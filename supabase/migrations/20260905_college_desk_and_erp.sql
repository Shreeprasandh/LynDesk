-- ========================================================
-- 🏛️ LYNDESK COLLEGE DESK & ERP ECOSYSTEM: SCHEMA & RLS
-- File: supabase/migrations/20260905_college_desk_and_erp.sql
-- ========================================================

-- 0. Add persona column to profiles if not present
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'persona'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN persona TEXT DEFAULT 'student';
    END IF;
END $$;

-- 1. College Subjects Catalog (college_subjects)
CREATE TABLE IF NOT EXISTS public.college_subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institute_id UUID REFERENCES public.institutes(id) ON DELETE CASCADE,
    department TEXT NOT NULL,
    academic_year TEXT NOT NULL,         -- '1st Year', '2nd Year', '3rd Year', '4th Year'
    semester INT NOT NULL CHECK (semester BETWEEN 1 AND 8),
    section TEXT NOT NULL DEFAULT 'ALL', -- 'ALL' or 'A', 'B', etc.
    subject_code TEXT NOT NULL,          -- e.g. 'CS8501'
    subject_name TEXT NOT NULL,          -- e.g. 'Theory of Computation'
    faculty_id UUID REFERENCES public.staff_accounts(id) ON DELETE SET NULL,
    faculty_name TEXT DEFAULT NULL,
    credits NUMERIC NOT NULL DEFAULT 3,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(institute_id, department, semester, subject_code)
);

CREATE INDEX IF NOT EXISTS idx_college_subjects_lookup ON public.college_subjects(institute_id, department, semester);

-- 2. Daily Period-Wise Attendance Logs (student_attendance_logs)
CREATE TABLE IF NOT EXISTS public.student_attendance_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institute_id UUID REFERENCES public.institutes(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.college_subjects(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    period_slot INT NOT NULL CHECK (period_slot BETWEEN 1 AND 10),
    status TEXT NOT NULL CHECK (status IN ('PRESENT', 'ABSENT', 'OD', 'LATE')),
    marked_by UUID DEFAULT NULL,
    remarks TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(student_id, subject_id, date, period_slot)
);

CREATE INDEX IF NOT EXISTS idx_att_logs_student ON public.student_attendance_logs(student_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_att_logs_subject_date ON public.student_attendance_logs(subject_id, date);

-- 3. Student Academic Marks Matrix (student_academic_marks)
CREATE TABLE IF NOT EXISTS public.student_academic_marks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institute_id UUID REFERENCES public.institutes(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.college_subjects(id) ON DELETE CASCADE,
    exam_type TEXT NOT NULL CHECK (exam_type IN ('IA1', 'IA2', 'IA3', 'MODEL', 'ASSIGNMENT', 'SEMESTER')),
    marks_obtained NUMERIC NOT NULL,
    max_marks NUMERIC NOT NULL DEFAULT 100,
    class_average NUMERIC DEFAULT NULL,
    remarks TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(student_id, subject_id, exam_type)
);

CREATE INDEX IF NOT EXISTS idx_marks_student ON public.student_academic_marks(student_id, exam_type);
CREATE INDEX IF NOT EXISTS idx_marks_subject ON public.student_academic_marks(subject_id, exam_type);

-- 4. Semester Historical Transcripts (student_semester_transcripts)
CREATE TABLE IF NOT EXISTS public.student_semester_transcripts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institute_id UUID REFERENCES public.institutes(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    semester INT NOT NULL CHECK (semester BETWEEN 1 AND 8),
    sgpa NUMERIC NOT NULL,
    cgpa NUMERIC NOT NULL,
    total_credits NUMERIC NOT NULL,
    earned_credits NUMERIC NOT NULL,
    status TEXT NOT NULL DEFAULT 'PASSED',
    results_json JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(student_id, semester)
);

CREATE INDEX IF NOT EXISTS idx_transcripts_student ON public.student_semester_transcripts(student_id, semester ASC);

-- 5. Student Fee Records (student_fee_records)
CREATE TABLE IF NOT EXISTS public.student_fee_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institute_id UUID REFERENCES public.institutes(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    academic_year TEXT NOT NULL,
    term_name TEXT NOT NULL,             -- e.g. 'Semester 5 Tuition & Lab Fee'
    total_amount NUMERIC NOT NULL,
    paid_amount NUMERIC NOT NULL DEFAULT 0,
    due_date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('PAID', 'PENDING', 'OVERDUE', 'PARTIAL')),
    receipt_url TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fees_student ON public.student_fee_records(student_id, status);

-- 6. Section Classroom Stream (classroom_posts)
CREATE TABLE IF NOT EXISTS public.classroom_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institute_id UUID REFERENCES public.institutes(id) ON DELETE CASCADE,
    structure_id UUID REFERENCES public.college_structures(id) ON DELETE CASCADE,
    department TEXT NOT NULL,
    academic_year TEXT NOT NULL,
    section TEXT NOT NULL,
    subject_id UUID REFERENCES public.college_subjects(id) ON DELETE SET NULL,
    author_id UUID NOT NULL,
    author_name TEXT NOT NULL,
    author_role TEXT NOT NULL DEFAULT 'faculty',
    post_type TEXT NOT NULL CHECK (post_type IN ('assignment', 'material', 'notice', 'discussion')),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    attachment_url TEXT DEFAULT NULL,
    attachment_name TEXT DEFAULT NULL,
    due_date TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_classroom_posts_feed ON public.classroom_posts(department, academic_year, section, created_at DESC);

-- 7. Classroom Submissions (classroom_submissions)
CREATE TABLE IF NOT EXISTS public.classroom_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.classroom_posts(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    submission_url TEXT DEFAULT NULL,
    submission_text TEXT DEFAULT NULL,
    workspace_id UUID DEFAULT NULL,
    grade NUMERIC DEFAULT NULL,
    feedback TEXT DEFAULT NULL,
    status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'graded', 'late', 'resubmit')),
    submitted_at TIMESTAMPTZ DEFAULT now(),
    graded_at TIMESTAMPTZ DEFAULT NULL,
    UNIQUE(post_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_classroom_subs_post ON public.classroom_submissions(post_id);
CREATE INDEX IF NOT EXISTS idx_classroom_subs_student ON public.classroom_submissions(student_id);

-- 8. Academic Timetable & Schedules (academic_schedules)
CREATE TABLE IF NOT EXISTS public.academic_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institute_id UUID REFERENCES public.institutes(id) ON DELETE CASCADE,
    department TEXT NOT NULL,
    academic_year TEXT NOT NULL,
    section TEXT NOT NULL,
    day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 1 AND 7), -- 1=Mon, 2=Tue, etc.
    period_slot INT NOT NULL CHECK (period_slot BETWEEN 1 AND 10),
    start_time TEXT NOT NULL,            -- e.g. '09:00 AM'
    end_time TEXT NOT NULL,              -- e.g. '09:50 AM'
    subject_id UUID REFERENCES public.college_subjects(id) ON DELETE CASCADE,
    subject_name TEXT NOT NULL,
    faculty_name TEXT DEFAULT NULL,
    room_number TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_schedules_lookup ON public.academic_schedules(department, academic_year, section, day_of_week);

-- ========================================================
-- 🔒 ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================================

ALTER TABLE public.college_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_attendance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_academic_marks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_semester_transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_fee_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classroom_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classroom_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_schedules ENABLE ROW LEVEL SECURITY;

-- 1. College Subjects
DROP POLICY IF EXISTS "Public can view college subjects" ON public.college_subjects;
CREATE POLICY "Public can view college subjects" ON public.college_subjects
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Faculty and admin can manage college subjects" ON public.college_subjects;
CREATE POLICY "Faculty and admin can manage college subjects" ON public.college_subjects
  FOR ALL USING (true);

-- 2. Student Attendance Logs
DROP POLICY IF EXISTS "Students view own attendance logs" ON public.student_attendance_logs;
CREATE POLICY "Students view own attendance logs" ON public.student_attendance_logs
  FOR SELECT USING (auth.uid() = student_id OR auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Staff can insert and update attendance logs" ON public.student_attendance_logs;
CREATE POLICY "Staff can insert and update attendance logs" ON public.student_attendance_logs
  FOR ALL USING (true);

-- 3. Student Academic Marks
DROP POLICY IF EXISTS "Students view own marks" ON public.student_academic_marks;
CREATE POLICY "Students view own marks" ON public.student_academic_marks
  FOR SELECT USING (auth.uid() = student_id OR auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Staff can insert and update marks" ON public.student_academic_marks;
CREATE POLICY "Staff can insert and update marks" ON public.student_academic_marks
  FOR ALL USING (true);

-- 4. Semester Transcripts
DROP POLICY IF EXISTS "Students view own transcripts" ON public.student_semester_transcripts;
CREATE POLICY "Students view own transcripts" ON public.student_semester_transcripts
  FOR SELECT USING (auth.uid() = student_id OR auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Staff can manage transcripts" ON public.student_semester_transcripts;
CREATE POLICY "Staff can manage transcripts" ON public.student_semester_transcripts
  FOR ALL USING (true);

-- 5. Student Fee Records
DROP POLICY IF EXISTS "Students view own fee records" ON public.student_fee_records;
CREATE POLICY "Students view own fee records" ON public.student_fee_records
  FOR SELECT USING (auth.uid() = student_id OR auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Staff can manage fee records" ON public.student_fee_records;
CREATE POLICY "Staff can manage fee records" ON public.student_fee_records
  FOR ALL USING (true);

-- 6. Classroom Posts
DROP POLICY IF EXISTS "Anyone in institute can view classroom posts" ON public.classroom_posts;
CREATE POLICY "Anyone in institute can view classroom posts" ON public.classroom_posts
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Faculty can create and manage classroom posts" ON public.classroom_posts;
CREATE POLICY "Faculty can create and manage classroom posts" ON public.classroom_posts
  FOR ALL USING (true);

-- 7. Classroom Submissions
DROP POLICY IF EXISTS "Students can view and submit own work" ON public.classroom_submissions;
CREATE POLICY "Students can view and submit own work" ON public.classroom_submissions
  FOR ALL USING (auth.uid() = student_id OR auth.uid() IS NOT NULL);

-- 8. Academic Schedules
DROP POLICY IF EXISTS "Public can view academic schedules" ON public.academic_schedules;
CREATE POLICY "Public can view academic schedules" ON public.academic_schedules
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Staff can manage academic schedules" ON public.academic_schedules;
CREATE POLICY "Staff can manage academic schedules" ON public.academic_schedules
  FOR ALL USING (true);
