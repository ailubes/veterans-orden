-- Migration: Participation Tracking
-- Description: Track member participation for role progression

-- Activity type enum
CREATE TYPE "public"."participation_activity_type" AS ENUM(
  'event_attendance',      -- Attended an event
  'event_organization',    -- Organized an event
  'task_completion',       -- Completed a task
  'vote_cast',             -- Cast a vote
  'mentorship_session',    -- Participated in mentorship
  'mentorship_given',      -- Provided mentorship
  'volunteer_hours',       -- Volunteer work
  'council_meeting',       -- Attended council meeting
  'training_completion',   -- Completed training
  'content_creation',      -- Created content (articles, etc.)
  'recruitment',           -- Recruited new member
  'fundraising',           -- Participated in fundraising
  'community_service',     -- Community service
  'honor_court_service',   -- Served on Honor Court
  'leadership_role',       -- Active in leadership role
  'other'                  -- Other activities
);

-- Participation records
CREATE TABLE participation_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Activity details
  activity_type participation_activity_type NOT NULL,
  activity_id uuid,  -- Reference to the source (event_id, task_id, etc.)
  activity_table varchar(50),  -- Source table name

  -- Description
  title varchar(255),
  description text,

  -- Metrics
  points_earned integer DEFAULT 0,
  hours_contributed decimal(5,2),
  impact_score integer,  -- Optional quality/impact score

  -- Verification
  verified boolean DEFAULT false,
  verified_by uuid REFERENCES users(id),
  verified_at timestamp,
  verification_method varchar(50),  -- auto, manual, photo, attendance

  -- Evidence
  evidence_url text,
  evidence_notes text,

  -- Commandery context
  commandery_id uuid REFERENCES commanderies(id),

  -- Date of activity
  activity_date timestamp NOT NULL,

  -- Timestamps
  created_at timestamp DEFAULT now() NOT NULL,
  created_by uuid REFERENCES users(id)
);

-- Aggregated participation stats per user
CREATE TABLE participation_stats (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,

  -- Activity counts
  total_events_attended integer DEFAULT 0,
  total_events_organized integer DEFAULT 0,
  total_tasks_completed integer DEFAULT 0,
  total_votes_cast integer DEFAULT 0,
  total_mentorship_sessions integer DEFAULT 0,
  total_mentorship_given integer DEFAULT 0,
  total_volunteer_activities integer DEFAULT 0,
  total_council_meetings integer DEFAULT 0,
  total_trainings_completed integer DEFAULT 0,

  -- Time metrics
  total_hours_volunteered decimal(10,2) DEFAULT 0,
  total_mentorship_hours decimal(10,2) DEFAULT 0,

  -- Points
  total_participation_points integer DEFAULT 0,
  current_year_points integer DEFAULT 0,
  points_this_month integer DEFAULT 0,

  -- Streaks
  current_activity_streak integer DEFAULT 0,
  longest_activity_streak integer DEFAULT 0,
  last_activity_date timestamp,

  -- Rankings (updated periodically)
  yearly_rank integer,
  overall_rank integer,
  commandery_rank integer,

  -- Level/tier based on participation
  participation_level integer DEFAULT 1,
  next_level_points integer,

  -- Timestamps
  updated_at timestamp DEFAULT now() NOT NULL,
  last_calculated_at timestamp DEFAULT now()
);

-- Participation milestones (achievements based on participation)
CREATE TABLE participation_milestones (
  id varchar(50) PRIMARY KEY,
  name_uk varchar(100) NOT NULL,
  name_en varchar(100),
  description_uk text,
  description_en text,

  -- Requirements
  activity_type participation_activity_type,
  required_count integer,
  required_points integer,
  required_hours decimal(10,2),

  -- Rewards
  points_reward integer DEFAULT 0,
  badge_id varchar(50) REFERENCES badges(id),

  -- Display
  icon varchar(50),
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true
);

-- User milestone achievements
CREATE TABLE user_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  milestone_id varchar(50) NOT NULL REFERENCES participation_milestones(id),

  achieved_at timestamp DEFAULT now() NOT NULL,
  points_awarded integer DEFAULT 0,

  CONSTRAINT unique_user_milestone UNIQUE (user_id, milestone_id)
);

-- Indexes
CREATE INDEX participation_user_idx ON participation_records(user_id);
CREATE INDEX participation_type_idx ON participation_records(activity_type);
CREATE INDEX participation_date_idx ON participation_records(activity_date);
CREATE INDEX participation_verified_idx ON participation_records(verified) WHERE verified = true;
CREATE INDEX participation_commandery_idx ON participation_records(commandery_id);
CREATE INDEX participation_activity_ref_idx ON participation_records(activity_table, activity_id);

CREATE INDEX participation_stats_level_idx ON participation_stats(participation_level);
CREATE INDEX participation_stats_points_idx ON participation_stats(total_participation_points DESC);
CREATE INDEX participation_stats_yearly_idx ON participation_stats(current_year_points DESC);

CREATE INDEX user_milestones_user_idx ON user_milestones(user_id);
CREATE INDEX user_milestones_milestone_idx ON user_milestones(milestone_id);

-- Function to update participation stats
CREATE OR REPLACE FUNCTION update_participation_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Create stats record if it doesn't exist
  INSERT INTO participation_stats (user_id)
  VALUES (NEW.user_id)
  ON CONFLICT (user_id) DO NOTHING;

  -- Update the stats
  UPDATE participation_stats
  SET
    total_events_attended = total_events_attended +
      CASE WHEN NEW.activity_type = 'event_attendance' AND NEW.verified THEN 1 ELSE 0 END,
    total_events_organized = total_events_organized +
      CASE WHEN NEW.activity_type = 'event_organization' AND NEW.verified THEN 1 ELSE 0 END,
    total_tasks_completed = total_tasks_completed +
      CASE WHEN NEW.activity_type = 'task_completion' AND NEW.verified THEN 1 ELSE 0 END,
    total_votes_cast = total_votes_cast +
      CASE WHEN NEW.activity_type = 'vote_cast' THEN 1 ELSE 0 END,
    total_hours_volunteered = total_hours_volunteered + COALESCE(NEW.hours_contributed, 0),
    total_participation_points = total_participation_points + COALESCE(NEW.points_earned, 0),
    current_year_points = current_year_points +
      CASE WHEN EXTRACT(YEAR FROM NEW.activity_date) = EXTRACT(YEAR FROM now())
           THEN COALESCE(NEW.points_earned, 0) ELSE 0 END,
    last_activity_date = GREATEST(last_activity_date, NEW.activity_date),
    updated_at = now()
  WHERE user_id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_stats_on_participation
  AFTER INSERT ON participation_records
  FOR EACH ROW
  EXECUTE FUNCTION update_participation_stats();

-- Seed some milestones
INSERT INTO participation_milestones (id, name_uk, name_en, activity_type, required_count, points_reward, display_order) VALUES
  ('first_event', 'Перша подія', 'First Event', 'event_attendance', 1, 10, 1),
  ('events_10', '10 подій', '10 Events', 'event_attendance', 10, 50, 2),
  ('events_50', '50 подій', '50 Events', 'event_attendance', 50, 200, 3),
  ('first_task', 'Перше завдання', 'First Task', 'task_completion', 1, 10, 4),
  ('tasks_25', '25 завдань', '25 Tasks', 'task_completion', 25, 100, 5),
  ('first_mentor_session', 'Перша менторська сесія', 'First Mentor Session', 'mentorship_session', 1, 20, 6),
  ('volunteer_10h', '10 годин волонтерства', '10 Volunteer Hours', 'volunteer_hours', 10, 50, 7),
  ('volunteer_100h', '100 годин волонтерства', '100 Volunteer Hours', 'volunteer_hours', 100, 500, 8);

-- RLS policies
ALTER TABLE participation_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE participation_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_milestones ENABLE ROW LEVEL SECURITY;

-- Users can view their own participation
CREATE POLICY "Users view own participation"
  ON participation_records FOR SELECT
  USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

-- Users can view their own stats
CREATE POLICY "Users view own stats"
  ON participation_stats FOR SELECT
  USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

-- Comments
COMMENT ON TABLE participation_records IS 'Individual participation activity records';
COMMENT ON TABLE participation_stats IS 'Aggregated participation statistics per user';
COMMENT ON TABLE participation_milestones IS 'Available participation-based achievements';
COMMENT ON TABLE user_milestones IS 'Milestones achieved by users';
