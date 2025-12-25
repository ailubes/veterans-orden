-- Migration: Add messaging system columns to notifications table
-- This migration is safe to run multiple times

-- First, ensure the notifications table exists with all base columns
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'info',
  scope VARCHAR(50) NOT NULL DEFAULT 'all',
  scope_value TEXT,
  sent_at TIMESTAMP DEFAULT NOW(),
  recipient_count INTEGER DEFAULT 0,
  read_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Ensure notification_recipients table exists
CREATE TABLE IF NOT EXISTS notification_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID REFERENCES notifications(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  delivered_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(notification_id, user_id)
);

-- Add new messaging columns (safe to run if columns already exist)
DO $$
BEGIN
  -- Add message_type column for distinguishing admin-to-member vs member-to-leader
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'notifications' AND column_name = 'message_type') THEN
    ALTER TABLE notifications ADD COLUMN message_type VARCHAR(20) DEFAULT 'admin_to_member';
    COMMENT ON COLUMN notifications.message_type IS 'Message direction: admin_to_member, member_to_leader';
  END IF;

  -- Add source_entity_type for auto-generated notifications
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'notifications' AND column_name = 'source_entity_type') THEN
    ALTER TABLE notifications ADD COLUMN source_entity_type VARCHAR(50);
    COMMENT ON COLUMN notifications.source_entity_type IS 'Source of auto-notification: event, task, news';
  END IF;

  -- Add source_entity_id for linking to source entity
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'notifications' AND column_name = 'source_entity_id') THEN
    ALTER TABLE notifications ADD COLUMN source_entity_id UUID;
    COMMENT ON COLUMN notifications.source_entity_id IS 'ID of the source entity';
  END IF;
END $$;

-- Create indexes (safe to run multiple times with IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_notifications_sender ON notifications(sender_id);
CREATE INDEX IF NOT EXISTS idx_notifications_scope ON notifications(scope);
CREATE INDEX IF NOT EXISTS idx_notifications_sent_at ON notifications(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_message_type ON notifications(message_type);
CREATE INDEX IF NOT EXISTS idx_notifications_source ON notifications(source_entity_type, source_entity_id)
  WHERE source_entity_type IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_notification_recipients_notification ON notification_recipients(notification_id);
CREATE INDEX IF NOT EXISTS idx_notification_recipients_user ON notification_recipients(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_recipients_unread ON notification_recipients(user_id, is_read)
  WHERE is_read = FALSE;

-- Update comments
COMMENT ON TABLE notifications IS 'Notifications for admin-to-member and member-to-leader messaging';
COMMENT ON TABLE notification_recipients IS 'Individual notification delivery tracking';
COMMENT ON COLUMN notifications.scope IS 'Targeting scope: all, role, oblast, tier, user, referral_tree, payment_expired, never_paid';
