-- Migration: Add comprehensive points system
-- Date: 2025-12-27
-- Description: Adds points transaction ledger, user engagement fields, and annual points tracking

-- Create points transaction type enum
DO $$ BEGIN
  CREATE TYPE points_transaction_type AS ENUM (
    'earn_task',
    'earn_event',
    'earn_vote',
    'earn_referral',
    'earn_daily_login',
    'earn_content',
    'earn_challenge',
    'earn_admin',
    'spend_marketplace',
    'spend_event',
    'expire_annual',
    'refund'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create points_transactions table
CREATE TABLE IF NOT EXISTS points_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  type points_transaction_type NOT NULL,
  amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  earned_year INTEGER,
  expires_at TIMESTAMP,
  reference_type VARCHAR(50),
  reference_id UUID,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_by_id UUID REFERENCES users(id)
);

-- Create indexes for points_transactions
CREATE INDEX IF NOT EXISTS points_transactions_user_idx ON points_transactions(user_id);
CREATE INDEX IF NOT EXISTS points_transactions_type_idx ON points_transactions(type);
CREATE INDEX IF NOT EXISTS points_transactions_year_idx ON points_transactions(earned_year);
CREATE INDEX IF NOT EXISTS points_transactions_created_at_idx ON points_transactions(created_at);

-- Add points tracking columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS current_year_points INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS login_streak INTEGER DEFAULT 0;

-- Add comments for documentation
COMMENT ON TABLE points_transactions IS 'Transaction ledger for all points earned and spent';
COMMENT ON COLUMN points_transactions.amount IS 'Points amount (positive for earning, negative for spending)';
COMMENT ON COLUMN points_transactions.balance_after IS 'User total points balance after this transaction';
COMMENT ON COLUMN points_transactions.earned_year IS 'Year points were earned (for annual expiration)';
COMMENT ON COLUMN points_transactions.expires_at IS 'When these points expire (Dec 31 of earned year)';
COMMENT ON COLUMN points_transactions.reference_type IS 'Type of entity this transaction relates to (task, event, etc)';
COMMENT ON COLUMN points_transactions.reference_id IS 'ID of the related entity';
COMMENT ON COLUMN points_transactions.metadata IS 'Additional context (reason, adjusted_by, etc)';
COMMENT ON COLUMN points_transactions.created_by_id IS 'Admin user who created transaction (for manual adjustments)';

COMMENT ON COLUMN users.current_year_points IS 'Points earned this calendar year (reset annually)';
COMMENT ON COLUMN users.last_login_at IS 'Last time user logged in (for streak tracking)';
COMMENT ON COLUMN users.login_streak IS 'Consecutive days logged in';
