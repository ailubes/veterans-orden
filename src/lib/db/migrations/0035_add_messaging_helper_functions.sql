-- =============================================
-- MESSAGING HELPER FUNCTIONS
-- =============================================

-- Function to find existing DM between two users
CREATE OR REPLACE FUNCTION find_existing_dm(
  p_user_id_1 UUID,
  p_user_id_2 UUID
)
RETURNS TABLE (
  id UUID,
  type conversation_type,
  name VARCHAR(100),
  description TEXT,
  avatar_url TEXT,
  created_by_id UUID,
  is_active BOOLEAN,
  allow_replies BOOLEAN,
  participant_count INTEGER,
  last_message_at TIMESTAMP,
  last_message_preview TEXT,
  last_message_sender_id UUID,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT c.id, c.type, c.name, c.description, c.avatar_url,
         c.created_by_id, c.is_active, c.allow_replies,
         c.participant_count, c.last_message_at, c.last_message_preview,
         c.last_message_sender_id, c.created_at, c.updated_at
  FROM conversations c
  WHERE c.type = 'direct'
    AND c.is_active = true
    AND EXISTS (
      SELECT 1 FROM conversation_participants cp1
      WHERE cp1.conversation_id = c.id
        AND cp1.user_id = p_user_id_1
        AND cp1.is_active = true
    )
    AND EXISTS (
      SELECT 1 FROM conversation_participants cp2
      WHERE cp2.conversation_id = c.id
        AND cp2.user_id = p_user_id_2
        AND cp2.is_active = true
    )
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Function to check if a user is in another user's referral tree
-- Returns true if p_user_id is a direct or indirect referral of p_referrer_id
CREATE OR REPLACE FUNCTION is_in_referral_tree(
  p_referrer_id UUID,
  p_user_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_current_id UUID;
  v_depth INTEGER := 0;
  v_max_depth INTEGER := 10; -- Prevent infinite loops
BEGIN
  -- Can't be in own referral tree
  IF p_referrer_id = p_user_id THEN
    RETURN false;
  END IF;

  -- Start with the user and walk up the referral chain
  v_current_id := p_user_id;

  WHILE v_depth < v_max_depth LOOP
    -- Get the referrer of current user
    SELECT referred_by_id INTO v_current_id
    FROM users
    WHERE id = v_current_id;

    -- No more referrers in chain
    IF v_current_id IS NULL THEN
      RETURN false;
    END IF;

    -- Found the target referrer
    IF v_current_id = p_referrer_id THEN
      RETURN true;
    END IF;

    v_depth := v_depth + 1;
  END LOOP;

  RETURN false;
END;
$$ LANGUAGE plpgsql;

-- Function to get message statistics for admin dashboard
CREATE OR REPLACE FUNCTION get_messaging_stats()
RETURNS TABLE (
  total_conversations BIGINT,
  total_messages BIGINT,
  active_users_24h BIGINT,
  messages_24h BIGINT,
  dms_count BIGINT,
  groups_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM conversations WHERE is_active = true) as total_conversations,
    (SELECT COUNT(*) FROM messages WHERE is_deleted = false) as total_messages,
    (SELECT COUNT(DISTINCT user_id) FROM user_presence WHERE last_seen_at > NOW() - INTERVAL '24 hours') as active_users_24h,
    (SELECT COUNT(*) FROM messages WHERE created_at > NOW() - INTERVAL '24 hours' AND is_deleted = false) as messages_24h,
    (SELECT COUNT(*) FROM conversations WHERE type = 'direct' AND is_active = true) as dms_count,
    (SELECT COUNT(*) FROM conversations WHERE type = 'group' AND is_active = true) as groups_count;
END;
$$ LANGUAGE plpgsql;

-- Function to mute a conversation for a user
CREATE OR REPLACE FUNCTION mute_conversation(
  p_conversation_id UUID,
  p_user_id UUID,
  p_muted_until TIMESTAMP DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  UPDATE conversation_participants
  SET
    is_muted = true,
    muted_until = p_muted_until,
    updated_at = NOW()
  WHERE conversation_id = p_conversation_id
    AND user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to unmute a conversation
CREATE OR REPLACE FUNCTION unmute_conversation(
  p_conversation_id UUID,
  p_user_id UUID
)
RETURNS void AS $$
BEGIN
  UPDATE conversation_participants
  SET
    is_muted = false,
    muted_until = NULL,
    updated_at = NOW()
  WHERE conversation_id = p_conversation_id
    AND user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to search messages
CREATE OR REPLACE FUNCTION search_messages(
  p_user_id UUID,
  p_query TEXT,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  message_id UUID,
  conversation_id UUID,
  conversation_name VARCHAR(100),
  conversation_type conversation_type,
  content TEXT,
  sender_id UUID,
  sender_first_name VARCHAR(255),
  sender_last_name VARCHAR(255),
  created_at TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.id as message_id,
    m.conversation_id,
    c.name as conversation_name,
    c.type as conversation_type,
    m.content,
    m.sender_id,
    u.first_name as sender_first_name,
    u.last_name as sender_last_name,
    m.created_at
  FROM messages m
  JOIN conversations c ON c.id = m.conversation_id
  JOIN conversation_participants cp ON cp.conversation_id = c.id
  LEFT JOIN users u ON u.id = m.sender_id
  WHERE cp.user_id = p_user_id
    AND cp.is_active = true
    AND m.is_deleted = false
    AND m.content ILIKE '%' || p_query || '%'
  ORDER BY m.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-expire mutes
CREATE OR REPLACE FUNCTION check_mute_expiration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.muted_until IS NOT NULL AND NEW.muted_until < NOW() THEN
    NEW.is_muted := false;
    NEW.muted_until := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_mute_expiration ON conversation_participants;
CREATE TRIGGER trg_check_mute_expiration
BEFORE UPDATE ON conversation_participants
FOR EACH ROW
EXECUTE FUNCTION check_mute_expiration();
