-- ========================================================
-- 📚 LYNDESK DSA WAY USER PROGRESS SCHEMA & RLS POLICIES
-- File: supabase/migrations/20260808_user_dsa_progress.sql
-- ========================================================

CREATE TABLE IF NOT EXISTS public.user_dsa_progress (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  track_id TEXT NOT NULL,
  problem_id TEXT NOT NULL,
  status TEXT DEFAULT 'completed',
  is_starred BOOLEAN DEFAULT false,
  notes TEXT DEFAULT '',
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.user_dsa_progress ENABLE ROW LEVEL SECURITY;

-- Create RLS Security Policies
DROP POLICY IF EXISTS "Users can view own dsa progress" ON public.user_dsa_progress;
CREATE POLICY "Users can view own dsa progress" ON public.user_dsa_progress
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own dsa progress" ON public.user_dsa_progress;
CREATE POLICY "Users can insert own dsa progress" ON public.user_dsa_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own dsa progress" ON public.user_dsa_progress;
CREATE POLICY "Users can update own dsa progress" ON public.user_dsa_progress
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own dsa progress" ON public.user_dsa_progress;
CREATE POLICY "Users can delete own dsa progress" ON public.user_dsa_progress
  FOR DELETE USING (auth.uid() = user_id);
