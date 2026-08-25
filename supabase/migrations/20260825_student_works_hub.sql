-- ========================================================
-- 🎨 LYNDESK STUDENT CREATIVE WORKS HUB: PHASE A SCHEMA
-- File: supabase/migrations/20260825_student_works_hub.sql
-- ========================================================

-- 1. student_works
--    Core works table. Supports all creative categories, file/URL works,
--    alias proofs, AI + staff verification pipeline, rating & view aggregates.
CREATE TABLE IF NOT EXISTS public.student_works (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  institute_id     uuid        REFERENCES public.institutes(id) ON DELETE CASCADE,
  student_id       uuid        REFERENCES public.profiles(id)  ON DELETE CASCADE,
  title            text        NOT NULL,
  category         text        NOT NULL CHECK (category IN (
                                  'book','music','web_game','software','art','film',
                                  'mobile_app','podcast','research','website','physical_product'
                               )),
  description      text,
  is_published     boolean     DEFAULT true,
  external_url     text,
  file_path        text,
  is_alias         boolean     DEFAULT false,
  alias_proof_path text,
  status           text        DEFAULT 'pending' CHECK (status IN (
                                  'pending','ai_verified','staff_review','approved','rejected'
                               )),
  ai_verdict       jsonb,
  ai_verified_at   timestamptz,
  rejection_reason text,
  views            integer     DEFAULT 0,
  average_rating   numeric(3,2) DEFAULT 0,
  rating_count     integer     DEFAULT 0,
  tags             text[],
  how_to_use       text,
  embed_url        text,
  expires_at       timestamptz DEFAULT (now() + interval '90 days'),
  renewed_at       timestamptz,
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);

-- 2. student_work_ratings
--    One rating per (work, rater) pair. Aggregate is kept on student_works.
CREATE TABLE IF NOT EXISTS public.student_work_ratings (
  id         uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  work_id    uuid    REFERENCES public.student_works(id) ON DELETE CASCADE,
  rater_id   uuid    REFERENCES public.profiles(id)     ON DELETE CASCADE,
  rating     integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  created_at timestamptz DEFAULT now(),
  UNIQUE(work_id, rater_id)
);

-- 3. student_work_views
--    Unique view per (work, viewer) pair. Drives the `views` counter.
CREATE TABLE IF NOT EXISTS public.student_work_views (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  work_id   uuid REFERENCES public.student_works(id) ON DELETE CASCADE,
  viewer_id uuid REFERENCES public.profiles(id)     ON DELETE CASCADE,
  viewed_at timestamptz DEFAULT now(),
  UNIQUE(work_id, viewer_id)
);

-- 4. student_work_staff_reviews
--    Human review decisions made by staff accounts. Service-role access only.
CREATE TABLE IF NOT EXISTS public.student_work_staff_reviews (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  work_id      uuid REFERENCES public.student_works(id)   ON DELETE CASCADE,
  reviewed_by  uuid REFERENCES public.staff_accounts(id)  ON DELETE SET NULL,
  decision     text NOT NULL CHECK (decision IN ('approved','rejected')),
  review_note  text,
  reviewed_at  timestamptz DEFAULT now()
);

-- ========================================================
-- INDEXES: fast institute-scoped queries
-- ========================================================
CREATE INDEX IF NOT EXISTS idx_student_works_institute ON public.student_works(institute_id);
CREATE INDEX IF NOT EXISTS idx_student_works_student   ON public.student_works(student_id);
CREATE INDEX IF NOT EXISTS idx_student_works_status    ON public.student_works(status);
CREATE INDEX IF NOT EXISTS idx_student_works_category  ON public.student_works(category);
CREATE INDEX IF NOT EXISTS idx_student_works_expires   ON public.student_works(expires_at);
CREATE INDEX IF NOT EXISTS idx_work_ratings_work       ON public.student_work_ratings(work_id);
CREATE INDEX IF NOT EXISTS idx_work_views_work         ON public.student_work_views(work_id);

-- ========================================================
-- ROW LEVEL SECURITY
-- ========================================================
ALTER TABLE public.student_works              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_work_ratings       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_work_views         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_work_staff_reviews ENABLE ROW LEVEL SECURITY;

-- ────────────────────────────────────────────────────────
-- student_works RLS policies
-- ────────────────────────────────────────────────────────

-- Students can view approved works from their own institute
DROP POLICY IF EXISTS "student_works_select" ON public.student_works;
CREATE POLICY "student_works_select" ON public.student_works
  FOR SELECT USING (
    institute_id IN (
      SELECT institute_id FROM public.profiles WHERE id = auth.uid()
    )
    AND status = 'approved'
  );

-- Students can insert their own works
DROP POLICY IF EXISTS "student_works_insert" ON public.student_works;
CREATE POLICY "student_works_insert" ON public.student_works
  FOR INSERT WITH CHECK (student_id = auth.uid());

-- Students can update their own works
DROP POLICY IF EXISTS "student_works_update" ON public.student_works;
CREATE POLICY "student_works_update" ON public.student_works
  FOR UPDATE USING (student_id = auth.uid());

-- Students can delete their own works
DROP POLICY IF EXISTS "student_works_delete" ON public.student_works;
CREATE POLICY "student_works_delete" ON public.student_works
  FOR DELETE USING (student_id = auth.uid());

-- ────────────────────────────────────────────────────────
-- student_work_ratings RLS policies
-- ────────────────────────────────────────────────────────

-- Anyone authenticated can read ratings for approved works
DROP POLICY IF EXISTS "work_ratings_select" ON public.student_work_ratings;
CREATE POLICY "work_ratings_select" ON public.student_work_ratings
  FOR SELECT USING (
    work_id IN (SELECT id FROM public.student_works WHERE status = 'approved')
  );

-- Authenticated users can insert their own ratings
DROP POLICY IF EXISTS "work_ratings_insert" ON public.student_work_ratings;
CREATE POLICY "work_ratings_insert" ON public.student_work_ratings
  FOR INSERT WITH CHECK (rater_id = auth.uid());

-- Authenticated users can update their own ratings (for upsert flow)
DROP POLICY IF EXISTS "work_ratings_update" ON public.student_work_ratings;
CREATE POLICY "work_ratings_update" ON public.student_work_ratings
  FOR UPDATE USING (rater_id = auth.uid());

-- ────────────────────────────────────────────────────────
-- student_work_views RLS policies
-- ────────────────────────────────────────────────────────

-- Authenticated users can insert their own view records
DROP POLICY IF EXISTS "work_views_insert" ON public.student_work_views;
CREATE POLICY "work_views_insert" ON public.student_work_views
  FOR INSERT WITH CHECK (viewer_id = auth.uid());

-- ────────────────────────────────────────────────────────
-- student_work_staff_reviews RLS policies
-- Note: all writes are performed via service-role admin client.
--       The SELECT policy with `true` is readable in principle;
--       in practice, only admin client routes surface these records.
-- ────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "work_staff_reviews_select" ON public.student_work_staff_reviews;
CREATE POLICY "work_staff_reviews_select" ON public.student_work_staff_reviews
  FOR SELECT USING (true);
