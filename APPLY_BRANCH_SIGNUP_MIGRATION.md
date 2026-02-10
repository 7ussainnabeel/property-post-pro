# Apply Branch on Signup Migration

This migration updates the `handle_new_user()` trigger to save the user's branch selection during signup.

## Steps to Apply

1. Go to your Supabase Dashboard: https://supabase.com
2. Select your project
3. Navigate to **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy and paste the following SQL:

```sql
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
```

6. Click **Run** (or press Ctrl/Cmd + Enter)
7. You should see "Success. No rows returned"

## What This Does

- Creates a `branch_type` ENUM in the database with exactly 4 allowed values:
  - `seef` (Seef Branch)
  - `manama` (Manama Branch)
  - `saar` (Saar Branch)
  - `amwaj-island` (Amwaj Island Branch)
- Updates both `profiles` and `receipts` tables to use this ENUM type
- Enforces database-level validation - only these 4 branches can be stored
- Updates the signup trigger to save the selected branch to the user's profile
- New users will have their branch automatically saved when they sign up
- The branch will be loaded automatically when the user logs in
- Users no longer need to manually select their branch after signup

## Testing

1. Sign up a new user with branch selection
2. Log in with that user
3. The user's branch should be automatically loaded
4. When creating a receipt, it will use the user's assigned branch

## Notes

- Existing users without a branch can still select one manually on the Branch Selection page
- The branch is stored in both the profiles table and localStorage for quick access
