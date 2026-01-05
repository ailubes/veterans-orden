-- Migration: Military Service Tracking
-- Description: Track military service records and ranks for veterans

-- Military rank enum (Ukrainian military ranks)
CREATE TYPE "public"."military_rank" AS ENUM(
  'soldier',            -- Солдат
  'senior_soldier',     -- Старший солдат
  'junior_sergeant',    -- Молодший сержант
  'sergeant',           -- Сержант
  'senior_sergeant',    -- Старший сержант
  'master_sergeant',    -- Головний сержант
  'staff_sergeant',     -- Штаб-сержант
  'chief_sergeant',     -- Майстер-сержант
  'junior_lieutenant',  -- Молодший лейтенант
  'lieutenant',         -- Лейтенант
  'senior_lieutenant',  -- Старший лейтенант
  'captain',            -- Капітан
  'major',              -- Майор
  'lieutenant_colonel', -- Підполковник
  'colonel',            -- Полковник
  'brigadier_general',  -- Бригадний генерал
  'major_general',      -- Генерал-майор
  'lieutenant_general', -- Генерал-лейтенант
  'general',            -- Генерал
  'general_army'        -- Генерал армії України
);

-- Military branch enum
CREATE TYPE "public"."military_branch" AS ENUM(
  'zsu',      -- Збройні Сили України
  'ngu',      -- Національна гвардія України
  'dpsu',     -- Державна прикордонна служба України
  'ssu',      -- Служба безпеки України
  'gur',      -- Головне управління розвідки
  'other'     -- Інші формування
);

-- Military service records
CREATE TABLE military_service (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Rank and branch
  rank military_rank NOT NULL,
  branch military_branch DEFAULT 'zsu',

  -- Unit information
  unit_name varchar(255),
  unit_number varchar(50),
  position varchar(255),

  -- Service dates
  service_start date NOT NULL,
  service_end date,
  is_current_service boolean DEFAULT false,

  -- Combat experience
  combat_experience boolean DEFAULT false,
  combat_zones text,  -- Comma-separated list of combat zones
  combat_start date,
  combat_end date,

  -- Recognition
  awards jsonb DEFAULT '[]',  -- Array of { name, date, description }

  -- Verification
  verified boolean DEFAULT false,
  verified_by uuid REFERENCES users(id),
  verified_at timestamp,
  verification_notes text,

  -- Documents (store references to uploaded files)
  documents jsonb DEFAULT '[]',  -- Array of { url, type, uploaded_at }

  -- Additional info
  notes text,

  created_at timestamp DEFAULT now() NOT NULL,
  updated_at timestamp DEFAULT now() NOT NULL
);

-- Indexes
CREATE INDEX military_service_user_idx ON military_service(user_id);
CREATE INDEX military_service_rank_idx ON military_service(rank);
CREATE INDEX military_service_branch_idx ON military_service(branch);
CREATE INDEX military_service_combat_idx ON military_service(combat_experience) WHERE combat_experience = true;
CREATE INDEX military_service_verified_idx ON military_service(verified) WHERE verified = true;
CREATE INDEX military_service_current_idx ON military_service(is_current_service) WHERE is_current_service = true;

-- RLS policies
ALTER TABLE military_service ENABLE ROW LEVEL SECURITY;

-- Users can view their own service records
CREATE POLICY "Users can view own military service"
  ON military_service FOR SELECT
  USING (auth.uid()::text = (SELECT clerk_id FROM users WHERE id = user_id));

-- Users can insert their own service records
CREATE POLICY "Users can insert own military service"
  ON military_service FOR INSERT
  WITH CHECK (auth.uid()::text = (SELECT clerk_id FROM users WHERE id = user_id));

-- Users can update their own unverified service records
CREATE POLICY "Users can update own unverified military service"
  ON military_service FOR UPDATE
  USING (
    auth.uid()::text = (SELECT clerk_id FROM users WHERE id = user_id)
    AND verified = false
  );

-- Comments
COMMENT ON TABLE military_service IS 'Military service records for veterans';
COMMENT ON COLUMN military_service.rank IS 'Highest rank achieved during this service period';
COMMENT ON COLUMN military_service.branch IS 'Military branch (ЗСУ, НГУ, ДПСУ, etc.)';
COMMENT ON COLUMN military_service.combat_zones IS 'List of combat zones where veteran served';
COMMENT ON COLUMN military_service.awards IS 'Array of military awards with dates';
