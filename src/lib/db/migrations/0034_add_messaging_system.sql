-- =============================================
-- MESSAGING SYSTEM MIGRATION
-- =============================================

-- Create conversation type enum
DO $$ BEGIN
  CREATE TYPE conversation_type AS ENUM ('direct', 'group');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create participant role enum
DO $$ BEGIN
  CREATE TYPE participant_role AS ENUM ('owner', 'admin', 'member');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create message type enum
DO $$ BEGIN
  CREATE TYPE message_type AS ENUM ('text', 'image', 'file', 'system');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create message status enum
DO $$ BEGIN
  CREATE TYPE message_status AS ENUM ('sending', 'sent', 'delivered', 'read', 'failed');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- =============================================
-- CONVERSATIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type conversation_type NOT NULL,

  -- Group chat specific
  name VARCHAR(100),
  description TEXT,
  avatar_url TEXT,

  -- Creator/owner
  created_by_id UUID REFERENCES users(id) NOT NULL,

  -- Settings
  is_active BOOLEAN DEFAULT true,
  allow_replies BOOLEAN DEFAULT true,

  -- Denormalized for performance
  participant_count INTEGER DEFAULT 0,
  last_message_at TIMESTAMP,
  last_message_preview TEXT,
  last_message_sender_id UUID REFERENCES users(id),

  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_conversations_created_by ON conversations(created_by_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_type ON conversations(type);
CREATE INDEX IF NOT EXISTS idx_conversations_active ON conversations(is_active) WHERE is_active = true;

-- =============================================
-- CONVERSATION PARTICIPANTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS conversation_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,

  role participant_role DEFAULT 'member' NOT NULL,

  -- Notification settings
  is_muted BOOLEAN DEFAULT false,
  muted_until TIMESTAMP,

  -- Read tracking
  last_read_at TIMESTAMP,
  last_read_message_id UUID,
  unread_count INTEGER DEFAULT 0,

  -- Status
  is_active BOOLEAN DEFAULT true,
  left_at TIMESTAMP,
  removed_by UUID REFERENCES users(id),

  joined_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL,

  UNIQUE(conversation_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_conv_participants_user ON conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_conv_participants_conversation ON conversation_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conv_participants_active ON conversation_participants(conversation_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_conv_participants_unread ON conversation_participants(user_id, is_active) WHERE unread_count > 0;

-- =============================================
-- MESSAGES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Content
  type message_type DEFAULT 'text' NOT NULL,
  content TEXT,

  -- Reply support
  reply_to_id UUID REFERENCES messages(id) ON DELETE SET NULL,

  -- Attachments (stored as JSONB array)
  attachments JSONB DEFAULT '[]',

  -- Metadata (reactions, edit history, etc.)
  metadata JSONB DEFAULT '{}',

  -- Edit tracking
  is_edited BOOLEAN DEFAULT false,
  edited_at TIMESTAMP,

  -- Status tracking
  status message_status DEFAULT 'sent' NOT NULL,

  -- Soft delete
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMP,
  deleted_by UUID REFERENCES users(id),

  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_reply_to ON messages(reply_to_id) WHERE reply_to_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_messages_not_deleted ON messages(conversation_id, created_at DESC) WHERE is_deleted = false;

-- =============================================
-- MESSAGE READ RECEIPTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS message_read_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  read_at TIMESTAMP DEFAULT NOW() NOT NULL,

  UNIQUE(message_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_message_read_receipts_message ON message_read_receipts(message_id);
CREATE INDEX IF NOT EXISTS idx_message_read_receipts_user ON message_read_receipts(user_id);

-- =============================================
-- USER PRESENCE TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS user_presence (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  is_online BOOLEAN DEFAULT false,
  last_seen_at TIMESTAMP DEFAULT NOW() NOT NULL,
  current_conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  device_info JSONB,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_user_presence_online ON user_presence(is_online) WHERE is_online = true;

-- =============================================
-- MESSAGE REACTIONS TABLE (for efficient querying)
-- =============================================
CREATE TABLE IF NOT EXISTS message_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  emoji VARCHAR(10) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,

  UNIQUE(message_id, user_id, emoji)
);

CREATE INDEX IF NOT EXISTS idx_message_reactions_message ON message_reactions(message_id);
CREATE INDEX IF NOT EXISTS idx_message_reactions_user ON message_reactions(user_id);

-- =============================================
-- SEED DEFAULT MESSAGING SETTINGS
-- =============================================
INSERT INTO organization_settings (key, value) VALUES
  ('messaging_enabled', '"true"'),
  ('messaging_dm_enabled', '"true"'),
  ('messaging_group_chat_enabled', '"true"'),
  ('messaging_dm_initiator_roles', '["network_leader", "regional_leader", "national_leader", "network_guide"]'),
  ('messaging_group_creator_roles', '["network_leader", "regional_leader", "national_leader", "network_guide"]'),
  ('messaging_same_group_enabled', '"false"'),
  ('messaging_cross_group_enabled', '"false"'),
  ('messaging_attachments_enabled', '"true"'),
  ('messaging_max_attachment_size_mb', '"10"'),
  ('messaging_allowed_attachment_types', '["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf"]'),
  ('messaging_rate_limit_messages_per_minute', '"30"'),
  ('messaging_max_group_participants', '"100"'),
  ('messaging_edit_window_minutes', '"15"')
ON CONFLICT (key) DO NOTHING;

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Function to increment unread counts for all participants except sender
CREATE OR REPLACE FUNCTION increment_unread_counts(
  p_conversation_id UUID,
  p_sender_id UUID
)
RETURNS void AS $$
BEGIN
  UPDATE conversation_participants
  SET
    unread_count = unread_count + 1,
    updated_at = NOW()
  WHERE conversation_id = p_conversation_id
    AND user_id != p_sender_id
    AND is_active = true;
END;
$$ LANGUAGE plpgsql;

-- Function to mark messages as read
CREATE OR REPLACE FUNCTION mark_messages_read(
  p_conversation_id UUID,
  p_user_id UUID
)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  -- Get current unread count
  SELECT unread_count INTO v_count
  FROM conversation_participants
  WHERE conversation_id = p_conversation_id
    AND user_id = p_user_id;

  -- Update participant record
  UPDATE conversation_participants
  SET
    unread_count = 0,
    last_read_at = NOW(),
    updated_at = NOW()
  WHERE conversation_id = p_conversation_id
    AND user_id = p_user_id;

  RETURN COALESCE(v_count, 0);
END;
$$ LANGUAGE plpgsql;

-- Function to get total unread count for a user
CREATE OR REPLACE FUNCTION get_total_unread_count(p_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COALESCE(SUM(unread_count), 0)
    FROM conversation_participants
    WHERE user_id = p_user_id
      AND is_active = true
  );
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- TRIGGERS
-- =============================================

-- Trigger to update conversation last_message fields when new message is sent
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET
    last_message_at = NEW.created_at,
    last_message_preview = LEFT(NEW.content, 100),
    last_message_sender_id = NEW.sender_id,
    updated_at = NOW()
  WHERE id = NEW.conversation_id;

  -- Also increment unread counts
  PERFORM increment_unread_counts(NEW.conversation_id, NEW.sender_id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_conversation_last_message ON messages;
CREATE TRIGGER trg_update_conversation_last_message
AFTER INSERT ON messages
FOR EACH ROW
WHEN (NEW.type != 'system')
EXECUTE FUNCTION update_conversation_last_message();

-- Trigger to update participant count
CREATE OR REPLACE FUNCTION update_participant_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE conversations
    SET participant_count = participant_count + 1
    WHERE id = NEW.conversation_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.is_active = true AND NEW.is_active = false THEN
    UPDATE conversations
    SET participant_count = participant_count - 1
    WHERE id = NEW.conversation_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.is_active = false AND NEW.is_active = true THEN
    UPDATE conversations
    SET participant_count = participant_count + 1
    WHERE id = NEW.conversation_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_participant_count ON conversation_participants;
CREATE TRIGGER trg_update_participant_count
AFTER INSERT OR UPDATE OF is_active ON conversation_participants
FOR EACH ROW
EXECUTE FUNCTION update_participant_count();

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_read_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;

-- Conversations: Users can view conversations they participate in
DROP POLICY IF EXISTS "Users can view their conversations" ON conversations;
CREATE POLICY "Users can view their conversations" ON conversations
  FOR SELECT USING (
    id IN (
      SELECT conversation_id FROM conversation_participants
      WHERE user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
      AND is_active = true
    )
  );

-- Conversation participants: Users can see participants of their conversations
DROP POLICY IF EXISTS "Users can view conversation participants" ON conversation_participants;
CREATE POLICY "Users can view conversation participants" ON conversation_participants
  FOR SELECT USING (
    conversation_id IN (
      SELECT conversation_id FROM conversation_participants
      WHERE user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
      AND is_active = true
    )
  );

-- Messages: Users can view messages in their conversations
DROP POLICY IF EXISTS "Users can view messages" ON messages;
CREATE POLICY "Users can view messages" ON messages
  FOR SELECT USING (
    conversation_id IN (
      SELECT conversation_id FROM conversation_participants
      WHERE user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
      AND is_active = true
    )
  );

-- Messages: Users can insert messages in their conversations
DROP POLICY IF EXISTS "Users can send messages" ON messages;
CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (
    conversation_id IN (
      SELECT conversation_id FROM conversation_participants
      WHERE user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
      AND is_active = true
    )
  );

-- User presence: Users can view presence of users in shared conversations
DROP POLICY IF EXISTS "Users can view presence" ON user_presence;
CREATE POLICY "Users can view presence" ON user_presence
  FOR SELECT USING (true);

-- Users can update their own presence
DROP POLICY IF EXISTS "Users can update own presence" ON user_presence;
CREATE POLICY "Users can update own presence" ON user_presence
  FOR ALL USING (
    user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
  );

-- Message reactions
DROP POLICY IF EXISTS "Users can view reactions" ON message_reactions;
CREATE POLICY "Users can view reactions" ON message_reactions
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can manage own reactions" ON message_reactions;
CREATE POLICY "Users can manage own reactions" ON message_reactions
  FOR ALL USING (
    user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
  );

-- Read receipts
DROP POLICY IF EXISTS "Users can view read receipts" ON message_read_receipts;
CREATE POLICY "Users can view read receipts" ON message_read_receipts
  FOR SELECT USING (true);

-- =============================================
-- ENABLE REALTIME
-- =============================================
-- Note: Run these in Supabase dashboard if needed:
-- ALTER PUBLICATION supabase_realtime ADD TABLE messages;
-- ALTER PUBLICATION supabase_realtime ADD TABLE conversation_participants;
-- ALTER PUBLICATION supabase_realtime ADD TABLE user_presence;
