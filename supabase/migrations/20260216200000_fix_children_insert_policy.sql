-- ============================================================
-- FIX: Ensure INSERT policy exists for children table
--
-- Issue: Users getting 403 when trying to add a child.
-- Root cause: INSERT policy may be missing in production.
--
-- The INSERT policy is essential because:
-- 1. New users have no child_access entries yet
-- 2. They must be able to insert a child first
-- 3. The on_child_created_add_owner trigger then creates their owner access
-- ============================================================

-- Drop and recreate to ensure policy exists with correct definition
DROP POLICY IF EXISTS "Users can insert their own children" ON public.children;

CREATE POLICY "Users can insert their own children"
  ON public.children
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Add a comment for documentation
COMMENT ON POLICY "Users can insert their own children" ON public.children IS
  'Allows authenticated users to create children with themselves as owner. The on_child_created_add_owner trigger auto-creates the child_access entry.';
