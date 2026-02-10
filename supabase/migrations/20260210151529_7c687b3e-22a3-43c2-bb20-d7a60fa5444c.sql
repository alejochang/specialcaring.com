
-- Add approval status to user_roles
ALTER TABLE public.user_roles 
ADD COLUMN is_approved boolean NOT NULL DEFAULT false;

-- Approve the existing admin
UPDATE public.user_roles SET is_approved = true WHERE user_id = '36031fed-3e72-49f1-86be-d9dc8c2497d0';

-- Update the auto-assign trigger to set is_approved = false for new users
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role, is_approved)
  VALUES (NEW.id, 'caregiver', false);
  RETURN NEW;
END;
$$;
