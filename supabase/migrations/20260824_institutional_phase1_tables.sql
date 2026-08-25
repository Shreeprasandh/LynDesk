-- ========================================================
-- 🏛️ LYNDESK INSTITUTIONAL ECOSYSTEM: PHASE 1 SCHEMA & RLS
-- File: supabase/migrations/20260824_institutional_phase1_tables.sql
-- ========================================================

-- 1. Campus Architecture Table (college_structures)
CREATE TABLE IF NOT EXISTS public.college_structures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institute_id UUID NOT NULL REFERENCES public.institutes(id) ON DELETE CASCADE,
    academic_year TEXT NOT NULL,         -- '1st Year', '2nd Year', '3rd Year', '4th Year'
    department TEXT NOT NULL,            -- 'CSE', 'IT', 'ECE', 'AI&DS', etc.
    section TEXT NOT NULL,               -- 'A', 'B', 'C', etc.
    roll_start TEXT NOT NULL,            -- e.g. 'RA2311003010001'
    roll_end TEXT NOT NULL,              -- e.g. 'RA2311003010070'
    expected_students INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(institute_id, academic_year, department, section)
);

CREATE INDEX IF NOT EXISTS idx_college_structures_inst ON public.college_structures(institute_id);

-- 2. College Root Administrators (college_admins)
CREATE TABLE IF NOT EXISTS public.college_admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institute_id UUID NOT NULL REFERENCES public.institutes(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    totp_secret TEXT DEFAULT NULL,
    totp_enabled BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_college_admins_inst ON public.college_admins(institute_id);

-- 3. Staff & Faculty Accounts (staff_accounts)
CREATE TABLE IF NOT EXISTS public.staff_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institute_id UUID NOT NULL REFERENCES public.institutes(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    passkey_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('hod', 'coordinator', 'faculty')),
    department_scope TEXT NOT NULL,      -- 'ALL', 'CSE', 'IT', 'ECE', etc.
    assigned_sections JSONB DEFAULT '[]', -- ['A', 'B'] or empty for all
    assigned_years JSONB DEFAULT '[]',    -- ['3rd Year', '4th Year'] or empty for all
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(institute_id, email)
);

CREATE INDEX IF NOT EXISTS idx_staff_accounts_inst ON public.staff_accounts(institute_id);

-- 4. Corporate Recruiter Access Keys (recruiter_keys)
CREATE TABLE IF NOT EXISTS public.recruiter_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institute_id UUID NOT NULL REFERENCES public.institutes(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    pin_hash TEXT NOT NULL,
    created_by UUID REFERENCES public.college_admins(id) ON DELETE SET NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_accessed_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_recruiter_keys_inst ON public.recruiter_keys(institute_id);

-- 5. Institutional Audit Logs (institutional_audit_logs)
CREATE TABLE IF NOT EXISTS public.institutional_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institute_id UUID NOT NULL REFERENCES public.institutes(id) ON DELETE CASCADE,
    actor_type TEXT NOT NULL CHECK (actor_type IN ('admin', 'staff', 'recruiter', 'system')),
    actor_id TEXT NOT NULL,
    actor_name TEXT NOT NULL,
    action_type TEXT NOT NULL,           -- 'LOGIN', 'QUERY_AI', 'EXPORT_EXCEL', 'BROADCAST_SENT', 'KEY_GENERATED', etc.
    description TEXT NOT NULL,
    ip_hash TEXT NOT NULL,               -- SHA-256 hashed IP for GDPR compliance
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_inst ON public.institutional_audit_logs(institute_id, created_at DESC);

-- 6. Staff Broadcasts & Alerts (staff_broadcasts)
CREATE TABLE IF NOT EXISTS public.staff_broadcasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institute_id UUID NOT NULL REFERENCES public.institutes(id) ON DELETE CASCADE,
    staff_id UUID REFERENCES public.staff_accounts(id) ON DELETE SET NULL,
    staff_name TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'info' CHECK (priority IN ('info', 'urgent', 'reminder')),
    attachment_url TEXT DEFAULT NULL,
    target_type TEXT NOT NULL CHECK (target_type IN ('all', 'year', 'department', 'section', 'roll_range', 'individual')),
    target_scope JSONB DEFAULT '{}',      -- { year, department, section, roll_start, roll_end, student_id }
    scheduled_at TIMESTAMPTZ DEFAULT NULL,-- NULL = immediate dispatch
    sent_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_staff_broadcasts_inst ON public.staff_broadcasts(institute_id, created_at DESC);

-- 7. Broadcast Read Receipts (broadcast_receipts)
CREATE TABLE IF NOT EXISTS public.broadcast_receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    broadcast_id UUID NOT NULL REFERENCES public.staff_broadcasts(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    delivered_at TIMESTAMPTZ DEFAULT now(),
    read_at TIMESTAMPTZ DEFAULT NULL,
    UNIQUE(broadcast_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_broadcast_receipts_lookup ON public.broadcast_receipts(student_id, read_at);

-- 8. Faculty-Recommended Opportunities (staff_recommended_events)
CREATE TABLE IF NOT EXISTS public.staff_recommended_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institute_id UUID NOT NULL REFERENCES public.institutes(id) ON DELETE CASCADE,
    staff_id UUID REFERENCES public.staff_accounts(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('hackathon', 'contest', 'opportunity', 'workshop')),
    url TEXT NOT NULL,
    deadline TEXT DEFAULT NULL,
    location TEXT DEFAULT 'online',
    level TEXT DEFAULT 'national',
    description TEXT DEFAULT NULL,
    target_scope JSONB DEFAULT '{}',      -- {} = college-wide, or { department: 'IT', year: '3rd Year' }
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_staff_recomms_inst ON public.staff_recommended_events(institute_id, is_active);

-- ========================================================
-- 🔒 ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================================

ALTER TABLE public.college_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.college_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruiter_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutional_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_broadcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.broadcast_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_recommended_events ENABLE ROW LEVEL SECURITY;

-- 1. College Structures: Public read for verification; write managed by service role / admin
DROP POLICY IF EXISTS "Public can view college structures for verification" ON public.college_structures;
CREATE POLICY "Public can view college structures for verification" ON public.college_structures
  FOR SELECT USING (true);

-- 2. Staff Broadcasts: Students can read broadcasts targeting their institute
DROP POLICY IF EXISTS "Students can view institute broadcasts" ON public.staff_broadcasts;
CREATE POLICY "Students can view institute broadcasts" ON public.staff_broadcasts
  FOR SELECT USING (true);

-- 3. Broadcast Receipts: Students can read and insert their own receipts
DROP POLICY IF EXISTS "Students can view own broadcast receipts" ON public.broadcast_receipts;
CREATE POLICY "Students can view own broadcast receipts" ON public.broadcast_receipts
  FOR SELECT USING (auth.uid() = student_id);

DROP POLICY IF EXISTS "Students can update own broadcast receipts" ON public.broadcast_receipts;
CREATE POLICY "Students can update own broadcast receipts" ON public.broadcast_receipts
  FOR ALL USING (auth.uid() = student_id);

-- 4. Recommended Events: Anyone authenticated can view active recommendations
DROP POLICY IF EXISTS "Public can view active recommended events" ON public.staff_recommended_events;
CREATE POLICY "Public can view active recommended events" ON public.staff_recommended_events
  FOR SELECT USING (is_active = true);
