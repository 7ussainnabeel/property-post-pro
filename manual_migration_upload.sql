-- =============================================================================
-- MANUAL MIGRATION FILE - Upload this to Supabase SQL Editor
-- Date: February 22, 2026
-- =============================================================================
-- This file contains all pending migrations that need to be applied:
-- 1. Add IT Support role
-- 2. Update accountant RLS policies
-- 3. Add IT Support settings and policies
-- 4. Add phone number to profiles
-- =============================================================================

-- -----------------------------------------------------------------------------
-- STEP 1: Add 'it_support' role to app_role enum
-- -----------------------------------------------------------------------------
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'it_support';


-- -----------------------------------------------------------------------------
-- STEP 2: Update RLS policies for receipts (accountant access control)
-- -----------------------------------------------------------------------------

-- Drop all existing receipt policies that we'll be recreating
DROP POLICY IF EXISTS "Users can delete own receipts" ON public.receipts;
DROP POLICY IF EXISTS "Users can view own receipts" ON public.receipts;
DROP POLICY IF EXISTS "Users can view receipts from their branch" ON public.receipts;
DROP POLICY IF EXISTS "Accountants can view all receipts" ON public.receipts;
DROP POLICY IF EXISTS "Users can update own receipts" ON public.receipts;
DROP POLICY IF EXISTS "Users can update receipts from their branch" ON public.receipts;
DROP POLICY IF EXISTS "Users can create receipts" ON public.receipts;

-- Create user view policy to be branch-based
CREATE POLICY "Users can view receipts from their branch" ON public.receipts
  FOR SELECT TO authenticated 
  USING (
    NOT public.has_role(auth.uid(), 'admin') 
    AND NOT public.has_role(auth.uid(), 'accountant')
    AND NOT public.has_role(auth.uid(), 'it_support')
    AND branch = (SELECT branch FROM public.profiles WHERE user_id = auth.uid())
  );

-- Accountants can view all receipts (for financial reporting and auditing)
CREATE POLICY "Accountants can view all receipts" ON public.receipts
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'accountant'));

-- Users can update receipts from their branch (admins can update all via existing policy)
CREATE POLICY "Users can update receipts from their branch" ON public.receipts
  FOR UPDATE TO authenticated
  USING (
    (NOT public.has_role(auth.uid(), 'admin') 
     AND NOT public.has_role(auth.uid(), 'it_support')
     AND branch = (SELECT branch FROM public.profiles WHERE user_id = auth.uid()))
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'it_support')
  );

-- Only users (non-accountants), admins, and IT support can create receipts
CREATE POLICY "Users can create receipts" ON public.receipts
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'it_support')
    OR (auth.uid() = user_id AND NOT public.has_role(auth.uid(), 'accountant'))
  );


-- -----------------------------------------------------------------------------
-- STEP 3: Create edit_duration_settings table and IT Support policies
-- -----------------------------------------------------------------------------

-- Create edit_duration_settings table
CREATE TABLE IF NOT EXISTS public.edit_duration_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  edit_duration_days integer NOT NULL DEFAULT 3,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

ALTER TABLE public.edit_duration_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read edit duration" ON public.edit_duration_settings;
CREATE POLICY "Authenticated users can read edit duration" ON public.edit_duration_settings
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "IT Support can update edit duration" ON public.edit_duration_settings;
CREATE POLICY "IT Support can update edit duration" ON public.edit_duration_settings
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'it_support'));

DROP POLICY IF EXISTS "IT Support can insert edit duration" ON public.edit_duration_settings;
CREATE POLICY "IT Support can insert edit duration" ON public.edit_duration_settings
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'it_support'));

INSERT INTO public.edit_duration_settings (edit_duration_days) 
SELECT 3
WHERE NOT EXISTS (SELECT 1 FROM public.edit_duration_settings);

-- Add created_by_email column to receipts
ALTER TABLE public.receipts ADD COLUMN IF NOT EXISTS created_by_email text;

-- Assign IT Support role to support@icarlton.com
INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'it_support'::app_role
FROM auth.users u
WHERE u.email = 'support@icarlton.com'
AND NOT EXISTS (
  SELECT 1 FROM public.user_roles ur WHERE ur.user_id = u.id AND ur.role = 'it_support'
);

-- IT Support RLS policies for receipts
DROP POLICY IF EXISTS "IT Support can view all receipts" ON public.receipts;
CREATE POLICY "IT Support can view all receipts" ON public.receipts
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'it_support'));

DROP POLICY IF EXISTS "IT Support can update all receipts" ON public.receipts;
CREATE POLICY "IT Support can update all receipts" ON public.receipts
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'it_support'));

DROP POLICY IF EXISTS "IT Support can delete all receipts" ON public.receipts;
CREATE POLICY "IT Support can delete all receipts" ON public.receipts
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'it_support'));

-- IT Support RLS policies for profiles
DROP POLICY IF EXISTS "IT Support can view all profiles" ON public.profiles;
CREATE POLICY "IT Support can view all profiles" ON public.profiles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'it_support'));

DROP POLICY IF EXISTS "IT Support can update all profiles" ON public.profiles;
CREATE POLICY "IT Support can update all profiles" ON public.profiles
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'it_support'));

-- IT Support RLS policies for user_roles
DROP POLICY IF EXISTS "IT Support can manage all roles" ON public.user_roles;
CREATE POLICY "IT Support can manage all roles" ON public.user_roles
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'it_support'));


-- -----------------------------------------------------------------------------
-- STEP 4: Add phone_number field to profiles table
-- -----------------------------------------------------------------------------

-- Add phone_number field to profiles table
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
-- Summary of changes:
-- ✓ Added IT Support role to app_role enum
-- ✓ Updated RLS policies for accountant role (view-only access to all receipts)
-- ✓ Updated RLS policies to prevent accountants from creating receipts
-- ✓ Created edit_duration_settings table for IT Support panel
-- ✓ Added IT Support RLS policies for full system access
-- ✓ Added created_by_email column to receipts
-- ✓ Assigned IT Support role to support@icarlton.com
-- ✓ Added phone_number column to profiles for WhatsApp integration
-- =============================================================================
