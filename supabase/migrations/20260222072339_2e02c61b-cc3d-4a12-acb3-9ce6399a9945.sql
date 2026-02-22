
-- Create edit_duration_settings table
CREATE TABLE public.edit_duration_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  edit_duration_days integer NOT NULL DEFAULT 3,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

ALTER TABLE public.edit_duration_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read edit duration" ON public.edit_duration_settings
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "IT Support can update edit duration" ON public.edit_duration_settings
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'it_support'));

CREATE POLICY "IT Support can insert edit duration" ON public.edit_duration_settings
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'it_support'));

INSERT INTO public.edit_duration_settings (edit_duration_days) VALUES (3);

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
CREATE POLICY "IT Support can view all receipts" ON public.receipts
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'it_support'));

CREATE POLICY "IT Support can update all receipts" ON public.receipts
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'it_support'));

CREATE POLICY "IT Support can delete all receipts" ON public.receipts
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'it_support'));

-- IT Support RLS policies for profiles
CREATE POLICY "IT Support can view all profiles" ON public.profiles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'it_support'));

CREATE POLICY "IT Support can update all profiles" ON public.profiles
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'it_support'));

-- IT Support RLS policies for user_roles
CREATE POLICY "IT Support can manage all roles" ON public.user_roles
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'it_support'));
