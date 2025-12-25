# Database Migrations

## How to Apply Migrations

### Using Supabase Dashboard:

1. Go to your Supabase project: https://ckcucfofooarisquhmxm.supabase.co
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the contents of the migration file
5. Paste into the query editor
6. Click **Run** to execute

### Migration Order:

Apply migrations in numerical order:
1. ⚠️ `0005_fix_featured_image_column.sql` - **RUN THIS FIRST** (CRITICAL)
2. 📝 `0006_add_news_editor_role.sql` - Add news_editor role
3. 📦 `0007_add_category_metadata.sql` - Category management system

---

## Migration 0005: Fix Featured Image Column ⚠️ CRITICAL

**Status**: ⚠️ **URGENT - Must run before using news editor**

**What it does**:
- Renames `featured_image` column to `featured_image_url`
- Fixes data integrity issue where images weren't saving

**SQL to run**:
```sql
BEGIN;

ALTER TABLE news_articles
RENAME COLUMN featured_image TO featured_image_url;

COMMENT ON COLUMN news_articles.featured_image_url IS 'URL to the featured/hero image for the article';

COMMIT;
```

**Verification**:
```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'news_articles'
  AND column_name LIKE '%image%';
```

Expected result: `featured_image_url | text`

---

## Migration 0006: Add news_editor Role

**Status**: ✅ Ready to run

**What it does**:
- Adds `news_editor` role to user_role enum
- Allows super admins to assign news editing permissions to members

**SQL to run**:
```sql
BEGIN;

ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'news_editor';

COMMENT ON TYPE user_role IS 'User roles: free_viewer, prospect, silent_member, full_member, group_leader, regional_leader, news_editor, admin, super_admin';

COMMIT;
```

**Verification**:
```sql
SELECT enumlabel
FROM pg_enum
WHERE enumtypid = 'user_role'::regtype
ORDER BY enumsortorder;
```

Expected: Should include 'news_editor' in the list

---

## Migration 0007: Add Category Metadata

**Status**: ✅ Ready to run

**What it does**:
- Creates `news_category_meta` table for category metadata
- Allows managing category translations, icons, colors, and ordering
- Inserts default 5 categories

**SQL to run**:
```sql
BEGIN;

CREATE TABLE IF NOT EXISTS news_category_meta (
  id VARCHAR(50) PRIMARY KEY,
  name_uk VARCHAR(100) NOT NULL,
  name_en VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  color VARCHAR(20),
  "order" INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO news_category_meta (id, name_uk, name_en, description, icon, color, "order") VALUES
  ('announcement', 'Оголошення', 'Announcement', 'Важливі оголошення та повідомлення', 'megaphone', '#ef4444', 1),
  ('update', 'Оновлення', 'Update', 'Новини та оновлення платформи', 'bell', '#3b82f6', 2),
  ('success_story', 'Історія успіху', 'Success Story', 'Історії успіху членів мережі', 'trophy', '#10b981', 3),
  ('media', 'Медіа', 'Media', 'Публікації в медіа про мережу', 'newspaper', '#8b5cf6', 4),
  ('education', 'Освіта', 'Education', 'Освітні матеріали та навчання', 'book-open', '#f59e0b', 5)
ON CONFLICT (id) DO NOTHING;

COMMENT ON TABLE news_category_meta IS 'Metadata for news article categories including translations and visual styling';

COMMIT;
```

**Verification**:
```sql
SELECT id, name_uk, name_en, icon, color
FROM news_category_meta
ORDER BY "order";
```

Expected: 5 rows with category data

---

## Quick Start: Run All Migrations

To set up the news editor system, run these migrations in order:

1. **Fix featured image column** (0005)
2. **Add news_editor role** (0006)
3. **Add category metadata** (0007)

After running all migrations:
- Visit `/admin/news/new` to create articles
- Visit `/admin/settings/news-categories` to manage categories (super_admin only)
- Assign `news_editor` role to members who should be able to create/edit news

---

## Troubleshooting

### Error: column "featured_image" does not exist
- The column may have already been renamed. Skip migration 0005.

### Error: enum label "news_editor" already exists
- The role may have already been added. Skip migration 0006.

### Error: relation "news_category_meta" already exists
- The table may have already been created. Skip migration 0007.
