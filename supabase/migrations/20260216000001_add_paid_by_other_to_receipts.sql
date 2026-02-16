-- Add paid_by_other column to receipts table
ALTER TABLE public.receipts ADD COLUMN IF NOT EXISTS paid_by_other TEXT;
