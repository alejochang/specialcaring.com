
-- ============================================================
-- ADD MISSING SECTIONS & MEDICATION COLUMNS
-- ============================================================

-- 1. Add missing columns to medications table
ALTER TABLE public.medications 
  ADD COLUMN IF NOT EXISTS pharmacy text DEFAULT '',
  ADD COLUMN IF NOT EXISTS refill_date text DEFAULT '',
  ADD COLUMN IF NOT EXISTS side_effects text DEFAULT '';

-- 2. Employment Agreements table
CREATE TABLE public.employment_agreements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  child_id uuid NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  caregiver_name text NOT NULL DEFAULT '',
  position_title text NOT NULL DEFAULT '',
  start_date text DEFAULT '',
  end_date text DEFAULT '',
  work_schedule text DEFAULT '',
  hourly_rate text DEFAULT '',
  payment_frequency text DEFAULT '',
  duties text DEFAULT '',
  emergency_procedures text DEFAULT '',
  confidentiality_terms text DEFAULT '',
  termination_terms text DEFAULT '',
  additional_terms text DEFAULT '',
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'draft', 'terminated', 'expired')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.employment_agreements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view employment agreements for accessible children"
  ON public.employment_agreements FOR SELECT
  USING (has_child_access(auth.uid(), child_id));
CREATE POLICY "Users can insert employment agreements for accessible children"
  ON public.employment_agreements FOR INSERT
  WITH CHECK (has_child_access(auth.uid(), child_id));
CREATE POLICY "Users can update employment agreements for accessible children"
  ON public.employment_agreements FOR UPDATE
  USING (has_child_access(auth.uid(), child_id));
CREATE POLICY "Users can delete employment agreements for accessible children"
  ON public.employment_agreements FOR DELETE
  USING (has_child_access(auth.uid(), child_id));

CREATE TRIGGER update_employment_agreements_updated_at
  BEFORE UPDATE ON public.employment_agreements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Financial & Legal Documents table
CREATE TABLE public.financial_legal_docs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  child_id uuid NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  doc_type text NOT NULL DEFAULT 'other',
  title text NOT NULL DEFAULT '',
  description text DEFAULT '',
  institution text DEFAULT '',
  account_number text DEFAULT '',
  contact_name text DEFAULT '',
  contact_phone text DEFAULT '',
  contact_email text DEFAULT '',
  expiry_date text DEFAULT '',
  notes text DEFAULT '',
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'expired', 'archived')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.financial_legal_docs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view financial docs for accessible children"
  ON public.financial_legal_docs FOR SELECT
  USING (has_child_access(auth.uid(), child_id));
CREATE POLICY "Users can insert financial docs for accessible children"
  ON public.financial_legal_docs FOR INSERT
  WITH CHECK (has_child_access(auth.uid(), child_id));
CREATE POLICY "Users can update financial docs for accessible children"
  ON public.financial_legal_docs FOR UPDATE
  USING (has_child_access(auth.uid(), child_id));
CREATE POLICY "Users can delete financial docs for accessible children"
  ON public.financial_legal_docs FOR DELETE
  USING (has_child_access(auth.uid(), child_id));

CREATE TRIGGER update_financial_legal_docs_updated_at
  BEFORE UPDATE ON public.financial_legal_docs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. End-of-Life Wishes table
CREATE TABLE public.end_of_life_wishes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  child_id uuid NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  medical_directives text DEFAULT '',
  preferred_hospital text DEFAULT '',
  preferred_physician text DEFAULT '',
  organ_donation text DEFAULT 'not_specified' CHECK (organ_donation IN ('yes', 'no', 'not_specified')),
  funeral_preferences text DEFAULT '',
  religious_cultural_wishes text DEFAULT '',
  legal_guardian text DEFAULT '',
  power_of_attorney text DEFAULT '',
  special_instructions text DEFAULT '',
  additional_notes text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.end_of_life_wishes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view end of life wishes for accessible children"
  ON public.end_of_life_wishes FOR SELECT
  USING (has_child_access(auth.uid(), child_id));
CREATE POLICY "Users can insert end of life wishes for accessible children"
  ON public.end_of_life_wishes FOR INSERT
  WITH CHECK (has_child_access(auth.uid(), child_id));
CREATE POLICY "Users can update end of life wishes for accessible children"
  ON public.end_of_life_wishes FOR UPDATE
  USING (has_child_access(auth.uid(), child_id));
CREATE POLICY "Users can delete end of life wishes for accessible children"
  ON public.end_of_life_wishes FOR DELETE
  USING (has_child_access(auth.uid(), child_id));

CREATE TRIGGER update_end_of_life_wishes_updated_at
  BEFORE UPDATE ON public.end_of_life_wishes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
