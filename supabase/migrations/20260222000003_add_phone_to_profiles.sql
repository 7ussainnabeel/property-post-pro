-- Add phone_number field to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone_number TEXT;

-- Add comment
COMMENT ON COLUMN public.profiles.phone_number IS 'User phone number for WhatsApp password reset';
