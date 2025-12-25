-- Migration: Add news_editor role to user_role enum
-- This allows super admins to assign news editing permissions to members
-- Date: 2024-12-25

BEGIN;

-- Add news_editor to the user_role enum
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'news_editor';

-- Add comment
COMMENT ON TYPE user_role IS 'User roles: free_viewer, prospect, silent_member, full_member, group_leader, regional_leader, news_editor, admin, super_admin';

COMMIT;
