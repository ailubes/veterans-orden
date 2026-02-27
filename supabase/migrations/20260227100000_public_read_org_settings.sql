-- Allow anonymous users to read organization settings
-- This makes public org info (name, address, bank details) accessible to public pages
CREATE POLICY "public_read_org_settings"
  ON organization_settings
  FOR SELECT
  TO anon
  USING (true);
