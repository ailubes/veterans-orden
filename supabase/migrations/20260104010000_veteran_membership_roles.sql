-- Migration: Veteran Membership Roles
-- Description: Replace referral-based membership with participation-based veteran roles

-- New enum for veteran-specific membership
CREATE TYPE "public"."veteran_membership_role" AS ENUM(
  'applicant',           -- Applied, not yet reviewed
  'community_member',    -- Спільнота - open membership
  'order_candidate',     -- Орден - nominated, in trial period
  'order_member',        -- Орден - full member after initiation
  'veteran_emeritus'     -- Honorary status for distinguished service
);

-- Add veteran-specific columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS veteran_role veteran_membership_role DEFAULT 'applicant';
ALTER TABLE users ADD COLUMN IF NOT EXISTS membership_type varchar(20) DEFAULT 'community';
ALTER TABLE users ADD COLUMN IF NOT EXISTS nominated_by_id uuid REFERENCES users(id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS initiation_date timestamp;
ALTER TABLE users ADD COLUMN IF NOT EXISTS trial_start_date timestamp;
ALTER TABLE users ADD COLUMN IF NOT EXISTS trial_end_date timestamp;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS users_veteran_role_idx ON users(veteran_role);
CREATE INDEX IF NOT EXISTS users_membership_type_idx ON users(membership_type);
CREATE INDEX IF NOT EXISTS users_nominated_by_idx ON users(nominated_by_id);

-- Comments for documentation
COMMENT ON COLUMN users.veteran_role IS 'Participation-based membership role';
COMMENT ON COLUMN users.membership_type IS 'Type: community (open) or order (by invitation)';
COMMENT ON COLUMN users.nominated_by_id IS 'User who nominated this member for Order';
COMMENT ON COLUMN users.initiation_date IS 'Date of Order initiation ceremony';
COMMENT ON COLUMN users.trial_start_date IS 'Start of trial period for Order candidates';
COMMENT ON COLUMN users.trial_end_date IS 'End of trial period for Order candidates';
