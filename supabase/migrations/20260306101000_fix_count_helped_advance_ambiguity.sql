-- Fix ambiguous parameter names in count_helped_advance().
-- The previous definition compared columns to themselves due PL/pgSQL name collision.

DROP FUNCTION IF EXISTS count_helped_advance(UUID, membership_role, membership_role);

CREATE FUNCTION count_helped_advance(
  p_referrer_id UUID,
  p_from_role membership_role,
  p_to_role membership_role
)
RETURNS INTEGER AS $$
DECLARE
  result INTEGER;
BEGIN
  SELECT COUNT(DISTINCT ra.user_id) INTO result
  FROM role_advancements ra
  INNER JOIN users u ON ra.user_id = u.id
  WHERE u.referred_by_id = p_referrer_id
    AND ra.from_role = p_from_role
    AND ra.to_role = p_to_role;

  RETURN COALESCE(result, 0);
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION count_helped_advance(UUID, membership_role, membership_role) IS
  'Counts direct referrals who advanced from one specific role to another';
