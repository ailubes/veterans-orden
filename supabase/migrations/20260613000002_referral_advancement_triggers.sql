-- Migration: Replace payment-based auto-advance with referral-based auto-advance
-- Description: Removes the trg_check_advancement_on_payment trigger (which auto-promoted
--              a 'supporter' to 'candidate' on completed payment) and adds a new trigger
--              that re-evaluates the referrer's advancement eligibility the moment a
--              referred user is created or advances in role.
-- Date: 2026-06-13

-- =====================================================
-- 1. Drop the obsolete payment-based auto-advance trigger
-- =====================================================
-- The old trigger (in 0029) promoted a user to 'candidate' on completed payment.
-- With the new model, payments are no longer tied to role progression, so the
-- trigger is removed. The SQL function trigger_check_advancement_on_payment() is
-- kept in place in case it is needed by future logic, but it is no longer wired.
DROP TRIGGER IF EXISTS trg_check_advancement_on_payment ON payments;

-- =====================================================
-- 2. New trigger: re-evaluate referrer's advancement in real time
-- =====================================================
-- Whenever a referred user is created (INSERT) or advances in role
-- (UPDATE OF membership_role), the referrer's stats are recomputed and their
-- advancement eligibility is re-evaluated. This piggybacks on the existing
-- trg_update_referrer_stats_* triggers (in 0029) which already recompute stats;
-- we simply add a follow-up call to advance_user_role.
--
-- Why a follow-up trigger and not just extending the existing function?
--   - Keeps concerns separated: stats are managed by 0029 triggers, advancement
--     is managed here.
--   - advance_user_role() is idempotent and chains (supporter -> candidate -> member -> ...);
--     a single call walks the whole chain until ineligible.
--
-- advance_user_role() is SECURITY DEFINER, so the trigger function must be too.

CREATE OR REPLACE FUNCTION trg_evaluate_referrer_advancement()
RETURNS TRIGGER AS $$
DECLARE
  v_referrer_id UUID;
BEGIN
  -- Determine the referrer from NEW (INSERT/UPDATE) or OLD (DELETE).
  v_referrer_id := COALESCE(NEW.referred_by_id, OLD.referred_by_id);

  IF v_referrer_id IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  -- Walk the referrer's role chain. advance_user_role() stops when ineligible.
  PERFORM advance_user_role(v_referrer_id, NULL);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fire after a new referred user is created.
DROP TRIGGER IF EXISTS trg_evaluate_referrer_on_insert ON users;
CREATE TRIGGER trg_evaluate_referrer_on_insert
  AFTER INSERT ON users
  FOR EACH ROW
  WHEN (NEW.referred_by_id IS NOT NULL)
  EXECUTE FUNCTION trg_evaluate_referrer_advancement();

-- Fire after a referred user's role changes (so the referrer's
-- "helped advance" counters are re-evaluated).
DROP TRIGGER IF EXISTS trg_evaluate_referrer_on_role_change ON users;
CREATE TRIGGER trg_evaluate_referrer_on_role_change
  AFTER UPDATE OF membership_role ON users
  FOR EACH ROW
  WHEN (NEW.referred_by_id IS NOT NULL)
  EXECUTE FUNCTION trg_evaluate_referrer_advancement();

COMMENT ON TRIGGER trg_evaluate_referrer_on_insert ON users IS
  'Re-evaluates the referrer role advancement when a new referred user signs up (real-time path)';
COMMENT ON TRIGGER trg_evaluate_referrer_on_role_change ON users IS
  'Re-evaluates the referrer role advancement when a referred user changes role (real-time path)';

-- =====================================================
-- 3. Backfill: re-evaluate every active user's advancement
-- =====================================================
-- The new trigger only fires on future events. For existing users, we run a
-- one-time sweep so any user who already qualifies (e.g. someone who already
-- has 1+ direct referral but is still 'supporter') is promoted immediately.
--
-- This block is split into a separate migration (20260613000003) because it
-- depends on process_pending_advancements() — a function that is not present
-- on every Supabase environment. See 20260613000003_add_process_pending_advancements.sql
-- for the function definition + the actual backfill pass.
