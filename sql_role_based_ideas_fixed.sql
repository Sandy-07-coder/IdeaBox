-- SQL for Role-Based Idea Approval System (Fixed)
-- This file should be executed in Supabase SQL Editor

-- 1. Add user_role column to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS user_role VARCHAR(20) DEFAULT 'regular' CHECK (user_role IN ('regular', 'admin'));

-- 2. Add approval-related columns to ideas table
-- Using author_id (not user_id) as that's the column that stores the user reference
ALTER TABLE public.ideas
ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- 3. Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_ideas_is_approved ON public.ideas(is_approved);
CREATE INDEX IF NOT EXISTS idx_ideas_approved_by ON public.ideas(approved_by);
CREATE INDEX IF NOT EXISTS idx_ideas_author_id_approved ON public.ideas(author_id, is_approved);
CREATE INDEX IF NOT EXISTS idx_profiles_user_role ON public.profiles(user_role);

-- 4. Add comments for documentation
COMMENT ON COLUMN public.profiles.user_role IS 'User role in the system: regular (can create ideas) or admin (can approve ideas)';
COMMENT ON COLUMN public.ideas.is_approved IS 'Whether the idea has been approved by an admin (default: false)';
COMMENT ON COLUMN public.ideas.approved_by IS 'Admin user who approved the idea';
COMMENT ON COLUMN public.ideas.approved_at IS 'Timestamp when the idea was approved';

-- 5. Update existing ideas to be approved
-- This assumes ideas already created should be visible to all users
UPDATE public.ideas
SET is_approved = true
WHERE is_approved = false AND created_at < NOW();

-- 6. Create a function to automatically set approved_at when is_approved changes to true
CREATE OR REPLACE FUNCTION set_approved_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_approved = true AND OLD.is_approved = false THEN
    NEW.approved_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Create trigger for auto-updating approved_at
DROP TRIGGER IF EXISTS idea_approval_trigger ON public.ideas;
CREATE TRIGGER idea_approval_trigger
BEFORE UPDATE ON public.ideas
FOR EACH ROW
EXECUTE FUNCTION set_approved_at();

-- 8. Example data for reference
-- To promote a user to admin:
-- UPDATE public.profiles SET user_role = 'admin' WHERE id = 'user-uuid-here';

-- To view all pending ideas:
-- SELECT id, project_title, author_id, is_approved, created_at FROM public.ideas WHERE is_approved = false ORDER BY created_at DESC;

-- To approve an idea:
-- UPDATE public.ideas SET is_approved = true, approved_by = 'admin-uuid-here' WHERE id = 'idea-uuid-here';
