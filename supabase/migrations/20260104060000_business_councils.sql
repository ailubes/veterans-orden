-- Migration: Business Councils
-- Description: Regional and national business councils for veterans

-- Council scope enum (reuse org_role_scope if exists)
-- Already created in organizational_roles migration

-- Business councils
CREATE TABLE business_councils (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(255) NOT NULL,
  slug varchar(100) NOT NULL UNIQUE,

  -- Scope
  scope org_role_scope NOT NULL DEFAULT 'national',
  commandery_id uuid REFERENCES commanderies(id),  -- NULL for national council

  -- Description
  description text,
  mission text,
  focus_areas business_expertise[] DEFAULT '{}',

  -- Leadership
  head_id uuid REFERENCES users(id),
  deputy_head_id uuid REFERENCES users(id),
  secretary_id uuid REFERENCES users(id),

  -- Status
  is_active boolean DEFAULT true,
  founded_at timestamp DEFAULT now(),

  -- Stats (denormalized for performance)
  member_count integer DEFAULT 0,
  active_initiatives integer DEFAULT 0,

  -- Meetings
  meeting_frequency varchar(50),  -- weekly, biweekly, monthly, quarterly
  next_meeting_date timestamp,
  meeting_location text,
  meeting_url text,  -- For online meetings

  -- Contact
  email varchar(255),
  phone varchar(20),

  -- Timestamps
  created_at timestamp DEFAULT now() NOT NULL,
  updated_at timestamp DEFAULT now() NOT NULL
);

-- Council membership
CREATE TABLE business_council_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  council_id uuid NOT NULL REFERENCES business_councils(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Role in council
  role varchar(50) DEFAULT 'member',  -- head, deputy, secretary, member, advisor

  -- Expertise they bring
  expertise business_expertise[],
  contribution_areas text,  -- What they specifically contribute

  -- Membership period
  joined_at timestamp DEFAULT now(),
  left_at timestamp,
  is_active boolean DEFAULT true,

  -- Notes
  notes text,
  achievements text,

  -- Timestamps
  created_at timestamp DEFAULT now() NOT NULL,

  CONSTRAINT unique_council_member UNIQUE (council_id, user_id)
);

-- Council meetings
CREATE TABLE business_council_meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  council_id uuid NOT NULL REFERENCES business_councils(id) ON DELETE CASCADE,

  -- Meeting details
  title varchar(255) NOT NULL,
  description text,
  meeting_number integer,  -- Sequential number for this council

  -- Schedule
  scheduled_date timestamp NOT NULL,
  duration_minutes integer DEFAULT 90,
  actual_start timestamp,
  actual_end timestamp,

  -- Location
  is_online boolean DEFAULT true,
  meeting_url text,
  location text,

  -- Content
  agenda text,
  minutes text,
  key_decisions jsonb DEFAULT '[]',  -- Array of { decision, voted_for, voted_against }

  -- Attendance
  expected_attendees jsonb DEFAULT '[]',  -- Array of user_ids
  actual_attendees jsonb DEFAULT '[]',    -- Array of { user_id, arrived_at, left_at }

  -- Status
  status varchar(20) DEFAULT 'scheduled',  -- scheduled, in_progress, completed, cancelled
  cancelled_reason text,

  -- Follow-up
  action_items jsonb DEFAULT '[]',  -- Array of { item, responsible_id, due_date, completed }
  next_meeting_topics text,

  -- Timestamps
  created_at timestamp DEFAULT now() NOT NULL,
  updated_at timestamp DEFAULT now() NOT NULL,
  created_by uuid REFERENCES users(id)
);

-- Council initiatives (projects/programs)
CREATE TABLE council_initiatives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  council_id uuid NOT NULL REFERENCES business_councils(id) ON DELETE CASCADE,

  -- Initiative details
  title varchar(255) NOT NULL,
  description text NOT NULL,
  objectives text,

  -- Category
  focus_area business_expertise,
  initiative_type varchar(50),  -- program, project, event, partnership

  -- Leadership
  lead_id uuid REFERENCES users(id),
  team_members jsonb DEFAULT '[]',  -- Array of user_ids

  -- Timeline
  start_date timestamp,
  target_end_date timestamp,
  actual_end_date timestamp,

  -- Status
  status varchar(20) DEFAULT 'planning',  -- planning, active, completed, cancelled, on_hold

  -- Metrics
  target_participants integer,
  actual_participants integer,
  budget decimal(12,2),
  spent decimal(12,2),

  -- Outcomes
  outcomes text,
  lessons_learned text,

  -- Timestamps
  created_at timestamp DEFAULT now() NOT NULL,
  updated_at timestamp DEFAULT now() NOT NULL
);

-- Indexes
CREATE INDEX councils_scope_idx ON business_councils(scope);
CREATE INDEX councils_commandery_idx ON business_councils(commandery_id);
CREATE INDEX councils_active_idx ON business_councils(is_active) WHERE is_active = true;
CREATE INDEX councils_slug_idx ON business_councils(slug);

CREATE INDEX council_members_council_idx ON business_council_members(council_id);
CREATE INDEX council_members_user_idx ON business_council_members(user_id);
CREATE INDEX council_members_active_idx ON business_council_members(is_active) WHERE is_active = true;

CREATE INDEX council_meetings_council_idx ON business_council_meetings(council_id);
CREATE INDEX council_meetings_date_idx ON business_council_meetings(scheduled_date);
CREATE INDEX council_meetings_status_idx ON business_council_meetings(status);

CREATE INDEX initiatives_council_idx ON council_initiatives(council_id);
CREATE INDEX initiatives_status_idx ON council_initiatives(status);
CREATE INDEX initiatives_lead_idx ON council_initiatives(lead_id);

-- RLS policies
ALTER TABLE business_councils ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_council_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_council_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE council_initiatives ENABLE ROW LEVEL SECURITY;

-- Anyone can view active councils
CREATE POLICY "View active councils"
  ON business_councils FOR SELECT
  USING (is_active = true);

-- Members can view their council's meetings
CREATE POLICY "Members view council meetings"
  ON business_council_meetings FOR SELECT
  USING (
    council_id IN (
      SELECT council_id FROM business_council_members
      WHERE user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
      AND is_active = true
    )
  );

-- Update member count trigger
CREATE OR REPLACE FUNCTION update_council_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE business_councils
    SET member_count = (
      SELECT COUNT(*) FROM business_council_members
      WHERE council_id = NEW.council_id AND is_active = true
    )
    WHERE id = NEW.council_id;
  END IF;

  IF TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN
    UPDATE business_councils
    SET member_count = (
      SELECT COUNT(*) FROM business_council_members
      WHERE council_id = COALESCE(OLD.council_id, NEW.council_id) AND is_active = true
    )
    WHERE id = COALESCE(OLD.council_id, NEW.council_id);
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_council_members_count
  AFTER INSERT OR UPDATE OR DELETE ON business_council_members
  FOR EACH ROW
  EXECUTE FUNCTION update_council_member_count();

-- Comments
COMMENT ON TABLE business_councils IS 'Regional and national business councils';
COMMENT ON TABLE business_council_members IS 'Council membership records';
COMMENT ON TABLE business_council_meetings IS 'Council meeting records';
COMMENT ON TABLE council_initiatives IS 'Council projects and programs';
