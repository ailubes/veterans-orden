-- Migration: Election Tiebreaker Support
-- Description: Support for elections with military rank as tiebreaker

-- Add election-specific fields to votes table
ALTER TABLE votes ADD COLUMN IF NOT EXISTS is_election boolean DEFAULT false;
ALTER TABLE votes ADD COLUMN IF NOT EXISTS position_type org_role_type;
ALTER TABLE votes ADD COLUMN IF NOT EXISTS commandery_scope uuid REFERENCES commanderies(id);
ALTER TABLE votes ADD COLUMN IF NOT EXISTS use_military_tiebreaker boolean DEFAULT true;
ALTER TABLE votes ADD COLUMN IF NOT EXISTS min_candidates integer DEFAULT 1;
ALTER TABLE votes ADD COLUMN IF NOT EXISTS max_winners integer DEFAULT 1;

-- Create index for elections
CREATE INDEX IF NOT EXISTS votes_election_idx ON votes(is_election) WHERE is_election = true;
CREATE INDEX IF NOT EXISTS votes_position_type_idx ON votes(position_type);

-- Election candidates table (extends vote_options for elections)
CREATE TABLE election_candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vote_id uuid NOT NULL REFERENCES votes(id) ON DELETE CASCADE,
  candidate_id uuid NOT NULL REFERENCES users(id),
  option_id uuid REFERENCES vote_options(id),  -- Link to vote option

  -- Candidate profile for this election
  platform_statement text,
  qualifications text,
  endorsements jsonb DEFAULT '[]',  -- Array of { endorser_id, statement }

  -- Military info for tiebreaker (cached from military_service)
  highest_military_rank military_rank,
  total_service_years decimal(4,2),
  combat_experience boolean DEFAULT false,
  rank_numeric integer,  -- Numeric value for comparison (higher = better)

  -- Nomination
  nominated_by uuid REFERENCES users(id),
  nominated_at timestamp DEFAULT now(),
  accepted_nomination boolean DEFAULT false,
  accepted_at timestamp,
  declined_reason text,

  -- Results (populated after election closes)
  final_vote_count integer DEFAULT 0,
  final_percentage decimal(5,2),
  final_rank integer,  -- Position in results (1 = winner)
  is_elected boolean DEFAULT false,
  tied_with jsonb DEFAULT '[]',  -- Array of candidate_ids they tied with
  won_by_tiebreaker boolean DEFAULT false,

  -- Timestamps
  created_at timestamp DEFAULT now() NOT NULL,
  updated_at timestamp DEFAULT now() NOT NULL,

  CONSTRAINT unique_candidate_per_election UNIQUE (vote_id, candidate_id)
);

-- Function to calculate rank numeric value (for tiebreaker comparison)
CREATE OR REPLACE FUNCTION get_rank_numeric(rank military_rank)
RETURNS integer AS $$
BEGIN
  RETURN CASE rank
    WHEN 'soldier' THEN 1
    WHEN 'senior_soldier' THEN 2
    WHEN 'junior_sergeant' THEN 3
    WHEN 'sergeant' THEN 4
    WHEN 'senior_sergeant' THEN 5
    WHEN 'master_sergeant' THEN 6
    WHEN 'staff_sergeant' THEN 7
    WHEN 'chief_sergeant' THEN 8
    WHEN 'junior_lieutenant' THEN 10
    WHEN 'lieutenant' THEN 11
    WHEN 'senior_lieutenant' THEN 12
    WHEN 'captain' THEN 13
    WHEN 'major' THEN 14
    WHEN 'lieutenant_colonel' THEN 15
    WHEN 'colonel' THEN 16
    WHEN 'brigadier_general' THEN 17
    WHEN 'major_general' THEN 18
    WHEN 'lieutenant_general' THEN 19
    WHEN 'general' THEN 20
    WHEN 'general_army' THEN 21
    ELSE 0
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to populate candidate military info from military_service table
CREATE OR REPLACE FUNCTION populate_candidate_military_info()
RETURNS TRIGGER AS $$
DECLARE
  service_record RECORD;
BEGIN
  -- Get highest rank from verified military service records
  SELECT
    ms.rank,
    get_rank_numeric(ms.rank) as rank_numeric,
    SUM(
      EXTRACT(YEAR FROM AGE(COALESCE(ms.service_end, CURRENT_DATE), ms.service_start))
    ) as total_years,
    BOOL_OR(ms.combat_experience) as has_combat
  INTO service_record
  FROM military_service ms
  WHERE ms.user_id = NEW.candidate_id
    AND ms.verified = true
  GROUP BY ms.rank
  ORDER BY get_rank_numeric(ms.rank) DESC
  LIMIT 1;

  IF service_record IS NOT NULL THEN
    NEW.highest_military_rank := service_record.rank;
    NEW.rank_numeric := service_record.rank_numeric;
    NEW.total_service_years := service_record.total_years;
    NEW.combat_experience := service_record.has_combat;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER populate_military_info
  BEFORE INSERT OR UPDATE ON election_candidates
  FOR EACH ROW
  EXECUTE FUNCTION populate_candidate_military_info();

-- Function to resolve election ties using military rank
CREATE OR REPLACE FUNCTION resolve_election_ties(election_id uuid)
RETURNS void AS $$
DECLARE
  candidate RECORD;
  current_rank integer := 0;
  prev_votes integer := -1;
  prev_military_rank integer := -1;
  prev_service_years decimal := -1;
BEGIN
  -- Only process elections with tiebreaker enabled
  IF NOT (SELECT use_military_tiebreaker FROM votes WHERE id = election_id) THEN
    -- Just rank by votes
    UPDATE election_candidates
    SET final_rank = sub.row_rank
    FROM (
      SELECT id, ROW_NUMBER() OVER (ORDER BY final_vote_count DESC) as row_rank
      FROM election_candidates
      WHERE vote_id = election_id
    ) sub
    WHERE election_candidates.id = sub.id;
    RETURN;
  END IF;

  -- Rank with military tiebreaker
  FOR candidate IN
    SELECT id, final_vote_count, rank_numeric, total_service_years, combat_experience
    FROM election_candidates
    WHERE vote_id = election_id
    ORDER BY
      final_vote_count DESC,
      rank_numeric DESC NULLS LAST,
      total_service_years DESC NULLS LAST,
      combat_experience DESC
  LOOP
    -- Check if this is a different position than previous
    IF candidate.final_vote_count != prev_votes
       OR COALESCE(candidate.rank_numeric, 0) != COALESCE(prev_military_rank, 0)
       OR COALESCE(candidate.total_service_years, 0) != COALESCE(prev_service_years, 0) THEN
      current_rank := current_rank + 1;
    END IF;

    UPDATE election_candidates
    SET
      final_rank = current_rank,
      won_by_tiebreaker = (candidate.final_vote_count = prev_votes AND current_rank = 1)
    WHERE id = candidate.id;

    prev_votes := candidate.final_vote_count;
    prev_military_rank := candidate.rank_numeric;
    prev_service_years := candidate.total_service_years;
  END LOOP;

  -- Mark winners based on max_winners setting
  UPDATE election_candidates ec
  SET is_elected = true
  WHERE ec.vote_id = election_id
    AND ec.final_rank <= (SELECT max_winners FROM votes WHERE id = election_id);
END;
$$ LANGUAGE plpgsql;

-- Election nomination requests (for tracking self-nominations or nominations by others)
CREATE TABLE election_nominations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vote_id uuid NOT NULL REFERENCES votes(id) ON DELETE CASCADE,
  nominee_id uuid NOT NULL REFERENCES users(id),
  nominator_id uuid REFERENCES users(id),  -- NULL for self-nomination

  -- Nomination details
  is_self_nomination boolean DEFAULT false,
  nomination_statement text,
  endorsement_statement text,  -- From nominator

  -- Status
  status varchar(20) DEFAULT 'pending',  -- pending, accepted, declined, withdrawn
  response_at timestamp,
  response_notes text,

  -- Timestamps
  created_at timestamp DEFAULT now() NOT NULL,

  CONSTRAINT unique_nomination UNIQUE (vote_id, nominee_id, nominator_id)
);

-- Indexes
CREATE INDEX election_candidates_vote_idx ON election_candidates(vote_id);
CREATE INDEX election_candidates_user_idx ON election_candidates(candidate_id);
CREATE INDEX election_candidates_rank_idx ON election_candidates(final_rank);
CREATE INDEX election_candidates_elected_idx ON election_candidates(is_elected) WHERE is_elected = true;

CREATE INDEX election_nominations_vote_idx ON election_nominations(vote_id);
CREATE INDEX election_nominations_nominee_idx ON election_nominations(nominee_id);
CREATE INDEX election_nominations_status_idx ON election_nominations(status);

-- RLS policies
ALTER TABLE election_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE election_nominations ENABLE ROW LEVEL SECURITY;

-- Anyone can view candidates for active/closed elections
CREATE POLICY "View election candidates"
  ON election_candidates FOR SELECT
  USING (
    vote_id IN (
      SELECT id FROM votes
      WHERE status IN ('active', 'closed')
    )
  );

-- Users can view their own nominations
CREATE POLICY "View own nominations"
  ON election_nominations FOR SELECT
  USING (
    nominee_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
    OR nominator_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
  );

-- Comments
COMMENT ON TABLE election_candidates IS 'Candidates running in organizational elections';
COMMENT ON TABLE election_nominations IS 'Nomination requests for elections';
COMMENT ON COLUMN election_candidates.rank_numeric IS 'Numeric value of military rank for tiebreaker comparison';
COMMENT ON COLUMN election_candidates.won_by_tiebreaker IS 'Whether this candidate won due to military rank tiebreaker';
COMMENT ON FUNCTION resolve_election_ties IS 'Resolves election ties using military rank as tiebreaker';
