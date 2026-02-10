-- First, update any existing data to use lowercase branch IDs
UPDATE public.profiles 
SET branch = LOWER(branch) 
WHERE branch IS NOT NULL;

UPDATE public.receipts 
SET branch = LOWER(branch) 
WHERE branch IS NOT NULL;

-- Create branch enum type to restrict to only 4 branches
DO $$ BEGIN
  CREATE TYPE public.branch_type AS ENUM ('seef', 'manama', 'saar', 'amwaj-island');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Update profiles table to use branch enum
ALTER TABLE public.profiles 
  ALTER COLUMN branch TYPE branch_type USING branch::branch_type;

-- Update receipts table to use branch enum
ALTER TABLE public.receipts 
  ALTER COLUMN branch TYPE branch_type USING branch::branch_type;

-- Update the handle_new_user function to save branch from user metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, branch)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'branch', NULL)::branch_type
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;
