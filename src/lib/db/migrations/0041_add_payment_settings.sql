-- Migration 0041: Add LiqPay payment settings to organization_settings
-- Allows admin to configure payment gateway from dashboard

-- Insert LiqPay payment settings (if they don't exist)
INSERT INTO organization_settings (key, value, updated_at)
VALUES
  ('payment_liqpay_enabled', '"true"'::jsonb, NOW()),
  ('payment_liqpay_public_key', '""'::jsonb, NOW()),
  ('payment_liqpay_private_key', '""'::jsonb, NOW()),
  ('payment_liqpay_sandbox_mode', '"true"'::jsonb, NOW()),
  ('payment_currency', '"UAH"'::jsonb, NOW()),
  ('payment_success_bonus_points', '"50"'::jsonb, NOW())
ON CONFLICT (key) DO NOTHING;
