-- Enable RLS on encryption_keys table to prevent direct access
-- SECURITY DEFINER functions (encrypt_sensitive, decrypt_sensitive) bypass RLS automatically
ALTER TABLE public.encryption_keys ENABLE ROW LEVEL SECURITY;

-- No policies are added intentionally - this means NO direct user access is allowed
-- Only SECURITY DEFINER functions can read/write encryption keys