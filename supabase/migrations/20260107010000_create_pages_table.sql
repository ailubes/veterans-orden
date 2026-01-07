-- Migration: Create pages table for CMS
-- This creates the pages table for storing dynamic page content as MDX

-- Create pages table
CREATE TABLE IF NOT EXISTS pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic info
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  label VARCHAR(100),
  description TEXT,

  -- Content (MDX format)
  content TEXT NOT NULL DEFAULT '',

  -- Featured image
  featured_image_url TEXT,

  -- Hierarchy
  parent_slug VARCHAR(255) REFERENCES pages(slug) ON DELETE SET NULL,

  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),

  -- Navigation
  show_in_nav BOOLEAN DEFAULT false,
  nav_label VARCHAR(100),
  sort_order INTEGER DEFAULT 0,

  -- SEO
  meta_title VARCHAR(70),
  meta_description VARCHAR(160),

  -- Authorship
  author_id UUID REFERENCES users(id) ON DELETE SET NULL,
  last_edited_by UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Timestamps
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);
CREATE INDEX IF NOT EXISTS idx_pages_status ON pages(status);
CREATE INDEX IF NOT EXISTS idx_pages_parent ON pages(parent_slug);
CREATE INDEX IF NOT EXISTS idx_pages_show_in_nav ON pages(show_in_nav) WHERE show_in_nav = true;
CREATE INDEX IF NOT EXISTS idx_pages_sort_order ON pages(sort_order);

-- Enable RLS
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Published pages are viewable by everyone" ON pages;
DROP POLICY IF EXISTS "Admins can view all pages" ON pages;
DROP POLICY IF EXISTS "Admins can insert pages" ON pages;
DROP POLICY IF EXISTS "Admins can update pages" ON pages;
DROP POLICY IF EXISTS "Admins can delete pages" ON pages;

-- Anyone can read published pages
CREATE POLICY "Published pages are viewable by everyone"
  ON pages FOR SELECT
  USING (status = 'published');

-- Admins can view all pages (including drafts)
CREATE POLICY "Admins can view all pages"
  ON pages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.auth_id = auth.uid()
      AND u.staff_role IN ('admin', 'super_admin')
    )
  );

-- Admins can insert pages
CREATE POLICY "Admins can insert pages"
  ON pages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.auth_id = auth.uid()
      AND u.staff_role IN ('admin', 'super_admin')
    )
  );

-- Admins can update pages
CREATE POLICY "Admins can update pages"
  ON pages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.auth_id = auth.uid()
      AND u.staff_role IN ('admin', 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.auth_id = auth.uid()
      AND u.staff_role IN ('admin', 'super_admin')
    )
  );

-- Admins can delete pages
CREATE POLICY "Admins can delete pages"
  ON pages FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.auth_id = auth.uid()
      AND u.staff_role IN ('admin', 'super_admin')
    )
  );

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_pages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_pages_updated_at ON pages;
CREATE TRIGGER update_pages_updated_at
  BEFORE UPDATE ON pages
  FOR EACH ROW
  EXECUTE FUNCTION update_pages_updated_at();

-- Add comment
COMMENT ON TABLE pages IS 'CMS pages with MDX content for dynamic page rendering';
