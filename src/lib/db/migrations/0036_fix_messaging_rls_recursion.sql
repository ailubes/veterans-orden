-- =============================================
-- FIX MESSAGING RLS INFINITE RECURSION
-- =============================================
-- The original policies caused infinite recursion because
-- conversation_participants policy queried itself.
-- Fix: Use SECURITY DEFINER functions to bypass RLS in checks.

-- =============================================
-- HELPER FUNCTION (bypasses RLS)
-- =============================================

-- Function to check if user is a participant of a conversation
-- Uses SECURITY DEFINER to bypass RLS and avoid recursion
CREATE OR REPLACE FUNCTION user_is_conversation_participant(
  p_conversation_id UUID,
  p_clerk_id TEXT
)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM conversation_participants cp
    INNER JOIN users u ON u.id = cp.user_id
    WHERE cp.conversation_id = p_conversation_id
    AND u.clerk_id = p_clerk_id
    AND cp.is_active = true
  );
END;
$$ LANGUAGE plpgsql;

-- Function to get user's conversation IDs (bypasses RLS)
CREATE OR REPLACE FUNCTION get_user_conversation_ids(p_clerk_id TEXT)
RETURNS SETOF UUID
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT cp.conversation_id
  FROM conversation_participants cp
  INNER JOIN users u ON u.id = cp.user_id
  WHERE u.clerk_id = p_clerk_id
  AND cp.is_active = true;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- FIX CONVERSATION PARTICIPANTS POLICIES
-- =============================================

-- Drop the problematic policies
DROP POLICY IF EXISTS "Users can view conversation participants" ON conversation_participants;

-- New policy: Users can view participants in conversations they belong to
-- Uses the helper function to avoid recursion
CREATE POLICY "Users can view conversation participants" ON conversation_participants
  FOR SELECT USING (
    user_is_conversation_participant(conversation_id, auth.uid()::text)
  );

-- Policy for users to view their own participant records
DROP POLICY IF EXISTS "Users can view own participant records" ON conversation_participants;
CREATE POLICY "Users can view own participant records" ON conversation_participants
  FOR SELECT USING (
    user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
  );

-- Policy for updating own participant records (mute, read, etc.)
DROP POLICY IF EXISTS "Users can update own participant records" ON conversation_participants;
CREATE POLICY "Users can update own participant records" ON conversation_participants
  FOR UPDATE USING (
    user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
  );

-- =============================================
-- FIX CONVERSATIONS POLICIES
-- =============================================

-- Drop the old policy
DROP POLICY IF EXISTS "Users can view their conversations" ON conversations;

-- New policy using helper function
CREATE POLICY "Users can view their conversations" ON conversations
  FOR SELECT USING (
    id IN (SELECT get_user_conversation_ids(auth.uid()::text))
  );

-- =============================================
-- FIX MESSAGES POLICIES
-- =============================================

-- Drop old policies
DROP POLICY IF EXISTS "Users can view messages" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;

-- New policies using helper function
CREATE POLICY "Users can view messages" ON messages
  FOR SELECT USING (
    user_is_conversation_participant(conversation_id, auth.uid()::text)
  );

CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (
    user_is_conversation_participant(conversation_id, auth.uid()::text)
  );

-- =============================================
-- ALSO ADD INSERT/UPDATE POLICIES FOR PARTICIPANTS
-- (needed for creating conversations)
-- =============================================

-- Allow inserting participants for conversations user created or is admin of
DROP POLICY IF EXISTS "Users can add participants" ON conversation_participants;
CREATE POLICY "Users can add participants" ON conversation_participants
  FOR INSERT WITH CHECK (
    -- User is the creator of the conversation
    EXISTS (
      SELECT 1 FROM conversations c
      INNER JOIN users u ON u.id = c.created_by_id
      WHERE c.id = conversation_id
      AND u.clerk_id = auth.uid()::text
    )
    OR
    -- User is an admin/owner of the conversation
    EXISTS (
      SELECT 1 FROM conversation_participants cp
      INNER JOIN users u ON u.id = cp.user_id
      WHERE cp.conversation_id = conversation_participants.conversation_id
      AND u.clerk_id = auth.uid()::text
      AND cp.role IN ('owner', 'admin')
      AND cp.is_active = true
    )
  );

-- Allow users to insert conversations they create
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
CREATE POLICY "Users can create conversations" ON conversations
  FOR INSERT WITH CHECK (
    created_by_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
  );
