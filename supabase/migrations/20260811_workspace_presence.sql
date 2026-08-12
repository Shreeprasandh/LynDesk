-- ========================================================
-- 🌐 LYSNDESK WORKSPACE PRESENCE DB SCHEMA & RLS POLICIES
-- File: supabase/migrations/20260811_workspace_presence.sql
-- ========================================================

-- 1. Create workspace_presence table
CREATE TABLE IF NOT EXISTS public.workspace_presence (
  workspace_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status_text TEXT DEFAULT 'Active',
  is_online BOOLEAN DEFAULT true,
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (workspace_id, user_id)
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.workspace_presence ENABLE ROW LEVEL SECURITY;

-- 3. RLS Security Policies for workspace_presence
DROP POLICY IF EXISTS "Users can view workspace presence" ON public.workspace_presence;
CREATE POLICY "Users can view workspace presence" ON public.workspace_presence
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can upsert own workspace presence" ON public.workspace_presence;
CREATE POLICY "Users can upsert own workspace presence" ON public.workspace_presence
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
