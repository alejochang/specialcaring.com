-- Documents Storage and Metadata
-- Secure file storage for medical records, insurance cards, etc.

-- Create documents bucket if it doesn't exist
-- Note: Run this in Supabase dashboard or via storage API
-- INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
-- VALUES (
--   'documents',
--   'documents',
--   false,
--   10485760, -- 10MB
--   ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
-- )
-- ON CONFLICT (id) DO NOTHING;

-- Documents metadata table
CREATE TABLE IF NOT EXISTS public.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  name text NOT NULL,
  path text NOT NULL,
  size bigint NOT NULL,
  type text NOT NULL,
  description text,
  category text DEFAULT 'general',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  -- Ensure path is unique
  CONSTRAINT documents_path_unique UNIQUE(path)
);

-- Indexes
CREATE INDEX IF NOT EXISTS documents_child_id_idx ON public.documents(child_id);
CREATE INDEX IF NOT EXISTS documents_category_idx ON public.documents(category);

-- Enable RLS
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Helper function to check child access
CREATE OR REPLACE FUNCTION has_child_access(user_uuid uuid, child_uuid uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.child_access
    WHERE user_id = user_uuid AND child_id = child_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies for documents table
CREATE POLICY "Users can view documents for accessible children"
  ON public.documents FOR SELECT
  USING (has_child_access(auth.uid(), child_id));

CREATE POLICY "Users can upload documents for accessible children"
  ON public.documents FOR INSERT
  WITH CHECK (has_child_access(auth.uid(), child_id));

CREATE POLICY "Users can update documents for accessible children"
  ON public.documents FOR UPDATE
  USING (has_child_access(auth.uid(), child_id));

CREATE POLICY "Users can delete documents for accessible children"
  ON public.documents FOR DELETE
  USING (has_child_access(auth.uid(), child_id));

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_documents_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER documents_updated_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION update_documents_updated_at();


-- Storage bucket policies (run in Supabase dashboard)
-- These policies control access to the actual files in storage

-- Policy: Users can upload to their children's folders
-- CREATE POLICY "Users can upload to children folders"
--   ON storage.objects FOR INSERT
--   WITH CHECK (
--     bucket_id = 'documents' AND
--     has_child_access(auth.uid(), (string_to_array(name, '/'))[1]::uuid)
--   );

-- Policy: Users can view their children's documents
-- CREATE POLICY "Users can view children documents"
--   ON storage.objects FOR SELECT
--   USING (
--     bucket_id = 'documents' AND
--     has_child_access(auth.uid(), (string_to_array(name, '/'))[1]::uuid)
--   );

-- Policy: Users can delete their children's documents
-- CREATE POLICY "Users can delete children documents"
--   ON storage.objects FOR DELETE
--   USING (
--     bucket_id = 'documents' AND
--     has_child_access(auth.uid(), (string_to_array(name, '/'))[1]::uuid)
--   );
