-- ============================================================
-- CELEBRATION TABLES RLS + DOCUMENTS STORAGE POLICIES
-- ============================================================

-- ============================================================
-- 1. celebration_categories
-- ============================================================
ALTER TABLE public.celebration_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view celebration categories for accessible children"
  ON public.celebration_categories FOR SELECT
  USING (has_child_access(auth.uid(), child_id));

CREATE POLICY "Owners and caregivers can insert celebration categories"
  ON public.celebration_categories FOR INSERT
  WITH CHECK (can_write_child_data(auth.uid(), child_id));

CREATE POLICY "Owners and caregivers can update celebration categories"
  ON public.celebration_categories FOR UPDATE
  USING (can_write_child_data(auth.uid(), child_id));

CREATE POLICY "Owners and caregivers can delete celebration categories"
  ON public.celebration_categories FOR DELETE
  USING (can_write_child_data(auth.uid(), child_id));

-- ============================================================
-- 2. journeys
-- ============================================================
ALTER TABLE public.journeys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view journeys for accessible children"
  ON public.journeys FOR SELECT
  USING (has_child_access(auth.uid(), child_id));

CREATE POLICY "Owners and caregivers can insert journeys"
  ON public.journeys FOR INSERT
  WITH CHECK (can_write_child_data(auth.uid(), child_id));

CREATE POLICY "Owners and caregivers can update journeys"
  ON public.journeys FOR UPDATE
  USING (can_write_child_data(auth.uid(), child_id));

CREATE POLICY "Owners and caregivers can delete journeys"
  ON public.journeys FOR DELETE
  USING (can_write_child_data(auth.uid(), child_id));

-- ============================================================
-- 3. journey_moments
-- ============================================================
ALTER TABLE public.journey_moments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view journey moments for accessible children"
  ON public.journey_moments FOR SELECT
  USING (has_child_access(auth.uid(), child_id));

CREATE POLICY "Owners and caregivers can insert journey moments"
  ON public.journey_moments FOR INSERT
  WITH CHECK (can_write_child_data(auth.uid(), child_id));

CREATE POLICY "Owners and caregivers can update journey moments"
  ON public.journey_moments FOR UPDATE
  USING (can_write_child_data(auth.uid(), child_id));

CREATE POLICY "Owners and caregivers can delete journey moments"
  ON public.journey_moments FOR DELETE
  USING (can_write_child_data(auth.uid(), child_id));

-- ============================================================
-- 4. Storage policies for the 'documents' bucket
-- Files are stored under {child_id}/{filename} paths.
-- Uses has_child_access for read, can_write_child_data for writes.
-- ============================================================

-- Create the documents bucket if it doesn't already exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  false,
  10485760,
  ARRAY[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- SELECT: any user with access to the child can view their documents
CREATE POLICY "Users can view children documents"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'documents'
    AND public.has_child_access(auth.uid(), (storage.foldername(name))[1]::uuid)
  );

-- INSERT: only owners and caregivers can upload documents
CREATE POLICY "Owners and caregivers can upload to children folders"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'documents'
    AND public.can_write_child_data(auth.uid(), (storage.foldername(name))[1]::uuid)
  );

-- UPDATE: only owners and caregivers can update documents
CREATE POLICY "Owners and caregivers can update children documents"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'documents'
    AND public.can_write_child_data(auth.uid(), (storage.foldername(name))[1]::uuid)
  );

-- DELETE: only owners and caregivers can delete documents
CREATE POLICY "Owners and caregivers can delete children documents"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'documents'
    AND public.can_write_child_data(auth.uid(), (storage.foldername(name))[1]::uuid)
  );
