-- Allow users to see children they own directly (needed for INSERT...RETURNING)
-- The existing policy uses has_child_access which relies on child_access table,
-- but during INSERT the AFTER trigger hasn't created the child_access row yet.
CREATE POLICY "Users can view their own inserted children"
ON public.children
FOR SELECT
USING (auth.uid() = user_id);
