-- ====================================================
-- FIX: Ensure profiles exist for all auth users
-- (Fixed: Provides default values for ALL required fields)
-- ====================================================

-- Step 1: Verify the FK exists between ideas.author_id → profiles.id
ALTER TABLE public.ideas
  DROP CONSTRAINT IF EXISTS ideas_author_id_fkey;

ALTER TABLE public.ideas
  ADD CONSTRAINT ideas_author_id_fkey
  FOREIGN KEY (author_id)
  REFERENCES public.profiles(id)
  ON DELETE SET NULL;

-- Step 2: Create a trigger that auto-creates a profile whenever
-- a new user signs up via Supabase Auth.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    full_name, 
    email, 
    mobile_number, 
    institution_name, 
    course_specialization, 
    year_of_study
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email,
    'Not Provided', -- Default value to bypass NOT NULL
    'Not Provided', -- Default value to bypass NOT NULL
    'Not Provided', -- Default value to bypass NOT NULL
    'Not Provided'  -- Default value to bypass NOT NULL
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ====================================================
-- Step 3: Backfill profiles for EXISTING auth users
-- that are missing profile records.
-- ====================================================
INSERT INTO public.profiles (
  id, 
  email, 
  full_name, 
  mobile_number, 
  institution_name, 
  course_specialization, 
  year_of_study
)
SELECT
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', au.email),
  'Not Provided',
  'Not Provided',
  'Not Provided',
  'Not Provided'
FROM auth.users au
LEFT JOIN public.profiles p ON p.id = au.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;
