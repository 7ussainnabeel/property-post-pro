-- Create storage bucket for video uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('videos', 'videos', true);

-- Allow public read access to videos
CREATE POLICY "Allow public read access to videos"
ON storage.objects FOR SELECT
USING (bucket_id = 'videos');

-- Allow public upload to videos bucket
CREATE POLICY "Allow public upload to videos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'videos');

-- Allow public update to videos bucket  
CREATE POLICY "Allow public update to videos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'videos');

-- Allow public delete from videos bucket
CREATE POLICY "Allow public delete to videos"
ON storage.objects FOR DELETE
USING (bucket_id = 'videos');

-- Add video_file_url column to video_submissions
ALTER TABLE public.video_submissions
ADD COLUMN video_file_url TEXT,
ALTER COLUMN youtube_url DROP NOT NULL;