-- ========================================================
-- 📚 LYSNDESK STUDY DESK DATABASE SCHEMA & RLS POLICIES
-- File: supabase/migrations/20260808_study_desk_schema.sql
-- ========================================================

-- 1. Create study_paths table
CREATE TABLE IF NOT EXISTS public.study_paths (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  depth_mode TEXT DEFAULT 'standard',
  upload_mode TEXT DEFAULT 'unified',
  source_files JSONB DEFAULT '[]'::jsonb,
  sections JSONB DEFAULT '[]'::jsonb,
  total_lessons INT DEFAULT 0,
  completed_lessons INT DEFAULT 0,
  xp_earned INT DEFAULT 0,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_studied_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create study_mistakes table
CREATE TABLE IF NOT EXISTS public.study_mistakes (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  path_id TEXT,
  lesson_id TEXT,
  question_type TEXT NOT NULL,
  question_prompt TEXT NOT NULL,
  options JSONB,
  correct_answer TEXT NOT NULL,
  user_answer TEXT NOT NULL,
  explanation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Extend public.profiles table for Academic Study Stats
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS study_xp INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS study_streak INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS study_longest_streak INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS study_last_date TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS study_active_days JSONB DEFAULT '[]'::jsonb;

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.study_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_mistakes ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS Security Policies for study_paths
DROP POLICY IF EXISTS "Users can view own study_paths" ON public.study_paths;
CREATE POLICY "Users can view own study_paths" ON public.study_paths
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own study_paths" ON public.study_paths;
CREATE POLICY "Users can insert own study_paths" ON public.study_paths
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own study_paths" ON public.study_paths;
CREATE POLICY "Users can update own study_paths" ON public.study_paths
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own study_paths" ON public.study_paths;
CREATE POLICY "Users can delete own study_paths" ON public.study_paths
  FOR DELETE USING (auth.uid() = user_id);

-- 6. Create RLS Security Policies for study_mistakes
DROP POLICY IF EXISTS "Users can view own study_mistakes" ON public.study_mistakes;
CREATE POLICY "Users can view own study_mistakes" ON public.study_mistakes
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own study_mistakes" ON public.study_mistakes;
CREATE POLICY "Users can insert own study_mistakes" ON public.study_mistakes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own study_mistakes" ON public.study_mistakes;
CREATE POLICY "Users can update own study_mistakes" ON public.study_mistakes
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own study_mistakes" ON public.study_mistakes;
CREATE POLICY "Users can delete own study_mistakes" ON public.study_mistakes
  FOR DELETE USING (auth.uid() = user_id);
