-- Migration: Add foreign key constraint for notifications.sender_id
-- This enables the PostgREST join to work for sender info

-- Add foreign key constraint (safe to run multiple times)
DO $$
BEGIN
  -- Check if the constraint already exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'notifications_sender_id_fkey'
    AND table_name = 'notifications'
  ) THEN
    ALTER TABLE notifications
    ADD CONSTRAINT notifications_sender_id_fkey
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Also ensure notification_recipients has FK to users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'notification_recipients_user_id_fkey'
    AND table_name = 'notification_recipients'
  ) THEN
    ALTER TABLE notification_recipients
    ADD CONSTRAINT notification_recipients_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
END $$;

COMMENT ON CONSTRAINT notifications_sender_id_fkey ON notifications IS 'Links notification sender to users table';
