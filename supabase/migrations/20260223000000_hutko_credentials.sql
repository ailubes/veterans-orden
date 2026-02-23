-- Extend payment_status enum with chargeback value
ALTER TYPE payment_status ADD VALUE IF NOT EXISTS 'chargeback';

-- Seed HUTKO production credentials
INSERT INTO organization_settings (key, value, updated_at)
VALUES
  ('payment_hutko_enabled',     'true',                                       now()),
  ('payment_hutko_merchant_id', '1702303',                                    now()),
  ('payment_hutko_secret_key',  '"4D8b4fNtrnUumVFSnWGhxF786XOXB8ZS"',       now()),
  ('payment_hutko_credit_key',  '"OIeDXyoTYhQEdtl9XOhzLWYOM1jii0z2"',       now())
ON CONFLICT (key) DO UPDATE
  SET value      = EXCLUDED.value,
      updated_at = EXCLUDED.updated_at;
