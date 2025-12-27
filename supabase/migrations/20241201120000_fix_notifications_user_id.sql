-- Migration: Fix notifications.user_id constraint
-- The notifications table was created with user_id NOT NULL from an older schema,
-- but the current design uses notification_recipients junction table instead.

-- Make user_id nullable (or drop it if not needed)
DO $$
BEGIN
  -- Check if user_id column exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'notifications'
    AND column_name = 'user_id'
  ) THEN
    -- Make it nullable by dropping the NOT NULL constraint
    ALTER TABLE notifications ALTER COLUMN user_id DROP NOT NULL;
  END IF;
END $$;
