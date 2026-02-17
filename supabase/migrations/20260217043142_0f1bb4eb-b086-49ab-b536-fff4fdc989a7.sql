
-- Create storage bucket for child avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('child-avatars', 'child-avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload avatars for accessible children
CREATE POLICY "Users can upload avatars for accessible children"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'child-avatars'
  AND public.has_child_access(auth.uid(), (storage.foldername(name))[1]::uuid)
);

-- Allow authenticated users to update avatars for accessible children
CREATE POLICY "Users can update avatars for accessible children"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'child-avatars'
  AND public.has_child_access(auth.uid(), (storage.foldername(name))[1]::uuid)
);

-- Allow authenticated users to delete avatars for accessible children
CREATE POLICY "Users can delete avatars for accessible children"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'child-avatars'
  AND public.has_child_access(auth.uid(), (storage.foldername(name))[1]::uuid)
);

-- Public read access for child avatars
CREATE POLICY "Child avatars are publicly readable"
ON storage.objects FOR SELECT
USING (bucket_id = 'child-avatars');
