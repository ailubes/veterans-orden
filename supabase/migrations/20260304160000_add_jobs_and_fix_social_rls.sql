-- Add jobs feature and normalize social RLS auth mapping
-- Created: 2026-03-04

CREATE OR REPLACE FUNCTION public.is_current_user(target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT
    target_user_id = auth.uid()
    OR EXISTS (
      SELECT 1
      FROM public.users u
      WHERE u.id = target_user_id
        AND u.auth_id = auth.uid()
    );
$$;

-- Posts policies
DROP POLICY IF EXISTS "Users can view posts from followed users" ON public.posts;
DROP POLICY IF EXISTS "Users can view own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can create own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can update own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can delete own posts" ON public.posts;
DROP POLICY IF EXISTS "Admins can manage all posts" ON public.posts;

CREATE POLICY "Users can view posts from followed users"
  ON public.posts FOR SELECT
  USING (
    visibility = 'followers' AND
    EXISTS (
      SELECT 1 FROM public.follows
      WHERE public.is_current_user(follower_id)
      AND following_id = author_id
      AND status = 'active'
    )
  );

CREATE POLICY "Users can view own posts"
  ON public.posts FOR SELECT
  USING (public.is_current_user(author_id));

CREATE POLICY "Users can create own posts"
  ON public.posts FOR INSERT
  WITH CHECK (public.is_current_user(author_id));

CREATE POLICY "Users can update own posts"
  ON public.posts FOR UPDATE
  USING (public.is_current_user(author_id))
  WITH CHECK (public.is_current_user(author_id));

CREATE POLICY "Users can delete own posts"
  ON public.posts FOR DELETE
  USING (public.is_current_user(author_id));

CREATE POLICY "Admins can manage all posts"
  ON public.posts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE (id = auth.uid() OR auth_id = auth.uid())
      AND staff_role IN ('admin', 'super_admin')
    )
  );

-- Comments policies
DROP POLICY IF EXISTS "Users can view comments on visible posts" ON public.comments;
DROP POLICY IF EXISTS "Users can create comments" ON public.comments;
DROP POLICY IF EXISTS "Users can update own comments" ON public.comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON public.comments;
DROP POLICY IF EXISTS "Admins can manage all comments" ON public.comments;

CREATE POLICY "Users can view comments on visible posts"
  ON public.comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.posts
      WHERE public.posts.id = comments.post_id
      AND (
        public.posts.visibility = 'public'
        OR public.is_current_user(public.posts.author_id)
        OR (
          public.posts.visibility = 'followers'
          AND EXISTS (
            SELECT 1 FROM public.follows
            WHERE public.is_current_user(follower_id)
            AND following_id = public.posts.author_id
            AND status = 'active'
          )
        )
      )
    )
  );

CREATE POLICY "Users can create comments"
  ON public.comments FOR INSERT
  WITH CHECK (
    public.is_current_user(author_id)
    AND EXISTS (
      SELECT 1 FROM public.posts
      WHERE public.posts.id = comments.post_id
      AND (
        public.posts.visibility = 'public'
        OR public.is_current_user(public.posts.author_id)
        OR (
          public.posts.visibility = 'followers'
          AND EXISTS (
            SELECT 1 FROM public.follows
            WHERE public.is_current_user(follower_id)
            AND following_id = public.posts.author_id
            AND status = 'active'
          )
        )
      )
    )
  );

CREATE POLICY "Users can update own comments"
  ON public.comments FOR UPDATE
  USING (public.is_current_user(author_id))
  WITH CHECK (public.is_current_user(author_id));

CREATE POLICY "Users can delete own comments"
  ON public.comments FOR DELETE
  USING (public.is_current_user(author_id));

CREATE POLICY "Admins can manage all comments"
  ON public.comments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE (id = auth.uid() OR auth_id = auth.uid())
      AND staff_role IN ('admin', 'super_admin')
    )
  );

-- Likes policies
DROP POLICY IF EXISTS "Users can view likes on visible posts" ON public.likes;
DROP POLICY IF EXISTS "Users can view likes on visible comments" ON public.likes;
DROP POLICY IF EXISTS "Users can create likes" ON public.likes;
DROP POLICY IF EXISTS "Users can delete own likes" ON public.likes;
DROP POLICY IF EXISTS "Admins can manage all likes" ON public.likes;

CREATE POLICY "Users can view likes on visible posts"
  ON public.likes FOR SELECT
  USING (
    target_type = 'post'
    AND EXISTS (
      SELECT 1 FROM public.posts
      WHERE public.posts.id = likes.target_id
      AND (
        public.posts.visibility = 'public'
        OR public.is_current_user(public.posts.author_id)
        OR (
          public.posts.visibility = 'followers'
          AND EXISTS (
            SELECT 1 FROM public.follows
            WHERE public.is_current_user(follower_id)
            AND following_id = public.posts.author_id
            AND status = 'active'
          )
        )
      )
    )
  );

CREATE POLICY "Users can view likes on visible comments"
  ON public.likes FOR SELECT
  USING (
    target_type = 'comment'
    AND EXISTS (
      SELECT 1
      FROM public.comments
      JOIN public.posts ON public.posts.id = public.comments.post_id
      WHERE public.comments.id = likes.target_id
      AND (
        public.posts.visibility = 'public'
        OR public.is_current_user(public.posts.author_id)
        OR (
          public.posts.visibility = 'followers'
          AND EXISTS (
            SELECT 1 FROM public.follows
            WHERE public.is_current_user(follower_id)
            AND following_id = public.posts.author_id
            AND status = 'active'
          )
        )
      )
    )
  );

CREATE POLICY "Users can create likes"
  ON public.likes FOR INSERT
  WITH CHECK (public.is_current_user(user_id));

CREATE POLICY "Users can delete own likes"
  ON public.likes FOR DELETE
  USING (public.is_current_user(user_id));

CREATE POLICY "Admins can manage all likes"
  ON public.likes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE (id = auth.uid() OR auth_id = auth.uid())
      AND staff_role IN ('admin', 'super_admin')
    )
  );

-- Follows policies
DROP POLICY IF EXISTS "Anyone can view follows" ON public.follows;
DROP POLICY IF EXISTS "Public can view follows" ON public.follows;
DROP POLICY IF EXISTS "Users can follow others" ON public.follows;
DROP POLICY IF EXISTS "Users can unfollow" ON public.follows;
DROP POLICY IF EXISTS "Users can update own follows" ON public.follows;
DROP POLICY IF EXISTS "Admins can manage all follows" ON public.follows;

CREATE POLICY "Anyone can view follows"
  ON public.follows FOR SELECT
  USING (true);

CREATE POLICY "Public can view follows"
  ON public.follows FOR SELECT
  USING (true);

CREATE POLICY "Users can follow others"
  ON public.follows FOR INSERT
  WITH CHECK (public.is_current_user(follower_id));

CREATE POLICY "Users can unfollow"
  ON public.follows FOR DELETE
  USING (public.is_current_user(follower_id));

CREATE POLICY "Users can update own follows"
  ON public.follows FOR UPDATE
  USING (public.is_current_user(follower_id) OR public.is_current_user(following_id))
  WITH CHECK (public.is_current_user(follower_id) OR public.is_current_user(following_id));

CREATE POLICY "Admins can manage all follows"
  ON public.follows FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE (id = auth.uid() OR auth_id = auth.uid())
      AND staff_role IN ('admin', 'super_admin')
    )
  );

-- Jobs feature
CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  post_id UUID UNIQUE REFERENCES public.posts(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  company_name TEXT,
  location TEXT,
  employment_type TEXT NOT NULL DEFAULT 'full_time' CHECK (employment_type IN ('full_time', 'part_time', 'contract', 'project', 'internship')),
  salary_min INTEGER,
  salary_max INTEGER,
  application_url TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_jobs_status_created ON public.jobs(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_author_created ON public.jobs(author_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_post_id ON public.jobs(post_id);

ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active jobs"
  ON public.jobs FOR SELECT
  USING (
    status = 'active'
    OR public.is_current_user(author_id)
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE (id = auth.uid() OR auth_id = auth.uid())
      AND staff_role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Eligible paid members can create jobs"
  ON public.jobs FOR INSERT
  WITH CHECK (
    public.is_current_user(author_id)
    AND EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = author_id
        AND u.membership_tier IN ('basic_49', 'supporter_100', 'supporter_200', 'patron_500')
        AND COALESCE(u.referral_count, 0) >= 3
        AND COALESCE(u.membership_paid_until, now()) >= now() - interval '7 days'
    )
  );

CREATE POLICY "Owners can update own jobs"
  ON public.jobs FOR UPDATE
  USING (public.is_current_user(author_id))
  WITH CHECK (public.is_current_user(author_id));

CREATE POLICY "Owners can delete own jobs"
  ON public.jobs FOR DELETE
  USING (public.is_current_user(author_id));

CREATE POLICY "Admins can manage all jobs"
  ON public.jobs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE (id = auth.uid() OR auth_id = auth.uid())
      AND staff_role IN ('admin', 'super_admin')
    )
  );

DROP TRIGGER IF EXISTS update_jobs_updated_at ON public.jobs;
CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
