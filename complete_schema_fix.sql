-- =========================================================================
-- LynDesk Complete Database Schema Fix & Migration Script
-- Run this script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/dsqkxedafwzkjtcupzwx/sql
-- =========================================================================

-- 1. CREATE MISSING TABLES

-- Workspace Artifacts Table
CREATE TABLE IF NOT EXISTS public.workspace_artifacts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    workspace_id UUID REFERENCES public.project_spaces(id) ON DELETE CASCADE,
    slot_index INTEGER DEFAULT 0 NOT NULL,
    slot_name TEXT DEFAULT '' NOT NULL,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    version INTEGER DEFAULT 1 NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.workspace_artifacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to workspace_artifacts"
    ON public.workspace_artifacts FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to insert workspace_artifacts"
    ON public.workspace_artifacts FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update workspace_artifacts"
    ON public.workspace_artifacts FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to delete workspace_artifacts"
    ON public.workspace_artifacts FOR DELETE TO authenticated USING (true);


-- Workspace Tasks Table (Kanban Board Items)
CREATE TABLE IF NOT EXISTS public.workspace_tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    workspace_id UUID REFERENCES public.project_spaces(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')) NOT NULL,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')) NOT NULL,
    assignee TEXT DEFAULT 'Unassigned',
    scope TEXT DEFAULT 'team',
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.workspace_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated select on workspace_tasks"
    ON public.workspace_tasks FOR SELECT USING (true);

CREATE POLICY "Allow authenticated insert on workspace_tasks"
    ON public.workspace_tasks FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update on workspace_tasks"
    ON public.workspace_tasks FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated delete on workspace_tasks"
    ON public.workspace_tasks FOR DELETE TO authenticated USING (true);


-- Workspace Notes Table
CREATE TABLE IF NOT EXISTS public.workspace_notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    workspace_id UUID REFERENCES public.project_spaces(id) ON DELETE CASCADE NOT NULL UNIQUE,
    content TEXT DEFAULT '',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.workspace_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select on workspace_notes"
    ON public.workspace_notes FOR SELECT USING (true);

CREATE POLICY "Allow authenticated all on workspace_notes"
    ON public.workspace_notes FOR ALL USING (true) WITH CHECK (true);


-- Handle Verifications Table (Coding Platform Handles)
CREATE TABLE IF NOT EXISTS public.handle_verifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    platform TEXT NOT NULL,
    handle TEXT NOT NULL,
    status TEXT DEFAULT 'verified' NOT NULL,
    verified_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, platform)
);

ALTER TABLE public.handle_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select on handle_verifications"
    ON public.handle_verifications FOR SELECT USING (true);

CREATE POLICY "Allow authenticated insert/update on handle_verifications"
    ON public.handle_verifications FOR ALL USING (true) WITH CHECK (true);


-- 2. ADD MISSING COLUMNS TO EXISTING TABLES

-- Profiles Table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS skills TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS department TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS graduation_year TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS github_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS portfolio_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS leetcode_username TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS codeforces_username TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS codechef_username TEXT;

-- Events Table
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'hackathon';
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS deadline TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS url TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS faculty_recommended BOOLEAN DEFAULT false NOT NULL;

-- Project Spaces Table
ALTER TABLE public.project_spaces ADD COLUMN IF NOT EXISTS tagline TEXT;
ALTER TABLE public.project_spaces ADD COLUMN IF NOT EXISTS stage TEXT DEFAULT 'ideation';
ALTER TABLE public.project_spaces ADD COLUMN IF NOT EXISTS current_stage TEXT DEFAULT 'ideation';
ALTER TABLE public.project_spaces ADD COLUMN IF NOT EXISTS tech_stack TEXT[];
ALTER TABLE public.project_spaces ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id);
ALTER TABLE public.project_spaces ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.project_spaces ADD COLUMN IF NOT EXISTS tasks JSONB;
ALTER TABLE public.project_spaces ADD COLUMN IF NOT EXISTS slot_names JSONB;
ALTER TABLE public.project_spaces ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;

-- Project Members Table
ALTER TABLE public.project_members ADD COLUMN IF NOT EXISTS joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;


-- 3. INSERT SYSTEM DUMMY SPACE FOR GLOBAL PRESENCE (Prevents FK Errors)
INSERT INTO public.project_spaces (id, project_name, status, tagline)
VALUES ('00000000-0000-4000-8000-000000000000', 'Global Campus Online Hub', 'ideation', 'System Presence Space')
ON CONFLICT (id) DO NOTHING;


-- 4. HIGH-PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_workspace_tasks_ws ON public.workspace_tasks(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_artifacts_ws ON public.workspace_artifacts(workspace_id);
CREATE INDEX IF NOT EXISTS idx_handle_verifications_user ON public.handle_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id, created_at DESC);

-- =========================================================================
-- COMPLETE MIGRATION COMPLETED SUCCESSFULLY!
-- =========================================================================
