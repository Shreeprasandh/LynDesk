-- =====================================================================
-- 🌑 LYNDESK COMPLETE DATABASE SCHEMA MIGRATION & REPAIR SCRIPT
-- Run this in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/dsqkxedafwzkjtcupzwx/sql
-- =====================================================================

-- 1. PROFILES TABLE MISSING COLUMNS
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS skills TEXT;

-- 2. EVENTS TABLE MISSING COLUMNS
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'hackathon';
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS deadline TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS url TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS faculty_recommended BOOLEAN DEFAULT false;

-- 3. PROJECT SPACES TABLE MISSING COLUMNS
ALTER TABLE public.project_spaces ADD COLUMN IF NOT EXISTS tagline TEXT;
ALTER TABLE public.project_spaces ADD COLUMN IF NOT EXISTS stage TEXT DEFAULT 'ideation';
ALTER TABLE public.project_spaces ADD COLUMN IF NOT EXISTS current_stage TEXT DEFAULT 'ideation';
ALTER TABLE public.project_spaces ADD COLUMN IF NOT EXISTS tech_stack TEXT;
ALTER TABLE public.project_spaces ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users ON DELETE SET NULL;
ALTER TABLE public.project_spaces ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- 4. PROJECT MEMBERS TABLE MISSING COLUMNS
ALTER TABLE public.project_members ADD COLUMN IF NOT EXISTS joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- 5. CREATE WORKSPACE ARTIFACTS TABLE
CREATE TABLE IF NOT EXISTS public.workspace_artifacts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    workspace_id UUID REFERENCES public.project_spaces ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    type TEXT DEFAULT 'file',
    content TEXT,
    created_by UUID REFERENCES auth.users ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.workspace_artifacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public workspace artifacts policy" ON public.workspace_artifacts FOR ALL USING (true) WITH CHECK (true);

-- 6. CREATE WORKSPACE TASKS TABLE
CREATE TABLE IF NOT EXISTS public.workspace_tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    workspace_id UUID REFERENCES public.project_spaces ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    assignee_id UUID REFERENCES auth.users ON DELETE SET NULL,
    completed BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.workspace_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public workspace tasks policy" ON public.workspace_tasks FOR ALL USING (true) WITH CHECK (true);

-- 7. CREATE WORKSPACE NOTES TABLE
CREATE TABLE IF NOT EXISTS public.workspace_notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    workspace_id UUID REFERENCES public.project_spaces ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    author_id UUID REFERENCES auth.users ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.workspace_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public workspace notes policy" ON public.workspace_notes FOR ALL USING (true) WITH CHECK (true);

-- 8. CREATE HANDLE VERIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.handle_verifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    platform TEXT NOT NULL,
    handle TEXT NOT NULL,
    status TEXT DEFAULT 'pending' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.handle_verifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public handle verifications policy" ON public.handle_verifications FOR ALL USING (true) WITH CHECK (true);
