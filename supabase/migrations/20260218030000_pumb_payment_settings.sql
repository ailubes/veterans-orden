-- Add PUMB payment provider settings to organization_settings table
-- These are dormant (disabled) until an admin enters credentials

INSERT INTO organization_settings (key, value, description, is_public)
VALUES
  ('payment_pumb_enabled',       'false', 'Enable PUMB PayHub2 as the active payment provider', false),
  ('payment_pumb_client_id',     '',      'PUMB PayHub2 OAuth2 client ID',                      false),
  ('payment_pumb_client_secret', '',      'PUMB PayHub2 OAuth2 client secret',                  false),
  ('payment_pumb_api_url',       '',      'PUMB PayHub2 API base URL (e.g. https://api.pumb.ua/payhub2)', false),
  ('payment_pumb_portal_id',     '',      'PUMB merchant portal ID',                            false),
  ('payment_pumb_merchant_id',   '',      'PUMB merchant ID',                                   false)

ON CONFLICT (key) DO NOTHING;
