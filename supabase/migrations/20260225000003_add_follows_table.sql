-- Migration: Add follows table for social graph
-- Created: 2026-02-25

CREATE TABLE follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'blocked')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CONSTRAINT no_self_follow CHECK (follower_id != following_id)
);

-- Indexes
CREATE INDEX idx_follows_follower ON follows(follower_id);
CREATE INDEX idx_follows_following ON follows(following_id);
CREATE INDEX idx_follows_both ON follows(follower_id, following_id);

-- Enable RLS
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- RLS Policies for follows

-- Users can view follows (who follows who)
CREATE POLICY "Anyone can view follows"
  ON follows FOR SELECT
  TO authenticated
  USING (true);

-- Allow anon to view follows for public profiles
CREATE POLICY "Public can view follows"
  ON follows FOR SELECT
  TO anon
  USING (true);

-- Users can create follows (follow someone)
CREATE POLICY "Users can follow others"
  ON follows FOR INSERT
  WITH CHECK (follower_id = auth.uid());

-- Users can unfollow (delete their follows)
CREATE POLICY "Users can unfollow"
  ON follows FOR DELETE
  USING (follower_id = auth.uid());

-- Users can update their own follow status (e.g., block)
CREATE POLICY "Users can update own follows"
  ON follows FOR UPDATE
  USING (follower_id = auth.uid() OR following_id = auth.uid())
  WITH CHECK (follower_id = auth.uid() OR following_id = auth.uid());

-- Admins can manage all follows
CREATE POLICY "Admins can manage all follows"
  ON follows FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND staff_role IN ('admin', 'super_admin')
    )
  );

-- Helper functions

-- Get follower count for a user
CREATE OR REPLACE FUNCTION get_follower_count(user_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*) FROM follows
    WHERE following_id = user_uuid
    AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get following count for a user
CREATE OR REPLACE FUNCTION get_following_count(user_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*) FROM follows
    WHERE follower_id = user_uuid
    AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user A follows user B
CREATE OR REPLACE FUNCTION is_following(follower_uuid UUID, following_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM follows
    WHERE follower_id = follower_uuid
    AND following_id = following_uuid
    AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get mutual followers count
CREATE OR REPLACE FUNCTION get_mutual_followers_count(user_a UUID, user_b UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*) FROM follows f1
    INNER JOIN follows f2 ON f1.follower_id = f2.follower_id
    WHERE f1.following_id = user_a
    AND f2.following_id = user_b
    AND f1.status = 'active'
    AND f2.status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
