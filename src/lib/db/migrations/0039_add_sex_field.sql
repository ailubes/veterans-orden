-- Migration: 0039_add_sex_field.sql
-- Description: Add sex field to users table for avatar defaults
-- Date: 2025-12-29

-- Create enum type for sex
DO $$ BEGIN
    CREATE TYPE user_sex AS ENUM ('male', 'female', 'not_specified');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add sex column to users table with default value
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS sex user_sex DEFAULT 'not_specified';

-- Create index for potential filtering/analytics
CREATE INDEX IF NOT EXISTS idx_users_sex ON users(sex);

-- Add documentation comment
COMMENT ON COLUMN users.sex IS 'User sex for avatar defaults: male, female, or not_specified';
