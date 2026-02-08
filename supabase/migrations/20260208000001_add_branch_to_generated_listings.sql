-- Add branch field to generated_listings table
ALTER TABLE generated_listings 
ADD COLUMN IF NOT EXISTS branch TEXT;

-- Create index on branch for faster filtering
CREATE INDEX IF NOT EXISTS idx_generated_listings_branch ON generated_listings(branch);

-- Update existing records to have a default branch (optional - you can set to NULL or a specific branch)
-- UPDATE generated_listings SET branch = 'dubai' WHERE branch IS NULL;
