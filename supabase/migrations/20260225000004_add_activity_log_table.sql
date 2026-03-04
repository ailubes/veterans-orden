-- Migration: Add activity_log table for feed aggregation
-- Created: 2026-02-25

CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN (
    'post_created', 'post_liked', 'comment_created',
    'event_rsvp', 'task_completed', 'vote_cast',
    'followed_user', 'profile_updated', 'achievement_earned'
  )),
  target_type TEXT, -- 'post', 'user', 'event', etc.
  target_id UUID,
  metadata JSONB, -- Additional context
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_activity_log_actor ON activity_log(actor_id, created_at DESC);
CREATE INDEX idx_activity_log_created ON activity_log(created_at DESC);
CREATE INDEX idx_activity_log_type ON activity_log(activity_type);
CREATE INDEX idx_activity_log_target ON activity_log(target_type, target_id);

-- Enable RLS
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for activity_log

-- Users can view their own activity
CREATE POLICY "Users can view own activity"
  ON activity_log FOR SELECT
  USING (actor_id = auth.uid());

-- Users can view activity from people they follow (for feed)
CREATE POLICY "Users can view followed users activity"
  ON activity_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM follows
      WHERE follower_id = auth.uid()
      AND following_id = actor_id
      AND status = 'active'
    )
  );

-- Users can view public activities (posts created, etc.)
CREATE POLICY "Users can view public activities"
  ON activity_log FOR SELECT
  USING (
    activity_type IN ('post_created', 'achievement_earned')
    AND EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = target_id
      AND posts.visibility = 'public'
    )
  );

-- System can insert activity log entries
CREATE POLICY "System can insert activity"
  ON activity_log FOR INSERT
  WITH CHECK (true);

-- Users cannot update or delete activity log (immutable)

-- Admins can view all activity
CREATE POLICY "Admins can view all activity"
  ON activity_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND staff_role IN ('admin', 'super_admin')
    )
  );

-- Function to log activity (can be called from triggers or application)
CREATE OR REPLACE FUNCTION log_activity(
  p_actor_id UUID,
  p_activity_type TEXT,
  p_target_type TEXT DEFAULT NULL,
  p_target_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_activity_id UUID;
BEGIN
  INSERT INTO activity_log (actor_id, activity_type, target_type, target_id, metadata)
  VALUES (p_actor_id, p_activity_type, p_target_type, p_target_id, p_metadata)
  RETURNING id INTO v_activity_id;

  RETURN v_activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function to auto-log post creation
CREATE OR REPLACE FUNCTION log_post_created()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM log_activity(
    NEW.author_id,
    'post_created',
    'post',
    NEW.id,
    jsonb_build_object('visibility', NEW.visibility)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_post_created
  AFTER INSERT ON posts
  FOR EACH ROW
  EXECUTE FUNCTION log_post_created();

-- Trigger function to auto-log follow creation
CREATE OR REPLACE FUNCTION log_follow_created()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM log_activity(
    NEW.follower_id,
    'followed_user',
    'user',
    NEW.following_id,
    NULL
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_follow_created
  AFTER INSERT ON follows
  FOR EACH ROW
  WHEN (NEW.status = 'active')
  EXECUTE FUNCTION log_follow_created();
