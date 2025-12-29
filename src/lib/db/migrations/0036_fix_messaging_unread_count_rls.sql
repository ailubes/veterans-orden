-- =============================================
-- FIX MESSAGING UNREAD COUNT RLS ISSUES
-- =============================================

-- Add UPDATE policy for users to update their OWN participant records
DROP POLICY IF EXISTS "Users can update own participant record" ON conversation_participants;
CREATE POLICY "Users can update own participant record" ON conversation_participants
  FOR UPDATE USING (
    user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
  );

-- Update increment_unread_counts to use SECURITY DEFINER
-- This allows the trigger and API to update other users' records
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update mark_messages_read to use SECURITY DEFINER
-- This allows the API to update participant records even when called by triggers
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update get_total_unread_count to use SECURITY DEFINER
-- This ensures RLS doesn't block the query
CREATE OR REPLACE FUNCTION get_total_unread_count(p_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COALESCE(SUM(unread_count), 0)::INTEGER
    FROM conversation_participants
    WHERE user_id = p_user_id
      AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remove the increment from trigger since we handle it in the API
-- The trigger should only update conversation metadata
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

  -- NOTE: increment_unread_counts is now handled in the API
  -- to avoid double increments and RLS issues

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
