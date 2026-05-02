-- Complete SQL schema update for the Profiles table to support enhanced persona details

-- 1. Add avatar_url column (if not exists)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 2. Add persona_details JSONB column to store all persona-specific information
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS persona_details JSONB DEFAULT '{}'::jsonb;

-- 3. Create index on persona for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_persona ON public.profiles(persona);

-- 4. Create GIN index on persona_details for JSONB queries (optional but recommended for performance)
CREATE INDEX IF NOT EXISTS idx_profiles_persona_details ON public.profiles USING GIN (persona_details);

-- The persona_details JSON structure by persona type:
-- 
-- School Student:
--   {"education_level": "higher-sec"}  -- elementary, middle, higher, higher-sec
--
-- College Student:
--   {"year": "3", "department": "Computer Science"}  -- year: 1,2,3,4
--
-- Faculty:
--   {"degree": "PhD", "designation": "Assistant Professor", "years_of_experience": "5"}
--
-- Industry Professional:
--   {"role": "Software Engineer", "years_of_experience": "7", "specialization": "Full Stack Development"}
--
-- Entrepreneur:
--   {"industry": "SaaS", "stage": "Series A"}  -- stage: idea, mvp, seed, series-a, series-b
--
-- Note: institution_name field is used to store:
--   - School name (for school students)
--   - College name (for college students)
--   - College/University name (for faculty)
--   - Company name (for industry professionals)
--   - Startup/Company name (for entrepreneurs)
