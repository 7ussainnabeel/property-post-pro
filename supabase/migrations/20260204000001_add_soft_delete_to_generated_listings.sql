-- Add soft delete columns to generated_listings table
ALTER TABLE public.generated_listings 
ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN deleted_by TEXT;

-- Create index for querying deleted listings
CREATE INDEX idx_generated_listings_deleted_at ON public.generated_listings (deleted_at);
