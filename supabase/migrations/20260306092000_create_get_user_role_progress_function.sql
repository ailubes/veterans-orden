-- Create missing role progression RPC used by dashboard and admin APIs.
-- This version is self-contained and does not depend on check_role_eligibility().

CREATE OR REPLACE FUNCTION public.get_user_role_progress(target_user_id UUID)
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
)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_curr_role membership_role;
  v_curr_level INTEGER;
  v_curr_name VARCHAR;
  v_next_role membership_role;
  v_next_level INTEGER;
  v_next_name VARCHAR;
  v_next_requires_contribution BOOLEAN;
  v_next_min_contribution_amount INTEGER;
  v_next_min_direct_referrals INTEGER;
  v_next_min_direct_referrals_at_role membership_role;
  v_next_min_total_referrals INTEGER;
  v_next_min_helped_advance INTEGER;
  v_next_helped_advance_from_role membership_role;
  v_next_helped_advance_to_role membership_role;
  v_next_privileges JSONB;
BEGIN
  SELECT
    u.membership_role
  INTO v_curr_role
  FROM users u
  WHERE u.id = target_user_id;

  IF v_curr_role IS NULL THEN
    RETURN;
  END IF;

  SELECT
    rr.role_level,
    rr.display_name_uk
  INTO v_curr_level, v_curr_name
  FROM role_requirements rr
  WHERE rr.role = v_curr_role
  LIMIT 1;

  SELECT
    rr.role,
    rr.role_level,
    rr.display_name_uk,
    rr.requires_contribution,
    rr.min_contribution_amount,
    rr.min_direct_referrals,
    rr.min_direct_referrals_at_role,
    rr.min_total_referrals,
    rr.min_helped_advance,
    rr.helped_advance_from_role,
    rr.helped_advance_to_role,
    rr.privileges
  INTO
    v_next_role,
    v_next_level,
    v_next_name,
    v_next_requires_contribution,
    v_next_min_contribution_amount,
    v_next_min_direct_referrals,
    v_next_min_direct_referrals_at_role,
    v_next_min_total_referrals,
    v_next_min_helped_advance,
    v_next_helped_advance_from_role,
    v_next_helped_advance_to_role,
    v_next_privileges
  FROM role_requirements rr
  WHERE rr.role_level = COALESCE(v_curr_level, 0) + 1
  LIMIT 1;

  RETURN QUERY
  SELECT
    target_user_id,
    v_curr_role,
    COALESCE(v_curr_level, 0),
    COALESCE(v_curr_name, ''),
    v_next_role,
    v_next_level,
    v_next_name,
    FALSE AS is_eligible,
    CASE WHEN v_next_role IS NULL THEN 100 ELSE 0 END AS progress_percent,
    jsonb_build_object(
      'missing', '[]'::jsonb,
      'next_role_requirements',
      CASE
        WHEN v_next_role IS NULL THEN NULL
        ELSE jsonb_build_object(
          'requires_contribution', COALESCE(v_next_requires_contribution, FALSE),
          'min_contribution_amount', COALESCE(v_next_min_contribution_amount, 0),
          'min_direct_referrals', COALESCE(v_next_min_direct_referrals, 0),
          'min_direct_referrals_at_role', v_next_min_direct_referrals_at_role,
          'min_total_referrals', COALESCE(v_next_min_total_referrals, 0),
          'min_helped_advance', COALESCE(v_next_min_helped_advance, 0),
          'helped_advance_from_role', v_next_helped_advance_from_role,
          'helped_advance_to_role', v_next_helped_advance_to_role,
          'privileges', COALESCE(v_next_privileges, '[]'::jsonb)
        )
      END
    ) AS requirements,
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
    ) AS stats
  FROM user_referral_stats us
  WHERE us.user_id = target_user_id
  UNION ALL
  SELECT
    target_user_id,
    v_curr_role,
    COALESCE(v_curr_level, 0),
    COALESCE(v_curr_name, ''),
    v_next_role,
    v_next_level,
    v_next_name,
    FALSE AS is_eligible,
    CASE WHEN v_next_role IS NULL THEN 100 ELSE 0 END AS progress_percent,
    jsonb_build_object(
      'missing', '[]'::jsonb,
      'next_role_requirements',
      CASE
        WHEN v_next_role IS NULL THEN NULL
        ELSE jsonb_build_object(
          'requires_contribution', COALESCE(v_next_requires_contribution, FALSE),
          'min_contribution_amount', COALESCE(v_next_min_contribution_amount, 0),
          'min_direct_referrals', COALESCE(v_next_min_direct_referrals, 0),
          'min_direct_referrals_at_role', v_next_min_direct_referrals_at_role,
          'min_total_referrals', COALESCE(v_next_min_total_referrals, 0),
          'min_helped_advance', COALESCE(v_next_min_helped_advance, 0),
          'helped_advance_from_role', v_next_helped_advance_from_role,
          'helped_advance_to_role', v_next_helped_advance_to_role,
          'privileges', COALESCE(v_next_privileges, '[]'::jsonb)
        )
      END
    ) AS requirements,
    jsonb_build_object(
      'direct_referrals', jsonb_build_object(
        'supporters', 0,
        'candidates', 0,
        'members', 0,
        'honorary_members', 0,
        'network_leaders', 0,
        'regional_leaders', 0,
        'national_leaders', 0,
        'network_guides', 0
      ),
      'total_tree_count', 0,
      'helped_advance', jsonb_build_object(
        'to_candidate', 0,
        'to_member', 0,
        'to_honorary', 0,
        'to_leader', 0,
        'to_regional', 0,
        'to_national', 0,
        'to_guide', 0
      )
    ) AS stats
  WHERE NOT EXISTS (
    SELECT 1 FROM user_referral_stats us2 WHERE us2.user_id = target_user_id
  )
  LIMIT 1;
END;
$$;

COMMENT ON FUNCTION public.get_user_role_progress(UUID)
  IS 'Returns role progress summary for dashboard/admin. Self-contained fallback-safe implementation.';
