-- Drop the old insecure has_role function
DROP FUNCTION IF EXISTS public.has_role(UUID, app_role);

-- Create a more secure version that prevents role enumeration
-- This function only allows checking roles for the authenticated user
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Security check: Only allow checking roles for the authenticated user
  -- This prevents role enumeration attacks
  IF _user_id != auth.uid() THEN
    -- Return false instead of raising an error to prevent information leakage
    RETURN FALSE;
  END IF;

  -- Check if the user has the specified role
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
END;
$$;

-- Add a comment explaining the security model
COMMENT ON FUNCTION public.has_role(UUID, app_role) IS 
'Securely checks if a user has a specific role. Only allows checking roles for the authenticated user (auth.uid()) to prevent role enumeration attacks. Returns FALSE for any other user_id.';

-- Create an admin-only function for checking other users' roles
-- This is used internally by RLS policies that already have admin checks
CREATE OR REPLACE FUNCTION public.has_role_admin_check(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

COMMENT ON FUNCTION public.has_role_admin_check(UUID, app_role) IS 
'Internal function for RLS policies. Can check any user''s role. Should only be called from trusted RLS policies with proper authorization checks.';

-- Grant execute permission only to authenticated users
REVOKE ALL ON FUNCTION public.has_role(UUID, app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, app_role) TO authenticated;

REVOKE ALL ON FUNCTION public.has_role_admin_check(UUID, app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role_admin_check(UUID, app_role) TO authenticated;
