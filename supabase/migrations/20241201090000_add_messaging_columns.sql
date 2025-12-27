-- Migration: Ensure notifications tables have all required columns
-- This migration is fully idempotent and safe to run multiple times

-- Add missing columns to notifications table using DO block
DO $$
BEGIN
  -- Check if notifications table exists, if not create it
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications') THEN
    CREATE TABLE notifications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      sender_id UUID,
      title VARCHAR(200) NOT NULL,
      message TEXT NOT NULL,
      type VARCHAR(50) DEFAULT 'info',
      scope VARCHAR(50) NOT NULL DEFAULT 'all',
      scope_value TEXT,
      sent_at TIMESTAMP DEFAULT NOW(),
      recipient_count INTEGER DEFAULT 0,
      read_count INTEGER DEFAULT 0,
      metadata JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMP DEFAULT NOW(),
      message_type VARCHAR(20) DEFAULT 'admin_to_member',
      source_entity_type VARCHAR(50),
      source_entity_id UUID
    );
  ELSE
    -- Table exists, add missing columns one by one

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'sender_id') THEN
      ALTER TABLE notifications ADD COLUMN sender_id UUID;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'title') THEN
      ALTER TABLE notifications ADD COLUMN title VARCHAR(200) NOT NULL DEFAULT '';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'message') THEN
      ALTER TABLE notifications ADD COLUMN message TEXT NOT NULL DEFAULT '';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'type') THEN
      ALTER TABLE notifications ADD COLUMN type VARCHAR(50) DEFAULT 'info';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'scope') THEN
      ALTER TABLE notifications ADD COLUMN scope VARCHAR(50) NOT NULL DEFAULT 'all';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'scope_value') THEN
      ALTER TABLE notifications ADD COLUMN scope_value TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'sent_at') THEN
      ALTER TABLE notifications ADD COLUMN sent_at TIMESTAMP DEFAULT NOW();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'recipient_count') THEN
      ALTER TABLE notifications ADD COLUMN recipient_count INTEGER DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'read_count') THEN
      ALTER TABLE notifications ADD COLUMN read_count INTEGER DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'metadata') THEN
      ALTER TABLE notifications ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'created_at') THEN
      ALTER TABLE notifications ADD COLUMN created_at TIMESTAMP DEFAULT NOW();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'message_type') THEN
      ALTER TABLE notifications ADD COLUMN message_type VARCHAR(20) DEFAULT 'admin_to_member';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'source_entity_type') THEN
      ALTER TABLE notifications ADD COLUMN source_entity_type VARCHAR(50);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'source_entity_id') THEN
      ALTER TABLE notifications ADD COLUMN source_entity_id UUID;
    END IF;
  END IF;
END $$;

-- Create notification_recipients table if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notification_recipients') THEN
    CREATE TABLE notification_recipients (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      notification_id UUID REFERENCES notifications(id) ON DELETE CASCADE,
      user_id UUID,
      is_read BOOLEAN DEFAULT FALSE,
      read_at TIMESTAMP,
      delivered_at TIMESTAMP DEFAULT NOW(),
      created_at TIMESTAMP DEFAULT NOW()
    );

    -- Add unique constraint
    ALTER TABLE notification_recipients ADD CONSTRAINT notification_recipients_notification_user_unique
      UNIQUE(notification_id, user_id);
  ELSE
    -- Table exists, add missing columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notification_recipients' AND column_name = 'notification_id') THEN
      ALTER TABLE notification_recipients ADD COLUMN notification_id UUID REFERENCES notifications(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notification_recipients' AND column_name = 'user_id') THEN
      ALTER TABLE notification_recipients ADD COLUMN user_id UUID;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notification_recipients' AND column_name = 'is_read') THEN
      ALTER TABLE notification_recipients ADD COLUMN is_read BOOLEAN DEFAULT FALSE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notification_recipients' AND column_name = 'read_at') THEN
      ALTER TABLE notification_recipients ADD COLUMN read_at TIMESTAMP;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notification_recipients' AND column_name = 'delivered_at') THEN
      ALTER TABLE notification_recipients ADD COLUMN delivered_at TIMESTAMP DEFAULT NOW();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notification_recipients' AND column_name = 'created_at') THEN
      ALTER TABLE notification_recipients ADD COLUMN created_at TIMESTAMP DEFAULT NOW();
    END IF;
  END IF;
END $$;

-- Create indexes only if the columns exist
DO $$
BEGIN
  -- Notifications indexes
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'sender_id') THEN
    CREATE INDEX IF NOT EXISTS idx_notifications_sender ON notifications(sender_id);
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'scope') THEN
    CREATE INDEX IF NOT EXISTS idx_notifications_scope ON notifications(scope);
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'sent_at') THEN
    CREATE INDEX IF NOT EXISTS idx_notifications_sent_at ON notifications(sent_at DESC);
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'message_type') THEN
    CREATE INDEX IF NOT EXISTS idx_notifications_message_type ON notifications(message_type);
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'source_entity_type') THEN
    CREATE INDEX IF NOT EXISTS idx_notifications_source ON notifications(source_entity_type, source_entity_id);
  END IF;

  -- Notification recipients indexes
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notification_recipients' AND column_name = 'notification_id') THEN
    CREATE INDEX IF NOT EXISTS idx_notification_recipients_notification ON notification_recipients(notification_id);
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notification_recipients' AND column_name = 'user_id') THEN
    CREATE INDEX IF NOT EXISTS idx_notification_recipients_user ON notification_recipients(user_id);
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notification_recipients' AND column_name = 'user_id')
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notification_recipients' AND column_name = 'is_read') THEN
    CREATE INDEX IF NOT EXISTS idx_notification_recipients_unread ON notification_recipients(user_id, is_read);
  END IF;
END $$;

-- Add comments (these are safe to run)
COMMENT ON TABLE notifications IS 'Notifications for admin-to-member and member-to-leader messaging';
COMMENT ON TABLE notification_recipients IS 'Individual notification delivery tracking';
