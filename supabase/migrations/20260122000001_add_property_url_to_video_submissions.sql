-- Add property_url column to video_submissions table
ALTER TABLE public.video_submissions 
ADD COLUMN IF NOT EXISTS property_url TEXT;
