-- Add messaging system columns to notifications table
-- Supports member-to-leader messaging and system auto-notifications

-- Message type to distinguish admin-to-member vs member-to-leader messages
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS message_type VARCHAR(20) DEFAULT 'admin_to_member';
COMMENT ON COLUMN notifications.message_type IS 'Message direction: admin_to_member, member_to_leader';

-- Source entity tracking for auto-generated notifications (events, tasks, news)
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS source_entity_type VARCHAR(50);
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS source_entity_id UUID;
COMMENT ON COLUMN notifications.source_entity_type IS 'Source of auto-notification: event, task, news';
COMMENT ON COLUMN notifications.source_entity_id IS 'ID of the source entity';

-- Index for querying notifications by source
CREATE INDEX IF NOT EXISTS idx_notifications_source ON notifications(source_entity_type, source_entity_id)
WHERE source_entity_type IS NOT NULL;

-- Update scope comment to include new values
COMMENT ON COLUMN notifications.scope IS 'Targeting scope: all, role, oblast, tier, user, referral_tree, payment_expired, never_paid';
