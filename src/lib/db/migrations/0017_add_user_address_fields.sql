-- Migration: Add delivery address and Nova Poshta fields to users table
-- Date: 2025-12-26

-- Add delivery address fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS street_address VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS postal_code VARCHAR(10);

-- Add Nova Poshta delivery fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS nova_poshta_city VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS nova_poshta_city_ref VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS nova_poshta_branch VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS nova_poshta_branch_ref VARCHAR(50);

-- Add comments for documentation
COMMENT ON COLUMN users.street_address IS 'Street address including building and apartment number';
COMMENT ON COLUMN users.postal_code IS 'Postal/ZIP code';
COMMENT ON COLUMN users.nova_poshta_city IS 'City name for Nova Poshta delivery';
COMMENT ON COLUMN users.nova_poshta_city_ref IS 'Nova Poshta API city reference';
COMMENT ON COLUMN users.nova_poshta_branch IS 'Nova Poshta branch number/name (e.g., "Відділення №5")';
COMMENT ON COLUMN users.nova_poshta_branch_ref IS 'Nova Poshta API branch reference';
