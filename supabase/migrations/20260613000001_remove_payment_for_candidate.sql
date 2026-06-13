-- Migration: Remove payment requirement for candidate role + grand-parent existing paid users
-- Description: Decouples membership role progression from payments. From now on, role advancement
--              is driven by referral activity (network growth), not by contribution.
--              The 'candidate' level is reached after 1+ direct referral joins.
-- Date: 2026-06-13

-- =====================================================
-- 1. Update role_requirements for 'candidate'
-- =====================================================
-- A user now advances from 'supporter' to 'candidate' by recruiting their first
-- direct referral. No payment is required.
UPDATE role_requirements
SET
  requires_contribution = false,
  min_contribution_amount = 0,
  min_direct_referrals = 1,
  min_direct_referrals_at_role = 'supporter'
WHERE role = 'candidate';

-- =====================================================
-- 2. Grand-parent existing paid users
-- =====================================================
-- Any user who previously paid for a membership tier (basic_49, supporter_100,
-- supporter_200, patron_500) is promoted to 'candidate'. This preserves the
-- membership privileges they earned under the old model.
UPDATE users
SET
  membership_role = 'candidate',
  role_advanced_at = NOW()
WHERE membership_role = 'supporter'
  AND membership_tier IN ('basic_49', 'supporter_100', 'supporter_200', 'patron_500');

-- Record the grand-parenting as role_advancements rows so the audit history is complete.
-- (Skipped intentionally: this is a one-time data migration, not user-driven advancement.
--  The existing trg_record_role_advancement would have inserted a row, but it's a
--  BEFORE UPDATE trigger on users; we run a plain UPDATE here, so we insert the row manually.)
INSERT INTO role_advancements (user_id, from_role, to_role, advanced_by, trigger_type, trigger_data, advanced_at)
SELECT
  users.id,
  'supporter'::membership_role,
  'candidate'::membership_role,
  NULL,
  'manual'::advancement_trigger,
  jsonb_build_object('trigger', 'grand_parent_2026_06_13', 'previous_tier', users.membership_tier),
  NOW()
FROM users
WHERE users.membership_role = 'candidate'
  AND users.membership_tier IN ('basic_49', 'supporter_100', 'supporter_200', 'patron_500')
  AND NOT EXISTS (
    SELECT 1 FROM role_advancements ra
    WHERE ra.user_id = users.id
      AND ra.from_role = 'supporter'
      AND ra.to_role = 'candidate'
      AND ra.trigger_data->>'trigger' = 'grand_parent_2026_06_13'
  );

COMMENT ON COLUMN role_requirements.requires_contribution IS
  'Whether reaching this role requires a completed payment. As of 2026-06-13, only referrals drive advancement.';
