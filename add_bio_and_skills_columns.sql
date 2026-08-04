-- SQL Migration Script: Add bio and skills columns to public.profiles table
-- Run this in the Supabase SQL Editor: https://supabase.com/dashboard/project/dsqkxedafwzkjtcupzwx/sql

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS skills TEXT;
