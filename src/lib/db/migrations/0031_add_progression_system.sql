-- Migration: 0031_add_progression_system.sql
-- Description: Member progression guidance system with auto-generated tasks, streaks, achievements, and feature gates
-- Date: 2025-01-30

-- =====================================================
-- TABLE 1: progression_tasks
-- Auto-generated tasks from role requirements
-- =====================================================

CREATE TABLE IF NOT EXISTS progression_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_level INTEGER NOT NULL,
  requirement_type TEXT NOT NULL, -- contribution, direct_referrals, total_tree, helped_advance
  title_uk TEXT NOT NULL,
  description_uk TEXT NOT NULL,
  cta_text_uk TEXT NOT NULL,
  cta_url TEXT NOT NULL,
  icon_name TEXT NOT NULL,
  current_value INTEGER NOT NULL DEFAULT 0,
  target_value INTEGER NOT NULL,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_progression_tasks_user_id ON progression_tasks(user_id);
CREATE INDEX idx_progression_tasks_user_completed ON progression_tasks(user_id, is_completed);

COMMENT ON TABLE progression_tasks IS 'Auto-generated tasks for member progression based on role requirements';

-- =====================================================
-- TABLE 2: user_streaks
-- Daily activity tracking for gamification
-- =====================================================

CREATE TABLE IF NOT EXISTS user_streaks (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  total_days INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE user_streaks IS 'Tracks daily activity streaks for gamification';

-- =====================================================
-- TABLE 3: user_achievements
-- Achievement/badge system
-- =====================================================

CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_key TEXT NOT NULL,
  title_uk TEXT NOT NULL,
  description_uk TEXT NOT NULL,
  icon_name TEXT NOT NULL,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, achievement_key)
);

CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_earned_at ON user_achievements(earned_at DESC);

COMMENT ON TABLE user_achievements IS 'User achievements and badges';

-- =====================================================
-- TABLE 4: progression_milestones
-- Celebration queue for completed tasks, achievements, streaks
-- =====================================================

CREATE TABLE IF NOT EXISTS progression_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  milestone_type TEXT NOT NULL, -- task_complete, achievement_earned, streak_milestone, role_advance
  title_uk TEXT NOT NULL,
  message_uk TEXT NOT NULL,
  is_celebrated BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_progression_milestones_user_uncelebrated ON progression_milestones(user_id, is_celebrated);

COMMENT ON TABLE progression_milestones IS 'Queue of celebration moments for users';

-- =====================================================
-- TABLE 5: feature_gates
-- Feature unlock definitions by membership role
-- =====================================================

CREATE TABLE IF NOT EXISTS feature_gates (
  feature_key TEXT PRIMARY KEY,
  required_role membership_role NOT NULL,
  display_name_uk TEXT NOT NULL,
  description_uk TEXT NOT NULL
);

COMMENT ON TABLE feature_gates IS 'Feature unlock requirements by membership role';

-- =====================================================
-- FUNCTION 1: generate_progression_tasks
-- Creates tasks for next role based on requirements
-- =====================================================

CREATE OR REPLACE FUNCTION generate_progression_tasks(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  user_current_role membership_role;
  user_current_level INTEGER;
  next_req RECORD;
  current_contribution INTEGER;
  current_direct_refs INTEGER;
  current_total_refs INTEGER;
  current_helped INTEGER;
BEGIN
  -- Get user's current role
  SELECT membership_role INTO user_current_role
  FROM users WHERE id = p_user_id;

  -- Get current role level
  SELECT role_level INTO user_current_level
  FROM role_requirements WHERE role = user_current_role;

  -- Delete existing tasks for this user
  DELETE FROM progression_tasks WHERE user_id = p_user_id;

  -- Get next role requirements
  SELECT * INTO next_req
  FROM role_requirements
  WHERE role_level = user_current_level + 1
  LIMIT 1;

  -- If no next role (already at max), exit
  IF next_req IS NULL THEN
    RETURN;
  END IF;

  -- Task 1: Contribution requirement
  IF next_req.requires_contribution THEN
    -- Get current contribution total
    SELECT COALESCE(SUM(amount), 0) INTO current_contribution
    FROM payments
    WHERE user_id = p_user_id AND status = 'completed';

    INSERT INTO progression_tasks (
      user_id, role_level, requirement_type,
      title_uk, description_uk, cta_text_uk, cta_url, icon_name,
      current_value, target_value, is_completed, display_order
    ) VALUES (
      p_user_id, next_req.role_level, 'contribution',
      'Зробіть внесок від ' || (next_req.min_contribution_amount / 100) || ' грн',
      'Підтримайте Мережу Вільних Людей фінансово для досягнення рівня ' || next_req.display_name_uk,
      'Внести кошти',
      '/dashboard/contribute',
      'DollarSign',
      current_contribution,
      next_req.min_contribution_amount,
      current_contribution >= next_req.min_contribution_amount,
      1
    );
  END IF;

  -- Task 2: Direct referrals requirement
  IF next_req.min_direct_referrals > 0 THEN
    current_direct_refs := count_direct_referrals_at_role(
      p_user_id,
      next_req.min_direct_referrals_at_role
    );

    INSERT INTO progression_tasks (
      user_id, role_level, requirement_type,
      title_uk, description_uk, cta_text_uk, cta_url, icon_name,
      current_value, target_value, is_completed, display_order
    ) VALUES (
      p_user_id, next_req.role_level, 'direct_referrals',
      'Запросіть ' || next_req.min_direct_referrals || ' ' ||
        CASE
          WHEN next_req.min_direct_referrals = 1 THEN 'людину'
          WHEN next_req.min_direct_referrals < 5 THEN 'людини'
          ELSE 'людей'
        END,
      'Поділіться вашим реферальним посиланням і запросіть нових членів',
      'Поділитися посиланням',
      '/dashboard/referrals',
      'Users',
      current_direct_refs,
      next_req.min_direct_referrals,
      current_direct_refs >= next_req.min_direct_referrals,
      2
    );
  END IF;

  -- Task 3: Total tree requirement
  IF next_req.min_total_referrals > 0 THEN
    SELECT COALESCE(total_tree_count, 0) INTO current_total_refs
    FROM user_referral_stats WHERE user_id = p_user_id;

    IF current_total_refs IS NULL THEN
      current_total_refs := calculate_total_referrals(p_user_id);
    END IF;

    INSERT INTO progression_tasks (
      user_id, role_level, requirement_type,
      title_uk, description_uk, cta_text_uk, cta_url, icon_name,
      current_value, target_value, is_completed, display_order
    ) VALUES (
      p_user_id, next_req.role_level, 'total_tree',
      'Побудуйте мережу з ' || next_req.min_total_referrals || ' членів',
      'Ваша реферальна мережа має налічувати ' || next_req.min_total_referrals || ' людей (всі рівні)',
      'Переглянути мережу',
      '/dashboard/referrals',
      'Network',
      current_total_refs,
      next_req.min_total_referrals,
      current_total_refs >= next_req.min_total_referrals,
      3
    );
  END IF;

  -- Task 4: Helped advance requirement
  IF next_req.min_helped_advance > 0 THEN
    current_helped := count_helped_advance(
      p_user_id,
      next_req.helped_advance_from_role,
      next_req.helped_advance_to_role
    );

    INSERT INTO progression_tasks (
      user_id, role_level, requirement_type,
      title_uk, description_uk, cta_text_uk, cta_url, icon_name,
      current_value, target_value, is_completed, display_order
    ) VALUES (
      p_user_id, next_req.role_level, 'helped_advance',
      'Допоможіть ' || next_req.min_helped_advance || ' членам просунутися',
      'Підтримайте ваших рефералів у досягненні наступного рівня',
      'Переглянути рефералів',
      '/dashboard/referrals',
      'TrendingUp',
      current_helped,
      next_req.min_helped_advance,
      current_helped >= next_req.min_helped_advance,
      4
    );
  END IF;

END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION generate_progression_tasks(UUID) IS
  'Generates progression tasks for a user based on next role requirements';

-- =====================================================
-- FUNCTION 2: update_progression_task_progress
-- Updates task progress when user actions occur
-- =====================================================

CREATE OR REPLACE FUNCTION update_progression_task_progress(
  p_user_id UUID,
  p_requirement_type TEXT
)
RETURNS VOID AS $$
DECLARE
  task RECORD;
  new_value INTEGER;
  was_incomplete BOOLEAN;
BEGIN
  -- Find the task to update
  SELECT * INTO task
  FROM progression_tasks
  WHERE user_id = p_user_id
    AND requirement_type = p_requirement_type
    AND is_completed = false
  LIMIT 1;

  IF task IS NULL THEN
    RETURN;
  END IF;

  was_incomplete := NOT task.is_completed;

  -- Calculate new current value based on type
  CASE p_requirement_type
    WHEN 'contribution' THEN
      SELECT COALESCE(SUM(amount), 0) INTO new_value
      FROM payments
      WHERE user_id = p_user_id AND status = 'completed';

    WHEN 'direct_referrals' THEN
      -- Need to get the required role from task
      SELECT COUNT(*) INTO new_value
      FROM users u
      WHERE u.referred_by_id = p_user_id
        AND u.status IN ('active', 'pending');

    WHEN 'total_tree' THEN
      new_value := calculate_total_referrals(p_user_id);

    WHEN 'helped_advance' THEN
      -- Count from role_advancements
      SELECT COUNT(DISTINCT ra.user_id) INTO new_value
      FROM role_advancements ra
      INNER JOIN users u ON ra.user_id = u.id
      WHERE u.referred_by_id = p_user_id;

    ELSE
      RETURN;
  END CASE;

  -- Update the task
  UPDATE progression_tasks
  SET
    current_value = new_value,
    is_completed = (new_value >= target_value),
    completed_at = CASE
      WHEN (new_value >= target_value) AND NOT is_completed THEN NOW()
      ELSE completed_at
    END,
    updated_at = NOW()
  WHERE id = task.id;

  -- If task just completed, create milestone
  IF was_incomplete AND new_value >= task.target_value THEN
    INSERT INTO progression_milestones (
      user_id, milestone_type, title_uk, message_uk
    ) VALUES (
      p_user_id,
      'task_complete',
      'Завдання виконано! ✅',
      'Ви завершили: ' || task.title_uk
    );
  END IF;

END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_progression_task_progress(UUID, TEXT) IS
  'Updates progress for a specific task type and creates milestone if completed';

-- =====================================================
-- FUNCTION 3: update_user_streak
-- Tracks daily activity and creates streak milestones
-- =====================================================

CREATE OR REPLACE FUNCTION update_user_streak(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  streak RECORD;
  today DATE := CURRENT_DATE;
  yesterday DATE := CURRENT_DATE - INTERVAL '1 day';
  new_current_streak INTEGER;
  new_longest_streak INTEGER;
  new_total_days INTEGER;
  milestone_days INTEGER[] := ARRAY[7, 14, 30, 60, 90, 180, 365];
  milestone_day INTEGER;
BEGIN
  -- Get existing streak or create new
  SELECT * INTO streak
  FROM user_streaks
  WHERE user_id = p_user_id;

  IF streak IS NULL THEN
    -- First activity ever
    INSERT INTO user_streaks (
      user_id, current_streak, longest_streak, total_days, last_activity_date
    ) VALUES (
      p_user_id, 1, 1, 1, today
    );
    RETURN;
  END IF;

  -- If already logged today, do nothing
  IF streak.last_activity_date = today THEN
    RETURN;
  END IF;

  -- Check if consecutive day
  IF streak.last_activity_date = yesterday THEN
    -- Continue streak
    new_current_streak := streak.current_streak + 1;
    new_longest_streak := GREATEST(streak.longest_streak, new_current_streak);
    new_total_days := streak.total_days + 1;
  ELSE
    -- Streak broken, reset
    new_current_streak := 1;
    new_longest_streak := streak.longest_streak;
    new_total_days := streak.total_days + 1;
  END IF;

  -- Update streak
  UPDATE user_streaks
  SET
    current_streak = new_current_streak,
    longest_streak = new_longest_streak,
    total_days = new_total_days,
    last_activity_date = today,
    updated_at = NOW()
  WHERE user_id = p_user_id;

  -- Check for milestone achievements
  FOREACH milestone_day IN ARRAY milestone_days
  LOOP
    IF new_current_streak = milestone_day THEN
      -- Create milestone celebration
      INSERT INTO progression_milestones (
        user_id, milestone_type, title_uk, message_uk
      ) VALUES (
        p_user_id,
        'streak_milestone',
        'Серія активності! 🔥',
        'Ви активні ' || milestone_day || ' днів поспіль!'
      );

      -- Grant achievement
      PERFORM grant_achievement(
        p_user_id,
        'streak_' || milestone_day
      );
    END IF;
  END LOOP;

END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_user_streak(UUID) IS
  'Updates daily activity streak and creates milestones at 7, 14, 30, 60, 90, 180, 365 days';

-- =====================================================
-- FUNCTION 4: grant_achievement
-- Awards achievement badge and creates milestone
-- =====================================================

CREATE OR REPLACE FUNCTION grant_achievement(
  p_user_id UUID,
  p_achievement_key TEXT
)
RETURNS VOID AS $$
DECLARE
  achievement_title TEXT;
  achievement_description TEXT;
  achievement_icon TEXT;
BEGIN
  -- Map achievement keys to Ukrainian titles
  CASE p_achievement_key
    WHEN 'first_contribution' THEN
      achievement_title := 'Перший внесок';
      achievement_description := 'Зробили першу фінансову підтримку';
      achievement_icon := 'DollarSign';
    WHEN 'become_candidate' THEN
      achievement_title := 'Кандидат в члени';
      achievement_description := 'Досягли рівня Кандидата';
      achievement_icon := 'Award';
    WHEN 'become_member' THEN
      achievement_title := 'Член Мережі';
      achievement_description := 'Досягли рівня Члена Мережі';
      achievement_icon := 'Award';
    WHEN 'become_honorary_member' THEN
      achievement_title := 'Почесний Член';
      achievement_description := 'Досягли рівня Почесного Члена';
      achievement_icon := 'Star';
    WHEN 'become_network_leader' THEN
      achievement_title := 'Лідер Мережі';
      achievement_description := 'Досягли рівня Лідера Мережі';
      achievement_icon := 'Crown';
    WHEN 'first_referral' THEN
      achievement_title := 'Перший реферал';
      achievement_description := 'Запросили першого члена';
      achievement_icon := 'Users';
    WHEN 'recruiter_5' THEN
      achievement_title := 'Рекрутер';
      achievement_description := 'Запросили 5 членів';
      achievement_icon := 'Users';
    WHEN 'recruiter_10' THEN
      achievement_title := 'Майстер рекрутингу';
      achievement_description := 'Запросили 10 членів';
      achievement_icon := 'Users';
    WHEN 'network_builder_50' THEN
      achievement_title := 'Будівельник мережі';
      achievement_description := 'Побудували мережу з 50 членів';
      achievement_icon := 'Network';
    WHEN 'streak_7' THEN
      achievement_title := 'Тиждень активності';
      achievement_description := '7 днів поспіль';
      achievement_icon := 'Flame';
    WHEN 'streak_30' THEN
      achievement_title := 'Місяць активності';
      achievement_description := '30 днів поспіль';
      achievement_icon := 'Flame';
    WHEN 'streak_365' THEN
      achievement_title := 'Рік активності';
      achievement_description := '365 днів поспіль';
      achievement_icon := 'Zap';
    ELSE
      -- Unknown achievement, use generic
      achievement_title := 'Досягнення';
      achievement_description := p_achievement_key;
      achievement_icon := 'Trophy';
  END CASE;

  -- Insert achievement (if not already earned)
  INSERT INTO user_achievements (
    user_id, achievement_key, title_uk, description_uk, icon_name
  )
  VALUES (
    p_user_id, p_achievement_key, achievement_title, achievement_description, achievement_icon
  )
  ON CONFLICT (user_id, achievement_key) DO NOTHING;

  -- Check if actually inserted (not duplicate)
  IF FOUND THEN
    -- Create celebration milestone
    INSERT INTO progression_milestones (
      user_id, milestone_type, title_uk, message_uk
    ) VALUES (
      p_user_id,
      'achievement_earned',
      'Нове досягнення! 🏆',
      'Ви отримали: ' || achievement_title
    );
  END IF;

END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION grant_achievement(UUID, TEXT) IS
  'Awards achievement badge to user and creates celebration milestone';

-- =====================================================
-- TRIGGER 1: Generate tasks on role change
-- =====================================================

CREATE OR REPLACE FUNCTION trigger_generate_progression_tasks()
RETURNS TRIGGER AS $$
BEGIN
  -- Only fire on actual role changes
  IF OLD.membership_role IS DISTINCT FROM NEW.membership_role THEN
    PERFORM generate_progression_tasks(NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_generate_progression_tasks ON users;
CREATE TRIGGER trg_generate_progression_tasks
  AFTER UPDATE OF membership_role ON users
  FOR EACH ROW
  EXECUTE FUNCTION trigger_generate_progression_tasks();

COMMENT ON TRIGGER trg_generate_progression_tasks ON users IS
  'Auto-generates progression tasks when user role changes';

-- =====================================================
-- TRIGGER 2: Update task progress on referral stats change
-- =====================================================

CREATE OR REPLACE FUNCTION trigger_update_task_progress()
RETURNS TRIGGER AS $$
BEGIN
  -- Update direct referrals task
  PERFORM update_progression_task_progress(NEW.user_id, 'direct_referrals');

  -- Update total tree task
  PERFORM update_progression_task_progress(NEW.user_id, 'total_tree');

  -- Update helped advance task
  PERFORM update_progression_task_progress(NEW.user_id, 'helped_advance');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_task_progress ON user_referral_stats;
CREATE TRIGGER trg_update_task_progress
  AFTER UPDATE ON user_referral_stats
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_task_progress();

COMMENT ON TRIGGER trg_update_task_progress ON user_referral_stats IS
  'Updates progression task progress when referral stats change';

-- =====================================================
-- TRIGGER 3: Update contribution task on payment
-- =====================================================

CREATE OR REPLACE FUNCTION trigger_update_contribution_task()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process completed payments
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    PERFORM update_progression_task_progress(NEW.user_id, 'contribution');

    -- Grant first contribution achievement
    IF NOT EXISTS (
      SELECT 1 FROM user_achievements
      WHERE user_id = NEW.user_id AND achievement_key = 'first_contribution'
    ) THEN
      PERFORM grant_achievement(NEW.user_id, 'first_contribution');
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_contribution_task ON payments;
CREATE TRIGGER trg_update_contribution_task
  AFTER INSERT OR UPDATE OF status ON payments
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_contribution_task();

COMMENT ON TRIGGER trg_update_contribution_task ON payments IS
  'Updates contribution task progress when payment completes';

-- =====================================================
-- TRIGGER 4: Grant achievement on role advancement
-- =====================================================

CREATE OR REPLACE FUNCTION trigger_grant_role_achievement()
RETURNS TRIGGER AS $$
BEGIN
  -- Grant achievement for reaching new role
  PERFORM grant_achievement(
    NEW.user_id,
    'become_' || NEW.to_role
  );

  -- Create role advancement milestone
  INSERT INTO progression_milestones (
    user_id, milestone_type, title_uk, message_uk
  ) VALUES (
    NEW.user_id,
    'role_advance',
    'Підвищення рівня! 🎉',
    'Ви досягли рівня: ' || (SELECT display_name_uk FROM role_requirements WHERE role = NEW.to_role)
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_grant_role_achievement ON role_advancements;
CREATE TRIGGER trg_grant_role_achievement
  AFTER INSERT ON role_advancements
  FOR EACH ROW
  EXECUTE FUNCTION trigger_grant_role_achievement();

COMMENT ON TRIGGER trg_grant_role_achievement ON role_advancements IS
  'Grants achievement and creates milestone when user advances role';

-- =====================================================
-- SEED DATA: Feature Gates
-- =====================================================

INSERT INTO feature_gates (feature_key, required_role, display_name_uk, description_uk) VALUES
  ('voting_primary', 'candidate', 'Голосування на праймеріз', 'Беріть участь у праймеріз Мережі Вільних Людей'),
  ('voting_full', 'member', 'Повне голосування', 'Голосуйте у всіх типах голосувань'),
  ('events_attend', 'member', 'Участь у подіях', 'Відвідуйте події та зустрічі Мережі'),
  ('events_organize', 'network_leader', 'Організація подій', 'Створюйте та організовуйте події'),
  ('tasks_execute', 'member', 'Виконання завдань', 'Виконуйте завдання для Мережі'),
  ('tasks_create', 'network_leader', 'Створення завдань', 'Створюйте завдання для інших членів'),
  ('referrals_tree_view', 'honorary_member', 'Реферальне дерево', 'Переглядайте повне дерево ваших рефералів'),
  ('leaders_council', 'network_leader', 'Рада Лідерів', 'Доступ до Ради Лідерів Мережі'),
  ('nomination_rights', 'network_leader', 'Право на номінацію', 'Висувайте кандидатів на посади')
ON CONFLICT (feature_key) DO NOTHING;

-- =====================================================
-- Generate initial tasks for all existing users
-- =====================================================

DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN SELECT id FROM users WHERE status IN ('active', 'pending')
  LOOP
    PERFORM generate_progression_tasks(user_record.id);
  END LOOP;
END $$;
