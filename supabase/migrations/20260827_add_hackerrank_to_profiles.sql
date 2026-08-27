-- Migration: Add HackerRank and GeeksforGeeks columns to public.profiles
-- Created: 2026-08-27

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS hackerrank_username TEXT,
ADD COLUMN IF NOT EXISTS hackerrank_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS geeksforgeeks_username TEXT,
ADD COLUMN IF NOT EXISTS geeksforgeeks_verified BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_profiles_hackerrank ON public.profiles (hackerrank_username) WHERE hackerrank_username IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_geeksforgeeks ON public.profiles (geeksforgeeks_username) WHERE geeksforgeeks_username IS NOT NULL;

