-- KATOTTG (Ukrainian Administrative Units Classification) Table
-- КАТОТТГ - кодифікатор адміністративно-територіальних одиниць та територій територіальних громад

-- Enable trigram extension for fuzzy search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create KATOTTG categories reference table
CREATE TABLE IF NOT EXISTS katottg_categories (
  code CHAR(1) PRIMARY KEY,
  name_uk VARCHAR(100) NOT NULL,
  name_en VARCHAR(100) NOT NULL,
  description_uk VARCHAR(255),
  level INTEGER NOT NULL
);

-- Insert category definitions
INSERT INTO katottg_categories (code, name_uk, name_en, description_uk, level) VALUES
  ('O', 'Область', 'Oblast', 'Область України', 1),
  ('K', 'Місто спеціального статусу', 'Special City', 'Місто зі спеціальним статусом (Київ, Севастополь)', 1),
  ('P', 'Район', 'Raion', 'Район області', 2),
  ('B', 'Район міста', 'City Borough', 'Район у складі великого міста', 2),
  ('H', 'Громада', 'Hromada', 'Територіальна громада', 3),
  ('M', 'Місто', 'City', 'Місто', 4),
  ('T', 'Селище міського типу', 'Urban-type Settlement', 'Селище міського типу', 4),
  ('C', 'Село', 'Village', 'Село', 4),
  ('X', 'Селище', 'Settlement', 'Селище', 4)
ON CONFLICT (code) DO NOTHING;

-- Create main KATOTTG table
CREATE TABLE IF NOT EXISTS katottg (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Official KATOTTG code (e.g., UA01020010010075540)
  code VARCHAR(19) NOT NULL UNIQUE,

  -- Category: O, K, P, H, B, M, T, C, X
  category CHAR(1) NOT NULL REFERENCES katottg_categories(code),

  -- Name of the administrative unit (Ukrainian)
  name VARCHAR(255) NOT NULL,

  -- Hierarchy level (1-5)
  level INTEGER NOT NULL CHECK (level BETWEEN 1 AND 5),

  -- Parent codes (denormalized for fast lookups)
  oblast_code VARCHAR(19),      -- Level 1 parent (O or K)
  raion_code VARCHAR(19),       -- Level 2 parent (P or B)
  hromada_code VARCHAR(19),     -- Level 3 parent (H)

  -- Denormalized parent names for display
  oblast_name VARCHAR(255),
  raion_name VARCHAR(255),
  hromada_name VARCHAR(255),

  -- Full path for display (e.g., "Вінницька область > Вінницький район > Вінницька громада > Вінниця")
  full_path TEXT,

  -- Normalized name for search (lowercase, no special chars)
  name_normalized VARCHAR(255),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_katottg_code ON katottg(code);
CREATE INDEX IF NOT EXISTS idx_katottg_category ON katottg(category);
CREATE INDEX IF NOT EXISTS idx_katottg_level ON katottg(level);
CREATE INDEX IF NOT EXISTS idx_katottg_oblast_code ON katottg(oblast_code);
CREATE INDEX IF NOT EXISTS idx_katottg_raion_code ON katottg(raion_code);
CREATE INDEX IF NOT EXISTS idx_katottg_hromada_code ON katottg(hromada_code);

-- Trigram index for fuzzy search on normalized name
CREATE INDEX IF NOT EXISTS idx_katottg_name_trgm ON katottg USING gin (name_normalized gin_trgm_ops);

-- Index for searching by name prefix
CREATE INDEX IF NOT EXISTS idx_katottg_name_normalized ON katottg(name_normalized varchar_pattern_ops);

-- Composite index for settlement searches (category + name)
CREATE INDEX IF NOT EXISTS idx_katottg_settlement_search ON katottg(category, name_normalized)
  WHERE category IN ('M', 'T', 'C', 'X');

COMMENT ON TABLE katottg IS 'Ukrainian administrative units classification (КАТОТТГ)';
COMMENT ON COLUMN katottg.code IS 'Official KATOTTG code (UA + digits)';
COMMENT ON COLUMN katottg.category IS 'Type of administrative unit (O=Oblast, K=Special city, P=Raion, H=Hromada, M=City, T=Town, C=Village, X=Settlement)';
COMMENT ON COLUMN katottg.level IS 'Hierarchy level: 1=Oblast/Special city, 2=Raion/Borough, 3=Hromada, 4=Settlement';
