-- Migration: Honor Court System
-- Description: System for handling disputes and honor code violations

-- Case type enum
CREATE TYPE "public"."honor_case_type" AS ENUM(
  'dispute',       -- Суперечка між членами
  'violation',     -- Порушення Кодексу Честі
  'reputation',    -- Захист репутації
  'appeal',        -- Апеляція на рішення
  'complaint'      -- Скарга на дії члена/керівництва
);

-- Case status enum
CREATE TYPE "public"."honor_case_status" AS ENUM(
  'submitted',      -- Подано
  'under_review',   -- На розгляді (попередня оцінка)
  'accepted',       -- Прийнято до розгляду
  'mediation',      -- Медіація (спроба примирення)
  'hearing',        -- Слухання
  'deliberation',   -- Нарада суддів
  'resolved',       -- Вирішено
  'closed',         -- Закрито (без рішення)
  'appealed',       -- Оскаржено
  'rejected'        -- Відхилено (не підлягає розгляду)
);

-- Sanction type enum
CREATE TYPE "public"."sanction_type" AS ENUM(
  'warning',        -- Попередження
  'reprimand',      -- Догана
  'suspension',     -- Тимчасове призупинення членства
  'demotion',       -- Пониження статусу
  'expulsion',      -- Виключення з організації
  'restoration',    -- Відновлення честі (для захисту репутації)
  'none'            -- Без санкцій (виправдання)
);

-- Honor Court cases
CREATE TABLE honor_court_cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_number varchar(20) NOT NULL UNIQUE,  -- Format: HC-2024-0001

  -- Case type and status
  case_type honor_case_type NOT NULL,
  status honor_case_status DEFAULT 'submitted',
  priority varchar(20) DEFAULT 'normal',  -- low, normal, high, urgent

  -- Parties involved
  complainant_id uuid REFERENCES users(id),  -- Person who filed the case
  respondent_id uuid REFERENCES users(id),   -- Person the case is against

  -- Case details
  title varchar(255) NOT NULL,
  description text NOT NULL,
  facts text,                -- Established facts

  -- Evidence
  evidence jsonb DEFAULT '[]',  -- Array of { type, url, description, submitted_by, submitted_at }

  -- Assignment
  assigned_judges jsonb DEFAULT '[]',  -- Array of user_ids
  lead_judge_id uuid REFERENCES users(id),

  -- Related cases
  parent_case_id uuid REFERENCES honor_court_cases(id),  -- For appeals
  related_cases jsonb DEFAULT '[]',  -- Array of case_ids

  -- Timeline
  submitted_at timestamp DEFAULT now(),
  accepted_at timestamp,
  hearing_date timestamp,
  hearing_location text,
  resolved_at timestamp,

  -- Decision
  decision text,
  decision_summary varchar(500),
  sanction_type sanction_type,
  sanction_details text,
  sanction_duration_days integer,  -- For suspensions

  -- Voting (for panel decisions)
  votes_for integer DEFAULT 0,
  votes_against integer DEFAULT 0,
  votes_abstain integer DEFAULT 0,

  -- Visibility
  is_public boolean DEFAULT false,  -- Whether decision is public
  anonymized boolean DEFAULT false, -- Whether to anonymize parties in public view

  -- Metadata
  created_at timestamp DEFAULT now() NOT NULL,
  updated_at timestamp DEFAULT now() NOT NULL,
  created_by uuid REFERENCES users(id)
);

-- Case notes and history
CREATE TABLE honor_court_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES honor_court_cases(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES users(id),

  -- Note content
  content text NOT NULL,
  note_type varchar(50) DEFAULT 'general',  -- general, internal, decision, mediation

  -- Visibility
  is_internal boolean DEFAULT false,  -- Only visible to judges

  -- Attachments
  attachments jsonb DEFAULT '[]',

  created_at timestamp DEFAULT now() NOT NULL
);

-- Case participants (witnesses, representatives)
CREATE TABLE honor_court_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES honor_court_cases(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id),  -- NULL for external participants

  -- Role in case
  role varchar(50) NOT NULL,  -- witness, representative, expert
  party varchar(20),  -- complainant, respondent, neutral

  -- For external participants
  external_name varchar(255),
  external_contact text,

  -- Status
  invited_at timestamp DEFAULT now(),
  confirmed_at timestamp,
  declined_at timestamp,

  notes text
);

-- Indexes
CREATE INDEX honor_cases_status_idx ON honor_court_cases(status);
CREATE INDEX honor_cases_type_idx ON honor_court_cases(case_type);
CREATE INDEX honor_cases_complainant_idx ON honor_court_cases(complainant_id);
CREATE INDEX honor_cases_respondent_idx ON honor_court_cases(respondent_id);
CREATE INDEX honor_cases_lead_judge_idx ON honor_court_cases(lead_judge_id);
CREATE INDEX honor_cases_submitted_idx ON honor_court_cases(submitted_at);
CREATE INDEX honor_cases_number_idx ON honor_court_cases(case_number);

CREATE INDEX honor_notes_case_idx ON honor_court_notes(case_id);
CREATE INDEX honor_notes_author_idx ON honor_court_notes(author_id);

CREATE INDEX honor_participants_case_idx ON honor_court_participants(case_id);
CREATE INDEX honor_participants_user_idx ON honor_court_participants(user_id);

-- RLS policies
ALTER TABLE honor_court_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE honor_court_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE honor_court_participants ENABLE ROW LEVEL SECURITY;

-- Public can view resolved public cases
CREATE POLICY "View public resolved cases"
  ON honor_court_cases FOR SELECT
  USING (is_public = true AND status IN ('resolved', 'closed'));

-- Function to generate case number
CREATE OR REPLACE FUNCTION generate_case_number()
RETURNS TRIGGER AS $$
DECLARE
  year_prefix text;
  next_number integer;
BEGIN
  year_prefix := 'HC-' || EXTRACT(YEAR FROM now())::text || '-';

  SELECT COALESCE(MAX(SUBSTRING(case_number FROM 9)::integer), 0) + 1
  INTO next_number
  FROM honor_court_cases
  WHERE case_number LIKE year_prefix || '%';

  NEW.case_number := year_prefix || LPAD(next_number::text, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_case_number
  BEFORE INSERT ON honor_court_cases
  FOR EACH ROW
  WHEN (NEW.case_number IS NULL)
  EXECUTE FUNCTION generate_case_number();

-- Comments
COMMENT ON TABLE honor_court_cases IS 'Honor Court cases for disputes and violations';
COMMENT ON TABLE honor_court_notes IS 'Notes and history for Honor Court cases';
COMMENT ON TABLE honor_court_participants IS 'Participants in Honor Court cases (witnesses, representatives)';
