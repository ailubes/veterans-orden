-- Add Telegram integration fields to users table
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS telegram_id BIGINT UNIQUE,
  ADD COLUMN IF NOT EXISTS telegram_username VARCHAR(32),
  ADD COLUMN IF NOT EXISTS telegram_first_name VARCHAR(64),
  ADD COLUMN IF NOT EXISTS telegram_linked_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS telegram_notifications_enabled BOOLEAN DEFAULT true;

CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegram_id);

-- Create telegram_invitations table for tracking referral invitations via bot
CREATE TABLE IF NOT EXISTS telegram_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inviter_id UUID REFERENCES users(id) ON DELETE SET NULL,
  telegram_id BIGINT NOT NULL,
  telegram_username VARCHAR(32),
  telegram_first_name VARCHAR(64),
  invited_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  registered_at TIMESTAMPTZ,
  referral_awarded BOOLEAN DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_telegram_invitations_telegram_id ON telegram_invitations(telegram_id);
CREATE INDEX IF NOT EXISTS idx_telegram_invitations_inviter_id ON telegram_invitations(inviter_id);

-- Extend notification_recipients with Telegram delivery fields
ALTER TABLE notification_recipients
  ADD COLUMN IF NOT EXISTS telegram_message_id INT,
  ADD COLUMN IF NOT EXISTS telegram_sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS telegram_error TEXT;
