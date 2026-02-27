-- Allow admins to insert and update organization settings
CREATE POLICY "org_settings_admin_insert" ON organization_settings
  FOR INSERT TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "org_settings_admin_update" ON organization_settings
  FOR UPDATE TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());
