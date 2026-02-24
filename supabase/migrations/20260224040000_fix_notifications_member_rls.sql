-- Fix member RLS policies for notifications tables
-- Old policies used clerk_id which no longer matches (project uses Supabase auth)
-- New policies use get_current_user_id() which resolves auth.uid() → users.id

-- Allow members to SELECT notifications they are a recipient of
CREATE POLICY "notifs_member_select" ON notifications
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM notification_recipients
      WHERE notification_recipients.notification_id = notifications.id
        AND notification_recipients.user_id = get_current_user_id()
    )
  );

-- Allow members to SELECT their own notification_recipients rows
CREATE POLICY "notif_recipients_member_select" ON notification_recipients
  FOR SELECT TO authenticated
  USING (user_id = get_current_user_id());

-- Allow members to UPDATE (mark as read) their own notification_recipients rows
CREATE POLICY "notif_recipients_member_update" ON notification_recipients
  FOR UPDATE TO authenticated
  USING (user_id = get_current_user_id())
  WITH CHECK (user_id = get_current_user_id());
