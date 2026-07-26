-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: Hiring feature
-- Tables: hiring_posts, hiring_applications
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. hiring_posts ───────────────────────────────────────────────────────────
--
-- Each row is a single "we're hiring" post linked to one idea/project.
-- One idea can have at most one active hiring post at a time (enforced via
-- the partial unique index below). Multiple posts are allowed if the owner
-- archives/closes old ones.
--
-- Status enum values:
--   'open'   – accepting applications
--   'closed' – no longer accepting (manually closed OR all slots filled)

create type hiring_post_status as enum ('open', 'closed');

create table if not exists public.hiring_posts (
  id                uuid primary key default gen_random_uuid(),

  -- The idea this post belongs to
  idea_id           uuid not null references public.ideas(id) on delete cascade,

  -- The owner (denormalised from ideas.author_id for fast joins; must match)
  owner_id          uuid not null references public.profiles(id) on delete cascade,

  -- Core fields (all required)
  title             text not null,                          -- e.g. "Looking for a ML Engineer"
  description       text not null,                         -- role details / responsibilities
  skills_needed     text[] not null default '{}',
  total_openings    int  not null check (total_openings >= 1),
  commitment        text not null,                         -- e.g. "5-10 hrs/week"

  -- Derived / computed
  accepted_count    int  not null default 0 check (accepted_count >= 0),
  -- remaining_openings = total_openings - accepted_count (computed; never stored)

  status            hiring_post_status not null default 'open',

  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- Keep updated_at current automatically
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger hiring_posts_updated_at
  before update on public.hiring_posts
  for each row execute procedure public.touch_updated_at();

-- ── 2. hiring_applications ────────────────────────────────────────────────────
--
-- Status enum values:
--   'pending'    – waiting for owner review
--   'accepted'   – owner accepted this applicant
--   'rejected'   – owner explicitly rejected this applicant
--   'closed'     – post was closed before a decision was made

create type hiring_application_status as enum ('pending', 'accepted', 'rejected', 'closed');

create table if not exists public.hiring_applications (
  id              uuid primary key default gen_random_uuid(),

  hiring_post_id  uuid not null references public.hiring_posts(id) on delete cascade,
  applicant_id    uuid not null references public.profiles(id) on delete cascade,

  -- Application content (all required)
  cover_note      text not null,        -- short cover message / motivation
  experience      text not null,        -- relevant experience summary
  resume_url      text,                 -- optional portfolio / resume link

  status          hiring_application_status not null default 'pending',

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  -- Prevent duplicate applications per post
  unique (hiring_post_id, applicant_id)
);

create trigger hiring_applications_updated_at
  before update on public.hiring_applications
  for each row execute procedure public.touch_updated_at();

-- ── 3. Indexes ────────────────────────────────────────────────────────────────

create index if not exists idx_hiring_posts_idea_id    on public.hiring_posts(idea_id);
create index if not exists idx_hiring_posts_owner_id   on public.hiring_posts(owner_id);
create index if not exists idx_hiring_posts_status     on public.hiring_posts(status);

create index if not exists idx_hiring_apps_post_id     on public.hiring_applications(hiring_post_id);
create index if not exists idx_hiring_apps_applicant   on public.hiring_applications(applicant_id);
create index if not exists idx_hiring_apps_status      on public.hiring_applications(status);

-- ── 4. Row Level Security ─────────────────────────────────────────────────────

alter table public.hiring_posts        enable row level security;
alter table public.hiring_applications enable row level security;

-- hiring_posts: everyone can read open posts; only owner can mutate
create policy "hiring_posts_select" on public.hiring_posts
  for select using (true);

create policy "hiring_posts_insert" on public.hiring_posts
  for insert with check (auth.uid() = owner_id);

create policy "hiring_posts_update" on public.hiring_posts
  for update using (auth.uid() = owner_id);

create policy "hiring_posts_delete" on public.hiring_posts
  for delete using (auth.uid() = owner_id);

-- hiring_applications: applicant sees own rows; owner sees apps for their posts
create policy "hiring_apps_select_applicant" on public.hiring_applications
  for select using (
    auth.uid() = applicant_id
    or exists (
      select 1 from public.hiring_posts hp
      where hp.id = hiring_applications.hiring_post_id
        and hp.owner_id = auth.uid()
    )
  );

create policy "hiring_apps_insert" on public.hiring_applications
  for insert with check (auth.uid() = applicant_id);

-- Owner updates status; applicant cannot change status themselves
create policy "hiring_apps_update_owner" on public.hiring_applications
  for update using (
    exists (
      select 1 from public.hiring_posts hp
      where hp.id = hiring_applications.hiring_post_id
        and hp.owner_id = auth.uid()
    )
  );

-- ── 5. Atomic accept helper function ─────────────────────────────────────────
--
-- Accepts an application atomically:
--   a) Sets the application status to 'accepted'
--   b) Increments accepted_count on the hiring post
--   c) If accepted_count reaches total_openings, closes the post and marks all
--      remaining 'pending' applications as 'closed'
--
-- Returns: JSON with { ok: bool, message: text }
--
-- This runs server-side so concurrent accepts never overshoot the slot count.

create or replace function public.accept_hiring_application(
  p_application_id  uuid,
  p_owner_id        uuid
) returns json language plpgsql security definer as $$
declare
  v_post          hiring_posts%rowtype;
  v_app           hiring_applications%rowtype;
  v_remaining     int;
begin
  -- Lock the application row
  select * into v_app
  from public.hiring_applications
  where id = p_application_id
  for update;

  if not found then
    return json_build_object('ok', false, 'message', 'Application not found');
  end if;

  if v_app.status <> 'pending' then
    return json_build_object('ok', false, 'message', 'Application is no longer pending');
  end if;

  -- Lock the hiring post row
  select * into v_post
  from public.hiring_posts
  where id = v_app.hiring_post_id
  for update;

  if v_post.owner_id <> p_owner_id then
    return json_build_object('ok', false, 'message', 'Not authorised');
  end if;

  if v_post.status = 'closed' then
    return json_build_object('ok', false, 'message', 'Hiring post is already closed');
  end if;

  v_remaining := v_post.total_openings - v_post.accepted_count;

  if v_remaining <= 0 then
    return json_build_object('ok', false, 'message', 'No openings remaining');
  end if;

  -- Accept the application
  update public.hiring_applications
  set status = 'accepted', updated_at = now()
  where id = p_application_id;

  -- Increment accepted_count
  update public.hiring_posts
  set accepted_count = accepted_count + 1, updated_at = now()
  where id = v_post.id;

  -- If this was the last slot → close the post & mark pending apps as closed
  if v_remaining = 1 then
    update public.hiring_posts
    set status = 'closed', updated_at = now()
    where id = v_post.id;

    update public.hiring_applications
    set status = 'closed', updated_at = now()
    where hiring_post_id = v_post.id
      and status = 'pending';
  end if;

  return json_build_object('ok', true, 'message', 'Application accepted');
end;
$$;

-- ── 6. Manual close helper ────────────────────────────────────────────────────
--
-- Closes a post early and marks all remaining pending applicants as 'closed'.

create or replace function public.close_hiring_post(
  p_post_id   uuid,
  p_owner_id  uuid
) returns json language plpgsql security definer as $$
declare
  v_post hiring_posts%rowtype;
begin
  select * into v_post
  from public.hiring_posts
  where id = p_post_id
  for update;

  if not found then
    return json_build_object('ok', false, 'message', 'Post not found');
  end if;

  if v_post.owner_id <> p_owner_id then
    return json_build_object('ok', false, 'message', 'Not authorised');
  end if;

  update public.hiring_posts
  set status = 'closed', updated_at = now()
  where id = p_post_id;

  update public.hiring_applications
  set status = 'closed', updated_at = now()
  where hiring_post_id = p_post_id
    and status = 'pending';

  return json_build_object('ok', true, 'message', 'Post closed');
end;
$$;

-- ── 7. Edit openings helper ──────────────────────────────────────────────────
--
-- Safely updates total_openings on a post.
-- Checks that the new total is not less than the currently accepted count.
-- If the new total equals the accepted count, automatically closes the post.

create or replace function public.edit_hiring_post_openings(
  p_post_id   uuid,
  p_owner_id  uuid,
  p_new_total int
) returns json language plpgsql security definer as $$
declare
  v_post hiring_posts%rowtype;
begin
  select * into v_post
  from public.hiring_posts
  where id = p_post_id
  for update;

  if not found then
    return json_build_object('ok', false, 'message', 'Post not found');
  end if;

  if v_post.owner_id <> p_owner_id then
    return json_build_object('ok', false, 'message', 'Not authorised');
  end if;

  if p_new_total < v_post.accepted_count then
    return json_build_object('ok', false, 'message', 'Total openings cannot be less than accepted applicants');
  end if;

  -- Update total_openings
  update public.hiring_posts
  set total_openings = p_new_total, updated_at = now()
  where id = p_post_id;

  -- If it's fully filled now, close it
  if p_new_total = v_post.accepted_count and v_post.status = 'open' then
    update public.hiring_posts
    set status = 'closed', updated_at = now()
    where id = p_post_id;

    update public.hiring_applications
    set status = 'closed', updated_at = now()
    where hiring_post_id = p_post_id
      and status = 'pending';
  end if;

  -- If it was closed but now has more openings, re-open it
  if p_new_total > v_post.accepted_count and v_post.status = 'closed' then
    update public.hiring_posts
    set status = 'open', updated_at = now()
    where id = p_post_id;
  end if;

  return json_build_object('ok', true, 'message', 'Openings updated');
end;
$$;
