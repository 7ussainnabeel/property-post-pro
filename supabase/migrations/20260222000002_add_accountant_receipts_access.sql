-- Update RLS policies for receipts to implement proper role-based access control

-- Drop existing user delete policy - only admins can delete
DROP POLICY IF EXISTS "Users can delete own receipts" ON public.receipts;

-- Drop and recreate user view policy to be branch-based instead of user-based
DROP POLICY IF EXISTS "Users can view own receipts" ON public.receipts;
CREATE POLICY "Users can view receipts from their branch" ON public.receipts
  FOR SELECT TO authenticated 
  USING (
    NOT public.has_role(auth.uid(), 'admin') 
    AND NOT public.has_role(auth.uid(), 'accountant')
    AND NOT public.has_role(auth.uid(), 'it_support')
    AND branch = (SELECT branch FROM public.profiles WHERE id = auth.uid())
  );

-- Accountants can view all receipts (for financial reporting and auditing)
CREATE POLICY "Accountants can view all receipts" ON public.receipts
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'accountant'));

-- Users can update receipts from their branch (admins can update all via existing policy)
DROP POLICY IF EXISTS "Users can update own receipts" ON public.receipts;
CREATE POLICY "Users can update receipts from their branch" ON public.receipts
  FOR UPDATE TO authenticated
  USING (
    (NOT public.has_role(auth.uid(), 'admin') 
     AND NOT public.has_role(auth.uid(), 'it_support')
     AND branch = (SELECT branch FROM public.profiles WHERE id = auth.uid()))
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'it_support')
  );

-- Only users (non-accountants), admins, and IT support can create receipts
DROP POLICY IF EXISTS "Users can create receipts" ON public.receipts;
CREATE POLICY "Users can create receipts" ON public.receipts
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'it_support')
    OR (auth.uid() = user_id AND NOT public.has_role(auth.uid(), 'accountant'))
  );

-- Summary of access control:
-- VIEW: Users (their branch only), Admins (all), Accountants (all - read only), IT Support (all)
-- CREATE: Users (except accountants), Admins, IT Support
-- UPDATE: Users (their branch only, except accountants), Admins (all), IT Support (all)
-- DELETE: Admins (all), IT Support (all) only
