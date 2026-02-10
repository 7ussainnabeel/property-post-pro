# Apply Payment Receipt Migration - REQUIRED BEFORE UPLOAD

## ⚠️ Run this SQL in Supabase Dashboard NOW

**Go to: https://supabase.com → Your Project → SQL Editor → New Query**

Paste and run this SQL:

```sql
-- Add accountant role to the enum (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'app_role' AND e.enumlabel = 'accountant') THEN
    ALTER TYPE public.app_role ADD VALUE 'accountant';
  END IF;
END $$;

-- Add payment_receipt_url column to receipts table
ALTER TABLE public.receipts
ADD COLUMN IF NOT EXISTS payment_receipt_url TEXT;

-- Create storage bucket for receipt uploads (THIS FIXES "Bucket not found" ERROR)
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload receipts
DROP POLICY IF EXISTS "Allow authenticated users to upload receipts" ON storage.objects;
CREATE POLICY "Allow authenticated users to upload receipts"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'receipts');

-- Allow authenticated users to read receipts
DROP POLICY IF EXISTS "Allow authenticated users to read receipts" ON storage.objects;
CREATE POLICY "Allow authenticated users to read receipts"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'receipts');

-- Allow authenticated users to update receipts
DROP POLICY IF EXISTS "Allow authenticated users to update receipts" ON storage.objects;
CREATE POLICY "Allow authenticated users to update receipts"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'receipts');

-- Allow authenticated users to delete receipts
DROP POLICY IF EXISTS "Allow authenticated users to delete receipts" ON storage.objects;
CREATE POLICY "Allow authenticated users to delete receipts"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'receipts');
```

## After Running SQL:
1. Refresh your app
2. Try uploading again
3. Upload should work now!
