-- ============================================================
-- Add RLS policies for tables that had RLS enabled but no policies
-- ============================================================

-- ============================================================
-- MENTORSHIP TABLES
-- Mentors and mentees can see their own records; admins see all.
-- ============================================================

-- mentorships
CREATE POLICY "mentorships_own_read" ON mentorships
  FOR SELECT TO authenticated
  USING (
    mentor_id = get_current_user_id()
    OR mentee_id = get_current_user_id()
    OR is_admin()
  );

CREATE POLICY "mentorships_own_insert" ON mentorships
  FOR INSERT TO authenticated
  WITH CHECK (
    mentor_id = get_current_user_id()
    OR mentee_id = get_current_user_id()
    OR is_admin()
  );

CREATE POLICY "mentorships_own_update" ON mentorships
  FOR UPDATE TO authenticated
  USING (
    mentor_id = get_current_user_id()
    OR mentee_id = get_current_user_id()
    OR is_admin()
  )
  WITH CHECK (
    mentor_id = get_current_user_id()
    OR mentee_id = get_current_user_id()
    OR is_admin()
  );

-- mentorship_requests
CREATE POLICY "mentorship_requests_own_read" ON mentorship_requests
  FOR SELECT TO authenticated
  USING (
    mentee_id = get_current_user_id()
    OR matched_mentor_id = get_current_user_id()
    OR is_admin()
  );

CREATE POLICY "mentorship_requests_own_insert" ON mentorship_requests
  FOR INSERT TO authenticated
  WITH CHECK (mentee_id = get_current_user_id());

CREATE POLICY "mentorship_requests_own_update" ON mentorship_requests
  FOR UPDATE TO authenticated
  USING (
    mentee_id = get_current_user_id()
    OR matched_mentor_id = get_current_user_id()
    OR is_admin()
  )
  WITH CHECK (
    mentee_id = get_current_user_id()
    OR matched_mentor_id = get_current_user_id()
    OR is_admin()
  );

-- mentorship_sessions
CREATE POLICY "mentorship_sessions_own_read" ON mentorship_sessions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM mentorships m
      WHERE m.id = mentorship_sessions.mentorship_id
        AND (m.mentor_id = get_current_user_id() OR m.mentee_id = get_current_user_id())
    )
    OR is_admin()
  );

CREATE POLICY "mentorship_sessions_own_insert" ON mentorship_sessions
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM mentorships m
      WHERE m.id = mentorship_sessions.mentorship_id
        AND (m.mentor_id = get_current_user_id() OR m.mentee_id = get_current_user_id())
    )
    OR is_admin()
  );

CREATE POLICY "mentorship_sessions_own_update" ON mentorship_sessions
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM mentorships m
      WHERE m.id = mentorship_sessions.mentorship_id
        AND (m.mentor_id = get_current_user_id() OR m.mentee_id = get_current_user_id())
    )
    OR is_admin()
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM mentorships m
      WHERE m.id = mentorship_sessions.mentorship_id
        AND (m.mentor_id = get_current_user_id() OR m.mentee_id = get_current_user_id())
    )
    OR is_admin()
  );

-- mentee_progress
CREATE POLICY "mentee_progress_own_read" ON mentee_progress
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM mentorships m
      WHERE m.id = mentee_progress.mentorship_id
        AND (m.mentor_id = get_current_user_id() OR m.mentee_id = get_current_user_id())
    )
    OR is_admin()
  );

CREATE POLICY "mentee_progress_own_insert" ON mentee_progress
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM mentorships m
      WHERE m.id = mentee_progress.mentorship_id
        AND (m.mentor_id = get_current_user_id() OR m.mentee_id = get_current_user_id())
    )
    OR is_admin()
  );

CREATE POLICY "mentee_progress_own_update" ON mentee_progress
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM mentorships m
      WHERE m.id = mentee_progress.mentorship_id
        AND (m.mentor_id = get_current_user_id() OR m.mentee_id = get_current_user_id())
    )
    OR is_admin()
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM mentorships m
      WHERE m.id = mentee_progress.mentorship_id
        AND (m.mentor_id = get_current_user_id() OR m.mentee_id = get_current_user_id())
    )
    OR is_admin()
  );

-- mentor_availability (mentor manages their own schedule)
CREATE POLICY "mentor_availability_read" ON mentor_availability
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "mentor_availability_own_insert" ON mentor_availability
  FOR INSERT TO authenticated
  WITH CHECK (mentor_id = get_current_user_id() OR is_admin());

CREATE POLICY "mentor_availability_own_update" ON mentor_availability
  FOR UPDATE TO authenticated
  USING (mentor_id = get_current_user_id() OR is_admin())
  WITH CHECK (mentor_id = get_current_user_id() OR is_admin());

CREATE POLICY "mentor_availability_own_delete" ON mentor_availability
  FOR DELETE TO authenticated
  USING (mentor_id = get_current_user_id() OR is_admin());

-- ============================================================
-- BUSINESS COUNCIL TABLES
-- Members can read; admin-only writes.
-- ============================================================

-- business_council_members
CREATE POLICY "business_council_members_auth_read" ON business_council_members
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "business_council_members_admin_write" ON business_council_members
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- council_initiatives
CREATE POLICY "council_initiatives_auth_read" ON council_initiatives
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "council_initiatives_admin_write" ON council_initiatives
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================================
-- HONOR COURT TABLES
-- Participants see their own cases; admins see all.
-- ============================================================

-- honor_court_participants
CREATE POLICY "honor_court_participants_own_read" ON honor_court_participants
  FOR SELECT TO authenticated
  USING (
    user_id = get_current_user_id()
    OR is_admin()
  );

CREATE POLICY "honor_court_participants_admin_write" ON honor_court_participants
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- honor_court_notes (non-internal notes visible to case participants)
CREATE POLICY "honor_court_notes_read" ON honor_court_notes
  FOR SELECT TO authenticated
  USING (
    (
      is_internal = false
      AND EXISTS (
        SELECT 1 FROM honor_court_participants hcp
        WHERE hcp.case_id = honor_court_notes.case_id
          AND hcp.user_id = get_current_user_id()
      )
    )
    OR author_id = get_current_user_id()
    OR is_admin()
  );

CREATE POLICY "honor_court_notes_own_insert" ON honor_court_notes
  FOR INSERT TO authenticated
  WITH CHECK (author_id = get_current_user_id() OR is_admin());

CREATE POLICY "honor_court_notes_admin_update" ON honor_court_notes
  FOR UPDATE TO authenticated
  USING (author_id = get_current_user_id() OR is_admin())
  WITH CHECK (author_id = get_current_user_id() OR is_admin());
