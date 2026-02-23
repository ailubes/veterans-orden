-- ============================================================
-- RLS — Enable Row Level Security on all public tables
-- ============================================================
-- Architecture notes:
--   • All user_id columns reference users.id (NOT auth.uid())
--   • users.auth_id = auth.uid()  (Supabase auth user UUID)
--   • Service-role clients always bypass RLS (webhooks, cron)
--   • Authenticated users use cookie/Bearer JWT (web + mobile)
-- ============================================================

-- ── Helper: resolve caller's app user ID ─────────────────────
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM users WHERE auth_id = auth.uid() LIMIT 1;
$$;

-- ── Helper: admin check (avoids recursive RLS on users table) ─
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM users
    WHERE auth_id = auth.uid()
      AND staff_role IN ('admin', 'super_admin')
  );
$$;

-- ============================================================
-- 1. ENABLE RLS
-- ============================================================

ALTER TABLE notification_recipients   ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations             ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_gates             ENABLE ROW LEVEL SECURITY;
ALTER TABLE katottg                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE katottg_categories        ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_category_meta        ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_requirements         ENABLE ROW LEVEL SECURITY;
ALTER TABLE oblasts                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE commanderies              ENABLE ROW LEVEL SECURITY;
ALTER TABLE help_categories           ENABLE ROW LEVEL SECURITY;
ALTER TABLE advancement_requests      ENABLE ROW LEVEL SECURITY;
ALTER TABLE users                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_role_labels           ENABLE ROW LEVEL SECURITY;
ALTER TABLE participation_milestones  ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_participants    ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges                ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_send_log            ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_template_history    ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates           ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_rsvps               ENABLE ROW LEVEL SECURITY;
ALTER TABLE events                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE help_article_feedback     ENABLE ROW LEVEL SECURITY;
ALTER TABLE help_articles             ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_articles             ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications             ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_settings     ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_transactions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE products                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_advancements         ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements         ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_location_changes     ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_referral_stats       ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_votes                ENABLE ROW LEVEL SECURITY;
ALTER TABLE help_tooltips             ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items               ENABLE ROW LEVEL SECURITY;
ALTER TABLE vote_options              ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 2. REFERENCE / LOOKUP TABLES (read-only, same for everyone)
--    Anon + authenticated can SELECT
-- ============================================================

CREATE POLICY "oblasts_public_read"          ON oblasts           FOR SELECT USING (true);
CREATE POLICY "katottg_public_read"          ON katottg           FOR SELECT USING (true);
CREATE POLICY "katottg_cats_public_read"     ON katottg_categories FOR SELECT USING (true);
CREATE POLICY "news_cat_meta_public_read"    ON news_category_meta FOR SELECT USING (true);
CREATE POLICY "commanderies_auth_read"       ON commanderies       FOR SELECT TO authenticated USING (true);
CREATE POLICY "oblasts_note" ON oblasts FOR SELECT USING (true); -- already done above, duplicate ok
-- deduplicate: drop the second oblasts policy
DROP POLICY IF EXISTS "oblasts_note" ON oblasts;

CREATE POLICY "role_reqs_auth_read"          ON role_requirements  FOR SELECT TO authenticated USING (true);
CREATE POLICY "participation_ms_auth_read"   ON participation_milestones FOR SELECT TO authenticated USING (true);
CREATE POLICY "org_role_labels_auth_read"    ON org_role_labels    FOR SELECT TO authenticated USING (true);
CREATE POLICY "badges_auth_read"             ON badges             FOR SELECT TO authenticated USING (true);
CREATE POLICY "groups_auth_read"             ON groups             FOR SELECT TO authenticated USING (true);
CREATE POLICY "feature_gates_auth_read"      ON feature_gates      FOR SELECT TO authenticated USING (true);
CREATE POLICY "products_public_read"         ON products           FOR SELECT USING (true);

-- ============================================================
-- 3. CONTENT TABLES (authenticated members can read)
-- ============================================================

-- News articles: published ones are public; drafts only for admins
CREATE POLICY "news_published_public_read"   ON news_articles
  FOR SELECT USING (
    status = 'published'
    OR is_admin()
  );

CREATE POLICY "help_articles_auth_read"      ON help_articles      FOR SELECT TO authenticated USING (true);
CREATE POLICY "help_categories_auth_read"    ON help_categories    FOR SELECT TO authenticated USING (true);
CREATE POLICY "help_tooltips_auth_read"      ON help_tooltips      FOR SELECT TO authenticated USING (true);
CREATE POLICY "votes_auth_read"              ON votes              FOR SELECT TO authenticated USING (true);
CREATE POLICY "vote_options_auth_read"       ON vote_options       FOR SELECT TO authenticated USING (true);
CREATE POLICY "tasks_auth_read"              ON tasks              FOR SELECT TO authenticated USING (true);
CREATE POLICY "challenges_auth_read"         ON challenges         FOR SELECT TO authenticated USING (true);
CREATE POLICY "events_auth_read"             ON events             FOR SELECT TO authenticated USING (true);

-- ============================================================
-- 4. USERS TABLE
--    • Users see/update their own row
--    • Admins see/update all rows
-- ============================================================

CREATE POLICY "users_own_read" ON users
  FOR SELECT TO authenticated
  USING (auth_id = auth.uid() OR is_admin());

CREATE POLICY "users_own_update" ON users
  FOR UPDATE TO authenticated
  USING (auth_id = auth.uid())
  WITH CHECK (auth_id = auth.uid());

CREATE POLICY "users_admin_update" ON users
  FOR UPDATE TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "users_insert_service" ON users
  FOR INSERT TO authenticated
  WITH CHECK (auth_id = auth.uid());

-- ============================================================
-- 5. USER-SPECIFIC DATA TABLES
--    user_id references users.id → need get_current_user_id()
-- ============================================================

-- payments
CREATE POLICY "payments_own_read" ON payments
  FOR SELECT TO authenticated
  USING (user_id = get_current_user_id() OR is_admin());

-- points_transactions
CREATE POLICY "points_own_read" ON points_transactions
  FOR SELECT TO authenticated
  USING (user_id = get_current_user_id() OR is_admin());

-- user_achievements
CREATE POLICY "achievements_own_read" ON user_achievements
  FOR SELECT TO authenticated
  USING (user_id = get_current_user_id() OR is_admin());

-- user_votes (users cast + read own votes)
CREATE POLICY "uservotes_own_read" ON user_votes
  FOR SELECT TO authenticated
  USING (user_id = get_current_user_id());

CREATE POLICY "uservotes_own_insert" ON user_votes
  FOR INSERT TO authenticated
  WITH CHECK (user_id = get_current_user_id());

-- user_referral_stats
CREATE POLICY "referral_stats_own_read" ON user_referral_stats
  FOR SELECT TO authenticated
  USING (user_id = get_current_user_id() OR is_admin());

-- notifications
CREATE POLICY "notifs_own_read" ON notifications
  FOR SELECT TO authenticated
  USING (user_id = get_current_user_id());

CREATE POLICY "notifs_own_update" ON notifications
  FOR UPDATE TO authenticated
  USING (user_id = get_current_user_id())
  WITH CHECK (user_id = get_current_user_id());

-- notification_recipients
CREATE POLICY "notif_recipients_own_read" ON notification_recipients
  FOR SELECT TO authenticated
  USING (user_id = get_current_user_id());

-- event_rsvps
CREATE POLICY "rsvps_own_read" ON event_rsvps
  FOR SELECT TO authenticated
  USING (user_id = get_current_user_id());

CREATE POLICY "rsvps_own_write" ON event_rsvps
  FOR INSERT TO authenticated
  WITH CHECK (user_id = get_current_user_id());

CREATE POLICY "rsvps_own_update" ON event_rsvps
  FOR UPDATE TO authenticated
  USING (user_id = get_current_user_id())
  WITH CHECK (user_id = get_current_user_id());

-- challenge_participants (read all for leaderboard, write own)
CREATE POLICY "challenge_parts_auth_read" ON challenge_participants
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "challenge_parts_own_write" ON challenge_participants
  FOR INSERT TO authenticated
  WITH CHECK (user_id = get_current_user_id());

-- advancement_requests
CREATE POLICY "adv_requests_own_read" ON advancement_requests
  FOR SELECT TO authenticated
  USING (user_id = get_current_user_id() OR is_admin());

CREATE POLICY "adv_requests_own_insert" ON advancement_requests
  FOR INSERT TO authenticated
  WITH CHECK (user_id = get_current_user_id());

-- role_advancements
CREATE POLICY "role_adv_own_read" ON role_advancements
  FOR SELECT TO authenticated
  USING (user_id = get_current_user_id() OR is_admin());

-- user_location_changes
CREATE POLICY "loc_changes_own_read" ON user_location_changes
  FOR SELECT TO authenticated
  USING (user_id = get_current_user_id());

CREATE POLICY "loc_changes_own_insert" ON user_location_changes
  FOR INSERT TO authenticated
  WITH CHECK (user_id = get_current_user_id());

-- ============================================================
-- 6. MESSAGING (conversation participants only)
-- ============================================================

-- conversation_participants
CREATE POLICY "conv_parts_own_read" ON conversation_participants
  FOR SELECT TO authenticated
  USING (user_id = get_current_user_id());

-- conversations: visible if user is a participant
CREATE POLICY "conv_participant_read" ON conversations
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = id
        AND cp.user_id = get_current_user_id()
    )
  );

-- messages: visible if user is in that conversation
CREATE POLICY "messages_participant_read" ON messages
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = conversation_id
        AND cp.user_id = get_current_user_id()
    )
  );

CREATE POLICY "messages_own_insert" ON messages
  FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = get_current_user_id()
    AND EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = conversation_id
        AND cp.user_id = get_current_user_id()
    )
  );

-- help_article_feedback
CREATE POLICY "feedback_own_read" ON help_article_feedback
  FOR SELECT TO authenticated
  USING (user_id = get_current_user_id());

CREATE POLICY "feedback_own_insert" ON help_article_feedback
  FOR INSERT TO authenticated
  WITH CHECK (user_id = get_current_user_id());

-- ============================================================
-- 7. ORDERS
-- ============================================================

CREATE POLICY "orders_own_read" ON orders
  FOR SELECT TO authenticated
  USING (user_id = get_current_user_id() OR is_admin());

-- order_items: via orders FK
CREATE POLICY "order_items_own_read" ON order_items
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_id
        AND o.user_id = get_current_user_id()
    )
    OR is_admin()
  );

-- ============================================================
-- 8. ADMIN-ONLY TABLES (no direct access; API routes use service_role)
--    Enable RLS without policies → denies all direct PostgREST
--    Admin reads go through Next.js API routes with service_role
-- ============================================================

-- organization_settings: only admins via authenticated session or service_role
CREATE POLICY "org_settings_admin_read" ON organization_settings
  FOR SELECT TO authenticated
  USING (is_admin());

-- audit_log: admin read only
CREATE POLICY "audit_log_admin_read" ON audit_log
  FOR SELECT TO authenticated
  USING (is_admin());

-- email tables: admin only
CREATE POLICY "email_templates_admin_read"    ON email_templates         FOR SELECT TO authenticated USING (is_admin());
CREATE POLICY "email_tmpl_history_admin_read" ON email_template_history  FOR SELECT TO authenticated USING (is_admin());
CREATE POLICY "email_send_log_admin_read"     ON email_send_log          FOR SELECT TO authenticated USING (is_admin());
