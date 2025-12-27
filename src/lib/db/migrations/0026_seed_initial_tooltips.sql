-- Seed initial help tooltips for common UI elements
-- Migration: 0026_seed_initial_tooltips.sql

-- Get the first admin user to be the creator
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  SELECT id INTO admin_user_id FROM users WHERE role IN ('admin', 'super_admin') LIMIT 1;

  -- Only seed if we have an admin user
  IF admin_user_id IS NOT NULL THEN

    -- Dashboard tooltips
    INSERT INTO help_tooltips (page_slug, element_id, content, audience, is_active) VALUES
    ('dashboard', 'points-balance', 'Ваш поточний баланс балів. Виконуйте завдання, голосуйте та відвідуйте події, щоб заробити більше балів.', 'all', true),
    ('dashboard', 'membership-level', 'Ваш рівень членства визначає доступ до функцій та привілеїв. Підвищуйте рівень, беручи активну участь у спільноті.', 'all', true),
    ('dashboard', 'quick-actions', 'Швидкі посилання на найважливіші розділи платформи.', 'all', true),

    -- Votes
    ('dashboard-votes', 'active-votes', 'Голосуйте за важливі рішення спільноти. Кожен голос нараховує бали.', 'members', true),
    ('dashboard-votes', 'my-votes', 'Перегляньте історію ваших голосів та їх результати.', 'members', true),

    -- Events
    ('dashboard-events', 'upcoming-events', 'Реєструйтесь на події та зустрічі. Відвідування події нараховує бали.', 'members', true),
    ('dashboard-events', 'my-events', 'Список подій, на які ви зареєстровані.', 'members', true),

    -- Tasks
    ('dashboard-tasks', 'available-tasks', 'Виконуйте завдання для розвитку спільноти та заробляйте бали.', 'members', true),
    ('dashboard-tasks', 'submit-proof', 'Завантажте скріншот або опис виконаної роботи для перевірки.', 'members', true),

    -- Referrals
    ('dashboard-referrals', 'referral-link', 'Поділіться вашим персональним посиланням, щоб запрошувати нових членів. Отримуйте бонуси за кожного, хто приєднається.', 'members', true),
    ('dashboard-referrals', 'referral-stats', 'Статистика ваших запрошень: скільки людей приєдналися через ваше посилання.', 'members', true),

    -- Marketplace
    ('dashboard-marketplace', 'points-spending', 'Обмінюйте зароблені бали на товари, цифрові продукти та квитки на події.', 'members', true),
    ('dashboard-marketplace', 'shopping-cart', 'Додайте товари до кошика та оформіть замовлення.', 'members', true),

    -- Admin tooltips
    ('admin-members', 'member-level', 'Адміністратори можуть підвищувати або знижувати рівень членства користувачів.', 'admins', true),
    ('admin-members', 'adjust-points', 'Нарахуйте або зніміть бали вручну (з обов''язковою причиною для аудиту).', 'admins', true),
    ('admin-members', 'suspend-member', 'Тимчасово заблокуйте доступ користувача до платформи.', 'admins', true),

    ('admin-votes', 'create-vote', 'Створюйте голосування для важливих рішень спільноти. Встановіть дату початку та закінчення.', 'admins', true),
    ('admin-votes', 'vote-results', 'Перегляньте результати голосування в реальному часі. Результати стають публічними після закриття голосування.', 'admins', true),

    ('admin-events', 'attendance-tracking', 'Відмічайте присутніх на події для автоматичного нарахування балів.', 'admins', true),
    ('admin-events', 'event-capacity', 'Обмежте кількість учасників події. Реєстрація закриється при досягненні ліміту.', 'admins', true),

    ('admin-tasks', 'task-verification', 'Перевіряйте виконання завдань та схвалюйте або відхиляйте з поясненням.', 'admins', true),
    ('admin-tasks', 'points-reward', 'Встановіть нагороду в балах за виконання завдання.', 'admins', true);

  END IF;
END $$;
