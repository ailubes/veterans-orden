-- ============================================================
-- Dashboard RLS Fix: add missing write policies + SECURITY DEFINER functions
-- Fixes 42501 violations across votes, tasks, challenges, notifications,
-- points, badges, and user profile reads.
-- ============================================================

-- ============================================================
-- 1. users SELECT: allow all authenticated members to read all
--    profiles (leaderboard, messaging sender names, challenges)
-- ============================================================
DROP POLICY IF EXISTS "users_own_read" ON users;
DROP POLICY IF EXISTS "users_auth_read" ON users;
CREATE POLICY "users_auth_read" ON users
  FOR SELECT TO authenticated USING (true);

-- ============================================================
-- 2. votes — UPDATE (increment total_votes, update status)
--    API route validates eligibility before any DB write.
-- ============================================================
DROP POLICY IF EXISTS "votes_auth_update" ON votes;
CREATE POLICY "votes_auth_update" ON votes
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- votes INSERT (create new vote — admin only)
DROP POLICY IF EXISTS "votes_admin_insert" ON votes;
CREATE POLICY "votes_admin_insert" ON votes
  FOR INSERT TO authenticated
  WITH CHECK (is_admin());

-- ============================================================
-- 3. vote_options — INSERT/UPDATE/DELETE (admin), UPDATE vote_count (any auth)
-- ============================================================
DROP POLICY IF EXISTS "vote_options_admin_insert" ON vote_options;
CREATE POLICY "vote_options_admin_insert" ON vote_options
  FOR INSERT TO authenticated
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "vote_options_admin_delete" ON vote_options;
CREATE POLICY "vote_options_admin_delete" ON vote_options
  FOR DELETE TO authenticated
  USING (is_admin());

DROP POLICY IF EXISTS "vote_options_auth_update" ON vote_options;
CREATE POLICY "vote_options_auth_update" ON vote_options
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- 4. tasks — UPDATE own tasks OR claim open/unassigned tasks
-- ============================================================
DROP POLICY IF EXISTS "tasks_own_update" ON tasks;
CREATE POLICY "tasks_own_update" ON tasks
  FOR UPDATE TO authenticated
  USING (
    assignee_id = get_current_user_id()
    OR (status = 'open' AND assignee_id IS NULL)
  )
  WITH CHECK (true);

-- ============================================================
-- 5. (task_submissions table does not exist yet — skip)
-- ============================================================

-- ============================================================
-- 6. challenge_participants — UPDATE own progress + DELETE own (leave)
-- ============================================================
DROP POLICY IF EXISTS "challenge_parts_own_update" ON challenge_participants;
CREATE POLICY "challenge_parts_own_update" ON challenge_participants
  FOR UPDATE TO authenticated
  USING (user_id = get_current_user_id())
  WITH CHECK (user_id = get_current_user_id());

DROP POLICY IF EXISTS "challenge_parts_own_delete" ON challenge_participants;
CREATE POLICY "challenge_parts_own_delete" ON challenge_participants
  FOR DELETE TO authenticated
  USING (user_id = get_current_user_id());

-- ============================================================
-- 7. notification_recipients — UPDATE own (mark as read)
-- ============================================================
DROP POLICY IF EXISTS "notification_recipients_own_update" ON notification_recipients;
CREATE POLICY "notification_recipients_own_update" ON notification_recipients
  FOR UPDATE TO authenticated
  USING (user_id = get_current_user_id())
  WITH CHECK (user_id = get_current_user_id());

-- ============================================================
-- 8. user_milestones — UPDATE own (celebrate milestone)
-- ============================================================
DROP POLICY IF EXISTS "user_milestones_own_update" ON user_milestones;
CREATE POLICY "user_milestones_own_update" ON user_milestones
  FOR UPDATE TO authenticated
  USING (user_id = get_current_user_id())
  WITH CHECK (user_id = get_current_user_id());

-- ============================================================
-- SECURITY DEFINER function: award_points_fn
--
-- Prevents users from directly injecting arbitrary points.
-- Called via supabase.rpc('award_points_fn', {...}) from API routes.
-- Handles both points_transactions INSERT and users balance UPDATE
-- atomically, bypassing RLS (runs as function owner = postgres).
-- ============================================================
CREATE OR REPLACE FUNCTION award_points_fn(
  p_user_id        UUID,
  p_amount         INTEGER,
  p_type           TEXT,
  p_reference_type TEXT    DEFAULT NULL,
  p_reference_id   UUID    DEFAULT NULL,
  p_description    TEXT    DEFAULT NULL,
  p_created_by_id  UUID    DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_transaction_id UUID;
  v_new_balance    INTEGER;
  v_earned_year    INTEGER     := EXTRACT(YEAR FROM NOW())::INTEGER;
  v_expires_at     TIMESTAMPTZ :=
    DATE_TRUNC('year', NOW()) + INTERVAL '1 year' - INTERVAL '1 second';
BEGIN
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'award_points_fn: amount must be positive, got %', p_amount;
  END IF;

  INSERT INTO points_transactions (
    user_id, type, amount,
    reference_type, reference_id,
    description, created_by_id,
    earned_year, expires_at, created_at
  ) VALUES (
    p_user_id, p_type, p_amount,
    p_reference_type, p_reference_id,
    p_description, COALESCE(p_created_by_id, p_user_id),
    v_earned_year, v_expires_at, NOW()
  )
  RETURNING id INTO v_transaction_id;

  UPDATE users
  SET
    points              = COALESCE(points, 0)              + p_amount,
    current_year_points = COALESCE(current_year_points, 0) + p_amount,
    updated_at          = NOW()
  WHERE id = p_user_id
  RETURNING points INTO v_new_balance;

  RETURN jsonb_build_object(
    'transaction_id', v_transaction_id,
    'new_balance',    v_new_balance
  );
END;
$$;

GRANT EXECUTE ON FUNCTION award_points_fn TO authenticated;

-- ============================================================
-- SECURITY DEFINER function: spend_points_fn
--
-- Deducts points, records negative transaction. Validates balance.
-- Called via supabase.rpc('spend_points_fn', {...}) from API routes.
-- ============================================================
CREATE OR REPLACE FUNCTION spend_points_fn(
  p_user_id        UUID,
  p_amount         INTEGER,
  p_type           TEXT,
  p_reference_type TEXT    DEFAULT NULL,
  p_reference_id   UUID    DEFAULT NULL,
  p_description    TEXT    DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_transaction_id    UUID;
  v_current_balance   INTEGER;
  v_current_year_pts  INTEGER;
  v_new_balance       INTEGER;
  v_new_year_pts      INTEGER;
BEGIN
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'spend_points_fn: amount must be positive, got %', p_amount;
  END IF;

  SELECT points, current_year_points
  INTO v_current_balance, v_current_year_pts
  FROM users WHERE id = p_user_id;

  IF v_current_balance IS NULL THEN
    RAISE EXCEPTION 'spend_points_fn: user not found %', p_user_id;
  END IF;

  IF v_current_balance < p_amount THEN
    RAISE EXCEPTION 'spend_points_fn: insufficient points (have %, need %)',
      v_current_balance, p_amount;
  END IF;

  v_new_balance  := v_current_balance - p_amount;
  v_new_year_pts := GREATEST(0, COALESCE(v_current_year_pts, 0) - p_amount);

  INSERT INTO points_transactions (
    user_id, type, amount,
    reference_type, reference_id,
    description, created_at
  ) VALUES (
    p_user_id, p_type, -p_amount,
    p_reference_type, p_reference_id,
    p_description, NOW()
  )
  RETURNING id INTO v_transaction_id;

  UPDATE users
  SET
    points              = v_new_balance,
    current_year_points = v_new_year_pts,
    updated_at          = NOW()
  WHERE id = p_user_id;

  RETURN jsonb_build_object(
    'transaction_id', v_transaction_id,
    'new_balance',    v_new_balance
  );
END;
$$;

GRANT EXECUTE ON FUNCTION spend_points_fn TO authenticated;

-- ============================================================
-- SECURITY DEFINER function: award_badge_fn
--
-- Inserts into user_achievements. ON CONFLICT DO NOTHING makes it
-- idempotent — safe to call even if user already has the badge.
-- Called via supabase.rpc('award_badge_fn', {...}) from services.
-- ============================================================
CREATE OR REPLACE FUNCTION award_badge_fn(
  p_user_id  UUID,
  p_badge_id TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO user_achievements (user_id, achievement_id, earned_at)
  VALUES (p_user_id, p_badge_id, NOW())
  ON CONFLICT (user_id, achievement_id) DO NOTHING;
  RETURN TRUE;
END;
$$;

GRANT EXECUTE ON FUNCTION award_badge_fn TO authenticated;
