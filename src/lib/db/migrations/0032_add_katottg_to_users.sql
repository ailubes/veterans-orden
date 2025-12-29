-- Add KATOTTG fields to users table
-- This migration adds the new location fields that reference the KATOTTG system

-- Add new KATOTTG-based location columns to users
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS katottg_code VARCHAR(19),
  ADD COLUMN IF NOT EXISTS settlement_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS hromada_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS raion_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS oblast_name_katottg VARCHAR(255);

-- Index for efficient lookups by location
CREATE INDEX IF NOT EXISTS idx_users_katottg_code ON users(katottg_code);

-- Clear existing location data as per migration strategy
-- All users must re-select their location from KATOTTG
UPDATE users SET oblast_id = NULL, city = NULL WHERE 1=1;

COMMENT ON COLUMN users.katottg_code IS 'Reference to KATOTTG code for user settlement';
COMMENT ON COLUMN users.settlement_name IS 'Denormalized settlement name from KATOTTG';
COMMENT ON COLUMN users.hromada_name IS 'Denormalized hromada name from KATOTTG';
COMMENT ON COLUMN users.raion_name IS 'Denormalized raion name from KATOTTG';
COMMENT ON COLUMN users.oblast_name_katottg IS 'Denormalized oblast name from KATOTTG';
