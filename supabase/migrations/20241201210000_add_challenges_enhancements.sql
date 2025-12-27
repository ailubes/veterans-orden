-- Migration: 0024_add_challenges_enhancements.sql
-- Add competitive challenge support, badges table, and enhanced tracking

-- Add 'cancelled' to challenge_status enum
ALTER TYPE challenge_status ADD VALUE IF NOT EXISTS 'cancelled';

-- Add competitive challenge support columns
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS is_competitive BOOLEAN DEFAULT false;
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS max_winners INTEGER DEFAULT 1;
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS created_by_id UUID REFERENCES users(id);

-- Add reward tracking to participants
ALTER TABLE challenge_participants ADD COLUMN IF NOT EXISTS reward_claimed BOOLEAN DEFAULT false;
ALTER TABLE challenge_participants ADD COLUMN IF NOT EXISTS final_rank INTEGER;

-- Create badges table
CREATE TABLE IF NOT EXISTS badges (
  id VARCHAR(50) PRIMARY KEY,
  name_uk VARCHAR(100) NOT NULL,
  name_en VARCHAR(100) NOT NULL,
  description_uk TEXT,
  description_en TEXT,
  icon_url TEXT,
  category VARCHAR(50) DEFAULT 'challenge',
  rarity VARCHAR(20) DEFAULT 'common',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed initial challenge badges
INSERT INTO badges (id, name_uk, name_en, description_uk, description_en, rarity, category) VALUES
  ('weekly_warrior', 'Тижневий воїн', 'Weekly Warrior', 'Завершив тижневий челендж', 'Completed a weekly challenge', 'common', 'challenge'),
  ('monthly_master', 'Майстер місяця', 'Monthly Master', 'Завершив місячний челендж', 'Completed a monthly challenge', 'rare', 'challenge'),
  ('challenge_champion', 'Чемпіон челенджів', 'Challenge Champion', 'Виграв конкурентний челендж', 'Won a competitive challenge', 'epic', 'challenge'),
  ('referral_star', 'Зірка рекрутингу', 'Referral Star', 'Запросив 10+ членів через челенджі', 'Invited 10+ members via challenges', 'rare', 'challenge'),
  ('task_titan', 'Титан завдань', 'Task Titan', 'Виконав 50+ завдань у челенджах', 'Completed 50+ tasks in challenges', 'epic', 'challenge'),
  ('event_enthusiast', 'Ентузіаст подій', 'Event Enthusiast', 'Відвідав 10+ подій через челенджі', 'Attended 10+ events via challenges', 'rare', 'challenge'),
  ('voting_voice', 'Голос демократії', 'Voting Voice', 'Проголосував 20+ разів у челенджах', 'Cast 20+ votes in challenges', 'rare', 'challenge'),
  ('first_challenge', 'Перший виклик', 'First Challenge', 'Завершив свій перший челендж', 'Completed your first challenge', 'common', 'achievement'),
  ('challenge_streak_3', 'Серія з 3', 'Streak of 3', 'Завершив 3 челенджі поспіль', 'Completed 3 challenges in a row', 'rare', 'achievement'),
  ('challenge_streak_5', 'Серія з 5', 'Streak of 5', 'Завершив 5 челенджів поспіль', 'Completed 5 challenges in a row', 'epic', 'achievement')
ON CONFLICT (id) DO NOTHING;

-- Create indexes
CREATE INDEX IF NOT EXISTS challenges_is_competitive_idx ON challenges(is_competitive);
CREATE INDEX IF NOT EXISTS challenges_created_by_idx ON challenges(created_by_id);
CREATE INDEX IF NOT EXISTS badges_category_idx ON badges(category);
CREATE INDEX IF NOT EXISTS badges_rarity_idx ON badges(rarity);

-- Add badge tracking to user_achievements if not exists
-- (user_achievements table should already exist for badge storage)
