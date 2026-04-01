-- Allow creation of commanderies only for members with role `honorary_member`.
-- This is enforced at the database RLS layer.

CREATE OR REPLACE FUNCTION can_create_commanderies()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM users
    WHERE auth_id = auth.uid()
      AND membership_role = 'honorary_member'
  );
$$;

DROP POLICY IF EXISTS "commanderies_honorary_insert" ON commanderies;

CREATE POLICY "commanderies_honorary_insert"
ON commanderies
FOR INSERT
TO authenticated
WITH CHECK (
  can_create_commanderies()
  AND leader_id = get_current_user_id()
  AND type IN ('commandery', 'city')
);
