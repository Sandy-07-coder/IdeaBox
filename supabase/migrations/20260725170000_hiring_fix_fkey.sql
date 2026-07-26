-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: Fix Hiring feature foreign keys to reference profiles
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Fix hiring_posts.owner_id
alter table public.hiring_posts
  drop constraint if exists hiring_posts_owner_id_fkey;

alter table public.hiring_posts
  add constraint hiring_posts_owner_id_fkey 
  foreign key (owner_id) references public.profiles(id) on delete cascade;

-- 2. Fix hiring_applications.applicant_id
alter table public.hiring_applications
  drop constraint if exists hiring_applications_applicant_id_fkey;

alter table public.hiring_applications
  add constraint hiring_applications_applicant_id_fkey 
  foreign key (applicant_id) references public.profiles(id) on delete cascade;

-- Force schema cache reload for PostgREST
notify pgrst, 'reload schema';
