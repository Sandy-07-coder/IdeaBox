-- Add persona_details JSONB column to store persona-specific information
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS persona_details JSONB DEFAULT '{}'::jsonb;

-- Example of what will be stored:
-- School Student: {"education_level": "higher-sec"}
-- College Student: {"year": "3", "department": "Computer Science"}
-- Faculty: {"degree": "PhD", "designation": "Assistant Professor", "years_of_experience": "5"}
-- Industry Professional: {"role": "Software Engineer", "years_of_experience": "7", "specialization": "Full Stack Development"}
-- Entrepreneur: {"company_name": "TechStartup Inc", "industry": "SaaS", "stage": "Series A"}
