-- SQL to add Additional Info fields to the profiles table
-- This file should be executed in Supabase SQL Editor

-- Add bio, position_in_idealab, and role columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS position_in_idealab VARCHAR(100) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS role VARCHAR(100) DEFAULT NULL;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_position ON public.profiles (position_in_idealab)
WHERE position_in_idealab IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN public.profiles.bio IS 'User biography - short description about the user';
COMMENT ON COLUMN public.profiles.position_in_idealab IS 'User position/role within IdeaLab (e.g., Member, Moderator, Contributor, Admin)';
COMMENT ON COLUMN public.profiles.role IS 'User role or expertise area (e.g., Innovator, Mentor, Advisor, Collaborator)';

-- Example values for reference:
-- bio: "Passionate about sustainable technology and innovation"
-- position_in_idealab: "Moderator" or "Member" or "Contributor"
-- role: "Mentor" or "Innovator" or "Advisor"
