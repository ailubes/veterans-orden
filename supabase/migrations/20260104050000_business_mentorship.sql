-- Migration: Business Mentorship System
-- Description: Full mentorship system for veteran business support

-- Business expertise areas
CREATE TYPE "public"."business_expertise" AS ENUM(
  'startup',        -- Стартапи
  'ecommerce',      -- E-commerce
  'manufacturing',  -- Виробництво
  'services',       -- Послуги
  'agriculture',    -- Сільське господарство
  'it',             -- IT та технології
  'finance',        -- Фінанси
  'marketing',      -- Маркетинг
  'legal',          -- Юридичні питання
  'hr',             -- HR та управління персоналом
  'logistics',      -- Логістика
  'construction',   -- Будівництво
  'hospitality',    -- Готельно-ресторанний бізнес
  'education',      -- Освіта
  'healthcare',     -- Охорона здоров'я
  'retail',         -- Роздрібна торгівля
  'real_estate',    -- Нерухомість
  'consulting',     -- Консалтинг
  'media',          -- Медіа та реклама
  'other'           -- Інше
);

-- Business stage enum
CREATE TYPE "public"."business_stage" AS ENUM(
  'idea',       -- Ідея
  'planning',   -- Планування
  'started',    -- Запущено
  'growing',    -- Зростання
  'scaling',    -- Масштабування
  'mature'      -- Зрілий бізнес
);

-- Mentorship request status
CREATE TYPE "public"."mentorship_request_status" AS ENUM(
  'pending',     -- Очікує на розгляд
  'matched',     -- Знайдено ментора
  'accepted',    -- Ментор прийняв
  'rejected',    -- Ментор відхилив
  'cancelled',   -- Скасовано заявником
  'completed'    -- Успішно завершено
);

-- Session status
CREATE TYPE "public"."mentorship_session_status" AS ENUM(
  'scheduled',   -- Заплановано
  'confirmed',   -- Підтверджено
  'in_progress', -- Триває
  'completed',   -- Завершено
  'cancelled',   -- Скасовано
  'no_show'      -- Не з'явився
);

-- Business mentor profiles
CREATE TABLE business_mentors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,

  -- Profile
  bio text,
  headline varchar(255),  -- Short tagline
  expertise business_expertise[] NOT NULL,
  experience_years integer,

  -- Business background
  company_name varchar(255),
  company_role varchar(100),
  company_website text,
  linkedin_url text,
  portfolio_url text,

  -- Availability
  is_active boolean DEFAULT true,
  max_mentees integer DEFAULT 3,
  current_mentees_count integer DEFAULT 0,
  preferred_format varchar(50) DEFAULT 'both',  -- online, offline, both
  preferred_language varchar(5) DEFAULT 'uk',
  preferred_session_duration integer DEFAULT 60,  -- minutes

  -- Location preferences (for offline)
  available_cities text[],
  can_travel boolean DEFAULT false,

  -- Stats
  total_sessions integer DEFAULT 0,
  total_mentees integer DEFAULT 0,
  total_hours decimal(10,2) DEFAULT 0,
  rating_sum integer DEFAULT 0,
  rating_count integer DEFAULT 0,

  -- Verification
  verified boolean DEFAULT false,
  verified_by uuid REFERENCES users(id),
  verified_at timestamp,
  verification_notes text,

  -- Timestamps
  created_at timestamp DEFAULT now() NOT NULL,
  updated_at timestamp DEFAULT now() NOT NULL
);

-- Mentor availability schedule
CREATE TABLE mentor_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id uuid NOT NULL REFERENCES business_mentors(id) ON DELETE CASCADE,

  -- Schedule
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),  -- 0=Sunday
  start_time time NOT NULL,
  end_time time NOT NULL,
  timezone varchar(50) DEFAULT 'Europe/Kyiv',

  -- Type
  is_online boolean DEFAULT true,
  location text,  -- For offline sessions

  -- Status
  is_active boolean DEFAULT true,

  created_at timestamp DEFAULT now() NOT NULL,

  CONSTRAINT valid_time_range CHECK (start_time < end_time)
);

-- Mentorship requests
CREATE TABLE mentorship_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mentee_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- What they're looking for
  preferred_expertise business_expertise[] NOT NULL,
  preferred_format varchar(50) DEFAULT 'both',

  -- Business info
  business_stage business_stage,
  business_name varchar(255),
  business_description text,
  industry varchar(100),
  goals text NOT NULL,  -- What they want to achieve
  challenges text,       -- Current challenges
  timeline varchar(100), -- Expected mentorship duration

  -- Matching
  status mentorship_request_status DEFAULT 'pending',
  matched_mentor_id uuid REFERENCES business_mentors(id),
  matched_at timestamp,
  match_score integer,  -- Algorithm matching score
  match_notes text,     -- Why this match was made

  -- Response
  accepted_at timestamp,
  rejected_at timestamp,
  rejection_reason text,

  -- Timestamps
  created_at timestamp DEFAULT now() NOT NULL,
  updated_at timestamp DEFAULT now() NOT NULL
);

-- Active mentorships (relationships)
CREATE TABLE mentorships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id uuid NOT NULL REFERENCES business_mentors(id) ON DELETE CASCADE,
  mentee_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  request_id uuid REFERENCES mentorship_requests(id),

  -- Status
  status varchar(20) DEFAULT 'active',  -- active, paused, completed, terminated

  -- Dates
  started_at timestamp DEFAULT now(),
  paused_at timestamp,
  ended_at timestamp,
  expected_end_date timestamp,

  -- Goals and notes
  goals jsonb DEFAULT '[]',  -- Array of { goal, target_date, completed }
  initial_assessment text,
  final_summary text,

  -- Progress tracking
  sessions_completed integer DEFAULT 0,
  next_session_date timestamp,

  -- Timestamps
  created_at timestamp DEFAULT now() NOT NULL,
  updated_at timestamp DEFAULT now() NOT NULL,

  CONSTRAINT unique_active_mentorship UNIQUE (mentor_id, mentee_id)
);

-- Mentorship sessions
CREATE TABLE mentorship_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mentorship_id uuid NOT NULL REFERENCES mentorships(id) ON DELETE CASCADE,

  -- Scheduling
  scheduled_date timestamp NOT NULL,
  duration_minutes integer DEFAULT 60,
  actual_duration_minutes integer,

  -- Location
  is_online boolean DEFAULT true,
  meeting_url text,
  location text,

  -- Status
  status mentorship_session_status DEFAULT 'scheduled',
  completed_at timestamp,
  cancelled_at timestamp,
  cancellation_reason text,
  cancelled_by uuid REFERENCES users(id),

  -- Content
  agenda text,
  notes text,  -- Session notes (visible to both)
  mentor_private_notes text,  -- Private mentor notes
  action_items jsonb DEFAULT '[]',  -- Array of { item, assigned_to, due_date, completed }

  -- Feedback
  mentee_rating integer CHECK (mentee_rating >= 1 AND mentee_rating <= 5),
  mentee_feedback text,
  mentor_rating integer CHECK (mentor_rating >= 1 AND mentor_rating <= 5),  -- Mentee's engagement
  mentor_feedback text,

  -- Timestamps
  created_at timestamp DEFAULT now() NOT NULL,
  updated_at timestamp DEFAULT now() NOT NULL
);

-- Mentee progress milestones
CREATE TABLE mentee_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mentorship_id uuid NOT NULL REFERENCES mentorships(id) ON DELETE CASCADE,

  -- Milestone details
  milestone_type varchar(50) NOT NULL,  -- business_plan, launch, revenue, etc.
  title varchar(255) NOT NULL,
  description text,

  -- Tracking
  target_date timestamp,
  completed_at timestamp,
  evidence_url text,
  evidence_description text,

  -- Verification
  verified_by_mentor boolean DEFAULT false,
  mentor_notes text,

  -- Timestamps
  created_at timestamp DEFAULT now() NOT NULL,
  updated_at timestamp DEFAULT now() NOT NULL
);

-- Indexes
CREATE INDEX business_mentors_user_idx ON business_mentors(user_id);
CREATE INDEX business_mentors_active_idx ON business_mentors(is_active) WHERE is_active = true;
CREATE INDEX business_mentors_verified_idx ON business_mentors(verified) WHERE verified = true;
CREATE INDEX business_mentors_expertise_idx ON business_mentors USING gin(expertise);

CREATE INDEX mentor_availability_mentor_idx ON mentor_availability(mentor_id);
CREATE INDEX mentor_availability_day_idx ON mentor_availability(day_of_week);

CREATE INDEX mentorship_requests_mentee_idx ON mentorship_requests(mentee_id);
CREATE INDEX mentorship_requests_status_idx ON mentorship_requests(status);
CREATE INDEX mentorship_requests_mentor_idx ON mentorship_requests(matched_mentor_id);

CREATE INDEX mentorships_mentor_idx ON mentorships(mentor_id);
CREATE INDEX mentorships_mentee_idx ON mentorships(mentee_id);
CREATE INDEX mentorships_status_idx ON mentorships(status);

CREATE INDEX sessions_mentorship_idx ON mentorship_sessions(mentorship_id);
CREATE INDEX sessions_date_idx ON mentorship_sessions(scheduled_date);
CREATE INDEX sessions_status_idx ON mentorship_sessions(status);

CREATE INDEX progress_mentorship_idx ON mentee_progress(mentorship_id);
CREATE INDEX progress_completed_idx ON mentee_progress(completed_at) WHERE completed_at IS NOT NULL;

-- RLS policies
ALTER TABLE business_mentors ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentor_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentorship_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentorships ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentorship_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentee_progress ENABLE ROW LEVEL SECURITY;

-- Anyone can view active verified mentors
CREATE POLICY "View active mentors"
  ON business_mentors FOR SELECT
  USING (is_active = true AND verified = true);

-- Comments
COMMENT ON TABLE business_mentors IS 'Business mentor profiles';
COMMENT ON TABLE mentor_availability IS 'Weekly availability schedule for mentors';
COMMENT ON TABLE mentorship_requests IS 'Requests for mentorship from mentees';
COMMENT ON TABLE mentorships IS 'Active mentorship relationships';
COMMENT ON TABLE mentorship_sessions IS 'Individual mentorship session records';
COMMENT ON TABLE mentee_progress IS 'Progress milestones achieved by mentees';
