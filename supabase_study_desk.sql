-- =====================================================================
-- 🌑 LYNDESK STUDY DESK DATABASE SCHEMA MIGRATION
-- Run this in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/dsqkxedafwzkjtcupzwx/sql
-- =====================================================================

-- 1. STUDY PATHS TABLE
CREATE TABLE IF NOT EXISTS public.study_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  depth_mode TEXT DEFAULT 'standard', -- 'sprint' | 'standard' | 'deep'
  upload_mode TEXT DEFAULT 'unified', -- 'unified' | 'per_document'
  source_files JSONB DEFAULT '[]'::jsonb,
  sections JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_lessons INT DEFAULT 0,
  completed_lessons INT DEFAULT 0,
  xp_earned INT DEFAULT 0,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  last_studied_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.study_paths ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public study paths policy" ON public.study_paths;
CREATE POLICY "Public study paths policy" ON public.study_paths FOR ALL USING (true) WITH CHECK (true);

-- 2. STUDY MISTAKES TABLE
CREATE TABLE IF NOT EXISTS public.study_mistakes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  path_id UUID REFERENCES public.study_paths(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL,
  question_type TEXT NOT NULL, -- 'mcq' | 'short_answer'
  question_prompt TEXT NOT NULL,
  options JSONB,
  correct_answer TEXT NOT NULL,
  user_answer TEXT NOT NULL,
  explanation TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.study_mistakes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public study mistakes policy" ON public.study_mistakes;
CREATE POLICY "Public study mistakes policy" ON public.study_mistakes FOR ALL USING (true) WITH CHECK (true);

-- 3. EXTEND PROFILES TABLE WITH GAMIFICATION STATS
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS study_xp INT DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS study_streak INT DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS study_longest_streak INT DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS study_last_date DATE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS study_active_days TEXT[] DEFAULT '{}';
