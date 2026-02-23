
-- Fix the policy that references auth.users (which authenticated role can't access)
DROP POLICY IF EXISTS "Invited users can view their invites" ON public.child_invites;

CREATE POLICY "Invited users can view their invites"
ON public.child_invites
FOR SELECT
USING (invited_email = (auth.jwt() ->> 'email'));
