-- LynDesk Campus Database Schema Migration Script
-- Run this script in the Supabase SQL Editor (https://supabase.com/dashboard/project/dsqkxedafwzkjtcupzwx/sql)

-- 1. ENUMS SETUP
CREATE TYPE location_type AS ENUM ('online', 'in_person', 'hybrid');
CREATE TYPE event_level AS ENUM ('local', 'national', 'global');
CREATE TYPE project_status AS ENUM ('ideation', 'development', 'testing', 'submitted');
CREATE TYPE role_type AS ENUM ('leader', 'member', 'mentor');
CREATE TYPE application_status AS ENUM ('pending', 'approved', 'rejected');

-- 2. INSTITUTES TABLE
CREATE TABLE public.institutes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email_domain TEXT NOT NULL UNIQUE,
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on Institutes
ALTER TABLE public.institutes ENABLE ROW LEVEL SECURITY;

-- 3. PROFILES TABLE (linked to Supabase auth.users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
    institute_id UUID REFERENCES public.institutes ON DELETE SET NULL,
    username TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    academic_credits INTEGER DEFAULT 0 NOT NULL,
    is_profile_public BOOLEAN DEFAULT true NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. EVENTS TABLE
CREATE TABLE public.events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    source_url TEXT,
    registration_deadline TIMESTAMP WITH TIME ZONE,
    location location_type DEFAULT 'online'::location_type NOT NULL,
    level event_level DEFAULT 'local'::event_level NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on Events
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- 5. PROJECT SPACES TABLE
CREATE TABLE public.project_spaces (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID REFERENCES public.events ON DELETE SET NULL,
    project_name TEXT NOT NULL,
    status project_status DEFAULT 'ideation'::project_status NOT NULL,
    github_repo TEXT,
    live_demo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on Project Spaces
ALTER TABLE public.project_spaces ENABLE ROW LEVEL SECURITY;

-- 6. PROJECT MEMBERS TABLE
CREATE TABLE public.project_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_space_id UUID REFERENCES public.project_spaces ON DELETE CASCADE NOT NULL,
    profile_id UUID REFERENCES public.profiles ON DELETE CASCADE NOT NULL,
    role role_type DEFAULT 'member'::role_type NOT NULL,
    UNIQUE(project_space_id, profile_id)
);

-- Enable RLS on Project Members
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;

-- 7. PROJECT ARTIFACTS TABLE
CREATE TABLE public.project_artifacts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_space_id UUID REFERENCES public.project_spaces ON DELETE CASCADE NOT NULL,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    version INTEGER DEFAULT 1 NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    uploaded_by UUID REFERENCES public.profiles ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on Project Artifacts
ALTER TABLE public.project_artifacts ENABLE ROW LEVEL SECURITY;

-- 8. CREDIT APPLICATIONS TABLE
CREATE TABLE public.credit_applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES public.profiles ON DELETE CASCADE NOT NULL,
    project_space_id UUID REFERENCES public.project_spaces ON DELETE CASCADE NOT NULL,
    faculty_verifier_id UUID REFERENCES public.profiles ON DELETE SET NULL,
    credit_points INTEGER DEFAULT 0 NOT NULL,
    status application_status DEFAULT 'pending'::application_status NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on Credit Applications
ALTER TABLE public.credit_applications ENABLE ROW LEVEL SECURITY;

-- 9. CHAT MESSAGES TABLE
CREATE TABLE public.chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_space_id UUID REFERENCES public.project_spaces ON DELETE CASCADE NOT NULL,
    profile_id UUID REFERENCES public.profiles ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on Chat Messages
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;


-- =========================================================================
-- RLS POLICIES DEFINITIONS
-- =========================================================================

-- Profiles Policies
CREATE POLICY "Allow public read access to profiles" 
    ON public.profiles FOR SELECT 
    USING (is_profile_public OR auth.uid() = id);

CREATE POLICY "Allow users to update own profile" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id);

-- Institutes Policies
CREATE POLICY "Allow public read access to institutes" 
    ON public.institutes FOR SELECT 
    USING (true);

-- Events Policies
CREATE POLICY "Allow authenticated read access to events" 
    ON public.events FOR SELECT 
    TO authenticated 
    USING (true);

CREATE POLICY "Allow authenticated insert access to events" 
    ON public.events FOR INSERT 
    TO authenticated 
    WITH CHECK (true);

-- Project Spaces Policies
CREATE POLICY "Allow members read access to project spaces" 
    ON public.project_spaces FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.project_members 
            WHERE project_members.project_space_id = id 
            AND project_members.profile_id = auth.uid()
        )
    );

CREATE POLICY "Allow team leaders to update project spaces" 
    ON public.project_spaces FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM public.project_members 
            WHERE project_members.project_space_id = id 
            AND project_members.profile_id = auth.uid()
            AND project_members.role = 'leader'::role_type
        )
    );

-- Project Members Policies
CREATE POLICY "Allow team members to view membership list" 
    ON public.project_members FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.project_members AS internal
            WHERE internal.project_space_id = project_space_id 
            AND internal.profile_id = auth.uid()
        )
    );

-- Chat Messages Policies
CREATE POLICY "Allow team members to view chat messages" 
    ON public.chat_messages FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.project_members 
            WHERE project_members.project_space_id = project_space_id 
            AND project_members.profile_id = auth.uid()
        )
    );

CREATE POLICY "Allow team members to post chat messages" 
    ON public.chat_messages FOR INSERT 
    TO authenticated
    WITH CHECK (
        auth.uid() = profile_id 
        AND EXISTS (
            SELECT 1 FROM public.project_members 
            WHERE project_members.project_space_id = project_space_id 
            AND project_members.profile_id = auth.uid()
        )
    );


-- =========================================================================
-- DATABASE TRIGGERS (Automating profile creation on signup)
-- =========================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    domain_part TEXT;
    matched_institute_id UUID;
    fallback_username TEXT;
BEGIN
    -- Get email domain
    domain_part := split_part(new.email, '@', 2);
    
    -- Find if domain is registered to an institute
    SELECT id INTO matched_institute_id FROM public.institutes WHERE email_domain = domain_part LIMIT 1;
    
    -- Generate fallback username from email prefix
    fallback_username := split_part(new.email, '@', 1);

    INSERT INTO public.profiles (id, institute_id, username, full_name, avatar_url, academic_credits, is_profile_public)
    VALUES (
        new.id,
        matched_institute_id,
        fallback_username,
        coalesce(new.raw_user_meta_data->>'full_name', fallback_username),
        new.raw_user_meta_data->>'avatar_url',
        0,
        true
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger execution
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- 10. SUPPORT INQUIRIES TABLE (For help form submissions)
CREATE TABLE public.support_inquiries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.support_inquiries ENABLE ROW LEVEL SECURITY;

-- Allow anyone to submit support tickets
CREATE POLICY "Allow public insert to support_inquiries" 
    ON public.support_inquiries FOR INSERT 
    WITH CHECK (true);

