-- Migration 0032: Fix ambiguous column reference in count_helped_advance function
-- Fixes: column reference "from_role" is ambiguous error during user registration

-- Drop and recreate the function with better parameter names
DROP FUNCTION IF EXISTS count_helped_advance(UUID, membership_role, membership_role);

CREATE OR REPLACE FUNCTION count_helped_advance(
  referrer_id UUID,
  p_from_role membership_role,
  p_to_role membership_role
)
RETURNS INTEGER AS $$
DECLARE
  result INTEGER;
BEGIN
  -- Count distinct users who:
  -- 1. Are direct referrals of the referrer
  -- 2. Had an advancement event from p_from_role to p_to_role
  SELECT COUNT(DISTINCT ra.user_id) INTO result
  FROM role_advancements ra
  INNER JOIN users u ON ra.user_id = u.id
  WHERE u.referred_by_id = referrer_id
    AND ra.from_role = p_from_role
    AND ra.to_role = p_to_role;

  RETURN COALESCE(result, 0);
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION count_helped_advance(UUID, membership_role, membership_role) IS
  'Counts direct referrals who advanced from one specific role to another (fixed ambiguous column reference)';
