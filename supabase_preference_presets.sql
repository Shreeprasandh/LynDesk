-- Migration script for LynDesk User Location & Preference Presets
-- Enables location tracking and preference filtering across Event Desk, Explore, and Dashboard

ALTER TABLE IF EXISTS public.profiles 
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}'::jsonb;

-- Ensure RLS policy allows users to update their own profile location & preferences
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' AND policyname = 'Users can update their own profile location and preferences'
  ) THEN
    CREATE POLICY "Users can update their own profile location and preferences" 
    ON public.profiles 
    FOR UPDATE 
    USING (auth.uid() = id) 
    WITH CHECK (auth.uid() = id);
  END IF;
END $$;
