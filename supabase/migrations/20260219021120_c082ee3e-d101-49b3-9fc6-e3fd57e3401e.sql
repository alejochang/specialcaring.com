-- Create the emergency-cards storage bucket (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('emergency-cards', 'emergency-cards', false)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for emergency-cards bucket
-- SELECT: Users can view emergency card images for children they have access to
CREATE POLICY "Users can view emergency cards for accessible children"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'emergency-cards'
    AND public.has_child_access(auth.uid(), (storage.foldername(name))[1]::uuid)
  );

-- INSERT: Users can upload emergency card images for children they have access to
CREATE POLICY "Users can upload emergency cards for accessible children"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'emergency-cards'
    AND public.has_child_access(auth.uid(), (storage.foldername(name))[1]::uuid)
  );

-- UPDATE: Users can update emergency card images for children they have access to
CREATE POLICY "Users can update emergency cards for accessible children"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'emergency-cards'
    AND public.has_child_access(auth.uid(), (storage.foldername(name))[1]::uuid)
  );

-- DELETE: Users can delete emergency card images for children they have access to
CREATE POLICY "Users can delete emergency cards for accessible children"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'emergency-cards'
    AND public.has_child_access(auth.uid(), (storage.foldername(name))[1]::uuid)
  );