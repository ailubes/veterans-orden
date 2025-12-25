-- Notifications table for admin-to-user messaging
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Sender (admin)
  sender_id UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Notification content
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'info', -- info, warning, success, alert

  -- Targeting
  scope VARCHAR(50) NOT NULL, -- 'all', 'role', 'oblast', 'tier', 'user', 'referral_tree'
  scope_value TEXT, -- Specific value for the scope (e.g., role name, oblast id, user id)

  -- Metadata
  sent_at TIMESTAMP DEFAULT NOW(),
  recipient_count INTEGER DEFAULT 0,
  read_count INTEGER DEFAULT 0,

  -- Additional data
  metadata JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMP DEFAULT NOW()
);

-- Notification recipients (tracks individual delivery)
CREATE TABLE IF NOT EXISTS notification_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID REFERENCES notifications(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  -- Status
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,

  -- Delivery
  delivered_at TIMESTAMP DEFAULT NOW(),

  created_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(notification_id, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_sender ON notifications(sender_id);
CREATE INDEX IF NOT EXISTS idx_notifications_scope ON notifications(scope);
CREATE INDEX IF NOT EXISTS idx_notifications_sent_at ON notifications(sent_at DESC);

CREATE INDEX IF NOT EXISTS idx_notification_recipients_notification ON notification_recipients(notification_id);
CREATE INDEX IF NOT EXISTS idx_notification_recipients_user ON notification_recipients(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_recipients_unread ON notification_recipients(user_id, is_read) WHERE is_read = FALSE;

-- Comments
COMMENT ON TABLE notifications IS 'Admin-sent notifications to users';
COMMENT ON TABLE notification_recipients IS 'Individual notification delivery tracking';
COMMENT ON COLUMN notifications.scope IS 'Targeting scope: all, role, oblast, tier, user, referral_tree';
COMMENT ON COLUMN notifications.scope_value IS 'Value for scoped notifications (e.g., role name for scope=role)';
