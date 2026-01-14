-- Create the update function first
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create a table for storing video URLs
CREATE TABLE public.video_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  youtube_url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  quality_status TEXT DEFAULT 'pending' CHECK (quality_status IN ('pending', 'approved', 'rejected')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.video_submissions ENABLE ROW LEVEL SECURITY;

-- Create policy for public access (since no auth is required for this feature)
CREATE POLICY "Allow public read access" 
ON public.video_submissions 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert access" 
ON public.video_submissions 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public update access" 
ON public.video_submissions 
FOR UPDATE 
USING (true);

CREATE POLICY "Allow public delete access" 
ON public.video_submissions 
FOR DELETE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_video_submissions_updated_at
BEFORE UPDATE ON public.video_submissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();