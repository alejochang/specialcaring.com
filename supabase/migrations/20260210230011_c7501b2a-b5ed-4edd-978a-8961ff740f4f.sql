
-- Create a security definer function that allows redeeming invites
-- This bypasses RLS since the redeemer isn't the owner
CREATE OR REPLACE FUNCTION public.redeem_invite(_invite_code text, _user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _invite record;
  _existing record;
BEGIN
  -- Find valid invite
  SELECT * INTO _invite FROM public.child_invites
  WHERE invite_code = _invite_code AND status = 'pending' AND expires_at > now();
  
  IF _invite IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Invalid or expired invite code');
  END IF;

  -- Check if user already has access
  SELECT id INTO _existing FROM public.child_access
  WHERE child_id = _invite.child_id AND user_id = _user_id;
  
  IF _existing IS NOT NULL THEN
    RETURN json_build_object('success', false, 'error', 'You already have access to this child');
  END IF;

  -- Create access
  INSERT INTO public.child_access (child_id, user_id, role)
  VALUES (_invite.child_id, _user_id, _invite.role);

  -- Mark invite as accepted
  UPDATE public.child_invites SET status = 'accepted' WHERE id = _invite.id;

  RETURN json_build_object('success', true, 'child_id', _invite.child_id);
END;
$$;
