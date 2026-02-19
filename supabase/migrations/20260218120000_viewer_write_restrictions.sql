-- ============================================================
-- VIEWER WRITE RESTRICTIONS
-- Restrict INSERT/UPDATE/DELETE to owner and caregiver roles only.
-- Viewers (read-only) must not be able to modify child data.
-- ============================================================

-- 1. Create helper function: returns true only for owner/caregiver roles
CREATE OR REPLACE FUNCTION public.can_write_child_data(_user_id uuid, _child_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.child_access
    WHERE user_id = _user_id AND child_id = _child_id AND role IN ('owner', 'caregiver')
  )
$$;

-- ============================================================
-- 2. medications
-- ============================================================
DROP POLICY IF EXISTS "Users can insert medications for accessible children" ON public.medications;
DROP POLICY IF EXISTS "Users can update medications for accessible children" ON public.medications;
DROP POLICY IF EXISTS "Users can delete medications for accessible children" ON public.medications;

CREATE POLICY "Owners and caregivers can insert medications"
  ON public.medications FOR INSERT
  WITH CHECK (can_write_child_data(auth.uid(), child_id));

CREATE POLICY "Owners and caregivers can update medications"
  ON public.medications FOR UPDATE
  USING (can_write_child_data(auth.uid(), child_id));

CREATE POLICY "Owners and caregivers can delete medications"
  ON public.medications FOR DELETE
  USING (can_write_child_data(auth.uid(), child_id));

-- ============================================================
-- 3. key_information
-- ============================================================
DROP POLICY IF EXISTS "Users can insert key info for accessible children" ON public.key_information;
DROP POLICY IF EXISTS "Users can update key info for accessible children" ON public.key_information;
DROP POLICY IF EXISTS "Users can delete key info for accessible children" ON public.key_information;

CREATE POLICY "Owners and caregivers can insert key info"
  ON public.key_information FOR INSERT
  WITH CHECK (can_write_child_data(auth.uid(), child_id));

CREATE POLICY "Owners and caregivers can update key info"
  ON public.key_information FOR UPDATE
  USING (can_write_child_data(auth.uid(), child_id));

CREATE POLICY "Owners and caregivers can delete key info"
  ON public.key_information FOR DELETE
  USING (can_write_child_data(auth.uid(), child_id));

-- ============================================================
-- 4. emergency_cards
-- ============================================================
DROP POLICY IF EXISTS "Users can insert emergency cards for accessible children" ON public.emergency_cards;
DROP POLICY IF EXISTS "Users can update emergency cards for accessible children" ON public.emergency_cards;
DROP POLICY IF EXISTS "Users can delete emergency cards for accessible children" ON public.emergency_cards;

CREATE POLICY "Owners and caregivers can insert emergency cards"
  ON public.emergency_cards FOR INSERT
  WITH CHECK (can_write_child_data(auth.uid(), child_id));

CREATE POLICY "Owners and caregivers can update emergency cards"
  ON public.emergency_cards FOR UPDATE
  USING (can_write_child_data(auth.uid(), child_id));

CREATE POLICY "Owners and caregivers can delete emergency cards"
  ON public.emergency_cards FOR DELETE
  USING (can_write_child_data(auth.uid(), child_id));

-- ============================================================
-- 5. daily_log_entries
-- ============================================================
DROP POLICY IF EXISTS "Users can insert daily logs for accessible children" ON public.daily_log_entries;
DROP POLICY IF EXISTS "Users can update daily logs for accessible children" ON public.daily_log_entries;
DROP POLICY IF EXISTS "Users can delete daily logs for accessible children" ON public.daily_log_entries;

CREATE POLICY "Owners and caregivers can insert daily logs"
  ON public.daily_log_entries FOR INSERT
  WITH CHECK (can_write_child_data(auth.uid(), child_id));

CREATE POLICY "Owners and caregivers can update daily logs"
  ON public.daily_log_entries FOR UPDATE
  USING (can_write_child_data(auth.uid(), child_id));

CREATE POLICY "Owners and caregivers can delete daily logs"
  ON public.daily_log_entries FOR DELETE
  USING (can_write_child_data(auth.uid(), child_id));

-- ============================================================
-- 6. emergency_protocols
-- ============================================================
DROP POLICY IF EXISTS "Users can insert protocols for accessible children" ON public.emergency_protocols;
DROP POLICY IF EXISTS "Users can update protocols for accessible children" ON public.emergency_protocols;
DROP POLICY IF EXISTS "Users can delete protocols for accessible children" ON public.emergency_protocols;

CREATE POLICY "Owners and caregivers can insert protocols"
  ON public.emergency_protocols FOR INSERT
  WITH CHECK (can_write_child_data(auth.uid(), child_id));

CREATE POLICY "Owners and caregivers can update protocols"
  ON public.emergency_protocols FOR UPDATE
  USING (can_write_child_data(auth.uid(), child_id));

CREATE POLICY "Owners and caregivers can delete protocols"
  ON public.emergency_protocols FOR DELETE
  USING (can_write_child_data(auth.uid(), child_id));

-- ============================================================
-- 7. home_safety_checks
-- Note: the prior migration had no UPDATE policy for this table.
-- ============================================================
DROP POLICY IF EXISTS "Users can insert safety checks for accessible children" ON public.home_safety_checks;
DROP POLICY IF EXISTS "Users can delete safety checks for accessible children" ON public.home_safety_checks;

CREATE POLICY "Owners and caregivers can insert safety checks"
  ON public.home_safety_checks FOR INSERT
  WITH CHECK (can_write_child_data(auth.uid(), child_id));

CREATE POLICY "Owners and caregivers can update safety checks"
  ON public.home_safety_checks FOR UPDATE
  USING (can_write_child_data(auth.uid(), child_id));

CREATE POLICY "Owners and caregivers can delete safety checks"
  ON public.home_safety_checks FOR DELETE
  USING (can_write_child_data(auth.uid(), child_id));

-- ============================================================
-- 8. medical_contacts
-- ============================================================
DROP POLICY IF EXISTS "Users can insert medical contacts for accessible children" ON public.medical_contacts;
DROP POLICY IF EXISTS "Users can update medical contacts for accessible children" ON public.medical_contacts;
DROP POLICY IF EXISTS "Users can delete medical contacts for accessible children" ON public.medical_contacts;

CREATE POLICY "Owners and caregivers can insert medical contacts"
  ON public.medical_contacts FOR INSERT
  WITH CHECK (can_write_child_data(auth.uid(), child_id));

CREATE POLICY "Owners and caregivers can update medical contacts"
  ON public.medical_contacts FOR UPDATE
  USING (can_write_child_data(auth.uid(), child_id));

CREATE POLICY "Owners and caregivers can delete medical contacts"
  ON public.medical_contacts FOR DELETE
  USING (can_write_child_data(auth.uid(), child_id));

-- ============================================================
-- 9. suppliers
-- ============================================================
DROP POLICY IF EXISTS "Users can insert suppliers for accessible children" ON public.suppliers;
DROP POLICY IF EXISTS "Users can update suppliers for accessible children" ON public.suppliers;
DROP POLICY IF EXISTS "Users can delete suppliers for accessible children" ON public.suppliers;

CREATE POLICY "Owners and caregivers can insert suppliers"
  ON public.suppliers FOR INSERT
  WITH CHECK (can_write_child_data(auth.uid(), child_id));

CREATE POLICY "Owners and caregivers can update suppliers"
  ON public.suppliers FOR UPDATE
  USING (can_write_child_data(auth.uid(), child_id));

CREATE POLICY "Owners and caregivers can delete suppliers"
  ON public.suppliers FOR DELETE
  USING (can_write_child_data(auth.uid(), child_id));

-- ============================================================
-- 10. saved_community_services
-- Note: the prior migration had no UPDATE policy for this table.
-- ============================================================
DROP POLICY IF EXISTS "Users can insert saved services for accessible children" ON public.saved_community_services;
DROP POLICY IF EXISTS "Users can delete saved services for accessible children" ON public.saved_community_services;

CREATE POLICY "Owners and caregivers can insert saved services"
  ON public.saved_community_services FOR INSERT
  WITH CHECK (can_write_child_data(auth.uid(), child_id));

CREATE POLICY "Owners and caregivers can update saved services"
  ON public.saved_community_services FOR UPDATE
  USING (can_write_child_data(auth.uid(), child_id));

CREATE POLICY "Owners and caregivers can delete saved services"
  ON public.saved_community_services FOR DELETE
  USING (can_write_child_data(auth.uid(), child_id));

-- ============================================================
-- 11. employment_agreements
-- ============================================================
DROP POLICY IF EXISTS "Users can insert employment agreements for accessible children" ON public.employment_agreements;
DROP POLICY IF EXISTS "Users can update employment agreements for accessible children" ON public.employment_agreements;
DROP POLICY IF EXISTS "Users can delete employment agreements for accessible children" ON public.employment_agreements;

CREATE POLICY "Owners and caregivers can insert employment agreements"
  ON public.employment_agreements FOR INSERT
  WITH CHECK (can_write_child_data(auth.uid(), child_id));

CREATE POLICY "Owners and caregivers can update employment agreements"
  ON public.employment_agreements FOR UPDATE
  USING (can_write_child_data(auth.uid(), child_id));

CREATE POLICY "Owners and caregivers can delete employment agreements"
  ON public.employment_agreements FOR DELETE
  USING (can_write_child_data(auth.uid(), child_id));

-- ============================================================
-- 12. financial_legal_docs
-- ============================================================
DROP POLICY IF EXISTS "Users can insert financial docs for accessible children" ON public.financial_legal_docs;
DROP POLICY IF EXISTS "Users can update financial docs for accessible children" ON public.financial_legal_docs;
DROP POLICY IF EXISTS "Users can delete financial docs for accessible children" ON public.financial_legal_docs;

CREATE POLICY "Owners and caregivers can insert financial docs"
  ON public.financial_legal_docs FOR INSERT
  WITH CHECK (can_write_child_data(auth.uid(), child_id));

CREATE POLICY "Owners and caregivers can update financial docs"
  ON public.financial_legal_docs FOR UPDATE
  USING (can_write_child_data(auth.uid(), child_id));

CREATE POLICY "Owners and caregivers can delete financial docs"
  ON public.financial_legal_docs FOR DELETE
  USING (can_write_child_data(auth.uid(), child_id));

-- ============================================================
-- 13. end_of_life_wishes
-- ============================================================
DROP POLICY IF EXISTS "Users can insert end of life wishes for accessible children" ON public.end_of_life_wishes;
DROP POLICY IF EXISTS "Users can update end of life wishes for accessible children" ON public.end_of_life_wishes;
DROP POLICY IF EXISTS "Users can delete end of life wishes for accessible children" ON public.end_of_life_wishes;

CREATE POLICY "Owners and caregivers can insert end of life wishes"
  ON public.end_of_life_wishes FOR INSERT
  WITH CHECK (can_write_child_data(auth.uid(), child_id));

CREATE POLICY "Owners and caregivers can update end of life wishes"
  ON public.end_of_life_wishes FOR UPDATE
  USING (can_write_child_data(auth.uid(), child_id));

CREATE POLICY "Owners and caregivers can delete end of life wishes"
  ON public.end_of_life_wishes FOR DELETE
  USING (can_write_child_data(auth.uid(), child_id));

-- ============================================================
-- 14. documents
-- ============================================================
DROP POLICY IF EXISTS "Users can upload documents for accessible children" ON public.documents;
DROP POLICY IF EXISTS "Users can update documents for accessible children" ON public.documents;
DROP POLICY IF EXISTS "Users can delete documents for accessible children" ON public.documents;

CREATE POLICY "Owners and caregivers can upload documents"
  ON public.documents FOR INSERT
  WITH CHECK (can_write_child_data(auth.uid(), child_id));

CREATE POLICY "Owners and caregivers can update documents"
  ON public.documents FOR UPDATE
  USING (can_write_child_data(auth.uid(), child_id));

CREATE POLICY "Owners and caregivers can delete documents"
  ON public.documents FOR DELETE
  USING (can_write_child_data(auth.uid(), child_id));

-- ============================================================
-- 15. notification_preferences - add missing DELETE policy
-- Users can only delete their own preferences
-- ============================================================
CREATE POLICY "Users can delete own preferences"
  ON public.notification_preferences FOR DELETE
  USING (auth.uid() = user_id);
