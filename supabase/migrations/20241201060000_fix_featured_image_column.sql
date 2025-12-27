-- Migration: Fix featured_image column name mismatch
-- Issue: Schema has 'featured_image' but forms use 'featured_image_url'
-- Solution: Rename column to match code convention
-- Date: 2024-12-25

BEGIN;

-- Rename the column
ALTER TABLE news_articles
RENAME COLUMN featured_image TO featured_image_url;

-- Add comment for clarity
COMMENT ON COLUMN news_articles.featured_image_url IS 'URL to the featured/hero image for the article';

COMMIT;
