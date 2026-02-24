-- Fix admin access to notifications tables

-- Allow admins to INSERT notifications (they are the sender, so user_id = their id)
CREATE POLICY "notifs_admin_insert" ON notifications
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = get_current_user_id()
    AND EXISTS (
      SELECT 1 FROM users
      WHERE id = get_current_user_id()
        AND staff_role IN ('admin', 'super_admin')
    )
  );

-- Allow admins to SELECT all notifications (not just their own)
CREATE POLICY "notifs_admin_select" ON notifications
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = get_current_user_id()
        AND staff_role IN ('admin', 'super_admin')
    )
  );

-- Allow admins to INSERT notification_recipients
CREATE POLICY "notif_recipients_admin_insert" ON notification_recipients
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = get_current_user_id()
        AND staff_role IN ('admin', 'super_admin')
    )
  );
