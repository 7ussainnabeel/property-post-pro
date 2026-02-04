-- Create generated_listings table to store property listing generation history
CREATE TABLE IF NOT EXISTS public.generated_listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Property Details
  property_type TEXT NOT NULL,
  category TEXT NOT NULL,
  listing_type TEXT NOT NULL,
  location TEXT NOT NULL,
  size NUMERIC,
  bedrooms INTEGER,
  bathrooms INTEGER,
  price TEXT NOT NULL,
  currency TEXT NOT NULL,
  furnishing_status TEXT,
  amenities TEXT[],
  ewa_included BOOLEAN DEFAULT false,
  land_classification TEXT,
  unique_selling_points TEXT,
  agent TEXT,
  
  -- Generated Content (English)
  property_finder_title_en TEXT,
  property_finder_en TEXT,
  instagram_en TEXT,
  website_en TEXT,
  
  -- Generated Content (Arabic)
  property_finder_title_ar TEXT,
  property_finder_ar TEXT,
  instagram_ar TEXT,
  website_ar TEXT,
  
  -- Metadata
  user_id UUID,
  notes TEXT,
  is_favorite BOOLEAN DEFAULT false
);

-- Enable Row Level Security
ALTER TABLE public.generated_listings ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for now (can be refined later with auth)
CREATE POLICY "Allow all operations on generated_listings" ON public.generated_listings
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_generated_listings_created_at ON public.generated_listings (created_at DESC);
CREATE INDEX idx_generated_listings_property_type ON public.generated_listings (property_type);
CREATE INDEX idx_generated_listings_location ON public.generated_listings (location);
CREATE INDEX idx_generated_listings_is_favorite ON public.generated_listings (is_favorite);
