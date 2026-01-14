-- Add agent and property_id columns to video_submissions table
ALTER TABLE public.video_submissions 
ADD COLUMN agent_name text,
ADD COLUMN property_id text;