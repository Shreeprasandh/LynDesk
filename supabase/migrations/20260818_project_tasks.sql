-- Migration: 20260818_project_tasks.sql
-- Description: Dedicated task persistence table for workspace Kanban/milestone management

CREATE TABLE IF NOT EXISTS public.project_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_space_id UUID NOT NULL REFERENCES public.project_spaces(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'todo',
    priority TEXT NOT NULL DEFAULT 'medium',
    scope TEXT NOT NULL DEFAULT 'team',
    assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    position INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_project_tasks_space_id ON public.project_tasks(project_space_id);

ALTER TABLE public.project_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view space tasks" ON public.project_tasks
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.project_members
            WHERE project_members.project_space_id = project_tasks.project_space_id
            AND project_members.profile_id = auth.uid()
        )
    );

CREATE POLICY "Members can modify space tasks" ON public.project_tasks
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.project_members
            WHERE project_members.project_space_id = project_tasks.project_space_id
            AND project_members.profile_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.project_members
            WHERE project_members.project_space_id = project_tasks.project_space_id
            AND project_members.profile_id = auth.uid()
        )
    );
