-- Link specific tasks to challenges for targeted gamification flows.

CREATE TABLE IF NOT EXISTS challenge_tasks (
  challenge_id uuid NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  created_at timestamp DEFAULT now() NOT NULL,
  PRIMARY KEY (challenge_id, task_id)
);

CREATE INDEX IF NOT EXISTS challenge_tasks_challenge_idx ON challenge_tasks(challenge_id);
CREATE INDEX IF NOT EXISTS challenge_tasks_task_idx ON challenge_tasks(task_id);

ALTER TABLE challenge_tasks ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read mappings so challenge progress checks can run under user sessions.
DROP POLICY IF EXISTS "challenge_tasks_auth_read" ON challenge_tasks;
CREATE POLICY "challenge_tasks_auth_read" ON challenge_tasks
  FOR SELECT TO authenticated USING (true);

-- Only staff admins can manage mappings.
DROP POLICY IF EXISTS "challenge_tasks_admin_insert" ON challenge_tasks;
CREATE POLICY "challenge_tasks_admin_insert" ON challenge_tasks
  FOR INSERT TO authenticated WITH CHECK (is_admin());

DROP POLICY IF EXISTS "challenge_tasks_admin_update" ON challenge_tasks;
CREATE POLICY "challenge_tasks_admin_update" ON challenge_tasks
  FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "challenge_tasks_admin_delete" ON challenge_tasks;
CREATE POLICY "challenge_tasks_admin_delete" ON challenge_tasks
  FOR DELETE TO authenticated USING (is_admin());
