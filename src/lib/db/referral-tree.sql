-- Recursive function to get referral tree for a user
-- This function returns all members in a user's downline referral tree
-- Used by regional leaders to see only members they referred (directly or indirectly)

CREATE OR REPLACE FUNCTION get_referral_tree(root_user_id UUID)
RETURNS TABLE (
  id UUID,
  clerk_id TEXT,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  role TEXT,
  status TEXT,
  membership_tier TEXT,
  oblast_id UUID,
  city TEXT,
  points INTEGER,
  level INTEGER,
  referral_count INTEGER,
  referred_by_id UUID,
  created_at TIMESTAMP,
  depth INTEGER
) AS $$
  WITH RECURSIVE referral_tree AS (
    -- Base case: root user (the regional leader or user we're checking)
    SELECT
      u.id,
      u.clerk_id,
      u.first_name,
      u.last_name,
      u.email,
      u.role::TEXT,
      u.status::TEXT,
      u.membership_tier::TEXT,
      u.oblast_id,
      u.city,
      u.points,
      u.level,
      u.referral_count,
      u.referred_by_id,
      u.created_at,
      0 as depth
    FROM users u
    WHERE u.id = root_user_id

    UNION ALL

    -- Recursive case: users referred by anyone in the tree
    SELECT
      u.id,
      u.clerk_id,
      u.first_name,
      u.last_name,
      u.email,
      u.role::TEXT,
      u.status::TEXT,
      u.membership_tier::TEXT,
      u.oblast_id,
      u.city,
      u.points,
      u.level,
      u.referral_count,
      u.referred_by_id,
      u.created_at,
      rt.depth + 1
    FROM users u
    INNER JOIN referral_tree rt ON u.referred_by_id = rt.id
    WHERE rt.depth < 10 -- Prevent infinite recursion (max 10 levels deep)
  )
  SELECT * FROM referral_tree;
$$ LANGUAGE sql STABLE;

-- Create index on referred_by_id if not exists for performance
CREATE INDEX IF NOT EXISTS idx_users_referred_by_id ON users(referred_by_id);

-- Example usage:
-- SELECT * FROM get_referral_tree('user-uuid-here') ORDER BY depth, created_at;
