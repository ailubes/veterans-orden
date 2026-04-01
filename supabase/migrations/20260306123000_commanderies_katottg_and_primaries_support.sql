-- Commanderies: connect settlement address via KATOTTG
ALTER TABLE commanderies
  ADD COLUMN IF NOT EXISTS katottg_code varchar(19),
  ADD COLUMN IF NOT EXISTS settlement_name varchar(255),
  ADD COLUMN IF NOT EXISTS hromada_name varchar(255),
  ADD COLUMN IF NOT EXISTS raion_name varchar(255),
  ADD COLUMN IF NOT EXISTS oblast_name varchar(255),
  ADD COLUMN IF NOT EXISTS address text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'commanderies_katottg_code_katottg_code_fk'
  ) THEN
    ALTER TABLE commanderies
      ADD CONSTRAINT commanderies_katottg_code_katottg_code_fk
      FOREIGN KEY (katottg_code)
      REFERENCES katottg(code)
      ON DELETE SET NULL
      ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS commanderies_katottg_code_idx ON commanderies(katottg_code);

-- Primaries: link vote options to actual candidate users for automated winner assignment
ALTER TABLE vote_options
  ADD COLUMN IF NOT EXISTS candidate_user_id uuid REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS vote_options_candidate_user_idx ON vote_options(candidate_user_id);
