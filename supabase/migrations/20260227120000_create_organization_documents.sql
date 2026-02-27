CREATE TABLE organization_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('documents', 'media', 'press_kit')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  size_bytes BIGINT,
  mime_type TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE organization_documents ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "org_docs_public_read" ON organization_documents
  FOR SELECT USING (true);

-- Admin write (insert/update/delete)
CREATE POLICY "org_docs_admin_all" ON organization_documents
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());
