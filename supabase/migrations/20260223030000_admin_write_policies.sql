-- ============================================================
-- Admin write policies for dashboard/admin pages that call
-- Supabase directly from client components.
-- Covers: tasks, events, news_articles, audit_log,
--         user_location_changes, challenges.
-- pages already has full policies from previous migrations.
-- ============================================================

-- tasks: admin create + full update/delete
DROP POLICY IF EXISTS "tasks_admin_insert" ON tasks;
CREATE POLICY "tasks_admin_insert" ON tasks
  FOR INSERT TO authenticated WITH CHECK (is_admin());

DROP POLICY IF EXISTS "tasks_admin_update" ON tasks;
CREATE POLICY "tasks_admin_update" ON tasks
  FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "tasks_admin_delete" ON tasks;
CREATE POLICY "tasks_admin_delete" ON tasks
  FOR DELETE TO authenticated USING (is_admin());

-- events: admin full CRUD
DROP POLICY IF EXISTS "events_admin_insert" ON events;
CREATE POLICY "events_admin_insert" ON events
  FOR INSERT TO authenticated WITH CHECK (is_admin());

DROP POLICY IF EXISTS "events_admin_update" ON events;
CREATE POLICY "events_admin_update" ON events
  FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "events_admin_delete" ON events;
CREATE POLICY "events_admin_delete" ON events
  FOR DELETE TO authenticated USING (is_admin());

-- news_articles: admin full CRUD
DROP POLICY IF EXISTS "news_admin_insert" ON news_articles;
CREATE POLICY "news_admin_insert" ON news_articles
  FOR INSERT TO authenticated WITH CHECK (is_admin());

DROP POLICY IF EXISTS "news_admin_update" ON news_articles;
CREATE POLICY "news_admin_update" ON news_articles
  FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "news_admin_delete" ON news_articles;
CREATE POLICY "news_admin_delete" ON news_articles
  FOR DELETE TO authenticated USING (is_admin());

-- audit_log: admin can INSERT activity records
DROP POLICY IF EXISTS "audit_log_admin_insert" ON audit_log;
CREATE POLICY "audit_log_admin_insert" ON audit_log
  FOR INSERT TO authenticated WITH CHECK (is_admin());

-- user_location_changes: admin can INSERT for any user (member edit page)
DROP POLICY IF EXISTS "loc_changes_admin_insert" ON user_location_changes;
CREATE POLICY "loc_changes_admin_insert" ON user_location_changes
  FOR INSERT TO authenticated WITH CHECK (is_admin());

-- challenges: admin full CRUD
DROP POLICY IF EXISTS "challenges_admin_insert" ON challenges;
CREATE POLICY "challenges_admin_insert" ON challenges
  FOR INSERT TO authenticated WITH CHECK (is_admin());

DROP POLICY IF EXISTS "challenges_admin_update" ON challenges;
CREATE POLICY "challenges_admin_update" ON challenges
  FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "challenges_admin_delete" ON challenges;
CREATE POLICY "challenges_admin_delete" ON challenges
  FOR DELETE TO authenticated USING (is_admin());
