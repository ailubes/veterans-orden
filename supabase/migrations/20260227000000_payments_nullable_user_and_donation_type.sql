-- Allow donations without a logged-in user
ALTER TABLE payments ALTER COLUMN user_id DROP NOT NULL;

-- Allow 'donation' as a payment type
ALTER TABLE payments
  DROP CONSTRAINT IF EXISTS payments_type_check;

ALTER TABLE payments
  ADD CONSTRAINT payments_type_check
  CHECK (type IN ('membership', 'donation', 'event', 'product'));
