-- Set user as admin by email
-- Run this in Supabase SQL Editor

-- Update role for spiceup.dev@gmail.com
UPDATE users
SET role = 'super_admin'
WHERE email = 'spiceup.dev@gmail.com';

-- Verify the update
SELECT id, email, first_name, last_name, role, status
FROM users
WHERE email = 'spiceup.dev@gmail.com';
