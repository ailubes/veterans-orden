-- Migration: 0030_migrate_users_to_new_roles.sql
-- Description: Migrate existing users to new membership role system
-- Date: 2025-12-29

-- =====================================================
-- PART 1: Set All Users to Supporter (Fresh Start)
-- Per design decision: all existing users must re-qualify
-- =====================================================

-- First, ensure all users have a membership_role set
UPDATE users
SET membership_role = 'supporter'
WHERE membership_role IS NULL;

-- =====================================================
-- PART 2: Map Staff Roles from Old System
-- =====================================================

-- Map old admin roles to new staff_role column
UPDATE users
SET staff_role = CASE role
  WHEN 'news_editor' THEN 'news_editor'::staff_role
  WHEN 'admin' THEN 'admin'::staff_role
  WHEN 'super_admin' THEN 'super_admin'::staff_role
  ELSE 'none'::staff_role
END
WHERE staff_role IS NULL OR staff_role = 'none';

-- =====================================================
-- PART 3: Auto-Advance Users Who Made Contributions
-- Check payments table and advance supporters to candidates
-- =====================================================

-- Advance users who have completed payments of 49+ UAH to candidate
UPDATE users u
SET membership_role = 'candidate'
WHERE u.membership_role = 'supporter'
  AND u.status = 'active'
  AND EXISTS (
    SELECT 1 FROM payments p
    WHERE p.user_id = u.id
      AND p.status = 'completed'
      AND p.amount >= 4900 -- 49 UAH in kopecks
  );

-- Record these advancements
INSERT INTO role_advancements (user_id, from_role, to_role, trigger_type, trigger_data)
SELECT
  u.id,
  'supporter',
  'candidate',
  'contribution',
  jsonb_build_object(
    'migration', '0030_migrate_users_to_new_roles',
    'reason', 'historical_contribution',
    'migrated_at', NOW()
  )
FROM users u
WHERE u.membership_role = 'candidate'
  AND NOT EXISTS (
    SELECT 1 FROM role_advancements ra
    WHERE ra.user_id = u.id AND ra.to_role = 'candidate'
  );

-- =====================================================
-- PART 4: Initialize Referral Stats for All Users
-- =====================================================

-- Create stats entries for all users
INSERT INTO user_referral_stats (user_id, last_calculated_at)
SELECT id, NOW()
FROM users
WHERE status IN ('active', 'pending')
ON CONFLICT (user_id) DO NOTHING;

-- =====================================================
-- PART 5: Calculate Total Referral Counts
-- =====================================================

-- Update total_referral_count for all users with referrals
UPDATE users
SET total_referral_count = calculate_total_referrals(id)
WHERE referral_count > 0 OR EXISTS (
  SELECT 1 FROM users u2 WHERE u2.referred_by_id = users.id
);

-- =====================================================
-- PART 6: Recalculate All Referral Stats
-- This populates the user_referral_stats table
-- =====================================================

-- Run batch recalculation (this might take a while for large datasets)
SELECT recalculate_all_referral_stats();

-- =====================================================
-- PART 7: Auto-Advance Eligible Users
-- Based on recalculated stats, advance users who qualify
-- =====================================================

-- Advance to Member: users with 2+ direct candidates
UPDATE users u
SET membership_role = 'member'
WHERE u.membership_role = 'candidate'
  AND u.status = 'active'
  AND (
    SELECT COALESCE(direct_candidates, 0) + COALESCE(direct_members, 0) +
           COALESCE(direct_honorary_members, 0) + COALESCE(direct_network_leaders, 0) +
           COALESCE(direct_regional_leaders, 0) + COALESCE(direct_national_leaders, 0) +
           COALESCE(direct_network_guides, 0)
    FROM user_referral_stats
    WHERE user_id = u.id
  ) >= 2;

-- Record Member advancements
INSERT INTO role_advancements (user_id, from_role, to_role, advanced_by, trigger_type, trigger_data)
SELECT
  u.id,
  'candidate',
  'member',
  u.referred_by_id,
  'referral_count',
  jsonb_build_object(
    'migration', '0030_migrate_users_to_new_roles',
    'reason', 'met_referral_requirement',
    'migrated_at', NOW()
  )
FROM users u
WHERE u.membership_role = 'member'
  AND NOT EXISTS (
    SELECT 1 FROM role_advancements ra
    WHERE ra.user_id = u.id AND ra.to_role = 'member'
  );

-- Advance to Honorary Member: users with 2+ recruits who became members
UPDATE users u
SET membership_role = 'honorary_member'
WHERE u.membership_role = 'member'
  AND u.status = 'active'
  AND (
    SELECT COALESCE(helped_to_member, 0)
    FROM user_referral_stats
    WHERE user_id = u.id
  ) >= 2;

-- Record Honorary Member advancements
INSERT INTO role_advancements (user_id, from_role, to_role, advanced_by, trigger_type, trigger_data)
SELECT
  u.id,
  'member',
  'honorary_member',
  u.referred_by_id,
  'helped_advance',
  jsonb_build_object(
    'migration', '0030_migrate_users_to_new_roles',
    'reason', 'helped_referrals_advance',
    'migrated_at', NOW()
  )
FROM users u
WHERE u.membership_role = 'honorary_member'
  AND NOT EXISTS (
    SELECT 1 FROM role_advancements ra
    WHERE ra.user_id = u.id AND ra.to_role = 'honorary_member'
  );

-- Advance to Network Leader: 8 personal + 49 total
UPDATE users u
SET membership_role = 'network_leader'
WHERE u.membership_role IN ('member', 'honorary_member')
  AND u.status = 'active'
  AND (
    SELECT
      (COALESCE(direct_candidates, 0) + COALESCE(direct_members, 0) +
       COALESCE(direct_honorary_members, 0) + COALESCE(direct_network_leaders, 0) +
       COALESCE(direct_regional_leaders, 0) + COALESCE(direct_national_leaders, 0) +
       COALESCE(direct_network_guides, 0)) >= 8
      AND COALESCE(total_tree_count, 0) >= 49
    FROM user_referral_stats
    WHERE user_id = u.id
  );

-- Record Network Leader advancements
INSERT INTO role_advancements (user_id, from_role, to_role, advanced_by, trigger_type, trigger_data)
SELECT
  u.id,
  CASE
    WHEN u.membership_role = 'network_leader' THEN 'honorary_member'
    ELSE 'member'
  END,
  'network_leader',
  u.referred_by_id,
  'referral_count',
  jsonb_build_object(
    'migration', '0030_migrate_users_to_new_roles',
    'reason', 'met_leader_requirements',
    'migrated_at', NOW()
  )
FROM users u
WHERE u.membership_role = 'network_leader'
  AND NOT EXISTS (
    SELECT 1 FROM role_advancements ra
    WHERE ra.user_id = u.id AND ra.to_role = 'network_leader'
  );

-- Higher levels (regional, national, guide) will be checked manually
-- as they require complex "helped advance" calculations that should
-- be verified by administrators during migration

-- =====================================================
-- PART 8: Final Stats Recalculation
-- =====================================================

-- Recalculate all stats one more time after advancements
SELECT recalculate_all_referral_stats();

-- =====================================================
-- PART 9: Migration Summary Report
-- =====================================================

DO $$
DECLARE
  supporter_count INTEGER;
  candidate_count INTEGER;
  member_count INTEGER;
  honorary_count INTEGER;
  leader_count INTEGER;
  total_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO supporter_count FROM users WHERE membership_role = 'supporter' AND status = 'active';
  SELECT COUNT(*) INTO candidate_count FROM users WHERE membership_role = 'candidate' AND status = 'active';
  SELECT COUNT(*) INTO member_count FROM users WHERE membership_role = 'member' AND status = 'active';
  SELECT COUNT(*) INTO honorary_count FROM users WHERE membership_role = 'honorary_member' AND status = 'active';
  SELECT COUNT(*) INTO leader_count FROM users WHERE membership_role = 'network_leader' AND status = 'active';
  SELECT COUNT(*) INTO total_count FROM users WHERE status = 'active';

  RAISE NOTICE '=== Migration Summary ===';
  RAISE NOTICE 'Total active users: %', total_count;
  RAISE NOTICE 'Supporters: %', supporter_count;
  RAISE NOTICE 'Candidates: %', candidate_count;
  RAISE NOTICE 'Members: %', member_count;
  RAISE NOTICE 'Honorary Members: %', honorary_count;
  RAISE NOTICE 'Network Leaders: %', leader_count;
  RAISE NOTICE '========================';
END $$;
