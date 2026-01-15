-- Add AI review fields to video_submissions
ALTER TABLE public.video_submissions 
ADD COLUMN orientation TEXT,
ADD COLUMN stability_rating INTEGER,
ADD COLUMN overall_rating INTEGER,
ADD COLUMN ai_feedback TEXT,
ADD COLUMN reviewed_at TIMESTAMP WITH TIME ZONE;