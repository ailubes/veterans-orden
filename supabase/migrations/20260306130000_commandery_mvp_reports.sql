-- MVP monthly reporting for commanderies

CREATE TABLE IF NOT EXISTS commandery_mvp_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  commandery_id uuid NOT NULL REFERENCES commanderies(id) ON DELETE CASCADE,
  report_month date NOT NULL,

  active_members_count integer NOT NULL,
  monthly_meetings_count integer NOT NULL,
  monthly_local_actions_count integer NOT NULL,

  what_done text NOT NULL,
  what_planned text NOT NULL,
  what_needed text NOT NULL,

  is_mvp_compliant boolean NOT NULL DEFAULT false,

  submitted_by_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now(),

  CONSTRAINT commandery_mvp_reports_month_unique UNIQUE (commandery_id, report_month),
  CONSTRAINT commandery_mvp_active_members_chk CHECK (active_members_count >= 0),
  CONSTRAINT commandery_mvp_meetings_chk CHECK (monthly_meetings_count >= 0),
  CONSTRAINT commandery_mvp_actions_chk CHECK (monthly_local_actions_count >= 0)
);

CREATE INDEX IF NOT EXISTS commandery_mvp_reports_commandery_idx
  ON commandery_mvp_reports(commandery_id);
CREATE INDEX IF NOT EXISTS commandery_mvp_reports_month_idx
  ON commandery_mvp_reports(report_month DESC);

ALTER TABLE commandery_mvp_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "commandery_mvp_auth_read" ON commandery_mvp_reports;
CREATE POLICY "commandery_mvp_auth_read"
  ON commandery_mvp_reports
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "commandery_mvp_leader_insert" ON commandery_mvp_reports;
CREATE POLICY "commandery_mvp_leader_insert"
  ON commandery_mvp_reports
  FOR INSERT
  TO authenticated
  WITH CHECK (
    submitted_by_id = get_current_user_id()
    AND (
      is_admin()
      OR EXISTS (
        SELECT 1
        FROM commanderies c
        WHERE c.id = commandery_mvp_reports.commandery_id
          AND c.leader_id = get_current_user_id()
      )
    )
  );

DROP POLICY IF EXISTS "commandery_mvp_leader_update" ON commandery_mvp_reports;
CREATE POLICY "commandery_mvp_leader_update"
  ON commandery_mvp_reports
  FOR UPDATE
  TO authenticated
  USING (
    is_admin()
    OR EXISTS (
      SELECT 1
      FROM commanderies c
      WHERE c.id = commandery_mvp_reports.commandery_id
        AND c.leader_id = get_current_user_id()
    )
  )
  WITH CHECK (
    submitted_by_id = get_current_user_id()
    AND (
      is_admin()
      OR EXISTS (
        SELECT 1
        FROM commanderies c
        WHERE c.id = commandery_mvp_reports.commandery_id
          AND c.leader_id = get_current_user_id()
      )
    )
  );
