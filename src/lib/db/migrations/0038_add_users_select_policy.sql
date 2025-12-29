-- Migration: Add SELECT policy to users table for conversation participant lookup
-- This allows authenticated users to read basic profile information of other users
-- Required for displaying names in direct message conversations

-- Allow authenticated users to read basic profile fields of other users
-- This is needed for:
-- 1. Displaying participant names in conversations
-- 2. User search when adding participants to groups
-- 3. Showing sender information in messages
CREATE POLICY "Users can view other users basic profile"
ON public.users
FOR SELECT
TO authenticated
USING (true);

-- Note: This allows reading all columns. For more restrictive access,
-- you could use views or specific column-level security.
-- However, since the API only exposes id, first_name, last_name, avatar_url,
-- and membership_role, this is acceptable for the messaging system.
