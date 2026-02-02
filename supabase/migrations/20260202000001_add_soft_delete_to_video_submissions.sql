-- Add soft delete columns to video_submissions table
ALTER TABLE public.video_submissions 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS deleted_by TEXT;

-- Create index for faster queries on non-deleted videos
CREATE INDEX IF NOT EXISTS idx_video_submissions_deleted_at 
ON public.video_submissions(deleted_at) 
WHERE deleted_at IS NULL;

-- Create index for faster queries on deleted videos
CREATE INDEX IF NOT EXISTS idx_video_submissions_deleted 
ON public.video_submissions(deleted_at) 
WHERE deleted_at IS NOT NULL;
