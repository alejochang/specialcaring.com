-- Fix: Make check_children_limit SECURITY DEFINER so RLS doesn't interfere
-- The trigger does SELECT COUNT(*) FROM children which is subject to RLS
-- For new users with no child_access entries, this can cause issues

CREATE OR REPLACE FUNCTION public.check_children_limit()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $function$
BEGIN
  IF (SELECT COUNT(*) FROM public.children WHERE user_id = NEW.user_id) >= 10 THEN
    RAISE EXCEPTION 'Maximum of 10 children per account';
  END IF;
  RETURN NEW;
END;
$function$;