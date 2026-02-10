
-- ============================================================
-- MULTI-CAREGIVER SUPPORT MIGRATION
-- ============================================================

-- 1. Create access_role enum
CREATE TYPE public.child_access_role AS ENUM ('owner', 'caregiver', 'viewer');

-- 2. Create child_access table (many-to-many between users and children)
CREATE TABLE public.child_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role child_access_role NOT NULL DEFAULT 'caregiver',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(child_id, user_id)
);

ALTER TABLE public.child_access ENABLE ROW LEVEL SECURITY;

-- 3. Create child_invites table for invite codes and email invites
CREATE TABLE public.child_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  invited_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invite_code text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(6), 'hex'),
  invited_email text,
  role child_access_role NOT NULL DEFAULT 'caregiver',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.child_invites ENABLE ROW LEVEL SECURITY;

-- 4. Security definer function: check if user has access to a child
CREATE OR REPLACE FUNCTION public.has_child_access(_user_id uuid, _child_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.child_access
    WHERE user_id = _user_id AND child_id = _child_id
  )
$$;

-- 5. Security definer function: check if user is owner of a child
CREATE OR REPLACE FUNCTION public.is_child_owner(_user_id uuid, _child_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.child_access
    WHERE user_id = _user_id AND child_id = _child_id AND role = 'owner'
  )
$$;

-- 6. Migrate existing children -> create owner access entries
INSERT INTO public.child_access (child_id, user_id, role)
SELECT id, user_id, 'owner'
FROM public.children
ON CONFLICT (child_id, user_id) DO NOTHING;

-- 7. RLS policies for child_access
CREATE POLICY "Users can view their own access entries"
  ON public.child_access FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view co-caregiver access for shared children"
  ON public.child_access FOR SELECT
  USING (has_child_access(auth.uid(), child_id));

CREATE POLICY "Child owners can insert access"
  ON public.child_access FOR INSERT
  WITH CHECK (is_child_owner(auth.uid(), child_id));

CREATE POLICY "Child owners can update access"
  ON public.child_access FOR UPDATE
  USING (is_child_owner(auth.uid(), child_id));

CREATE POLICY "Child owners can delete access (but not self)"
  ON public.child_access FOR DELETE
  USING (is_child_owner(auth.uid(), child_id) AND auth.uid() != user_id);

-- Allow users to remove their own access (leave a shared child)
CREATE POLICY "Users can remove their own non-owner access"
  ON public.child_access FOR DELETE
  USING (auth.uid() = user_id AND role != 'owner');

-- 8. RLS policies for child_invites
CREATE POLICY "Owners can view invites for their children"
  ON public.child_invites FOR SELECT
  USING (is_child_owner(auth.uid(), child_id));

CREATE POLICY "Invited users can view their invites"
  ON public.child_invites FOR SELECT
  USING (invited_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Owners can create invites"
  ON public.child_invites FOR INSERT
  WITH CHECK (is_child_owner(auth.uid(), child_id));

CREATE POLICY "Owners can update invites"
  ON public.child_invites FOR UPDATE
  USING (is_child_owner(auth.uid(), child_id));

CREATE POLICY "Owners can delete invites"
  ON public.child_invites FOR DELETE
  USING (is_child_owner(auth.uid(), child_id));

-- 9. Update children table RLS: users can view children they have access to
DROP POLICY IF EXISTS "Users can view their own children" ON public.children;
CREATE POLICY "Users can view accessible children"
  ON public.children FOR SELECT
  USING (has_child_access(auth.uid(), id));

-- Only owners can update/delete children
DROP POLICY IF EXISTS "Users can update their own children" ON public.children;
CREATE POLICY "Owners can update their children"
  ON public.children FOR UPDATE
  USING (is_child_owner(auth.uid(), id));

DROP POLICY IF EXISTS "Users can delete their own children" ON public.children;
CREATE POLICY "Owners can delete their children"
  ON public.children FOR DELETE
  USING (is_child_owner(auth.uid(), id));

-- INSERT stays: user_id = auth.uid() (you create children you own)
-- Keep existing insert policy

-- 10. Auto-create owner access when a new child is inserted
CREATE OR REPLACE FUNCTION public.handle_new_child_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.child_access (child_id, user_id, role)
  VALUES (NEW.id, NEW.user_id, 'owner')
  ON CONFLICT (child_id, user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_child_created_add_owner
  AFTER INSERT ON public.children
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_child_access();

-- 11. Update data table RLS policies to use child_access
-- medications
DROP POLICY IF EXISTS "Users can view their own medications" ON public.medications;
CREATE POLICY "Users can view medications for accessible children"
  ON public.medications FOR SELECT
  USING (has_child_access(auth.uid(), child_id));

DROP POLICY IF EXISTS "Users can insert their own medications" ON public.medications;
CREATE POLICY "Users can insert medications for accessible children"
  ON public.medications FOR INSERT
  WITH CHECK (has_child_access(auth.uid(), child_id));

DROP POLICY IF EXISTS "Users can update their own medications" ON public.medications;
CREATE POLICY "Users can update medications for accessible children"
  ON public.medications FOR UPDATE
  USING (has_child_access(auth.uid(), child_id));

DROP POLICY IF EXISTS "Users can delete their own medications" ON public.medications;
CREATE POLICY "Users can delete medications for accessible children"
  ON public.medications FOR DELETE
  USING (has_child_access(auth.uid(), child_id));

-- key_information
DROP POLICY IF EXISTS "Users can view their own key info" ON public.key_information;
CREATE POLICY "Users can view key info for accessible children"
  ON public.key_information FOR SELECT
  USING (has_child_access(auth.uid(), child_id));

DROP POLICY IF EXISTS "Users can insert their own key info" ON public.key_information;
CREATE POLICY "Users can insert key info for accessible children"
  ON public.key_information FOR INSERT
  WITH CHECK (has_child_access(auth.uid(), child_id));

DROP POLICY IF EXISTS "Users can update their own key info" ON public.key_information;
CREATE POLICY "Users can update key info for accessible children"
  ON public.key_information FOR UPDATE
  USING (has_child_access(auth.uid(), child_id));

DROP POLICY IF EXISTS "Users can delete their own key info" ON public.key_information;
CREATE POLICY "Users can delete key info for accessible children"
  ON public.key_information FOR DELETE
  USING (has_child_access(auth.uid(), child_id));

-- emergency_cards
DROP POLICY IF EXISTS "Users can view their own emergency cards" ON public.emergency_cards;
CREATE POLICY "Users can view emergency cards for accessible children"
  ON public.emergency_cards FOR SELECT
  USING (has_child_access(auth.uid(), child_id));

DROP POLICY IF EXISTS "Users can insert their own emergency cards" ON public.emergency_cards;
CREATE POLICY "Users can insert emergency cards for accessible children"
  ON public.emergency_cards FOR INSERT
  WITH CHECK (has_child_access(auth.uid(), child_id));

DROP POLICY IF EXISTS "Users can update their own emergency cards" ON public.emergency_cards;
CREATE POLICY "Users can update emergency cards for accessible children"
  ON public.emergency_cards FOR UPDATE
  USING (has_child_access(auth.uid(), child_id));

DROP POLICY IF EXISTS "Users can delete their own emergency cards" ON public.emergency_cards;
CREATE POLICY "Users can delete emergency cards for accessible children"
  ON public.emergency_cards FOR DELETE
  USING (has_child_access(auth.uid(), child_id));

-- daily_log_entries
DROP POLICY IF EXISTS "Users can view their own daily logs" ON public.daily_log_entries;
CREATE POLICY "Users can view daily logs for accessible children"
  ON public.daily_log_entries FOR SELECT
  USING (has_child_access(auth.uid(), child_id));

DROP POLICY IF EXISTS "Users can insert their own daily logs" ON public.daily_log_entries;
CREATE POLICY "Users can insert daily logs for accessible children"
  ON public.daily_log_entries FOR INSERT
  WITH CHECK (has_child_access(auth.uid(), child_id));

DROP POLICY IF EXISTS "Users can update their own daily logs" ON public.daily_log_entries;
CREATE POLICY "Users can update daily logs for accessible children"
  ON public.daily_log_entries FOR UPDATE
  USING (has_child_access(auth.uid(), child_id));

DROP POLICY IF EXISTS "Users can delete their own daily logs" ON public.daily_log_entries;
CREATE POLICY "Users can delete daily logs for accessible children"
  ON public.daily_log_entries FOR DELETE
  USING (has_child_access(auth.uid(), child_id));

-- emergency_protocols
DROP POLICY IF EXISTS "Users can view their own protocols" ON public.emergency_protocols;
CREATE POLICY "Users can view protocols for accessible children"
  ON public.emergency_protocols FOR SELECT
  USING (has_child_access(auth.uid(), child_id));

DROP POLICY IF EXISTS "Users can insert their own protocols" ON public.emergency_protocols;
CREATE POLICY "Users can insert protocols for accessible children"
  ON public.emergency_protocols FOR INSERT
  WITH CHECK (has_child_access(auth.uid(), child_id));

DROP POLICY IF EXISTS "Users can update their own protocols" ON public.emergency_protocols;
CREATE POLICY "Users can update protocols for accessible children"
  ON public.emergency_protocols FOR UPDATE
  USING (has_child_access(auth.uid(), child_id));

DROP POLICY IF EXISTS "Users can delete their own protocols" ON public.emergency_protocols;
CREATE POLICY "Users can delete protocols for accessible children"
  ON public.emergency_protocols FOR DELETE
  USING (has_child_access(auth.uid(), child_id));

-- home_safety_checks
DROP POLICY IF EXISTS "Users can view their own safety checks" ON public.home_safety_checks;
CREATE POLICY "Users can view safety checks for accessible children"
  ON public.home_safety_checks FOR SELECT
  USING (has_child_access(auth.uid(), child_id));

DROP POLICY IF EXISTS "Users can insert their own safety checks" ON public.home_safety_checks;
CREATE POLICY "Users can insert safety checks for accessible children"
  ON public.home_safety_checks FOR INSERT
  WITH CHECK (has_child_access(auth.uid(), child_id));

DROP POLICY IF EXISTS "Users can delete their own safety checks" ON public.home_safety_checks;
CREATE POLICY "Users can delete safety checks for accessible children"
  ON public.home_safety_checks FOR DELETE
  USING (has_child_access(auth.uid(), child_id));

-- medical_contacts
DROP POLICY IF EXISTS "Users can view their own medical contacts" ON public.medical_contacts;
CREATE POLICY "Users can view medical contacts for accessible children"
  ON public.medical_contacts FOR SELECT
  USING (has_child_access(auth.uid(), child_id));

DROP POLICY IF EXISTS "Users can insert their own medical contacts" ON public.medical_contacts;
CREATE POLICY "Users can insert medical contacts for accessible children"
  ON public.medical_contacts FOR INSERT
  WITH CHECK (has_child_access(auth.uid(), child_id));

DROP POLICY IF EXISTS "Users can update their own medical contacts" ON public.medical_contacts;
CREATE POLICY "Users can update medical contacts for accessible children"
  ON public.medical_contacts FOR UPDATE
  USING (has_child_access(auth.uid(), child_id));

DROP POLICY IF EXISTS "Users can delete their own medical contacts" ON public.medical_contacts;
CREATE POLICY "Users can delete medical contacts for accessible children"
  ON public.medical_contacts FOR DELETE
  USING (has_child_access(auth.uid(), child_id));

-- suppliers
DROP POLICY IF EXISTS "Users can view their own suppliers" ON public.suppliers;
CREATE POLICY "Users can view suppliers for accessible children"
  ON public.suppliers FOR SELECT
  USING (has_child_access(auth.uid(), child_id));

DROP POLICY IF EXISTS "Users can insert their own suppliers" ON public.suppliers;
CREATE POLICY "Users can insert suppliers for accessible children"
  ON public.suppliers FOR INSERT
  WITH CHECK (has_child_access(auth.uid(), child_id));

DROP POLICY IF EXISTS "Users can update their own suppliers" ON public.suppliers;
CREATE POLICY "Users can update suppliers for accessible children"
  ON public.suppliers FOR UPDATE
  USING (has_child_access(auth.uid(), child_id));

DROP POLICY IF EXISTS "Users can delete their own suppliers" ON public.suppliers;
CREATE POLICY "Users can delete suppliers for accessible children"
  ON public.suppliers FOR DELETE
  USING (has_child_access(auth.uid(), child_id));

-- saved_community_services
DROP POLICY IF EXISTS "Users can view their own saved services" ON public.saved_community_services;
CREATE POLICY "Users can view saved services for accessible children"
  ON public.saved_community_services FOR SELECT
  USING (has_child_access(auth.uid(), child_id));

DROP POLICY IF EXISTS "Users can insert their own saved services" ON public.saved_community_services;
CREATE POLICY "Users can insert saved services for accessible children"
  ON public.saved_community_services FOR INSERT
  WITH CHECK (has_child_access(auth.uid(), child_id));

DROP POLICY IF EXISTS "Users can delete their own saved services" ON public.saved_community_services;
CREATE POLICY "Users can delete saved services for accessible children"
  ON public.saved_community_services FOR DELETE
  USING (has_child_access(auth.uid(), child_id));
