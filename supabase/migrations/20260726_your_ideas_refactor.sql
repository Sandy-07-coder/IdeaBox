-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: "Your Ideas" refactor
--   1. idea_members table          (team roster, exempt from admin approval)
--   2. idea_edit_requests table    (pending owner edits/deletes post-approval)
--   3. Auto-sync trigger           (hiring acceptance → add member)
--   4. Duplicate-member guard
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. idea_members ───────────────────────────────────────────────────────────
--
-- Stores the active team roster for each idea.
-- Members can be added:
--   (a) Automatically via hiring acceptance (source = 'hiring')
--   (b) Manually by the owner (source = 'manual')
--
-- Soft-delete: removing a member sets left_at rather than hard-deleting,
-- so the historical record is preserved.

create table if not exists public.idea_members (
  id              uuid primary key default gen_random_uuid(),

  idea_id         uuid not null references public.ideas(id) on delete cascade,
  member_id       uuid not null references public.profiles(id) on delete cascade,

  -- Role: free-text for manual adds; copied from hiring post title for auto-adds
  role            text not null default 'Member',

  -- Traceability: which hiring application seeded this row (null if manual)
  hiring_application_id uuid references public.hiring_applications(id) on delete set null,

  source          text not null default 'manual' check (source in ('hiring', 'manual')),

  joined_at       timestamptz not null default now(),
  -- Non-null when owner removes a member (soft-delete)
  left_at         timestamptz,

  -- Prevent duplicate active members for the same idea
  constraint uq_active_member unique nulls not distinct (idea_id, member_id, left_at),

  created_at      timestamptz not null default now()
);

create index if not exists idx_idea_members_idea_id   on public.idea_members(idea_id);
create index if not exists idx_idea_members_member_id on public.idea_members(member_id);

alter table public.idea_members enable row level security;

-- Owner & the member themselves can see the row; public can read too (roster visible)
create policy "idea_members_select" on public.idea_members
  for select using (true);

-- Only idea owner can insert members manually
create policy "idea_members_insert_owner" on public.idea_members
  for insert with check (
    exists (
      select 1 from public.ideas i
      where i.id = idea_id
        and i.author_id = auth.uid()
    )
  );

-- Only idea owner can update (e.g. change role, set left_at)
create policy "idea_members_update_owner" on public.idea_members
  for update using (
    exists (
      select 1 from public.ideas i
      where i.id = idea_id
        and i.author_id = auth.uid()
    )
  );

-- ── 2. idea_edit_requests ────────────────────────────────────────────────────
--
-- When an idea is already approved, the owner cannot edit/delete directly.
-- Instead they submit a request here.  Admin approves or rejects it.
--
-- request_type:
--   'edit'   – wants to change core idea fields
--   'delete' – wants to delete the idea entirely
--
-- Status flow:  pending → approved | rejected
--   approved  → the payload is applied to the idea (or the idea is deleted)
--   rejected  → owner is notified; idea keeps old values; owner may resubmit

create type idea_edit_request_type   as enum ('edit', 'delete');
create type idea_edit_request_status as enum ('pending', 'approved', 'rejected');

create table if not exists public.idea_edit_requests (
  id              uuid primary key default gen_random_uuid(),

  idea_id         uuid not null references public.ideas(id) on delete cascade,
  owner_id        uuid not null references public.profiles(id) on delete cascade,

  request_type    idea_edit_request_type   not null,
  status          idea_edit_request_status not null default 'pending',

  -- For 'edit' requests: JSONB snapshot of the fields the owner wants to change.
  -- Keys mirror the ideas table column names. Null for 'delete' requests.
  -- Example: { "project_title": "New Title", "description": "Updated description" }
  payload         jsonb,

  -- Optional human-readable reason the owner provides
  owner_note      text,

  -- Admin fills these in when acting on the request
  admin_id        uuid references public.profiles(id) on delete set null,
  admin_note      text,
  acted_at        timestamptz,

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create trigger idea_edit_requests_updated_at
  before update on public.idea_edit_requests
  for each row execute procedure public.touch_updated_at();

create index if not exists idx_idea_edit_reqs_idea_id  on public.idea_edit_requests(idea_id);
create index if not exists idx_idea_edit_reqs_owner_id on public.idea_edit_requests(owner_id);
create index if not exists idx_idea_edit_reqs_status   on public.idea_edit_requests(status);

alter table public.idea_edit_requests enable row level security;

-- Owner sees their own requests; admin sees all
create policy "idea_edit_reqs_select" on public.idea_edit_requests
  for select using (
    auth.uid() = owner_id
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.user_role = 'admin'
    )
  );

create policy "idea_edit_reqs_insert" on public.idea_edit_requests
  for insert with check (auth.uid() = owner_id);

-- Only admin can update status
create policy "idea_edit_reqs_update_admin" on public.idea_edit_requests
  for update using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.user_role = 'admin'
    )
  );

-- ── 3. Auto-sync trigger: hiring acceptance → idea_members ───────────────────
--
-- Fires AFTER an UPDATE on hiring_applications where status changes to 'accepted'.
-- Inserts a row into idea_members if one doesn't already exist for the same
-- (idea_id, member_id) pair that is currently active (left_at IS NULL).

create or replace function public.sync_accepted_applicant_to_members()
returns trigger language plpgsql security definer as $$
declare
  v_post  hiring_posts%rowtype;
  v_role  text;
begin
  -- Only act when status transitions TO 'accepted'
  if new.status <> 'accepted' or old.status = 'accepted' then
    return new;
  end if;

  -- Fetch the hiring post to get idea_id and role title
  select * into v_post
  from public.hiring_posts
  where id = new.hiring_post_id;

  -- Use the post title as the role; fall back to 'Member'
  v_role := coalesce(v_post.title, 'Member');

  -- Insert only if no active membership already exists (duplicate guard)
  insert into public.idea_members (
    idea_id, member_id, role, hiring_application_id, source
  )
  select
    v_post.idea_id,
    new.applicant_id,
    v_role,
    new.id,
    'hiring'
  where not exists (
    select 1 from public.idea_members im
    where im.idea_id   = v_post.idea_id
      and im.member_id = new.applicant_id
      and im.left_at is null
  );

  return new;
end;
$$;

create trigger trg_sync_hired_member
  after update of status on public.hiring_applications
  for each row
  execute procedure public.sync_accepted_applicant_to_members();

-- ── 4. Admin-approve-edit helper function ─────────────────────────────────────
--
-- When an admin approves an 'edit' request, this function atomically:
--   a) Applies the payload JSON to the ideas row
--   b) Updates the request status to 'approved'
--   c) Sets acted_at + admin_id
--
-- For 'delete' requests the admin calls this same function; the payload is null
-- and the idea is deleted via cascade.

create or replace function public.admin_act_on_edit_request(
  p_request_id  uuid,
  p_admin_id    uuid,
  p_decision    idea_edit_request_status,   -- 'approved' or 'rejected'
  p_admin_note  text default null
) returns json language plpgsql security definer as $$
declare
  v_req  idea_edit_requests%rowtype;
  v_sql  text;
  v_key  text;
  v_val  jsonb;
begin
  -- Verify admin
  if not exists (
    select 1 from public.profiles
    where id = p_admin_id and user_role = 'admin'
  ) then
    return json_build_object('ok', false, 'message', 'Not authorised');
  end if;

  select * into v_req
  from public.idea_edit_requests
  where id = p_request_id
  for update;

  if not found then
    return json_build_object('ok', false, 'message', 'Request not found');
  end if;

  if v_req.status <> 'pending' then
    return json_build_object('ok', false, 'message', 'Request already acted upon');
  end if;

  -- Mark the request
  update public.idea_edit_requests
  set status     = p_decision,
      admin_id   = p_admin_id,
      admin_note = p_admin_note,
      acted_at   = now(),
      updated_at = now()
  where id = p_request_id;

  -- Only apply changes if approved
  if p_decision = 'approved' then
    if v_req.request_type = 'delete' then
      delete from public.ideas where id = v_req.idea_id;
    elsif v_req.request_type = 'edit' and v_req.payload is not null then
      -- Dynamically build UPDATE from payload keys
      -- Only allow safe columns to prevent SQL injection
      for v_key, v_val in select * from jsonb_each(v_req.payload) loop
        if v_key in ('project_title','description','elevator_pitch','problem_statement',
                     'solution','target_audience','requirements','prototype_url',
                     'project_status') then
          execute format(
            'update public.ideas set %I = $1, updated_at = now() where id = $2',
            v_key
          ) using (v_val #>> '{}'), v_req.idea_id;
        end if;
      end loop;
    end if;
  end if;

  return json_build_object('ok', true, 'message', 'Request ' || p_decision);
end;
$$;
