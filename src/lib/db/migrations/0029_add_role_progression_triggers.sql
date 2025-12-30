-- Migration: 0029_add_role_progression_triggers.sql
-- Description: Triggers for automatic role stats updates and advancement tracking
-- Date: 2025-12-29

-- =====================================================
-- TRIGGER 1: Record Role Advancement
-- Automatically records advancement events when membership_role changes
-- =====================================================

CREATE OR REPLACE FUNCTION trigger_record_role_advancement()
RETURNS TRIGGER AS $$
DECLARE
  trigger_type advancement_trigger;
BEGIN
  -- Only fire on actual role changes
  IF OLD.membership_role IS DISTINCT FROM NEW.membership_role THEN

    -- Determine trigger type based on context
    -- Default to 'manual' - the application layer should update this via trigger_data
    trigger_type := 'manual';

    -- Insert advancement record
    INSERT INTO role_advancements (
      user_id,
      from_role,
      to_role,
      advanced_by,
      trigger_type,
      trigger_data
    ) VALUES (
      NEW.id,
      OLD.membership_role,
      NEW.membership_role,
      NEW.referred_by_id, -- The person who referred them gets credit
      trigger_type,
      jsonb_build_object(
        'previous_role', OLD.membership_role,
        'new_role', NEW.membership_role,
        'advanced_at', NOW()
      )
    );

    -- Update the role_advanced_at timestamp
    NEW.role_advanced_at := NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger (BEFORE UPDATE so we can modify NEW)
DROP TRIGGER IF EXISTS trg_record_role_advancement ON users;
CREATE TRIGGER trg_record_role_advancement
  BEFORE UPDATE OF membership_role ON users
  FOR EACH ROW
  EXECUTE FUNCTION trigger_record_role_advancement();

COMMENT ON TRIGGER trg_record_role_advancement ON users IS
  'Records role advancement events for audit and "helped advance" calculations';

-- =====================================================
-- TRIGGER 2: Update Referrer Stats on New User
-- When a new user is created with a referral, update the referrer's stats
-- =====================================================

CREATE OR REPLACE FUNCTION trigger_update_referrer_stats_on_insert()
RETURNS TRIGGER AS $$
BEGIN
  -- If new user has a referrer, update the referrer's stats
  IF NEW.referred_by_id IS NOT NULL THEN
    PERFORM recalculate_user_referral_stats(NEW.referred_by_id);

    -- Also update the direct referral_count on the referrer (legacy support)
    UPDATE users
    SET referral_count = referral_count + 1
    WHERE id = NEW.referred_by_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_referrer_stats_on_insert ON users;
CREATE TRIGGER trg_update_referrer_stats_on_insert
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_referrer_stats_on_insert();

COMMENT ON TRIGGER trg_update_referrer_stats_on_insert ON users IS
  'Updates referrer stats when a new referred user is created';

-- =====================================================
-- TRIGGER 3: Update Referrer Stats on Role Change
-- When a user's role changes, update their referrer's "helped advance" stats
-- =====================================================

CREATE OR REPLACE FUNCTION trigger_update_referrer_stats_on_role_change()
RETURNS TRIGGER AS $$
BEGIN
  -- If user has a referrer and role changed, update referrer's stats
  IF NEW.referred_by_id IS NOT NULL
     AND OLD.membership_role IS DISTINCT FROM NEW.membership_role THEN
    PERFORM recalculate_user_referral_stats(NEW.referred_by_id);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_referrer_stats_on_role_change ON users;
CREATE TRIGGER trg_update_referrer_stats_on_role_change
  AFTER UPDATE OF membership_role ON users
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_referrer_stats_on_role_change();

COMMENT ON TRIGGER trg_update_referrer_stats_on_role_change ON users IS
  'Updates referrer stats when a referred user advances in role';

-- =====================================================
-- TRIGGER 4: Auto-Advance Check on Contribution
-- When a payment is completed, check if user can advance to candidate
-- =====================================================

CREATE OR REPLACE FUNCTION trigger_check_advancement_on_payment()
RETURNS TRIGGER AS $$
DECLARE
  user_role membership_role;
  min_amount INTEGER;
  advancement_mode_setting VARCHAR;
BEGIN
  -- Only process completed payments
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN

    -- Get user's current role
    SELECT membership_role INTO user_role
    FROM users WHERE id = NEW.user_id;

    -- Only check for supporter -> candidate advancement
    IF user_role = 'supporter' THEN

      -- Get minimum contribution requirement for candidate
      SELECT min_contribution_amount INTO min_amount
      FROM role_requirements
      WHERE role = 'candidate';

      -- Check if payment meets requirement
      IF NEW.amount >= COALESCE(min_amount, 4900) THEN

        -- Check advancement mode setting
        SELECT value::text INTO advancement_mode_setting
        FROM organization_settings
        WHERE key = 'role_advancement_mode';

        -- Remove quotes from JSON value
        advancement_mode_setting := TRIM(BOTH '"' FROM advancement_mode_setting);

        IF advancement_mode_setting = 'automatic' OR advancement_mode_setting IS NULL THEN
          -- Auto-advance to candidate
          UPDATE users
          SET membership_role = 'candidate'
          WHERE id = NEW.user_id;

          -- Update the trigger data on the advancement record
          UPDATE role_advancements
          SET
            trigger_type = 'contribution',
            trigger_data = jsonb_build_object(
              'payment_id', NEW.id,
              'payment_amount', NEW.amount,
              'trigger', 'auto_on_payment'
            )
          WHERE user_id = NEW.user_id
            AND to_role = 'candidate'
            AND advanced_at >= NOW() - INTERVAL '1 second';

        ELSE
          -- Create advancement request for admin approval
          INSERT INTO advancement_requests (
            user_id,
            requested_role,
            current_role,
            status
          ) VALUES (
            NEW.user_id,
            'candidate',
            'supporter',
            'pending'
          )
          ON CONFLICT (user_id, status) DO NOTHING;
        END IF;
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_advancement_on_payment ON payments;
CREATE TRIGGER trg_check_advancement_on_payment
  AFTER INSERT OR UPDATE OF status ON payments
  FOR EACH ROW
  EXECUTE FUNCTION trigger_check_advancement_on_payment();

COMMENT ON TRIGGER trg_check_advancement_on_payment ON payments IS
  'Checks for role advancement to candidate when a payment is completed';

-- =====================================================
-- TRIGGER 5: Update Total Referral Count Cascade
-- When referral tree changes, update all ancestors' total counts
-- (This is an expensive operation - consider making it async)
-- =====================================================

CREATE OR REPLACE FUNCTION trigger_update_ancestor_total_counts()
RETURNS TRIGGER AS $$
DECLARE
  ancestor_id UUID;
  current_id UUID;
  depth INTEGER;
BEGIN
  -- Walk up the referral tree and update each ancestor's total count
  current_id := COALESCE(NEW.referred_by_id, OLD.referred_by_id);
  depth := 0;

  WHILE current_id IS NOT NULL AND depth < 10 LOOP
    -- Update this ancestor's total count
    UPDATE users
    SET total_referral_count = calculate_total_referrals(current_id)
    WHERE id = current_id;

    -- Also update their cached stats
    PERFORM recalculate_user_referral_stats(current_id);

    -- Move to next ancestor
    SELECT referred_by_id INTO current_id
    FROM users WHERE id = current_id;

    depth := depth + 1;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Note: This trigger is disabled by default due to performance concerns
-- Enable it only if real-time updates are critical
-- Otherwise, use a scheduled job to recalculate stats

-- DROP TRIGGER IF EXISTS trg_update_ancestor_total_counts ON users;
-- CREATE TRIGGER trg_update_ancestor_total_counts
--   AFTER INSERT OR UPDATE OF referred_by_id, status ON users
--   FOR EACH ROW
--   EXECUTE FUNCTION trigger_update_ancestor_total_counts();

-- =====================================================
-- FUNCTION: Batch Recalculate All User Stats
-- For scheduled job or manual recalculation
-- =====================================================

CREATE OR REPLACE FUNCTION recalculate_all_referral_stats()
RETURNS INTEGER AS $$
DECLARE
  user_record RECORD;
  count INTEGER := 0;
BEGIN
  -- Process all active users who might have referrals
  FOR user_record IN
    SELECT DISTINCT u.id
    FROM users u
    WHERE u.status IN ('active', 'pending')
    ORDER BY u.created_at
  LOOP
    PERFORM recalculate_user_referral_stats(user_record.id);
    count := count + 1;
  END LOOP;

  RETURN count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION recalculate_all_referral_stats() IS
  'Recalculates referral stats for all active users. Run periodically via cron.';

-- =====================================================
-- FUNCTION: Check and Process Pending Advancements
-- For scheduled job to auto-advance eligible users
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
  'Processes all users and advances those who are eligible. Run via cron for automatic mode.';
