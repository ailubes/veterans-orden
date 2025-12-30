-- Migration: 0028_add_role_progression_functions.sql
-- Description: PostgreSQL functions for role progression calculations
-- Date: 2025-12-29

-- =====================================================
-- DROP EXISTING FUNCTIONS (to handle parameter name changes)
-- =====================================================
DROP FUNCTION IF EXISTS calculate_total_referrals(UUID);
DROP FUNCTION IF EXISTS count_direct_referrals_at_role(UUID, membership_role);
DROP FUNCTION IF EXISTS count_helped_advance(UUID, membership_role, membership_role);
DROP FUNCTION IF EXISTS recalculate_user_referral_stats(UUID);
DROP FUNCTION IF EXISTS check_role_eligibility(UUID);
DROP FUNCTION IF EXISTS advance_user_role(UUID, UUID);
DROP FUNCTION IF EXISTS get_user_role_progress(UUID);

-- =====================================================
-- FUNCTION 1: Calculate Total Referral Tree Count
-- Returns the total number of users in someone's referral tree (all depths)
-- =====================================================

CREATE OR REPLACE FUNCTION calculate_total_referrals(target_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  total INTEGER;
BEGIN
  WITH RECURSIVE referral_tree AS (
    -- Base case: direct referrals
    SELECT id, referred_by_id, 1 AS depth
    FROM users
    WHERE referred_by_id = target_user_id
      AND status IN ('active', 'pending')

    UNION ALL

    -- Recursive case: referrals of referrals
    SELECT u.id, u.referred_by_id, rt.depth + 1
    FROM users u
    INNER JOIN referral_tree rt ON u.referred_by_id = rt.id
    WHERE u.status IN ('active', 'pending')
      AND rt.depth < 10  -- Max depth to prevent infinite recursion
  )
  SELECT COUNT(*) INTO total FROM referral_tree;

  RETURN COALESCE(total, 0);
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION calculate_total_referrals(UUID) IS
  'Calculates the total number of users in a referral tree (max 10 levels deep)';

-- =====================================================
-- FUNCTION 2: Count Direct Referrals at Minimum Role
-- Returns count of direct referrals who are at or above a specific role
-- =====================================================

CREATE OR REPLACE FUNCTION count_direct_referrals_at_role(
  target_user_id UUID,
  min_role membership_role
)
RETURNS INTEGER AS $$
DECLARE
  result INTEGER;
  min_role_level INTEGER;
BEGIN
  -- Get the level of the minimum required role
  SELECT role_level INTO min_role_level
  FROM role_requirements
  WHERE role = min_role;

  -- Count direct referrals at or above this role level
  SELECT COUNT(*) INTO result
  FROM users u
  JOIN role_requirements rr ON u.membership_role = rr.role
  WHERE u.referred_by_id = target_user_id
    AND u.status IN ('active', 'pending')
    AND rr.role_level >= min_role_level;

  RETURN COALESCE(result, 0);
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION count_direct_referrals_at_role(UUID, membership_role) IS
  'Counts direct referrals who have reached at least the specified role level';

-- =====================================================
-- FUNCTION 3: Count "Helped Advance" Events
-- Returns count of direct referrals who advanced from one role to another
-- =====================================================

CREATE OR REPLACE FUNCTION count_helped_advance(
  referrer_id UUID,
  from_role membership_role,
  to_role membership_role
)
RETURNS INTEGER AS $$
DECLARE
  result INTEGER;
BEGIN
  -- Count distinct users who:
  -- 1. Are direct referrals of the referrer
  -- 2. Had an advancement event from from_role to to_role
  SELECT COUNT(DISTINCT ra.user_id) INTO result
  FROM role_advancements ra
  INNER JOIN users u ON ra.user_id = u.id
  WHERE u.referred_by_id = referrer_id
    AND ra.from_role = from_role
    AND ra.to_role = to_role;

  RETURN COALESCE(result, 0);
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION count_helped_advance(UUID, membership_role, membership_role) IS
  'Counts direct referrals who advanced from one specific role to another';

-- =====================================================
-- FUNCTION 4: Recalculate User Referral Stats
-- Updates the cached stats for a single user
-- =====================================================

CREATE OR REPLACE FUNCTION recalculate_user_referral_stats(target_user_id UUID)
RETURNS VOID AS $$
DECLARE
  stats RECORD;
BEGIN
  -- Calculate all stats in one query
  SELECT
    -- Direct referrals by role
    COUNT(*) FILTER (WHERE u.membership_role = 'supporter') AS direct_supporters,
    COUNT(*) FILTER (WHERE u.membership_role = 'candidate') AS direct_candidates,
    COUNT(*) FILTER (WHERE u.membership_role = 'member') AS direct_members,
    COUNT(*) FILTER (WHERE u.membership_role = 'honorary_member') AS direct_honorary_members,
    COUNT(*) FILTER (WHERE u.membership_role = 'network_leader') AS direct_network_leaders,
    COUNT(*) FILTER (WHERE u.membership_role = 'regional_leader') AS direct_regional_leaders,
    COUNT(*) FILTER (WHERE u.membership_role = 'national_leader') AS direct_national_leaders,
    COUNT(*) FILTER (WHERE u.membership_role = 'network_guide') AS direct_network_guides
  INTO stats
  FROM users u
  WHERE u.referred_by_id = target_user_id
    AND u.status IN ('active', 'pending');

  -- Insert or update stats
  INSERT INTO user_referral_stats (
    user_id,
    direct_supporters, direct_candidates, direct_members, direct_honorary_members,
    direct_network_leaders, direct_regional_leaders, direct_national_leaders, direct_network_guides,
    total_tree_count,
    helped_to_candidate, helped_to_member, helped_to_honorary,
    helped_to_leader, helped_to_regional, helped_to_national, helped_to_guide,
    last_calculated_at
  ) VALUES (
    target_user_id,
    COALESCE(stats.direct_supporters, 0),
    COALESCE(stats.direct_candidates, 0),
    COALESCE(stats.direct_members, 0),
    COALESCE(stats.direct_honorary_members, 0),
    COALESCE(stats.direct_network_leaders, 0),
    COALESCE(stats.direct_regional_leaders, 0),
    COALESCE(stats.direct_national_leaders, 0),
    COALESCE(stats.direct_network_guides, 0),
    calculate_total_referrals(target_user_id),
    count_helped_advance(target_user_id, 'supporter', 'candidate'),
    count_helped_advance(target_user_id, 'candidate', 'member'),
    count_helped_advance(target_user_id, 'member', 'honorary_member'),
    count_helped_advance(target_user_id, 'honorary_member', 'network_leader'),
    count_helped_advance(target_user_id, 'network_leader', 'regional_leader'),
    count_helped_advance(target_user_id, 'regional_leader', 'national_leader'),
    count_helped_advance(target_user_id, 'national_leader', 'network_guide'),
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    direct_supporters = EXCLUDED.direct_supporters,
    direct_candidates = EXCLUDED.direct_candidates,
    direct_members = EXCLUDED.direct_members,
    direct_honorary_members = EXCLUDED.direct_honorary_members,
    direct_network_leaders = EXCLUDED.direct_network_leaders,
    direct_regional_leaders = EXCLUDED.direct_regional_leaders,
    direct_national_leaders = EXCLUDED.direct_national_leaders,
    direct_network_guides = EXCLUDED.direct_network_guides,
    total_tree_count = EXCLUDED.total_tree_count,
    helped_to_candidate = EXCLUDED.helped_to_candidate,
    helped_to_member = EXCLUDED.helped_to_member,
    helped_to_honorary = EXCLUDED.helped_to_honorary,
    helped_to_leader = EXCLUDED.helped_to_leader,
    helped_to_regional = EXCLUDED.helped_to_regional,
    helped_to_national = EXCLUDED.helped_to_national,
    helped_to_guide = EXCLUDED.helped_to_guide,
    last_calculated_at = NOW();

  -- Also update the denormalized total_referral_count on users table
  UPDATE users
  SET total_referral_count = calculate_total_referrals(target_user_id)
  WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION recalculate_user_referral_stats(UUID) IS
  'Recalculates and caches all referral statistics for a user';

-- =====================================================
-- FUNCTION 5: Check Role Eligibility
-- Returns the next role a user is eligible for (if any)
-- =====================================================

CREATE OR REPLACE FUNCTION check_role_eligibility(target_user_id UUID)
RETURNS TABLE (
  curr_role membership_role,
  next_role membership_role,
  is_eligible BOOLEAN,
  progress_percent INTEGER,
  missing_requirements JSONB
) AS $$
DECLARE
  user_current_role membership_role;
  user_current_level INTEGER;
  req RECORD;
  has_contribution BOOLEAN;
  direct_at_role INTEGER;
  total_refs INTEGER;
  helped_count INTEGER;
  missing JSONB;
  total_reqs INTEGER;
  met_reqs INTEGER;
BEGIN
  -- Get user's current role
  SELECT u.membership_role INTO user_current_role
  FROM users u
  WHERE u.id = target_user_id;

  IF user_current_role IS NULL THEN
    RETURN;
  END IF;

  -- Get current role level
  SELECT role_level INTO user_current_level
  FROM role_requirements
  WHERE role = user_current_role;

  -- Check next role (one level higher)
  FOR req IN
    SELECT *
    FROM role_requirements
    WHERE role_level = user_current_level + 1
    LIMIT 1
  LOOP
    missing := '[]'::JSONB;
    total_reqs := 0;
    met_reqs := 0;

    -- Check contribution requirement
    IF req.requires_contribution THEN
      total_reqs := total_reqs + 1;
      SELECT EXISTS(
        SELECT 1 FROM payments
        WHERE user_id = target_user_id
          AND status = 'completed'
          AND amount >= COALESCE(req.min_contribution_amount, 0)
      ) INTO has_contribution;

      IF has_contribution THEN
        met_reqs := met_reqs + 1;
      ELSE
        missing := missing || jsonb_build_array(jsonb_build_object(
          'type', 'contribution',
          'required', req.min_contribution_amount,
          'current', 0
        ));
      END IF;
    END IF;

    -- Check direct referrals at role
    IF req.min_direct_referrals > 0 THEN
      total_reqs := total_reqs + 1;
      direct_at_role := count_direct_referrals_at_role(target_user_id, req.min_direct_referrals_at_role);

      IF direct_at_role >= req.min_direct_referrals THEN
        met_reqs := met_reqs + 1;
      ELSE
        missing := missing || jsonb_build_array(jsonb_build_object(
          'type', 'direct_referrals',
          'current', direct_at_role,
          'required', req.min_direct_referrals,
          'at_role', req.min_direct_referrals_at_role
        ));
      END IF;
    END IF;

    -- Check total referrals
    IF req.min_total_referrals > 0 THEN
      total_reqs := total_reqs + 1;
      SELECT COALESCE(total_tree_count, 0) INTO total_refs
      FROM user_referral_stats
      WHERE user_id = target_user_id;

      IF total_refs IS NULL THEN
        total_refs := calculate_total_referrals(target_user_id);
      END IF;

      IF total_refs >= req.min_total_referrals THEN
        met_reqs := met_reqs + 1;
      ELSE
        missing := missing || jsonb_build_array(jsonb_build_object(
          'type', 'total_referrals',
          'current', total_refs,
          'required', req.min_total_referrals
        ));
      END IF;
    END IF;

    -- Check helped advance
    IF req.min_helped_advance > 0 THEN
      total_reqs := total_reqs + 1;
      helped_count := count_helped_advance(target_user_id, req.helped_advance_from_role, req.helped_advance_to_role);

      IF helped_count >= req.min_helped_advance THEN
        met_reqs := met_reqs + 1;
      ELSE
        missing := missing || jsonb_build_array(jsonb_build_object(
          'type', 'helped_advance',
          'current', helped_count,
          'required', req.min_helped_advance,
          'from_role', req.helped_advance_from_role,
          'to_role', req.helped_advance_to_role
        ));
      END IF;
    END IF;

    -- Return eligibility result
    RETURN QUERY SELECT
      user_current_role,
      req.role,
      jsonb_array_length(missing) = 0,
      CASE WHEN total_reqs > 0 THEN (met_reqs * 100 / total_reqs) ELSE 100 END,
      missing;

  END LOOP;

  -- If no next role found (already at max), return current with 100% progress
  IF NOT FOUND THEN
    RETURN QUERY SELECT
      user_current_role,
      NULL::membership_role,
      FALSE,
      100,
      '[]'::JSONB;
  END IF;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION check_role_eligibility(UUID) IS
  'Checks if a user is eligible for the next role level and returns progress details';

-- =====================================================
-- FUNCTION 6: Advance User Role
-- Advances a user to the next role if eligible
-- =====================================================

CREATE OR REPLACE FUNCTION advance_user_role(
  target_user_id UUID,
  admin_user_id UUID DEFAULT NULL
)
RETURNS membership_role AS $$
DECLARE
  eligibility RECORD;
  old_role membership_role;
  new_role membership_role;
BEGIN
  -- Check eligibility
  SELECT * INTO eligibility
  FROM check_role_eligibility(target_user_id)
  LIMIT 1;

  IF eligibility IS NULL OR NOT eligibility.is_eligible THEN
    RETURN NULL;
  END IF;

  old_role := eligibility.curr_role;
  new_role := eligibility.next_role;

  -- Update user's role
  UPDATE users
  SET
    membership_role = new_role,
    role_advanced_at = NOW()
  WHERE id = target_user_id;

  -- Record the advancement (trigger will handle role_advancements insert)
  -- But we need to set the proper trigger_type and admin info

  -- Return the new role
  RETURN new_role;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION advance_user_role(UUID, UUID) IS
  'Advances a user to the next role if they meet all requirements';

-- =====================================================
-- FUNCTION 7: Get User Role Progress Summary
-- Returns comprehensive progress info for display
-- =====================================================

CREATE OR REPLACE FUNCTION get_user_role_progress(target_user_id UUID)
RETURNS TABLE (
  user_id UUID,
  curr_role membership_role,
  current_role_level INTEGER,
  current_role_name_uk VARCHAR,
  next_role membership_role,
  next_role_level INTEGER,
  next_role_name_uk VARCHAR,
  is_eligible BOOLEAN,
  progress_percent INTEGER,
  requirements JSONB,
  stats JSONB
) AS $$
BEGIN
  RETURN QUERY
  WITH eligibility AS (
    SELECT * FROM check_role_eligibility(target_user_id) LIMIT 1
  ),
  current_req AS (
    SELECT * FROM role_requirements rr
    WHERE rr.role = (SELECT e.curr_role FROM eligibility e)
  ),
  next_req AS (
    SELECT * FROM role_requirements rr
    WHERE rr.role = (SELECT e.next_role FROM eligibility e)
  ),
  user_stats AS (
    SELECT * FROM user_referral_stats WHERE user_referral_stats.user_id = target_user_id
  )
  SELECT
    target_user_id,
    e.curr_role,
    cr.role_level,
    cr.display_name_uk,
    e.next_role,
    nr.role_level,
    nr.display_name_uk,
    e.is_eligible,
    e.progress_percent,
    jsonb_build_object(
      'missing', e.missing_requirements,
      'next_role_requirements', CASE WHEN nr.id IS NOT NULL THEN
        jsonb_build_object(
          'requires_contribution', nr.requires_contribution,
          'min_contribution_amount', nr.min_contribution_amount,
          'min_direct_referrals', nr.min_direct_referrals,
          'min_direct_referrals_at_role', nr.min_direct_referrals_at_role,
          'min_total_referrals', nr.min_total_referrals,
          'min_helped_advance', nr.min_helped_advance,
          'helped_advance_from_role', nr.helped_advance_from_role,
          'helped_advance_to_role', nr.helped_advance_to_role,
          'privileges', nr.privileges
        )
      ELSE NULL END
    ),
    jsonb_build_object(
      'direct_referrals', jsonb_build_object(
        'supporters', COALESCE(us.direct_supporters, 0),
        'candidates', COALESCE(us.direct_candidates, 0),
        'members', COALESCE(us.direct_members, 0),
        'honorary_members', COALESCE(us.direct_honorary_members, 0),
        'network_leaders', COALESCE(us.direct_network_leaders, 0),
        'regional_leaders', COALESCE(us.direct_regional_leaders, 0),
        'national_leaders', COALESCE(us.direct_national_leaders, 0),
        'network_guides', COALESCE(us.direct_network_guides, 0)
      ),
      'total_tree_count', COALESCE(us.total_tree_count, 0),
      'helped_advance', jsonb_build_object(
        'to_candidate', COALESCE(us.helped_to_candidate, 0),
        'to_member', COALESCE(us.helped_to_member, 0),
        'to_honorary', COALESCE(us.helped_to_honorary, 0),
        'to_leader', COALESCE(us.helped_to_leader, 0),
        'to_regional', COALESCE(us.helped_to_regional, 0),
        'to_national', COALESCE(us.helped_to_national, 0),
        'to_guide', COALESCE(us.helped_to_guide, 0)
      )
    )
  FROM eligibility e
  LEFT JOIN current_req cr ON TRUE
  LEFT JOIN next_req nr ON TRUE
  LEFT JOIN user_stats us ON TRUE;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_user_role_progress(UUID) IS
  'Returns comprehensive role progress information for a user';
