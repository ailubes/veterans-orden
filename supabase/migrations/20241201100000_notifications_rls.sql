-- Migration: Add RLS policies for notifications tables
-- This allows admins to insert/manage notifications

-- Enable RLS on notifications table (if not already enabled)
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (safe to run)
DROP POLICY IF EXISTS "Admins can manage notifications" ON notifications;
DROP POLICY IF EXISTS "Users can read their notifications" ON notifications;
DROP POLICY IF EXISTS "Service role bypass" ON notifications;

-- Policy: Admins can insert/update/delete notifications
CREATE POLICY "Admins can manage notifications" ON notifications
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.clerk_id = auth.uid()::text
    AND users.role IN ('super_admin', 'admin', 'regional_leader')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.clerk_id = auth.uid()::text
    AND users.role IN ('super_admin', 'admin', 'regional_leader')
  )
);

-- Policy: Users can read notifications sent to them (via notification_recipients)
CREATE POLICY "Users can read notifications" ON notifications
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM notification_recipients nr
    JOIN users u ON u.id = nr.user_id
    WHERE nr.notification_id = notifications.id
    AND u.clerk_id = auth.uid()::text
  )
);

-- Enable RLS on notification_recipients
ALTER TABLE notification_recipients ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can manage recipients" ON notification_recipients;
DROP POLICY IF EXISTS "Users can read own recipients" ON notification_recipients;
DROP POLICY IF EXISTS "Users can update own recipients" ON notification_recipients;

-- Policy: Admins can manage recipient records
CREATE POLICY "Admins can manage recipients" ON notification_recipients
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.clerk_id = auth.uid()::text
    AND users.role IN ('super_admin', 'admin', 'regional_leader')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.clerk_id = auth.uid()::text
    AND users.role IN ('super_admin', 'admin', 'regional_leader')
  )
);

-- Policy: Users can read their own notification recipients
CREATE POLICY "Users can read own recipients" ON notification_recipients
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = notification_recipients.user_id
    AND users.clerk_id = auth.uid()::text
  )
);

-- Policy: Users can mark their own notifications as read
CREATE POLICY "Users can update own recipients" ON notification_recipients
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = notification_recipients.user_id
    AND users.clerk_id = auth.uid()::text
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = notification_recipients.user_id
    AND users.clerk_id = auth.uid()::text
  )
);
