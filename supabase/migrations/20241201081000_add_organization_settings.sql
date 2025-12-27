-- Migration: Add organization_settings table
-- Date: 2025-12-25

-- Create organization_settings table
CREATE TABLE IF NOT EXISTS organization_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) NOT NULL UNIQUE,
  value JSONB NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_by UUID REFERENCES users(id)
);

-- Create index on key
CREATE UNIQUE INDEX IF NOT EXISTS organization_settings_key_idx ON organization_settings(key);

-- Insert default organization settings
INSERT INTO organization_settings (key, value) VALUES
  ('organization_name', '"Мережа Вільних Людей"'),
  ('organization_email', '"info@freepeople.org.ua"'),
  ('organization_phone', '""'),
  ('organization_about', '"Громадська організація, що об''єднує активних громадян України."'),
  ('organization_facebook', '""'),
  ('organization_telegram', '""'),
  ('organization_instagram', '""'),
  ('organization_youtube', '""')
ON CONFLICT (key) DO NOTHING;
