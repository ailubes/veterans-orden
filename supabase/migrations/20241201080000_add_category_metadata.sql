-- Migration: Add news category metadata table
-- This allows super admins to manage category translations, icons, colors, and ordering
-- Date: 2024-12-25

BEGIN;

-- Create category metadata table
CREATE TABLE IF NOT EXISTS news_category_meta (
  id VARCHAR(50) PRIMARY KEY,  -- matches enum value (e.g. 'announcement')
  name_uk VARCHAR(100) NOT NULL,
  name_en VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50),  -- Lucide icon name
  color VARCHAR(20),  -- hex color or Tailwind class
  "order" INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default categories
INSERT INTO news_category_meta (id, name_uk, name_en, description, icon, color, "order") VALUES
  ('announcement', 'Оголошення', 'Announcement', 'Важливі оголошення та повідомлення', 'megaphone', '#ef4444', 1),
  ('update', 'Оновлення', 'Update', 'Новини та оновлення платформи', 'bell', '#3b82f6', 2),
  ('success_story', 'Історія успіху', 'Success Story', 'Історії успіху членів мережі', 'trophy', '#10b981', 3),
  ('media', 'Медіа', 'Media', 'Публікації в медіа про мережу', 'newspaper', '#8b5cf6', 4),
  ('education', 'Освіта', 'Education', 'Освітні матеріали та навчання', 'book-open', '#f59e0b', 5)
ON CONFLICT (id) DO NOTHING;

-- Add comments
COMMENT ON TABLE news_category_meta IS 'Metadata for news article categories including translations and visual styling';
COMMENT ON COLUMN news_category_meta.id IS 'Category ID matching news_category enum value';
COMMENT ON COLUMN news_category_meta.icon IS 'Lucide icon name for category';
COMMENT ON COLUMN news_category_meta.color IS 'Hex color code for category badge';

COMMIT;
