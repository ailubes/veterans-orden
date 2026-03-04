-- Challenge engagement automation state:
-- - event deduping (daily nudges, almost-done prompts, streak bonuses, auto-join)
-- - per-user challenge-task streak tracking

CREATE TABLE IF NOT EXISTS challenge_automation_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  challenge_id uuid REFERENCES challenges(id) ON DELETE CASCADE,
  event_type varchar(60) NOT NULL,
  event_date date,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS challenge_auto_event_daily_unique
  ON challenge_automation_events(user_id, challenge_id, event_type, event_date)
  WHERE event_date IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS challenge_auto_event_once_per_challenge_unique
  ON challenge_automation_events(user_id, challenge_id, event_type)
  WHERE event_date IS NULL AND challenge_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS challenge_auto_event_once_per_user_unique
  ON challenge_automation_events(user_id, event_type)
  WHERE event_date IS NULL AND challenge_id IS NULL;

CREATE INDEX IF NOT EXISTS challenge_auto_event_user_idx
  ON challenge_automation_events(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS challenge_user_streaks (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  current_streak integer NOT NULL DEFAULT 0,
  best_streak integer NOT NULL DEFAULT 0,
  last_activity_date date,
  updated_at timestamp NOT NULL DEFAULT now()
);

ALTER TABLE challenge_automation_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_user_streaks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "challenge_auto_events_own_read" ON challenge_automation_events;
CREATE POLICY "challenge_auto_events_own_read" ON challenge_automation_events
  FOR SELECT TO authenticated
  USING (user_id = get_current_user_id() OR is_admin());

DROP POLICY IF EXISTS "challenge_auto_events_own_insert" ON challenge_automation_events;
CREATE POLICY "challenge_auto_events_own_insert" ON challenge_automation_events
  FOR INSERT TO authenticated
  WITH CHECK (user_id = get_current_user_id() OR is_admin());

DROP POLICY IF EXISTS "challenge_auto_events_own_update" ON challenge_automation_events;
CREATE POLICY "challenge_auto_events_own_update" ON challenge_automation_events
  FOR UPDATE TO authenticated
  USING (user_id = get_current_user_id() OR is_admin())
  WITH CHECK (user_id = get_current_user_id() OR is_admin());

DROP POLICY IF EXISTS "challenge_user_streaks_own_read" ON challenge_user_streaks;
CREATE POLICY "challenge_user_streaks_own_read" ON challenge_user_streaks
  FOR SELECT TO authenticated
  USING (user_id = get_current_user_id() OR is_admin());

DROP POLICY IF EXISTS "challenge_user_streaks_own_insert" ON challenge_user_streaks;
CREATE POLICY "challenge_user_streaks_own_insert" ON challenge_user_streaks
  FOR INSERT TO authenticated
  WITH CHECK (user_id = get_current_user_id() OR is_admin());

DROP POLICY IF EXISTS "challenge_user_streaks_own_update" ON challenge_user_streaks;
CREATE POLICY "challenge_user_streaks_own_update" ON challenge_user_streaks
  FOR UPDATE TO authenticated
  USING (user_id = get_current_user_id() OR is_admin())
  WITH CHECK (user_id = get_current_user_id() OR is_admin());
