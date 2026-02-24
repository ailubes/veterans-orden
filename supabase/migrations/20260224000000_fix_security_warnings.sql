-- ============================================================
-- Fix Supabase security linter warnings
-- 1. Set fixed search_path on all public functions
-- 2. Tighten overly-permissive RLS WITH CHECK clauses
-- ============================================================

-- ============================================================
-- 1. Function search_path: prevent search_path injection
-- ============================================================

ALTER FUNCTION public.generate_case_number()
  SET search_path = public;

ALTER FUNCTION public.generate_referral_code()
  SET search_path = public;

ALTER FUNCTION public.get_rank_numeric(rank military_rank)
  SET search_path = public;

ALTER FUNCTION public.populate_candidate_military_info()
  SET search_path = public;

ALTER FUNCTION public.resolve_election_ties(election_id uuid)
  SET search_path = public;

ALTER FUNCTION public.update_council_member_count()
  SET search_path = public;

ALTER FUNCTION public.update_pages_updated_at()
  SET search_path = public;

ALTER FUNCTION public.update_participation_stats()
  SET search_path = public;

-- ============================================================
-- 2. RLS policy tightening
-- ============================================================

-- tasks_own_update: WITH CHECK was always-true; match USING clause
DROP POLICY IF EXISTS "tasks_own_update" ON tasks;
CREATE POLICY "tasks_own_update" ON tasks
  FOR UPDATE TO authenticated
  USING (
    assignee_id = get_current_user_id()
    OR (status = 'open' AND assignee_id IS NULL)
  )
  WITH CHECK (
    assignee_id = get_current_user_id()
    OR (status = 'open' AND assignee_id IS NULL)
  );

-- votes_auth_update: only allow updating active votes
DROP POLICY IF EXISTS "votes_auth_update" ON votes;
CREATE POLICY "votes_auth_update" ON votes
  FOR UPDATE TO authenticated
  USING (status = 'active')
  WITH CHECK (status = 'active');

-- vote_options_auth_update: only allow updating options of active votes
DROP POLICY IF EXISTS "vote_options_auth_update" ON vote_options;
CREATE POLICY "vote_options_auth_update" ON vote_options
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM votes
      WHERE votes.id = vote_options.vote_id
        AND votes.status = 'active'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM votes
      WHERE votes.id = vote_options.vote_id
        AND votes.status = 'active'
    )
  );

-- order_applications: require name and contact present instead of pure WITH CHECK (true)
DROP POLICY IF EXISTS "Anyone can submit an order application" ON order_applications;
CREATE POLICY "Anyone can submit an order application" ON order_applications
  FOR INSERT
  WITH CHECK (
    name IS NOT NULL
    AND length(trim(name)) > 0
    AND contact IS NOT NULL
    AND length(trim(contact)) > 0
  );
