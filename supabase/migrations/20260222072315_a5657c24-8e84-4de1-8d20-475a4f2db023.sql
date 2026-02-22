
-- Step 1: Add 'it_support' to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'it_support';
