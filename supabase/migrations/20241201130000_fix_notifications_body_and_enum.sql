-- Migration: Fix notifications table for messaging system
-- Applied via Supabase MCP on 2025-12-26

-- Make body nullable since we use message column now
ALTER TABLE notifications ALTER COLUMN body DROP NOT NULL;
ALTER TABLE notifications ALTER COLUMN body SET DEFAULT '';

-- Add missing notification types to enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumtypid = 'notification_type'::regtype AND enumlabel = 'info') THEN
    ALTER TYPE notification_type ADD VALUE 'info';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumtypid = 'notification_type'::regtype AND enumlabel = 'warning') THEN
    ALTER TYPE notification_type ADD VALUE 'warning';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumtypid = 'notification_type'::regtype AND enumlabel = 'success') THEN
    ALTER TYPE notification_type ADD VALUE 'success';
  END IF;
END $$;
