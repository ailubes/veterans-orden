-- Migration: Add likes/reactions table for social network
-- Created: 2026-02-25

CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('post', 'comment')),
  target_id UUID NOT NULL,
  reaction_type TEXT DEFAULT 'like' CHECK (reaction_type IN ('like', 'love', 'support', 'insightful')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, target_type, target_id)
);

-- Indexes
CREATE INDEX idx_likes_target ON likes(target_type, target_id);
CREATE INDEX idx_likes_user_id ON likes(user_id);

-- Enable RLS
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for likes

-- Users can view likes on visible content
CREATE POLICY "Users can view likes on visible posts"
  ON likes FOR SELECT
  USING (
    target_type = 'post'
    AND EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = likes.target_id
      AND (
        posts.visibility = 'public'
        OR posts.author_id = auth.uid()
        OR (
          posts.visibility = 'followers'
          AND EXISTS (
            SELECT 1 FROM follows
            WHERE follower_id = auth.uid()
            AND following_id = posts.author_id
            AND status = 'active'
          )
        )
      )
    )
  );

CREATE POLICY "Users can view likes on visible comments"
  ON likes FOR SELECT
  USING (
    target_type = 'comment'
    AND EXISTS (
      SELECT 1 FROM comments
      JOIN posts ON posts.id = comments.post_id
      WHERE comments.id = likes.target_id
      AND (
        posts.visibility = 'public'
        OR posts.author_id = auth.uid()
        OR (
          posts.visibility = 'followers'
          AND EXISTS (
            SELECT 1 FROM follows
            WHERE follower_id = auth.uid()
            AND following_id = posts.author_id
            AND status = 'active'
          )
        )
      )
    )
  );

-- Users can create likes
CREATE POLICY "Users can create likes"
  ON likes FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can delete own likes
CREATE POLICY "Users can delete own likes"
  ON likes FOR DELETE
  USING (user_id = auth.uid());

-- Admins can manage all likes
CREATE POLICY "Admins can manage all likes"
  ON likes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND staff_role IN ('admin', 'super_admin')
    )
  );

-- Function to get like count for a target
CREATE OR REPLACE FUNCTION get_like_count(target_type TEXT, target_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM likes WHERE likes.target_type = $1 AND likes.target_id = $2);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user liked a target
CREATE OR REPLACE FUNCTION has_user_liked(user_uuid UUID, target_type TEXT, target_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM likes
    WHERE likes.user_id = user_uuid
    AND likes.target_type = $2
    AND likes.target_id = $3
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
