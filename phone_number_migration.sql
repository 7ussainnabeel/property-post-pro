-- =============================================================================
-- PHONE NUMBER MIGRATION - Upload this to Supabase SQL Editor
-- Date: February 22, 2026
-- =============================================================================
-- This migration adds phone number support for WhatsApp integration
-- =============================================================================

-- Add phone_number column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone_number TEXT;

-- Add comment
COMMENT ON COLUMN public.profiles.phone_number IS 'User phone number for WhatsApp password reset';

-- Update the handle_new_user function to save phone_number from user metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, branch, phone_number)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'branch', NULL)::branch_type,
    COALESCE(NEW.raw_user_meta_data->>'phone_number', NULL)
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================
-- ✓ Added phone_number column to profiles
-- ✓ Updated handle_new_user trigger to save phone number from signup metadata
-- =============================================================================
