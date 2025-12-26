-- Migration: Fix notifications.sent_at default
-- Applied via Supabase MCP on 2025-12-26

-- Fix existing records with NULL sent_at
UPDATE notifications SET sent_at = created_at WHERE sent_at IS NULL;

-- Add default to prevent future issues
ALTER TABLE notifications ALTER COLUMN sent_at SET DEFAULT NOW();
