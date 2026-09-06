-- ==============================================================================
-- 🏛️ MIGRATION: STUDENT LEAVE & ON-DUTY (OD) APPLICATIONS (20260906)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.student_leave_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    application_type TEXT NOT NULL CHECK (application_type IN ('leave', 'od')),
    target_date DATE NOT NULL,
    end_date DATE, -- Optional for multi-day leaves
    is_full_day BOOLEAN NOT NULL DEFAULT true,
    periods INTEGER[] DEFAULT '{}', -- Array of period numbers e.g. [2, 3, 4]
    category TEXT NOT NULL DEFAULT 'academic', -- 'medical', 'academic', 'symposium', 'hackathon', 'personal'
    title TEXT NOT NULL,
    reason TEXT NOT NULL,
    letter_body TEXT, -- Formatted formal letter text
    proof_url TEXT, -- Document or certificate proof URL
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewed_by UUID REFERENCES public.profiles(id),
    faculty_remarks TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_leave_app_student_id ON public.student_leave_applications(student_id);
CREATE INDEX IF NOT EXISTS idx_leave_app_target_date ON public.student_leave_applications(target_date);
CREATE INDEX IF NOT EXISTS idx_leave_app_status ON public.student_leave_applications(status);

-- Enable RLS
ALTER TABLE public.student_leave_applications ENABLE ROW LEVEL SECURITY;

-- 1. Student can view own leave/OD applications
DROP POLICY IF EXISTS "Students can view own leave applications" ON public.student_leave_applications;
CREATE POLICY "Students can view own leave applications"
    ON public.student_leave_applications
    FOR SELECT
    USING (auth.uid() = student_id);

-- 2. Student can insert own applications
DROP POLICY IF EXISTS "Students can create leave applications" ON public.student_leave_applications;
CREATE POLICY "Students can create leave applications"
    ON public.student_leave_applications
    FOR INSERT
    WITH CHECK (auth.uid() = student_id);

-- 3. Faculty / Coordinators can view and update applications
DROP POLICY IF EXISTS "Faculty can review student leave applications" ON public.student_leave_applications;
CREATE POLICY "Faculty can review student leave applications"
    ON public.student_leave_applications
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.staff_accounts
            WHERE (staff_accounts.email = auth.jwt() ->> 'email' OR staff_accounts.id::text = auth.jwt() ->> 'sub')
            AND staff_accounts.is_active = true
        )
    );
