-- Organization settings table for storing system-wide configuration
-- Used for organization profile, system config, feature flags, etc.
-- Stores settings as key-value pairs with JSONB values for flexibility

CREATE TABLE IF NOT EXISTS organization_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) NOT NULL UNIQUE,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMP DEFAULT NOW(),
  updated_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create index on key for fast lookups
CREATE INDEX IF NOT EXISTS idx_organization_settings_key ON organization_settings(key);

-- Seed initial organization settings
INSERT INTO organization_settings (key, value, description) VALUES
  ('organization_name', '"Мережа Вільних Людей"'::jsonb, 'Organization display name'),
  ('organization_contact_email', '"info@freepeople.org.ua"'::jsonb, 'Main contact email'),
  ('organization_contact_phone', '"+380XXXXXXXXX"'::jsonb, 'Main contact phone'),
  ('organization_about', '"Громадська організація для координації дій громадян України"'::jsonb, 'About text'),
  ('organization_social_facebook', '""'::jsonb, 'Facebook page URL'),
  ('organization_social_telegram', '""'::jsonb, 'Telegram channel URL'),
  ('organization_social_youtube', '""'::jsonb, 'YouTube channel URL'),
  ('organization_social_twitter', '""'::jsonb, 'Twitter/X profile URL'),
  ('system_maintenance_mode', 'false'::jsonb, 'Maintenance mode toggle'),
  ('system_registration_enabled', 'true'::jsonb, 'Allow new registrations'),
  ('system_default_membership_tier', '"basic_49"'::jsonb, 'Default tier for new members'),
  ('system_voting_enabled', 'true'::jsonb, 'Enable voting feature'),
  ('system_events_enabled', 'true'::jsonb, 'Enable events feature'),
  ('system_tasks_enabled', 'true'::jsonb, 'Enable tasks feature'),
  ('system_challenges_enabled', 'true'::jsonb, 'Enable challenges feature'),
  ('points_event_attendance', '10'::jsonb, 'Points awarded for event attendance'),
  ('points_vote_cast', '5'::jsonb, 'Points awarded for casting a vote'),
  ('points_task_completion', '20'::jsonb, 'Points awarded for task completion'),
  ('points_referral', '50'::jsonb, 'Points awarded for successful referral'),
  ('points_challenge_win', '100'::jsonb, 'Points awarded for challenge win')
ON CONFLICT (key) DO NOTHING;

-- Example usage:
-- Get a single setting:
-- SELECT value FROM organization_settings WHERE key = 'organization_name';

-- Update a setting:
-- UPDATE organization_settings
-- SET value = '"New Name"'::jsonb, updated_at = NOW(), updated_by = 'user-uuid'
-- WHERE key = 'organization_name';

-- Get all settings as key-value pairs:
-- SELECT key, value FROM organization_settings ORDER BY key;
