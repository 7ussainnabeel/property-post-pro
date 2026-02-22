-- Fix foreign key constraint on edit_duration_settings to allow user deletion
-- This ensures that when a user is deleted, the updated_by field is set to NULL
-- instead of blocking the deletion

-- Drop the existing foreign key constraint
ALTER TABLE public.edit_duration_settings 
DROP CONSTRAINT IF EXISTS edit_duration_settings_updated_by_fkey;

-- Add it back with ON DELETE SET NULL
ALTER TABLE public.edit_duration_settings 
ADD CONSTRAINT edit_duration_settings_updated_by_fkey 
FOREIGN KEY (updated_by) REFERENCES auth.users(id) ON DELETE SET NULL;
