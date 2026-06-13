-- Migration: Add process_pending_advancements() function for batch safety-net pass
-- Description: Migration 20260613000002_* assumed process_pending_advancements()
--              was already present in the DB. On environments where the original
--              0029_add_role_progression_triggers.sql was never applied, the
--              function does not exist, and the backfill in 0002 fails. This
--              migration adds the function and runs the backfill.
-- Date: 2026-06-13

-- =====================================================
-- FUNCTION: Process Pending Advancements (batch)
-- For the safety-net cron job to auto-advance eligible users
-- =====================================================

CREATE OR REPLACE FUNCTION process_pending_advancements()
RETURNS TABLE (
  user_id UUID,
  from_role membership_role,
  to_role membership_role,
  advanced BOOLEAN
) AS $$
DECLARE
  user_record RECORD;
  eligibility RECORD;
  advancement_mode_setting VARCHAR;
BEGIN
  -- Get advancement mode setting
  SELECT value::text INTO advancement_mode_setting
  FROM organization_settings
  WHERE key = 'role_advancement_mode';

  advancement_mode_setting := TRIM(BOTH '"' FROM advancement_mode_setting);

  -- Only process if automatic mode
  IF advancement_mode_setting != 'automatic' THEN
    RETURN;
  END IF;

  -- Check each active user for eligibility
  FOR user_record IN
    SELECT u.id, u.membership_role
    FROM users u
    WHERE u.status = 'active'
      AND u.membership_role != 'network_guide' -- Already at max
    ORDER BY u.created_at
  LOOP
    -- Check eligibility
    SELECT * INTO eligibility
    FROM check_role_eligibility(user_record.id)
    LIMIT 1;

    IF eligibility IS NOT NULL AND eligibility.is_eligible THEN
      -- Advance the user
      UPDATE users
      SET membership_role = eligibility.next_role
      WHERE id = user_record.id;

      -- Update trigger data
      UPDATE role_advancements
      SET
        trigger_type = CASE
          WHEN eligibility.next_role = 'candidate' THEN 'contribution'
          WHEN eligibility.next_role IN ('member', 'network_leader') THEN 'referral_count'
          ELSE 'helped_advance'
        END,
        trigger_data = trigger_data || jsonb_build_object('trigger', 'auto_batch_process')
      WHERE user_id = user_record.id
        AND to_role = eligibility.next_role
        AND advanced_at >= NOW() - INTERVAL '1 second';

      RETURN QUERY SELECT
        user_record.id,
        eligibility.curr_role,
        eligibility.next_role,
        TRUE;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION process_pending_advancements() IS
  'Processes all users and advances those who are eligible. Run via cron for automatic mode. Added in 20260613000003 to backfill for environments where 0029 was never applied.';

-- =====================================================
-- Backfill: re-evaluate every active user's advancement
-- =====================================================
-- The new trigger trg_evaluate_referrer_advancement_* handles advancement
-- in real time, but process_pending_advancements() also handles edge
-- cases (e.g. users whose stats are stale due to data backfill, or users
-- who already qualify for a level beyond 'candidate' under the new model).
DO $$
DECLARE
  v_advanced_count INT := 0;
BEGIN
  PERFORM 1 FROM process_pending_advancements();
  GET DIAGNOSTICS v_advanced_count = ROW_COUNT;
  RAISE NOTICE 'Backfill (20260613000003): process_pending_advancements() returned % rows', v_advanced_count;
END $$;
