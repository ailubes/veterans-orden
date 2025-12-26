-- Migration: Add 'alert' to notification_type enum

-- Check if notification_type enum exists and add 'alert' if missing
DO $$
BEGIN
  -- Check if the enum type exists
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN
    -- Add 'alert' value if it doesn't exist
    IF NOT EXISTS (
      SELECT 1 FROM pg_enum
      WHERE enumtypid = 'notification_type'::regtype
      AND enumlabel = 'alert'
    ) THEN
      ALTER TYPE notification_type ADD VALUE 'alert';
    END IF;
  END IF;
END $$;

-- If the column is using the enum, this is already handled
-- If not, we don't need to do anything else
