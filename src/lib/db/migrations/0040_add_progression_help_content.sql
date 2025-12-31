-- Migration: Add progression system help documentation
-- Created: 2025-12-30
-- Description: Create "Рівні членства" category and 9 help articles (1 overview + 8 role-specific)

DO $$
DECLARE
  category_id UUID;
  author_id UUID := '519f19f8-8045-4190-b0d4-e29cecefe25b';
  overview_article_id UUID;
BEGIN

  -- 1. Create category "Рівні членства"
  INSERT INTO help_categories (name_uk, name_en, slug, description, icon, "order", is_visible)
  VALUES (
    'Рівні членства',
    'Membership Levels',
    'rivni-chlenstva',
    'Дізнайтеся про 8 рівнів членства та як прогресувати',
    'Trophy',
    3,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name_uk = EXCLUDED.name_uk,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    "order" = EXCLUDED."order"
  RETURNING id INTO category_id;

  RAISE NOTICE 'Category created with ID: %', category_id;

  -- 2. Insert OVERVIEW article
  INSERT INTO help_articles (
    category_id, title, slug, content, excerpt,
    audience, keywords, status, author_id, published_at
  ) VALUES (
    category_id,
    'Система прогресії: Огляд 8 рівнів членства',
    'systema-prohresiyi-ohlyad',
    '<div class="space-y-6">
      <h2 class="font-syne text-2xl font-bold text-timber-dark">Вступ</h2>
      <p class="text-timber-beam">Мережа Вільних Людей використовує 8-рівневу систему членства, яка мотивує та винагороджує активних учасників. Кожен рівень відкриває нові можливості та привілеї.</p>

      <h3 class="font-syne text-xl font-bold text-timber-dark mt-8">📊 Діаграма рівнів</h3>
      <div class="overflow-x-auto">
        <table class="w-full border-2 border-timber-dark">
          <thead>
            <tr class="bg-accent/20">
              <th class="p-3 text-left border-r border-timber-dark/30">Рівень</th>
              <th class="p-3 text-left border-r border-timber-dark/30">Назва</th>
              <th class="p-3 text-left border-r border-timber-dark/30">Колір</th>
              <th class="p-3 text-left">Основні привілеї</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-timber-dark/20">
            <tr><td class="p-3">0</td><td class="p-3">Прихильник</td><td class="p-3">🔘 Сірий</td><td class="p-3">Розсилка новин</td></tr>
            <tr><td class="p-3">1</td><td class="p-3">Кандидат</td><td class="p-3">🔵 Синій</td><td class="p-3">+ Праймеріз голосування</td></tr>
            <tr><td class="p-3">2</td><td class="p-3">Член Мережі</td><td class="p-3">🟢 Зелений</td><td class="p-3">+ Повне голосування, Події, Завдання</td></tr>
            <tr><td class="p-3">3</td><td class="p-3">Почесний Член</td><td class="p-3">🟣 Фіолетовий</td><td class="p-3">+ Програма лояльності</td></tr>
            <tr><td class="p-3">4</td><td class="p-3">Лідер Мережі</td><td class="p-3">🟠 Помаранчевий</td><td class="p-3">+ Номінація, Рада Лідерів</td></tr>
            <tr><td class="p-3">5</td><td class="p-3">Регіональний лідер</td><td class="p-3">🔴 Червоний</td><td class="p-3">+ Адмін-панель, Пріоритет мер</td></tr>
            <tr><td class="p-3">6</td><td class="p-3">Національний лідер</td><td class="p-3">🟡 Золотий</td><td class="p-3">+ Пріоритет депутат/президент</td></tr>
            <tr><td class="p-3">7</td><td class="p-3">Провідник Мережі</td><td class="p-3">⚪ Платиновий</td><td class="p-3">+ Контроль 70% бюджету</td></tr>
          </tbody>
        </table>
      </div>

      <h3 class="font-syne text-xl font-bold text-timber-dark mt-8">⚙️ Як працює прогресія</h3>
      <p class="text-timber-beam">Система автоматично генерує персоналізовані завдання на основі вимог наступного рівня:</p>
      <ul class="list-disc list-inside space-y-2 ml-4 text-timber-beam">
        <li><strong class="text-timber-dark">Фінансовий внесок</strong> — Підтримка Мережі коштами</li>
        <li><strong class="text-timber-dark">Прямі реферали</strong> — Запрошення нових членів</li>
        <li><strong class="text-timber-dark">Загальна мережа</strong> — Розмір вашого реферального дерева</li>
        <li><strong class="text-timber-dark">Допомога прогресувати</strong> — Кількість людей, яким допомогли просунутись</li>
      </ul>

      <h3 class="font-syne text-xl font-bold text-timber-dark mt-8">📝 Система завдань</h3>
      <p class="text-timber-beam">У розділі <a href="/dashboard/progression" class="text-accent hover:underline font-bold">Мій прогрес</a> ви побачите:</p>
      <ul class="list-disc list-inside space-y-2 ml-4 text-timber-beam">
        <li>📊 Поточний прогрес до наступного рівня</li>
        <li>✅ Виконані завдання</li>
        <li>⏳ Активні завдання з прогресом</li>
        <li>🎯 Вимоги для підвищення рівня</li>
      </ul>

      <h3 class="font-syne text-xl font-bold text-timber-dark mt-8">🔥 Серії активності (Streaks)</h3>
      <p class="text-timber-beam">Відвідуйте платформу щодня для накопичення серії:</p>
      <ul class="list-disc list-inside space-y-2 ml-4 text-timber-beam">
        <li>🔥 <strong>7 днів поспіль</strong> — "Тиждень активності"</li>
        <li>🔥 <strong>30 днів</strong> — "Місяць активності"</li>
        <li>⚡ <strong>365 днів</strong> — "Рік активності"</li>
      </ul>

      <h3 class="font-syne text-xl font-bold text-timber-dark mt-8">🏆 Досягнення (Achievements)</h3>
      <p class="text-timber-beam">Отримуйте унікальні значки за:</p>
      <ul class="list-disc list-inside space-y-2 ml-4 text-timber-beam">
        <li>🏆 Перший внесок</li>
        <li>👥 Запрошення рефералів (1, 5, 10, 50)</li>
        <li>🌐 Розбудову мережі (50, 100, 500)</li>
        <li>📈 Підвищення рівня</li>
        <li>🔥 Серії активності</li>
      </ul>

      <h3 class="font-syne text-xl font-bold text-timber-dark mt-8">🔓 Доступ до функцій</h3>
      <p class="text-timber-beam mb-4">Різні функції розблоковуються на певних рівнях:</p>
      <table class="w-full border-2 border-timber-dark">
        <tbody class="divide-y divide-timber-dark/20">
          <tr><td class="py-2 px-3"><strong>Праймеріз голосування</strong></td><td class="py-2 px-3 text-right">Рівень 1+</td></tr>
          <tr><td class="py-2 px-3"><strong>Повне голосування</strong></td><td class="py-2 px-3 text-right">Рівень 2+</td></tr>
          <tr><td class="py-2 px-3"><strong>Участь у подіях</strong></td><td class="py-2 px-3 text-right">Рівень 2+</td></tr>
          <tr><td class="py-2 px-3"><strong>Організація подій</strong></td><td class="py-2 px-3 text-right">Рівень 4+</td></tr>
          <tr><td class="py-2 px-3"><strong>Рада Лідерів</strong></td><td class="py-2 px-3 text-right">Рівень 4+</td></tr>
          <tr><td class="py-2 px-3"><strong>Адмін-панель</strong></td><td class="py-2 px-3 text-right">Рівень 5+</td></tr>
        </tbody>
      </table>

      <h3 class="font-syne text-xl font-bold text-timber-dark mt-8">❓ Часті питання</h3>

      <div class="bg-white border-2 border-timber-dark p-4 mt-4">
        <p class="font-bold text-timber-dark">Чи можна втратити рівень?</p>
        <p class="text-timber-beam">Ні, досягнутий рівень залишається назавжди. Однак для підтримки деяких привілеїв потрібні активні платежі.</p>
      </div>

      <div class="bg-white border-2 border-timber-dark p-4 mt-4">
        <p class="font-bold text-timber-dark">Скільки часу займає прогрес?</p>
        <p class="text-timber-beam">Залежить від вашої активності. Перші рівні (0-3) можна досягти за 1-3 місяці. Вищі рівні (4-7) потребують довготермінової роботи.</p>
      </div>

      <div class="bg-white border-2 border-timber-dark p-4 mt-4">
        <p class="font-bold text-timber-dark">Що робити, якщо застряг на рівні?</p>
        <p class="text-timber-beam">Перевірте ваші завдання в розділі "Прогрес". Система показує точно, чого не вистачає для підвищення.</p>
      </div>

      <h3 class="font-syne text-xl font-bold text-timber-dark mt-8">🔗 Детальна інформація</h3>
      <p class="text-timber-beam mb-4">Вивчіть кожен рівень окремо:</p>
      <ul class="list-none space-y-2">
        <li><a href="/help/rivni-chlenstva/riven-0-prykhylnyk" class="text-accent hover:underline font-bold">→ Рівень 0: Прихильник</a></li>
        <li><a href="/help/rivni-chlenstva/riven-1-kandydat" class="text-accent hover:underline font-bold">→ Рівень 1: Кандидат</a></li>
        <li><a href="/help/rivni-chlenstva/riven-2-chlen-merezhi" class="text-accent hover:underline font-bold">→ Рівень 2: Член Мережі</a></li>
        <li><a href="/help/rivni-chlenstva/riven-3-pochesnyy-chlen" class="text-accent hover:underline font-bold">→ Рівень 3: Почесний Член</a></li>
        <li><a href="/help/rivni-chlenstva/riven-4-lider-merezhi" class="text-accent hover:underline font-bold">→ Рівень 4: Лідер Мережі</a></li>
        <li><a href="/help/rivni-chlenstva/riven-5-rehionalnyy-lider" class="text-accent hover:underline font-bold">→ Рівень 5: Регіональний лідер</a></li>
        <li><a href="/help/rivni-chlenstva/riven-6-natsionalnyy-lider" class="text-accent hover:underline font-bold">→ Рівень 6: Національний лідер</a></li>
        <li><a href="/help/rivni-chlenstva/riven-7-providnyk-merezhi" class="text-accent hover:underline font-bold">→ Рівень 7: Провідник Мережі</a></li>
      </ul>
    </div>',
    'Дізнайтеся про 8 рівнів членства: від Прихильника до Провідника Мережі. Автоматичні завдання, досягнення та серії активності.',
    'all',
    '["прогресія", "рівні", "членство", "система", "завдання", "досягнення", "серії"]'::jsonb,
    'published',
    author_id,
    NOW()
  )
  ON CONFLICT (slug) DO UPDATE SET
    content = EXCLUDED.content,
    excerpt = EXCLUDED.excerpt,
    updated_at = NOW()
  RETURNING id INTO overview_article_id;

  RAISE NOTICE 'Overview article created with ID: %', overview_article_id;

  -- 3. Insert Level 0: Прихильник
  INSERT INTO help_articles (
    category_id, title, slug, content, excerpt,
    audience, keywords, status, author_id, published_at
  ) VALUES (
    category_id,
    'Рівень 0: Прихильник',
    'riven-0-prykhylnyk',
    '<div class="space-y-6">
      <div class="bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-timber-dark p-6">
        <h2 class="font-syne text-3xl font-bold text-gray-700 mb-4">🔘 Рівень 0: Прихильник</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div><strong>Колір:</strong> <span class="text-gray-500">●</span> Сірий</div>
          <div><strong>Іконка:</strong> UserPlus</div>
          <div><strong>Наступний:</strong> <a href="/help/rivni-chlenstva/riven-1-kandydat" class="text-accent hover:underline">Кандидат →</a></div>
        </div>
      </div>

      <h3 class="font-syne text-xl font-bold text-timber-dark">✨ Привілеї цього рівня</h3>
      <ul class="list-disc list-inside space-y-2 ml-4">
        <li><strong>Розсилка новин</strong> — Отримуйте важливі оновлення про діяльність Мережі</li>
        <li><strong>Перегляд контенту</strong> — Доступ до публічних матеріалів</li>
        <li><strong>Реферальне посилання</strong> — Можливість запрошувати інших</li>
      </ul>

      <h3 class="font-syne text-xl font-bold text-timber-dark mt-6">🚫 Що ще недоступно</h3>
      <ul class="list-disc list-inside space-y-2 ml-4 text-timber-beam">
        <li>Голосування (потрібен рівень Кандидат)</li>
        <li>Участь у подіях (потрібен рівень Член Мережі)</li>
        <li>Виконання завдань (потрібен рівень Член Мережі)</li>
      </ul>

      <h3 class="font-syne text-xl font-bold text-timber-dark mt-6">📈 Вимоги для підвищення до Кандидата</h3>
      <table class="w-full border-2 border-timber-dark mt-4">
        <thead>
          <tr class="bg-accent/20">
            <th class="p-3 text-left">Вимога</th>
            <th class="p-3 text-left">Кількість</th>
            <th class="p-3 text-left">Опис</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="p-3 border-t border-timber-dark/20">💰 Внесок</td>
            <td class="p-3 border-t border-timber-dark/20">49+ грн</td>
            <td class="p-3 border-t border-timber-dark/20">Перший внесок для отримання права голосу</td>
          </tr>
        </tbody>
      </table>

      <h3 class="font-syne text-xl font-bold text-timber-dark mt-6">🎓 Поради для успіху</h3>
      <ul class="list-disc list-inside space-y-2 ml-4">
        <li>Зробіть перший внесок від 49 грн щоб отримати право голосу</li>
        <li>Поділіться реферальним посиланням з друзями</li>
        <li>Ознайомтесь з платформою та можливостями</li>
        <li>Підпишіться на розсилку новин</li>
      </ul>

      <h3 class="font-syne text-xl font-bold text-timber-dark mt-6">🔗 Корисні посилання</h3>
      <ul class="list-none space-y-2">
        <li><a href="/dashboard/progression" class="text-accent hover:underline font-bold">→ Мій прогрес</a></li>
        <li><a href="/dashboard/contribute" class="text-accent hover:underline font-bold">→ Зробити внесок</a></li>
        <li><a href="/dashboard/referrals" class="text-accent hover:underline font-bold">→ Реферальна програма</a></li>
        <li><a href="/help/rivni-chlenstva/systema-prohresiyi-ohlyad" class="text-accent hover:underline font-bold">→ Огляд системи</a></li>
        <li><a href="/help/rivni-chlenstva/riven-1-kandydat" class="text-accent hover:underline font-bold">→ Наступний рівень: Кандидат</a></li>
      </ul>

      <div class="border-l-4 border-accent bg-accent/5 p-4 mt-6">
        <p class="text-timber-dark"><strong>💭 Підказка:</strong> Це стартовий рівень! Зробіть перший внесок від 49 грн, щоб стати Кандидатом і отримати право голосу.</p>
      </div>
    </div>',
    'Стартовий рівень. Зробіть перший внесок від 49 грн для отримання права голосу.',
    'all',
    '["прихильник", "рівень 0", "старт", "перший внесок"]'::jsonb,
    'published',
    author_id,
    NOW()
  ) ON CONFLICT (slug) DO UPDATE SET content = EXCLUDED.content, updated_at = NOW();

  -- 4. Insert Level 1: Кандидат
  INSERT INTO help_articles (
    category_id, title, slug, content, excerpt,
    audience, keywords, status, author_id, published_at
  ) VALUES (
    category_id,
    'Рівень 1: Кандидат',
    'riven-1-kandydat',
    '<div class="space-y-6">
      <div class="bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-timber-dark p-6">
        <h2 class="font-syne text-3xl font-bold text-blue-700 mb-4">🔵 Рівень 1: Кандидат</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div><strong>Колір:</strong> <span class="text-blue-500">●</span> Синій</div>
          <div><strong>Іконка:</strong> UserCheck</div>
          <div><strong>Наступний:</strong> <a href="/help/rivni-chlenstva/riven-2-chlen-merezhi" class="text-accent hover:underline">Член Мережі →</a></div>
        </div>
      </div>

      <h3 class="font-syne text-xl font-bold text-timber-dark">✨ Привілеї цього рівня</h3>
      <ul class="list-disc list-inside space-y-2 ml-4">
        <li><strong>Розсилка новин</strong> — Отримуйте важливі оновлення</li>
        <li><strong>Праймеріз голосування</strong> — Беріть участь у виборі кандидатів</li>
        <li><strong>Реферальна програма</strong> — Запрошуйте друзів і будуйте мережу</li>
      </ul>

      <h3 class="font-syne text-xl font-bold text-timber-dark mt-6">🚫 Що ще недоступно</h3>
      <ul class="list-disc list-inside space-y-2 ml-4 text-timber-beam">
        <li>Повне голосування (буде доступно на рівні Член Мережі)</li>
        <li>Участь у подіях (буде доступно на рівні Член Мережі)</li>
        <li>Виконання завдань (буде доступно на рівні Член Мережі)</li>
      </ul>

      <h3 class="font-syne text-xl font-bold text-timber-dark mt-6">📈 Вимоги для підвищення до Члена Мережі</h3>
      <table class="w-full border-2 border-timber-dark mt-4">
        <thead>
          <tr class="bg-accent/20">
            <th class="p-3 text-left">Вимога</th>
            <th class="p-3 text-left">Кількість</th>
            <th class="p-3 text-left">Опис</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="p-3 border-t border-timber-dark/20">👥 Прямі реферали</td>
            <td class="p-3 border-t border-timber-dark/20">2 особи</td>
            <td class="p-3 border-t border-timber-dark/20">Запросіть 2 кандидатів (по 49+ грн)</td>
          </tr>
        </tbody>
      </table>

      <h3 class="font-syne text-xl font-bold text-timber-dark mt-6">🎓 Поради для успіху</h3>
      <ul class="list-disc list-inside space-y-2 ml-4">
        <li>Активно беріть участь у праймеріз голосуваннях</li>
        <li>Поділіться реферальним посиланням з друзями та родиною</li>
        <li>Поясніть переваги членства потенційним рефералам</li>
        <li>Допоможіть вашим рефералам зробити перший внесок</li>
      </ul>

      <h3 class="font-syne text-xl font-bold text-timber-dark mt-6">🔗 Корисні посилання</h3>
      <ul class="list-none space-y-2">
        <li><a href="/dashboard/progression" class="text-accent hover:underline font-bold">→ Мій прогрес</a></li>
        <li><a href="/dashboard/referrals" class="text-accent hover:underline font-bold">→ Реферальна програма</a></li>
        <li><a href="/dashboard/votes" class="text-accent hover:underline font-bold">→ Голосування</a></li>
        <li><a href="/help/rivni-chlenstva/riven-0-prykhylnyk" class="text-accent hover:underline font-bold">← Попередній: Прихильник</a></li>
        <li><a href="/help/rivni-chlenstva/riven-2-chlen-merezhi" class="text-accent hover:underline font-bold">→ Наступний: Член Мережі</a></li>
      </ul>

      <div class="border-l-4 border-accent bg-accent/5 p-4 mt-6">
        <p class="text-timber-dark"><strong>💭 Підказка:</strong> Запросіть 2 друзів і допоможіть їм стати кандидатами — це відкриє вам повні можливості платформи!</p>
      </div>
    </div>',
    'Перший крок у прогресії. Отримайте право голосу та почніть будувати мережу.',
    'all',
    '["кандидат", "рівень 1", "голосування", "праймеріз"]'::jsonb,
    'published',
    author_id,
    NOW()
  ) ON CONFLICT (slug) DO UPDATE SET content = EXCLUDED.content, updated_at = NOW();

  -- 5. Insert Level 2: Член Мережі
  INSERT INTO help_articles (
    category_id, title, slug, content, excerpt,
    audience, keywords, status, author_id, published_at
  ) VALUES (
    category_id,
    'Рівень 2: Член Мережі',
    'riven-2-chlen-merezhi',
    '<div class="space-y-6">
      <div class="bg-gradient-to-r from-green-50 to-green-100 border-2 border-timber-dark p-6">
        <h2 class="font-syne text-3xl font-bold text-green-700 mb-4">🟢 Рівень 2: Член Мережі</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div><strong>Колір:</strong> <span class="text-green-500">●</span> Зелений</div>
          <div><strong>Іконка:</strong> Users</div>
          <div><strong>Наступний:</strong> <a href="/help/rivni-chlenstva/riven-3-pochesnyy-chlen" class="text-accent hover:underline">Почесний Член →</a></div>
        </div>
      </div>

      <h3 class="font-syne text-xl font-bold text-timber-dark">✨ Привілеї цього рівня</h3>
      <ul class="list-disc list-inside space-y-2 ml-4">
        <li><strong>Розсилка новин</strong> — Всі оновлення та анонси</li>
        <li><strong>Праймеріз голосування</strong> — Вибір кандидатів</li>
        <li><strong>Повне голосування</strong> — Участь у всіх голосуваннях Мережі</li>
        <li><strong>Участь у подіях</strong> — Доступ до офлайн та онлайн заходів</li>
        <li><strong>Виконання завдань</strong> — Система завдань та досягнень</li>
      </ul>

      <h3 class="font-syne text-xl font-bold text-timber-dark mt-6">🚫 Що ще недоступно</h3>
      <ul class="list-disc list-inside space-y-2 ml-4 text-timber-beam">
        <li>Програма лояльності (буде на рівні Почесний Член)</li>
        <li>Номінація кандидатів (буде на рівні Лідер Мережі)</li>
        <li>Рада Лідерів (буде на рівні Лідер Мережі)</li>
      </ul>

      <h3 class="font-syne text-xl font-bold text-timber-dark mt-6">📈 Вимоги для підвищення до Почесного Члена</h3>
      <table class="w-full border-2 border-timber-dark mt-4">
        <thead>
          <tr class="bg-accent/20">
            <th class="p-3 text-left">Вимога</th>
            <th class="p-3 text-left">Кількість</th>
            <th class="p-3 text-left">Опис</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="p-3 border-t border-timber-dark/20">⬆️ Підвищені реферали</td>
            <td class="p-3 border-t border-timber-dark/20">2 особи</td>
            <td class="p-3 border-t border-timber-dark/20">2 ваших реферала стали Членами (по 2 реферала)</td>
          </tr>
        </tbody>
      </table>

      <h3 class="font-syne text-xl font-bold text-timber-dark mt-6">🎓 Поради для успіху</h3>
      <ul class="list-disc list-inside space-y-2 ml-4">
        <li>Беріть активну участь у всіх голосуваннях</li>
        <li>Відвідуйте події Мережі для нетворкінгу</li>
        <li>Виконуйте завдання для отримання досягнень</li>
        <li>Допомагайте вашим рефералам залучати нових членів</li>
        <li>Підтримуйте щоденну серію активності</li>
      </ul>

      <h3 class="font-syne text-xl font-bold text-timber-dark mt-6">🔗 Корисні посилання</h3>
      <ul class="list-none space-y-2">
        <li><a href="/dashboard/progression" class="text-accent hover:underline font-bold">→ Мій прогрес</a></li>
        <li><a href="/dashboard/events" class="text-accent hover:underline font-bold">→ Події</a></li>
        <li><a href="/dashboard/votes" class="text-accent hover:underline font-bold">→ Голосування</a></li>
        <li><a href="/dashboard/challenges" class="text-accent hover:underline font-bold">→ Челенджі</a></li>
        <li><a href="/help/rivni-chlenstva/riven-1-kandydat" class="text-accent hover:underline font-bold">← Попередній: Кандидат</a></li>
        <li><a href="/help/rivni-chlenstva/riven-3-pochesnyy-chlen" class="text-accent hover:underline font-bold">→ Наступний: Почесний Член</a></li>
      </ul>

      <div class="border-l-4 border-accent bg-accent/5 p-4 mt-6">
        <p class="text-timber-dark"><strong>💭 Підказка:</strong> Тепер ви повноцінний член! Допоможіть вашим рефералам також стати членами для наступного підвищення.</p>
      </div>
    </div>',
    'Повноцінне членство з правом голосу та участю в подіях.',
    'members',
    '["член", "рівень 2", "голосування", "події", "завдання"]'::jsonb,
    'published',
    author_id,
    NOW()
  ) ON CONFLICT (slug) DO UPDATE SET content = EXCLUDED.content, updated_at = NOW();

  -- 6. Insert Level 3: Почесний Член
  INSERT INTO help_articles (
    category_id, title, slug, content, excerpt,
    audience, keywords, status, author_id, published_at
  ) VALUES (
    category_id,
    'Рівень 3: Почесний Член',
    'riven-3-pochesnyy-chlen',
    '<div class="space-y-6">
      <div class="bg-gradient-to-r from-purple-50 to-purple-100 border-2 border-timber-dark p-6">
        <h2 class="font-syne text-3xl font-bold text-purple-700 mb-4">🟣 Рівень 3: Почесний Член</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div><strong>Колір:</strong> <span class="text-purple-500">●</span> Фіолетовий</div>
          <div><strong>Іконка:</strong> Award</div>
          <div><strong>Наступний:</strong> <a href="/help/rivni-chlenstva/riven-4-lider-merezhi" class="text-accent hover:underline">Лідер Мережі →</a></div>
        </div>
      </div>

      <h3 class="font-syne text-xl font-bold text-timber-dark">✨ Привілеї цього рівня</h3>
      <ul class="list-disc list-inside space-y-2 ml-4">
        <li><strong>Всі попередні привілеї</strong> — Голосування, події, завдання</li>
        <li><strong>Програма лояльності</strong> — Спеціальні пропозиції та бонуси</li>
        <li><strong>Почесний статус</strong> — Визнання досягнень у Мережі</li>
      </ul>

      <h3 class="font-syne text-xl font-bold text-timber-dark mt-6">📈 Вимоги для підвищення до Лідера Мережі</h3>
      <table class="w-full border-2 border-timber-dark mt-4">
        <thead>
          <tr class="bg-accent/20">
            <th class="p-3 text-left">Вимога</th>
            <th class="p-3 text-left">Кількість</th>
            <th class="p-3 text-left">Опис</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="p-3 border-t border-timber-dark/20">👥 Прямі реферали</td>
            <td class="p-3 border-t border-timber-dark/20">8 осіб</td>
            <td class="p-3 border-t border-timber-dark/20">Особисто запрошених членів</td>
          </tr>
          <tr>
            <td class="p-3 border-t border-timber-dark/20">🌐 Загальна мережа</td>
            <td class="p-3 border-t border-timber-dark/20">49 осіб</td>
            <td class="p-3 border-t border-timber-dark/20">Весь реферальний спадок</td>
          </tr>
        </tbody>
      </table>

      <h3 class="font-syne text-xl font-bold text-timber-dark mt-6">🎓 Поради для успіху</h3>
      <ul class="list-disc list-inside space-y-2 ml-4">
        <li>Активно будуйте вашу мережу — шукайте активних людей</li>
        <li>Навчайте реферали ефективно залучати нових членів</li>
        <li>Використовуйте програму лояльності</li>
        <li>Готуйтеся до лідерських обов''язків</li>
      </ul>

      <div class="border-l-4 border-accent bg-accent/5 p-4 mt-6">
        <p class="text-timber-dark"><strong>💭 Підказка:</strong> Для досягнення наступного рівня потрібна стабільна мережа. Фокусуйтесь на якості, а не лише на кількості!</p>
      </div>
    </div>',
    'Почесний статус з доступом до програми лояльності.',
    'members',
    '["почесний член", "рівень 3", "програма лояльності"]'::jsonb,
    'published',
    author_id,
    NOW()
  ) ON CONFLICT (slug) DO UPDATE SET content = EXCLUDED.content, updated_at = NOW();

  -- 7. Insert Level 4: Лідер Мережі
  INSERT INTO help_articles (
    category_id, title, slug, content, excerpt,
    audience, keywords, status, author_id, published_at
  ) VALUES (
    category_id,
    'Рівень 4: Лідер Мережі',
    'riven-4-lider-merezhi',
    '<div class="space-y-6">
      <div class="bg-gradient-to-r from-orange-50 to-orange-100 border-2 border-timber-dark p-6">
        <h2 class="font-syne text-3xl font-bold text-orange-700 mb-4">🟠 Рівень 4: Лідер Мережі</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div><strong>Колір:</strong> <span class="text-orange-500">●</span> Помаранчевий</div>
          <div><strong>Іконка:</strong> Crown</div>
          <div><strong>Наступний:</strong> <a href="/help/rivni-chlenstva/riven-5-rehionalnyy-lider" class="text-accent hover:underline">Регіональний лідер →</a></div>
        </div>
      </div>

      <h3 class="font-syne text-xl font-bold text-timber-dark">✨ Привілеї цього рівня</h3>
      <ul class="list-disc list-inside space-y-2 ml-4">
        <li><strong>Всі попередні привілеї</strong> — Повний доступ до платформи</li>
        <li><strong>Номінація кандидатів</strong> — Право висувати кандидатів</li>
        <li><strong>Рада Лідерів</strong> — Участь у стратегічних рішеннях</li>
        <li><strong>Організація подій</strong> — Можливість створювати події</li>
      </ul>

      <h3 class="font-syne text-xl font-bold text-timber-dark mt-6">📈 Вимоги для підвищення до Регіонального лідера</h3>
      <table class="w-full border-2 border-timber-dark mt-4">
        <thead>
          <tr class="bg-accent/20">
            <th class="p-3 text-left">Вимога</th>
            <th class="p-3 text-left">Кількість</th>
            <th class="p-3 text-left">Опис</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="p-3 border-t border-timber-dark/20">⬆️ Допомога стати Лідерами</td>
            <td class="p-3 border-t border-timber-dark/20">6 осіб</td>
            <td class="p-3 border-t border-timber-dark/20">Ваші реферали стали Лідерами Мережі</td>
          </tr>
          <tr>
            <td class="p-3 border-t border-timber-dark/20">🌐 Загальна мережа</td>
            <td class="p-3 border-t border-timber-dark/20">400 осіб</td>
            <td class="p-3 border-t border-timber-dark/20">Весь реферальний спадок</td>
          </tr>
        </tbody>
      </table>

      <h3 class="font-syne text-xl font-bold text-timber-dark mt-6">🎓 Поради для успіху</h3>
      <ul class="list-disc list-inside space-y-2 ml-4">
        <li>Активно беріть участь у Раді Лідерів</li>
        <li>Організовуйте регіональні події</li>
        <li>Наставляйте майбутніх лідерів у вашій мережі</li>
        <li>Розвивайте лідерські навички</li>
      </ul>

      <div class="border-l-4 border-accent bg-accent/5 p-4 mt-6">
        <p class="text-timber-dark"><strong>💭 Підказка:</strong> Ви тепер лідер! Фокусуйтесь на розвитку інших лідерів у вашій мережі.</p>
      </div>
    </div>',
    'Лідерський рівень з правом номінації та участю в Раді Лідерів.',
    'leaders',
    '["лідер мережі", "рівень 4", "рада лідерів", "номінація"]'::jsonb,
    'published',
    author_id,
    NOW()
  ) ON CONFLICT (slug) DO UPDATE SET content = EXCLUDED.content, updated_at = NOW();

  -- 8. Insert Level 5: Регіональний лідер
  INSERT INTO help_articles (
    category_id, title, slug, content, excerpt,
    audience, keywords, status, author_id, published_at
  ) VALUES (
    category_id,
    'Рівень 5: Регіональний лідер',
    'riven-5-rehionalnyy-lider',
    '<div class="space-y-6">
      <div class="bg-gradient-to-r from-red-50 to-red-100 border-2 border-timber-dark p-6">
        <h2 class="font-syne text-3xl font-bold text-red-700 mb-4">🔴 Рівень 5: Регіональний лідер</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div><strong>Колір:</strong> <span class="text-red-500">●</span> Червоний</div>
          <div><strong>Іконка:</strong> MapPin</div>
          <div><strong>Наступний:</strong> <a href="/help/rivni-chlenstva/riven-6-natsionalnyy-lider" class="text-accent hover:underline">Національний лідер →</a></div>
        </div>
      </div>

      <h3 class="font-syne text-xl font-bold text-timber-dark">✨ Привілеї цього рівня</h3>
      <ul class="list-disc list-inside space-y-2 ml-4">
        <li><strong>Всі попередні привілеї</strong> — Повний функціонал платформи</li>
        <li><strong>Адмін-панель</strong> — Доступ до адміністративних функцій</li>
        <li><strong>Пріоритет на посаду мера</strong> — Висування на місцеві вибори</li>
        <li><strong>Управління регіоном</strong> — Координація діяльності в області</li>
      </ul>

      <h3 class="font-syne text-xl font-bold text-timber-dark mt-6">📈 Вимоги для підвищення до Національного лідера</h3>
      <table class="w-full border-2 border-timber-dark mt-4">
        <thead>
          <tr class="bg-accent/20">
            <th class="p-3 text-left">Вимога</th>
            <th class="p-3 text-left">Кількість</th>
            <th class="p-3 text-left">Опис</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="p-3 border-t border-timber-dark/20">⬆️ Допомога стати Регіональними</td>
            <td class="p-3 border-t border-timber-dark/20">4 особи</td>
            <td class="p-3 border-t border-timber-dark/20">Ваші реферали стали Регіональними лідерами</td>
          </tr>
          <tr>
            <td class="p-3 border-t border-timber-dark/20">🌐 Загальна мережа</td>
            <td class="p-3 border-t border-timber-dark/20">4000 осіб</td>
            <td class="p-3 border-t border-timber-dark/20">Весь реферальний спадок</td>
          </tr>
        </tbody>
      </table>

      <h3 class="font-syne text-xl font-bold text-timber-dark mt-6">🎓 Поради для успіху</h3>
      <ul class="list-disc list-inside space-y-2 ml-4">
        <li>Координуйте діяльність лідерів у вашому регіоні</li>
        <li>Використовуйте адмін-панель для аналітики</li>
        <li>Організовуйте обласні заходи та ініціативи</li>
        <li>Готуйтесь до участі в місцевих виборах</li>
      </ul>

      <div class="border-l-4 border-accent bg-accent/5 p-4 mt-6">
        <p class="text-timber-dark"><strong>💭 Підказка:</strong> Регіональні лідери мають адміністративні повноваження. Використовуйте їх відповідально!</p>
      </div>
    </div>',
    'Регіональне лідерство з доступом до адмін-панелі та пріоритетом на посаду мера.',
    'admins',
    '["регіональний лідер", "рівень 5", "адмін панель", "мер"]'::jsonb,
    'published',
    author_id,
    NOW()
  ) ON CONFLICT (slug) DO UPDATE SET content = EXCLUDED.content, updated_at = NOW();

  -- 9. Insert Level 6: Національний лідер
  INSERT INTO help_articles (
    category_id, title, slug, content, excerpt,
    audience, keywords, status, author_id, published_at
  ) VALUES (
    category_id,
    'Рівень 6: Національний лідер',
    'riven-6-natsionalnyy-lider',
    '<div class="space-y-6">
      <div class="bg-gradient-to-r from-yellow-50 to-yellow-100 border-2 border-timber-dark p-6">
        <h2 class="font-syne text-3xl font-bold text-yellow-700 mb-4">🟡 Рівень 6: Національний лідер</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div><strong>Колір:</strong> <span class="text-yellow-500">●</span> Золотий</div>
          <div><strong>Іконка:</strong> Globe</div>
          <div><strong>Наступний:</strong> <a href="/help/rivni-chlenstva/riven-7-providnyk-merezhi" class="text-accent hover:underline">Провідник Мережі →</a></div>
        </div>
      </div>

      <h3 class="font-syne text-xl font-bold text-timber-dark">✨ Привілеї цього рівня</h3>
      <ul class="list-disc list-inside space-y-2 ml-4">
        <li><strong>Всі попередні привілеї</strong> — Повні можливості платформи</li>
        <li><strong>Пріоритет на посаду депутата</strong> — Висування в парламент</li>
        <li><strong>Пріоритет на посаду президента</strong> — Висування на президентські вибори</li>
        <li><strong>Національна координація</strong> — Керівництво на рівні країни</li>
      </ul>

      <h3 class="font-syne text-xl font-bold text-timber-dark mt-6">📈 Вимоги для підвищення до Провідника Мережі</h3>
      <table class="w-full border-2 border-timber-dark mt-4">
        <thead>
          <tr class="bg-accent/20">
            <th class="p-3 text-left">Вимога</th>
            <th class="p-3 text-left">Кількість</th>
            <th class="p-3 text-left">Опис</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="p-3 border-t border-timber-dark/20">⬆️ Допомога стати Національними</td>
            <td class="p-3 border-t border-timber-dark/20">2 особи</td>
            <td class="p-3 border-t border-timber-dark/20">Ваші реферали стали Національними лідерами</td>
          </tr>
          <tr>
            <td class="p-3 border-t border-timber-dark/20">🌐 Загальна мережа</td>
            <td class="p-3 border-t border-timber-dark/20">25000 осіб</td>
            <td class="p-3 border-t border-timber-dark/20">Весь реферальний спадок</td>
          </tr>
        </tbody>
      </table>

      <h3 class="font-syne text-xl font-bold text-timber-dark mt-6">🎓 Поради для успіху</h3>
      <ul class="list-disc list-inside space-y-2 ml-4">
        <li>Координуйте діяльність на національному рівні</li>
        <li>Готуйтесь до участі в парламентських виборах</li>
        <li>Розвивайте стратегічне бачення для країни</li>
        <li>Наставляйте майбутніх національних лідерів</li>
      </ul>

      <div class="border-l-4 border-accent bg-accent/5 p-4 mt-6">
        <p class="text-timber-dark"><strong>💭 Підказка:</strong> Національні лідери формують майбутнє України. Велика відповідальність вимагає великої мудрості!</p>
      </div>
    </div>',
    'Національне лідерство з пріоритетом на посади депутата та президента.',
    'admins',
    '["національний лідер", "рівень 6", "депутат", "президент"]'::jsonb,
    'published',
    author_id,
    NOW()
  ) ON CONFLICT (slug) DO UPDATE SET content = EXCLUDED.content, updated_at = NOW();

  -- 10. Insert Level 7: Провідник Мережі
  INSERT INTO help_articles (
    category_id, title, slug, content, excerpt,
    audience, keywords, status, author_id, published_at
  ) VALUES (
    category_id,
    'Рівень 7: Провідник Мережі',
    'riven-7-providnyk-merezhi',
    '<div class="space-y-6">
      <div class="bg-gradient-to-r from-gray-50 via-gray-100 to-white border-2 border-timber-dark p-6">
        <h2 class="font-syne text-3xl font-bold text-gray-800 mb-4">⚪ Рівень 7: Провідник Мережі</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div><strong>Колір:</strong> <span class="text-gray-300">●</span> Платиновий</div>
          <div><strong>Іконка:</strong> Star</div>
          <div><strong>Наступний:</strong> — <em>Найвищий рівень</em></div>
        </div>
      </div>

      <h3 class="font-syne text-xl font-bold text-timber-dark">✨ Привілеї цього рівня</h3>
      <ul class="list-disc list-inside space-y-2 ml-4">
        <li><strong>Всі попередні привілеї</strong> — Максимальні можливості</li>
        <li><strong>Контроль 70% бюджету</strong> — Участь у бюджетних рішеннях</li>
        <li><strong>Стратегічне керівництво</strong> — Визначення напрямку Мережі</li>
        <li><strong>Найвищий статус</strong> — Визнання як основоположника</li>
      </ul>

      <h3 class="font-syne text-xl font-bold text-timber-dark mt-6">🏆 Вітаємо!</h3>
      <p class="text-timber-beam">Ви досягли найвищого рівня в Мережі Вільних Людей. Це визнання вашого величезного внеску в розбудову демократичного суспільства.</p>

      <p class="text-timber-beam mt-4">Провідники Мережі:</p>
      <ul class="list-disc list-inside space-y-2 ml-4 text-timber-beam">
        <li>Формують стратегічний напрямок організації</li>
        <li>Беруть участь у найважливіших бюджетних рішеннях</li>
        <li>Є взірцем для сотень тисяч членів</li>
        <li>Несуть відповідальність за майбутнє України</li>
      </ul>

      <h3 class="font-syne text-xl font-bold text-timber-dark mt-6">🎓 Ваша роль</h3>
      <ul class="list-disc list-inside space-y-2 ml-4">
        <li>Наставляйте національних лідерів</li>
        <li>Візіонерське мислення для країни</li>
        <li>Відповідальне управління ресурсами</li>
        <li>Втілення цінностей Мережі</li>
      </ul>

      <div class="border-l-4 border-accent bg-accent/5 p-4 mt-6">
        <p class="text-timber-dark"><strong>💭 Шана:</strong> Дякуємо за вашу віру, працю та відданість справі вільної України!</p>
      </div>
    </div>',
    'Найвищий рівень з контролем бюджету та стратегічним керівництвом.',
    'admins',
    '["провідник", "рівень 7", "найвищий рівень", "бюджет"]'::jsonb,
    'published',
    author_id,
    NOW()
  ) ON CONFLICT (slug) DO UPDATE SET content = EXCLUDED.content, updated_at = NOW();

  RAISE NOTICE 'All 9 progression help articles created successfully!';

END $$;
