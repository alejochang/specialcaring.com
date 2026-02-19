-- ============================================================
-- EMERGENCY CARDS STORAGE BUCKET + POLICIES
-- ============================================================
-- Creates the 'emergency-cards' storage bucket and secures it
-- with RLS policies matching the 'documents' bucket pattern.
-- Files are stored under {child_id}/{filename} paths.
-- Uses has_child_access for read, can_write_child_data for writes.
-- ============================================================

-- Create the emergency-cards bucket (private, images only, 10MB limit)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'emergency-cards',
  'emergency-cards',
  false,
  10485760,
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/heic',
    'image/heif'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- SELECT: any user with access to the child can view their emergency card images
CREATE POLICY "Users can view children emergency card images"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'emergency-cards'
    AND public.has_child_access(auth.uid(), (storage.foldername(name))[1]::uuid)
  );

-- INSERT: only owners and caregivers can upload emergency card images
CREATE POLICY "Owners and caregivers can upload emergency card images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'emergency-cards'
    AND public.can_write_child_data(auth.uid(), (storage.foldername(name))[1]::uuid)
  );

-- UPDATE: only owners and caregivers can update emergency card images
CREATE POLICY "Owners and caregivers can update emergency card images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'emergency-cards'
    AND public.can_write_child_data(auth.uid(), (storage.foldername(name))[1]::uuid)
  );

-- DELETE: only owners and caregivers can delete emergency card images
CREATE POLICY "Owners and caregivers can delete emergency card images"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'emergency-cards'
    AND public.can_write_child_data(auth.uid(), (storage.foldername(name))[1]::uuid)
  );
