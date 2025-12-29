-- =============================================
-- MESSAGE FEATURES: PIN, STAR, FORWARD
-- =============================================

-- Add pinned_at and pinned_by to messages
ALTER TABLE messages ADD COLUMN IF NOT EXISTS pinned_at TIMESTAMP;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS pinned_by UUID REFERENCES users(id);

-- Add forwarded_from fields to messages
ALTER TABLE messages ADD COLUMN IF NOT EXISTS forwarded_from_message_id UUID REFERENCES messages(id);
ALTER TABLE messages ADD COLUMN IF NOT EXISTS forwarded_from_conversation_id UUID REFERENCES conversations(id);

-- Original sender name stored for forwarded messages (in case original user deleted)
ALTER TABLE messages ADD COLUMN IF NOT EXISTS forwarded_from_sender_name TEXT;

-- =============================================
-- STARRED MESSAGES TABLE
-- =============================================

-- User-specific bookmarks for important messages
CREATE TABLE IF NOT EXISTS starred_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE NOT NULL,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  starred_at TIMESTAMP DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, message_id)
);

-- Indexes for starred messages
CREATE INDEX IF NOT EXISTS idx_starred_messages_user ON starred_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_starred_messages_message ON starred_messages(message_id);
CREATE INDEX IF NOT EXISTS idx_starred_messages_conversation ON starred_messages(conversation_id);

-- =============================================
-- PINNED MESSAGES TRACKING ON CONVERSATIONS
-- =============================================

-- Max 3 pinned messages per conversation - store as array for easy access
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS pinned_message_ids UUID[] DEFAULT '{}';

-- Index for pinned messages lookup
CREATE INDEX IF NOT EXISTS idx_messages_pinned ON messages(conversation_id, pinned_at DESC) WHERE pinned_at IS NOT NULL;

-- Index for forwarded messages
CREATE INDEX IF NOT EXISTS idx_messages_forwarded ON messages(forwarded_from_message_id) WHERE forwarded_from_message_id IS NOT NULL;

-- =============================================
-- ROW LEVEL SECURITY FOR STARRED MESSAGES
-- =============================================

ALTER TABLE starred_messages ENABLE ROW LEVEL SECURITY;

-- Users can view their own starred messages
DROP POLICY IF EXISTS "Users can view own starred messages" ON starred_messages;
CREATE POLICY "Users can view own starred messages" ON starred_messages
  FOR SELECT USING (
    user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
  );

-- Users can star messages in conversations they participate in
DROP POLICY IF EXISTS "Users can star messages" ON starred_messages;
CREATE POLICY "Users can star messages" ON starred_messages
  FOR INSERT WITH CHECK (
    user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
    AND conversation_id IN (
      SELECT conversation_id FROM conversation_participants
      WHERE user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
      AND is_active = true
    )
  );

-- Users can unstar their own starred messages
DROP POLICY IF EXISTS "Users can unstar own messages" ON starred_messages;
CREATE POLICY "Users can unstar own messages" ON starred_messages
  FOR DELETE USING (
    user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
  );

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Function to pin a message (enforces max 3 limit)
CREATE OR REPLACE FUNCTION pin_message(
  p_message_id UUID,
  p_user_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_conversation_id UUID;
  v_current_pinned UUID[];
  v_is_admin BOOLEAN;
BEGIN
  -- Get conversation ID for the message
  SELECT conversation_id INTO v_conversation_id
  FROM messages WHERE id = p_message_id;

  IF v_conversation_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Check if user is admin/owner of conversation
  SELECT (role IN ('owner', 'admin')) INTO v_is_admin
  FROM conversation_participants
  WHERE conversation_id = v_conversation_id
    AND user_id = p_user_id
    AND is_active = true;

  IF NOT v_is_admin THEN
    RETURN FALSE;
  END IF;

  -- Get current pinned messages
  SELECT COALESCE(pinned_message_ids, '{}') INTO v_current_pinned
  FROM conversations WHERE id = v_conversation_id;

  -- Check if already at max (3)
  IF array_length(v_current_pinned, 1) >= 3 THEN
    RETURN FALSE;
  END IF;

  -- Check if already pinned
  IF p_message_id = ANY(v_current_pinned) THEN
    RETURN FALSE;
  END IF;

  -- Pin the message
  UPDATE messages
  SET pinned_at = NOW(), pinned_by = p_user_id
  WHERE id = p_message_id;

  -- Add to conversation's pinned array
  UPDATE conversations
  SET pinned_message_ids = array_append(pinned_message_ids, p_message_id)
  WHERE id = v_conversation_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to unpin a message
CREATE OR REPLACE FUNCTION unpin_message(
  p_message_id UUID,
  p_user_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_conversation_id UUID;
  v_is_admin BOOLEAN;
BEGIN
  -- Get conversation ID for the message
  SELECT conversation_id INTO v_conversation_id
  FROM messages WHERE id = p_message_id;

  IF v_conversation_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Check if user is admin/owner of conversation
  SELECT (role IN ('owner', 'admin')) INTO v_is_admin
  FROM conversation_participants
  WHERE conversation_id = v_conversation_id
    AND user_id = p_user_id
    AND is_active = true;

  IF NOT v_is_admin THEN
    RETURN FALSE;
  END IF;

  -- Unpin the message
  UPDATE messages
  SET pinned_at = NULL, pinned_by = NULL
  WHERE id = p_message_id;

  -- Remove from conversation's pinned array
  UPDATE conversations
  SET pinned_message_ids = array_remove(pinned_message_ids, p_message_id)
  WHERE id = v_conversation_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get pinned messages for a conversation
CREATE OR REPLACE FUNCTION get_pinned_messages(p_conversation_id UUID)
RETURNS TABLE (
  id UUID,
  content TEXT,
  sender_name TEXT,
  pinned_at TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.id,
    m.content,
    CONCAT(u.first_name, ' ', u.last_name) as sender_name,
    m.pinned_at
  FROM messages m
  LEFT JOIN users u ON u.id = m.sender_id
  WHERE m.conversation_id = p_conversation_id
    AND m.pinned_at IS NOT NULL
  ORDER BY m.pinned_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has starred a message
CREATE OR REPLACE FUNCTION is_message_starred(
  p_message_id UUID,
  p_user_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM starred_messages
    WHERE message_id = p_message_id
      AND user_id = p_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
