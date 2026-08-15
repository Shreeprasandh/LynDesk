-- ========================================================
-- 📅 LYNDESK WALLCALENDAR LIVE SCHEDULER SCHEMA & RLS
-- File: supabase/migrations/20260815_wall_calendar_events.sql
-- ========================================================

CREATE TABLE IF NOT EXISTS public.wall_calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  event_date DATE NOT NULL,
  event_time TEXT DEFAULT '12:00',
  category TEXT NOT NULL CHECK (category IN ('contest', 'deadline', 'study', 'opportunity', 'reminder')),
  description TEXT DEFAULT '',
  link TEXT DEFAULT '',
  source_type TEXT DEFAULT 'custom',
  source_id TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast queries by user and event_date
CREATE INDEX IF NOT EXISTS idx_wall_calendar_user_date ON public.wall_calendar_events(user_id, event_date);
CREATE INDEX IF NOT EXISTS idx_wall_calendar_source ON public.wall_calendar_events(user_id, source_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.wall_calendar_events ENABLE ROW LEVEL SECURITY;

-- Create RLS Security Policies
DROP POLICY IF EXISTS "Users can view own wall calendar events" ON public.wall_calendar_events;
CREATE POLICY "Users can view own wall calendar events" ON public.wall_calendar_events
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own wall calendar events" ON public.wall_calendar_events;
CREATE POLICY "Users can insert own wall calendar events" ON public.wall_calendar_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own wall calendar events" ON public.wall_calendar_events;
CREATE POLICY "Users can update own wall calendar events" ON public.wall_calendar_events
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own wall calendar events" ON public.wall_calendar_events;
CREATE POLICY "Users can delete own wall calendar events" ON public.wall_calendar_events
  FOR DELETE USING (auth.uid() = user_id);
