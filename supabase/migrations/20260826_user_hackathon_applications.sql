-- Migration: Create user_hackathon_applications table for personalized application tracking
CREATE TABLE IF NOT EXISTS public.user_hackathon_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  portal TEXT NOT NULL DEFAULT 'Unstop',
  portal_url TEXT NOT NULL,
  handle TEXT,
  role TEXT NOT NULL DEFAULT 'Participant',
  status TEXT NOT NULL DEFAULT 'Applied',
  stage TEXT NOT NULL DEFAULT 'Round 1',
  deadline TIMESTAMPTZ,
  workspace_id UUID REFERENCES public.project_spaces(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_user_hackathon_apps_user_id ON public.user_hackathon_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_hackathon_apps_created_at ON public.user_hackathon_applications(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.user_hackathon_applications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view own hackathon applications" ON public.user_hackathon_applications;
DROP POLICY IF EXISTS "Users can insert own hackathon applications" ON public.user_hackathon_applications;
DROP POLICY IF EXISTS "Users can update own hackathon applications" ON public.user_hackathon_applications;
DROP POLICY IF EXISTS "Users can delete own hackathon applications" ON public.user_hackathon_applications;

-- RLS Policies: Authenticated users can manage their own applications
CREATE POLICY "Users can view own hackathon applications"
  ON public.user_hackathon_applications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own hackathon applications"
  ON public.user_hackathon_applications
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own hackathon applications"
  ON public.user_hackathon_applications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own hackathon applications"
  ON public.user_hackathon_applications
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
