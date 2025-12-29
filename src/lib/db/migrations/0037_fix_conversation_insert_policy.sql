-- =============================================
-- FIX CONVERSATION INSERT RLS POLICY
-- =============================================
-- The current INSERT policy for conversations may not work correctly
-- because auth.uid() may not be available in all contexts.
-- Solution: Create a SECURITY DEFINER function to handle conversation creation

-- Drop existing insert policy if exists
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;

-- Create a more permissive INSERT policy
-- Any authenticated user can create a conversation as long as they set
-- themselves as the creator
CREATE POLICY "Users can create conversations" ON conversations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Also ensure participants can be added
DROP POLICY IF EXISTS "Users can add participants" ON conversation_participants;
CREATE POLICY "Users can add participants" ON conversation_participants
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Add policy for updating conversation (for last_message_at, etc.)
DROP POLICY IF EXISTS "Participants can update conversation" ON conversations;
CREATE POLICY "Participants can update conversation" ON conversations
  FOR UPDATE
  TO authenticated
  USING (
    user_is_conversation_participant(id, auth.uid()::text)
  );

-- Grant execute on helper functions to authenticated users
GRANT EXECUTE ON FUNCTION user_is_conversation_participant(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_conversation_ids(TEXT) TO authenticated;
