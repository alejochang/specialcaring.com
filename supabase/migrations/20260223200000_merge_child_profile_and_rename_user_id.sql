-- ============================================================
-- DOMAIN MODEL REFACTORING: Merge Child + KeyInformation
-- Rename user_id → created_by across all tables
-- ============================================================
--
-- RATIONALE:
-- The 1:1 split between `children` (thin identity) and `key_information`
-- (full profile) is an artificial domain boundary. The child IS the profile.
-- Additionally, `user_id` is misleading — authorization comes from
-- `child_access`, not from `user_id`. Renaming to `created_by` clarifies
-- its purpose as an audit trail field.
--
-- CHANGES:
-- 1. Add all key_information columns to children
-- 2. Migrate data from key_information → children
-- 3. Rename user_id → created_by on children + all data tables
-- 4. Update trigger functions
-- 5. Update RLS policies
-- 6. Replace key_information_secure view with children_secure
-- 7. Drop key_information table
-- ============================================================

BEGIN;

-- ============================================================
-- STEP 1: Add profile columns to children table
-- ============================================================

ALTER TABLE public.children
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS birth_date TEXT,
  ADD COLUMN IF NOT EXISTS address TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS phone_number TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS health_card_number TEXT,
  ADD COLUMN IF NOT EXISTS insurance_provider TEXT,
  ADD COLUMN IF NOT EXISTS insurance_number TEXT,
  ADD COLUMN IF NOT EXISTS emergency_contact TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS emergency_phone TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS medical_conditions TEXT,
  ADD COLUMN IF NOT EXISTS allergies TEXT,
  ADD COLUMN IF NOT EXISTS likes TEXT,
  ADD COLUMN IF NOT EXISTS dislikes TEXT,
  ADD COLUMN IF NOT EXISTS do_nots TEXT,
  ADD COLUMN IF NOT EXISTS additional_notes TEXT;

-- ============================================================
-- STEP 2: Migrate data from key_information → children
-- ============================================================

UPDATE public.children c
SET
  full_name       = COALESCE(ki.full_name, c.name),
  birth_date      = ki.birth_date,
  address         = COALESCE(ki.address, ''),
  phone_number    = COALESCE(ki.phone_number, ''),
  email           = ki.email,
  health_card_number = ki.health_card_number,
  insurance_provider = ki.insurance_provider,
  insurance_number   = ki.insurance_number,
  emergency_contact  = COALESCE(ki.emergency_contact, ''),
  emergency_phone    = COALESCE(ki.emergency_phone, ''),
  medical_conditions = ki.medical_conditions,
  allergies          = ki.allergies,
  likes              = ki.likes,
  dislikes           = ki.dislikes,
  do_nots            = ki.do_nots,
  additional_notes   = ki.additional_notes
FROM public.key_information ki
WHERE ki.child_id = c.id;

-- For children that had no key_information row, default full_name from name
UPDATE public.children
SET full_name = name
WHERE full_name IS NULL;

-- ============================================================
-- STEP 3: Drop the key_information_secure view BEFORE renaming columns
-- (views depend on underlying column names)
-- ============================================================

DROP VIEW IF EXISTS public.key_information_secure CASCADE;

-- ============================================================
-- STEP 4: Rename user_id → created_by on children table
-- ============================================================

ALTER TABLE public.children RENAME COLUMN user_id TO created_by;

-- ============================================================
-- STEP 5: Rename user_id → created_by on ALL data tables
-- ============================================================

ALTER TABLE public.medications RENAME COLUMN user_id TO created_by;
ALTER TABLE public.medical_contacts RENAME COLUMN user_id TO created_by;
ALTER TABLE public.emergency_protocols RENAME COLUMN user_id TO created_by;
ALTER TABLE public.emergency_cards RENAME COLUMN user_id TO created_by;
ALTER TABLE public.daily_log_entries RENAME COLUMN user_id TO created_by;
ALTER TABLE public.suppliers RENAME COLUMN user_id TO created_by;
ALTER TABLE public.employment_agreements RENAME COLUMN user_id TO created_by;
ALTER TABLE public.financial_legal_docs RENAME COLUMN user_id TO created_by;
ALTER TABLE public.end_of_life_wishes RENAME COLUMN user_id TO created_by;
ALTER TABLE public.home_safety_checks RENAME COLUMN user_id TO created_by;
ALTER TABLE public.key_information RENAME COLUMN user_id TO created_by;

-- ============================================================
-- STEP 6: Update trigger functions that reference user_id
-- ============================================================

-- 6a: Children limit check
CREATE OR REPLACE FUNCTION public.check_children_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF (SELECT COUNT(*) FROM public.children WHERE created_by = NEW.created_by) >= 10 THEN
    RAISE EXCEPTION 'Maximum of 10 children per account';
  END IF;
  RETURN NEW;
END;
$$;

-- 6b: Auto-create owner access when child is created
CREATE OR REPLACE FUNCTION public.handle_new_child_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.child_access (child_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'owner')
  ON CONFLICT (child_id, user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- ============================================================
-- STEP 7: Update RLS policies on children table
-- ============================================================

-- 7a: INSERT policy (the only policy that directly references created_by)
DROP POLICY IF EXISTS "Users can insert their own children" ON public.children;
CREATE POLICY "Users can insert their own children"
  ON public.children
  FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- 7b: UPDATE policy — allow any caregiver with access to update profile
-- (previously only owners could update children; now caregivers edit profile too)
DROP POLICY IF EXISTS "Owners can update their children" ON public.children;
CREATE POLICY "Caregivers can update accessible children"
  ON public.children
  FOR UPDATE
  USING (has_child_access(auth.uid(), id));

-- NOTE: SELECT and DELETE policies use has_child_access() / is_child_owner()
-- which reference child_access.user_id (NOT children.user_id), so they
-- are unaffected by the rename.

-- ============================================================
-- STEP 8: Create new children_secure view
-- ============================================================
-- This replaces key_information_secure. If the original view used
-- pgcrypto decrypt() functions, those same calls should be replicated
-- here. The version below passes columns through directly — adjust
-- if your Supabase project uses column-level encryption.

CREATE OR REPLACE VIEW public.children_secure AS
SELECT
  id,
  created_by,
  name,
  avatar_url,
  full_name,
  birth_date,
  address,
  phone_number,
  email,
  health_card_number,
  insurance_provider,
  insurance_number,
  emergency_contact,
  emergency_phone,
  medical_conditions,
  allergies,
  likes,
  dislikes,
  do_nots,
  additional_notes,
  created_at,
  updated_at
FROM public.children;

-- ============================================================
-- STEP 9: Drop key_information table
-- ============================================================

DROP TABLE IF EXISTS public.key_information CASCADE;

COMMIT;
