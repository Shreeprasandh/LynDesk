-- ========================================================
-- 🏛️ LYNDESK INSTITUTIONAL ECOSYSTEM: PHASE 0 SCHEMA
-- File: supabase/migrations/20260824_institutional_phase0_profiles.sql
-- ========================================================

-- 1. Extend profiles table with institutional enrollment & consent fields
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS roll_number TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS academic_year TEXT DEFAULT NULL,       -- '1st Year' | '2nd Year' | '3rd Year' | '4th Year'
  ADD COLUMN IF NOT EXISTS section TEXT DEFAULT NULL,             -- 'A' | 'B' | 'C' ...
  ADD COLUMN IF NOT EXISTS batch_code TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS college_linked_status TEXT DEFAULT 'none', -- 'none' | 'pending' | 'linked'
  ADD COLUMN IF NOT EXISTS grant_share_permission BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS placement_consent BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS institute_id UUID REFERENCES public.institutes(id) ON DELETE SET NULL;

-- 2. Create performance indexes for institutional queries
CREATE INDEX IF NOT EXISTS idx_profiles_roll_number ON public.profiles(roll_number);
CREATE INDEX IF NOT EXISTS idx_profiles_institute_id ON public.profiles(institute_id);
CREATE INDEX IF NOT EXISTS idx_profiles_dept_year_sec ON public.profiles(institute_id, department, academic_year, section);

-- 3. Create consent_log table to track student consent history (GDPR / Institutional Audit)
CREATE TABLE IF NOT EXISTS public.consent_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    consent_type TEXT NOT NULL CHECK (consent_type IN ('placement_analytics', 'profile_sharing')),
    granted BOOLEAN NOT NULL,
    ip_hash TEXT NOT NULL,
    changed_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_consent_log_student ON public.consent_log(student_id);

-- 4. Enable Row Level Security (RLS) on consent_log
ALTER TABLE public.consent_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own consent log" ON public.consent_log;
CREATE POLICY "Users can view own consent log" ON public.consent_log
  FOR SELECT USING (auth.uid() = student_id);

DROP POLICY IF EXISTS "Users can insert own consent log" ON public.consent_log;
CREATE POLICY "Users can insert own consent log" ON public.consent_log
  FOR INSERT WITH CHECK (auth.uid() = student_id);
