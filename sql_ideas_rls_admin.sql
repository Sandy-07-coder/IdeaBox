-- Enable Row Level Security for the ideas table
ALTER TABLE public.ideas ENABLE ROW LEVEL SECURITY;

-- 1. Allow everyone to view ideas
DROP POLICY IF EXISTS "Anyone can view ideas" ON public.ideas;
CREATE POLICY "Anyone can view ideas"
ON public.ideas FOR SELECT
USING (true);

-- 2. Allow users to insert their own ideas
DROP POLICY IF EXISTS "Users can insert their own ideas" ON public.ideas;
CREATE POLICY "Users can insert their own ideas"
ON public.ideas FOR INSERT
WITH CHECK (auth.uid() = author_id);

-- 3. Allow users to update their own ideas (optional, if they need to edit)
DROP POLICY IF EXISTS "Users can update their own ideas" ON public.ideas;
CREATE POLICY "Users can update their own ideas"
ON public.ideas FOR UPDATE
USING (auth.uid() = author_id)
WITH CHECK (auth.uid() = author_id);

-- 4. CRITICAL: Allow admins to update ALL ideas (so they can approve them!)
DROP POLICY IF EXISTS "Admins can update any idea" ON public.ideas;
CREATE POLICY "Admins can update any idea"
ON public.ideas FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.user_role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.user_role = 'admin'
  )
);
