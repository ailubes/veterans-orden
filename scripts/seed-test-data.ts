#!/usr/bin/env tsx

/**
 * Test Data Seed Script for Ukrainian Veterans Platform
 *
 * This script populates the database with realistic test data for development and testing.
 * It is idempotent - safe to run multiple times without creating duplicates.
 *
 * Usage: npm run seed:test
 */

import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';

// Environment validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// ============================================
// UKRAINIAN TEST DATA
// ============================================

const FIRST_NAMES = [
  'Олександр', 'Андрій', 'Василь', 'Дмитро', 'Євген', 'Іван', 'Максим', 'Михайло',
  'Олег', 'Сергій', 'Тарас', 'Юрій', 'Богдан', 'Віталій', 'Григорій', 'Ярослав',
  'Анна', 'Марія', 'Олена', 'Наталія', 'Тетяна', 'Ірина', 'Катерина', 'Людмила'
];

const LAST_NAMES = [
  'Коваленко', 'Бойко', 'Мельник', 'Шевченко', 'Ткаченко', 'Кравченко', 'Ковальчук',
  'Петренко', 'Савченко', 'Іваненко', 'Павленко', 'Гриценко', 'Дорошенко', 'Марченко',
  'Козак', 'Лисенко', 'Романенко', 'Гончаренко', 'Симоненко', 'Василенко'
];

// ============================================
// HELPER FUNCTIONS
// ============================================

function randomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function generateEmail(firstName: string, lastName: string, index: number): string {
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${index}@test.merezha.org`;
}

function generateReferralCode(firstName: string, lastName: string): string {
  const base = `${firstName.slice(0, 2)}${lastName.slice(0, 2)}`.toUpperCase();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `TEST${base}${random}`;
}

// ============================================
// SEED FUNCTIONS
// ============================================

async function getOblasts() {
  const { data, error } = await supabase.from('oblasts').select('id, name').limit(25);
  if (error || !data || data.length === 0) {
    console.log('   No oblasts found, using null for oblast_id');
    return null;
  }
  return data;
}

async function seedUsers(oblasts: { id: string; name: string }[] | null) {
  console.log('\nSeeding users...');

  const roles: { role: string; count: number }[] = [
    { role: 'super_admin', count: 1 },
    { role: 'admin', count: 2 },
    { role: 'regional_leader', count: 3 },
    { role: 'full_member', count: 6 },
    { role: 'silent_member', count: 3 },
    { role: 'prospect', count: 3 },
    { role: 'free_viewer', count: 2 }
  ];

  const membershipTiers = ['free', 'basic_49', 'supporter_100', 'supporter_200', 'patron_500'];

  let totalCreated = 0;
  let totalSkipped = 0;
  let userIndex = 0;

  for (const { role, count } of roles) {
    for (let i = 0; i < count; i++) {
      const firstName = randomItem(FIRST_NAMES);
      const lastName = randomItem(LAST_NAMES);
      const email = generateEmail(firstName, lastName, userIndex++);

      // Check if user already exists
      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (existing) {
        console.log(`   Skipping existing user: ${email}`);
        totalSkipped++;
        continue;
      }

      const userData = {
        clerk_id: `test_supabase_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        email,
        first_name: firstName,
        last_name: lastName,
        phone: `+380${Math.floor(Math.random() * 900000000 + 100000000)}`,
        oblast_id: oblasts ? randomItem(oblasts).id : null,
        role,
        status: 'active',
        membership_tier: randomItem(membershipTiers),
        points: Math.floor(Math.random() * 1000),
        referral_code: generateReferralCode(firstName, lastName),
        is_verified: true,
        created_at: randomDate(new Date('2024-01-01'), new Date()).toISOString()
      };

      const { error } = await supabase.from('users').insert(userData);

      if (error) {
        console.error(`   Failed to create user ${email}:`, error.message);
      } else {
        console.log(`   Created ${role}: ${firstName} ${lastName}`);
        totalCreated++;
      }
    }
  }

  console.log(`   Users: ${totalCreated} created, ${totalSkipped} skipped`);
  return totalCreated;
}

async function seedEvents(oblasts: { id: string; name: string }[] | null) {
  console.log('\nSeeding events...');

  const eventTypes = ['meeting', 'rally', 'training', 'social', 'online', 'other'];
  const scopes = ['national', 'regional', 'local'];

  const eventTemplates = [
    { title: 'Зустріч ветеранів Київської області', description: 'Щомісячна зустріч для обміну досвідом та підтримки' },
    { title: 'Майстер-клас з резюме та співбесід', description: 'Практичний воркшоп для пошуку роботи' },
    { title: 'Онлайн-конференція "Підприємництво після служби"', description: 'Досвід успішних ветеранів-підприємців' },
    { title: 'Соціальна зустріч у Львові', description: 'Неформальне спілкування та знайомства' },
    { title: 'Тренінг з психологічної підтримки', description: 'Групова терапія та методики подолання стресу' },
    { title: 'Хакатон ветеранських ініціатив', description: '48 годин розробки соціальних проєктів' },
    { title: 'Спортивні змагання', description: 'Командні спортивні ігри та естафети' },
    { title: 'Круглий стіл з представниками бізнесу', description: 'Обговорення працевлаштування ветеранів' },
    { title: 'Вечір пам\'яті та вшанування', description: 'Спільне вшанування пам\'яті загиблих побратимів' },
    { title: 'Презентація нових можливостей Мережі', description: 'Огляд нових функцій платформи' }
  ];

  let totalCreated = 0;
  let totalSkipped = 0;

  // Get some users to assign as organizers
  const { data: organizers } = await supabase
    .from('users')
    .select('id')
    .in('role', ['admin', 'regional_leader', 'super_admin'])
    .limit(5);

  for (const template of eventTemplates) {
    // Check if event already exists
    const { data: existing } = await supabase
      .from('events')
      .select('id')
      .eq('title', template.title)
      .single();

    if (existing) {
      console.log(`   Skipping existing event: ${template.title}`);
      totalSkipped++;
      continue;
    }

    const isPast = Math.random() > 0.6;
    const startDate = isPast
      ? randomDate(new Date('2024-01-01'), new Date())
      : randomDate(new Date(), new Date('2025-12-31'));

    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + 3);

    const isOnline = Math.random() > 0.5;

    const eventData = {
      title: template.title,
      description: template.description,
      type: randomItem(eventTypes),
      scope: randomItem(scopes),
      is_online: isOnline,
      location: !isOnline && oblasts ? { address: `${randomItem(oblasts).name}, Україна` } : null,
      online_url: isOnline ? 'https://meet.google.com/xxx-yyyy-zzz' : null,
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      max_attendees: Math.floor(Math.random() * 50 + 20),
      created_by: organizers && organizers.length > 0 ? randomItem(organizers).id : null,
      points_reward: Math.floor(Math.random() * 50 + 10),
      status: isPast ? 'completed' : 'published'
    };

    const { error } = await supabase.from('events').insert(eventData);

    if (error) {
      console.error(`   Failed to create event:`, error.message);
    } else {
      console.log(`   Created event: ${template.title}`);
      totalCreated++;
    }
  }

  console.log(`   Events: ${totalCreated} created, ${totalSkipped} skipped`);
  return totalCreated;
}

async function seedVotes() {
  console.log('\nSeeding votes...');

  const voteTemplates = [
    {
      title: 'Вибори регіонального лідера Київської області',
      description: 'Оберіть лідера, який представлятиме ветеранів Київщини',
      type: 'multiple_choice',
      options: ['Олександр Коваленко', 'Марія Шевченко', 'Андрій Мельник']
    },
    {
      title: 'Яку тему обрати для наступного вебінару?',
      description: 'Голосуйте за тему, яка вас найбільше цікавить',
      type: 'multiple_choice',
      options: ['Підприємництво', 'Психологічна підтримка', 'IT перекваліфікація', 'Юридична допомога']
    },
    {
      title: 'Затвердження бюджету на квартал',
      description: 'Розподіл коштів на основні напрямки діяльності',
      type: 'binary',
      options: ['Схвалити бюджет', 'Відхилити та переглянути']
    },
    {
      title: 'Найкраща ініціатива місяця',
      description: 'Оберіть проєкт, який заслуговує на підтримку',
      type: 'multiple_choice',
      options: ['Ветеранський коворкінг', 'Програма менторства', 'Спортивний клуб']
    },
    {
      title: 'Зміна правил участі у голосуваннях',
      description: 'Пропозиція дозволити голосувати всім членам',
      type: 'binary',
      options: ['За зміну правил', 'Проти змін']
    },
    {
      title: 'Формат щомісячних зустрічей',
      description: 'Як ви хочете проводити регулярні зустрічі?',
      type: 'multiple_choice',
      options: ['Тільки онлайн', 'Тільки офлайн', 'Гібридний формат']
    },
    {
      title: 'Партнерство з освітньою платформою',
      description: 'Чи підтримуєте ви угоду про безкоштовні курси?',
      type: 'binary',
      options: ['Підтримую', 'Не підтримую']
    },
    {
      title: 'Логотип нової ініціативи',
      description: 'Виберіть дизайн для нового проєкту',
      type: 'multiple_choice',
      options: ['Варіант A', 'Варіант B', 'Варіант C']
    },
    {
      title: 'Час проведення онлайн-зустрічей',
      description: 'Який час найзручніший для більшості?',
      type: 'multiple_choice',
      options: ['18:00-19:00', '19:00-20:00', '20:00-21:00']
    },
    {
      title: 'Створення регіонального фонду підтримки',
      description: 'Рішення про створення фонду взаємодопомоги',
      type: 'binary',
      options: ['За створення', 'Проти створення']
    }
  ];

  let totalCreated = 0;
  let totalSkipped = 0;

  // Get admin users for creators
  const { data: admins } = await supabase
    .from('users')
    .select('id')
    .in('role', ['admin', 'super_admin'])
    .limit(5);

  for (let i = 0; i < voteTemplates.length; i++) {
    const template = voteTemplates[i];
    const isClosed = i < 5; // First 5 are closed

    // Check if vote already exists
    const { data: existing } = await supabase
      .from('votes')
      .select('id')
      .eq('title', template.title)
      .single();

    if (existing) {
      console.log(`   Skipping existing vote: ${template.title}`);
      totalSkipped++;
      continue;
    }

    const startDate = isClosed
      ? randomDate(new Date('2024-01-01'), new Date('2024-11-01'))
      : randomDate(new Date(), new Date());

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + (isClosed ? 7 : 30));

    const voteData = {
      title: template.title,
      description: template.description,
      type: template.type,
      transparency: 'anonymous',
      scope: 'national',
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      created_by: admins && admins.length > 0 ? randomItem(admins).id : null,
      status: isClosed ? 'closed' : 'active',
      eligible_roles: ['full_member', 'regional_leader', 'admin', 'super_admin'],
      points_reward: 5
    };

    const { data: vote, error: voteError } = await supabase
      .from('votes')
      .insert(voteData)
      .select()
      .single();

    if (voteError) {
      console.error(`   Failed to create vote:`, voteError.message);
      continue;
    }

    // Create options
    for (const optionText of template.options) {
      const optionData = {
        vote_id: vote.id,
        text: optionText
      };

      await supabase.from('vote_options').insert(optionData);
    }

    console.log(`   Created ${isClosed ? 'closed' : 'active'} vote: ${template.title}`);
    totalCreated++;
  }

  console.log(`   Votes: ${totalCreated} created, ${totalSkipped} skipped`);
  return totalCreated;
}

async function seedTasks() {
  console.log('\nSeeding tasks...');

  const taskTypes = ['recruitment', 'outreach', 'event_support', 'content', 'administrative', 'other'];
  const priorities = ['low', 'medium', 'high', 'urgent'];
  const statuses = ['open', 'in_progress', 'completed', 'cancelled'];

  const taskTemplates = [
    { title: 'Перевірити нові заявки на членство', type: 'administrative', priority: 'high' },
    { title: 'Написати пост про успішну ініціативу', type: 'content', priority: 'medium' },
    { title: 'Організувати зустріч у Львові', type: 'event_support', priority: 'medium' },
    { title: 'Модерація коментарів у форумі', type: 'administrative', priority: 'low' },
    { title: 'Залучити 5 нових членів з Одеси', type: 'recruitment', priority: 'high' },
    { title: 'Оновити FAQ на платформі', type: 'content', priority: 'low' },
    { title: 'Підготувати звіт про діяльність', type: 'administrative', priority: 'urgent' },
    { title: 'Зв\'язатися з партнерами', type: 'outreach', priority: 'medium' },
    { title: 'Організувати онлайн-воркшоп', type: 'event_support', priority: 'high' },
    { title: 'Перевірити скарги користувачів', type: 'administrative', priority: 'urgent' },
    { title: 'Створити інфографіку', type: 'content', priority: 'medium' },
    { title: 'Провести опитування членів', type: 'outreach', priority: 'low' },
    { title: 'Оновити базу контактів', type: 'administrative', priority: 'medium' },
    { title: 'Підготувати матеріали для новачків', type: 'content', priority: 'high' },
    { title: 'Організувати благодійну акцію', type: 'event_support', priority: 'medium' },
    { title: 'Перевірити звіти про події', type: 'administrative', priority: 'low' },
    { title: 'Запустити кампанію в соцмережах', type: 'recruitment', priority: 'high' },
    { title: 'Модерація сторінок користувачів', type: 'administrative', priority: 'low' },
    { title: 'Підготувати презентацію', type: 'content', priority: 'urgent' },
    { title: 'Провести майстер-клас з лідерства', type: 'event_support', priority: 'medium' }
  ];

  let totalCreated = 0;
  let totalSkipped = 0;

  // Get users who can be assigned tasks
  const { data: assignees } = await supabase
    .from('users')
    .select('id')
    .limit(10);

  if (!assignees || assignees.length === 0) {
    console.log('   No users found. Skipping tasks.');
    return 0;
  }

  for (const template of taskTemplates) {
    // Check if task already exists
    const { data: existing } = await supabase
      .from('tasks')
      .select('id')
      .eq('title', template.title)
      .single();

    if (existing) {
      console.log(`   Skipping existing task: ${template.title}`);
      totalSkipped++;
      continue;
    }

    const status = randomItem(statuses);
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + Math.floor(Math.random() * 30));

    const taskData = {
      title: template.title,
      description: `Детальний опис завдання: ${template.title}`,
      type: template.type,
      priority: template.priority,
      status,
      points_reward: template.priority === 'urgent' ? 50 : template.priority === 'high' ? 30 : template.priority === 'medium' ? 20 : 10,
      assignee_id: randomItem(assignees).id,
      due_date: dueDate.toISOString(),
      completed_at: status === 'completed' ? randomDate(new Date('2024-11-01'), new Date()).toISOString() : null
    };

    const { error } = await supabase.from('tasks').insert(taskData);

    if (error) {
      console.error(`   Failed to create task:`, error.message);
    } else {
      console.log(`   Created ${template.priority} task: ${template.title}`);
      totalCreated++;
    }
  }

  console.log(`   Tasks: ${totalCreated} created, ${totalSkipped} skipped`);
  return totalCreated;
}

async function seedChallenges() {
  console.log('\nSeeding challenges...');

  const challenges = [
    {
      title: 'Тижневий челендж: Запроси друга',
      description: 'Запросіть 3 нових членів протягом тижня та отримайте бонусні бали',
      type: 'weekly',
      goal_type: 'referrals',
      goal_target: 3,
      points: 100,
      status: 'active',
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      title: 'Місячний челендж: Активний учасник',
      description: 'Відвідайте 5 подій протягом місяця',
      type: 'monthly',
      goal_type: 'events',
      goal_target: 5,
      points: 250,
      status: 'active',
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      title: 'Спеціальний челендж: Новорічний марафон',
      description: 'Виконайте 10 завдань та отримайте ексклюзивний мерч',
      type: 'special',
      goal_type: 'tasks',
      goal_target: 10,
      points: 500,
      status: 'upcoming',
      start_date: new Date('2025-12-01').toISOString(),
      end_date: new Date('2025-12-31').toISOString()
    }
  ];

  let totalCreated = 0;
  let totalSkipped = 0;

  for (const challenge of challenges) {
    // Check if challenge already exists
    const { data: existing } = await supabase
      .from('challenges')
      .select('id')
      .eq('title', challenge.title)
      .single();

    if (existing) {
      console.log(`   Skipping existing challenge: ${challenge.title}`);
      totalSkipped++;
      continue;
    }

    const { error } = await supabase.from('challenges').insert(challenge);

    if (error) {
      console.error(`   Failed to create challenge:`, error.message);
    } else {
      console.log(`   Created ${challenge.type} challenge: ${challenge.title}`);
      totalCreated++;
    }
  }

  console.log(`   Challenges: ${totalCreated} created, ${totalSkipped} skipped`);
  return totalCreated;
}

async function seedProducts() {
  console.log('\nSeeding marketplace products...');

  const products = [
    {
      name: 'Veteran T-shirt',
      name_uk: 'Ветеранська футболка "Вільні Люди"',
      description: 'High-quality cotton t-shirt with network logo',
      description_uk: 'Високоякісна бавовняна футболка з логотипом Мережі',
      slug: 'veteran-tshirt',
      type: 'physical',
      status: 'active',
      price_points: 500
    },
    {
      name: 'Career Consultation',
      name_uk: 'Консультація з кар\'єрного розвитку',
      description: 'One hour individual consultation with HR expert',
      description_uk: 'Година індивідуальної консультації з HR експертом',
      slug: 'career-consultation',
      type: 'digital',
      status: 'active',
      price_points: 1000
    },
    {
      name: 'IT Course Access',
      name_uk: 'Доступ до онлайн-курсу "IT для початківців"',
      description: '3-month programming course for beginners',
      description_uk: '3-місячний курс програмування з нуля',
      slug: 'it-course',
      type: 'digital',
      status: 'active',
      price_points: 2000
    },
    {
      name: 'Network Cap',
      name_uk: 'Фірмова кепка',
      description: 'Stylish cap with embroidered logo',
      description_uk: 'Стильна кепка з вишивкою логотипу',
      slug: 'network-cap',
      type: 'physical',
      status: 'active',
      price_points: 300
    },
    {
      name: 'Legal Consultation',
      name_uk: 'Юридична консультація',
      description: 'Consultation on legal matters',
      description_uk: 'Консультація з юридичних питань',
      slug: 'legal-consultation',
      type: 'digital',
      status: 'active',
      price_points: 800
    },
    {
      name: 'Psychology Session',
      name_uk: 'Психологічна підтримка (сесія)',
      description: 'Online session with certified psychologist',
      description_uk: 'Онлайн сесія з сертифікованим психологом',
      slug: 'psychology-session',
      type: 'digital',
      status: 'active',
      price_points: 1200
    },
    {
      name: 'Sticker Pack',
      name_uk: 'Набір стікерів',
      description: 'Set of 10 unique stickers',
      description_uk: 'Комплект з 10 унікальних стікерів',
      slug: 'sticker-pack',
      type: 'physical',
      status: 'active',
      price_points: 150
    },
    {
      name: 'Business Masterclass',
      name_uk: 'Майстер-клас з підприємництва',
      description: 'Practical workshop from successful entrepreneurs',
      description_uk: 'Практичний воркшоп від успішних бізнесменів',
      slug: 'business-masterclass',
      type: 'event_ticket',
      status: 'active',
      price_points: 1500
    },
    {
      name: 'Network Backpack',
      name_uk: 'Фірмовий рюкзак',
      description: 'Comfortable backpack for everyday use',
      description_uk: 'Зручний рюкзак для повсякденного використання',
      slug: 'network-backpack',
      type: 'physical',
      status: 'active',
      price_points: 800
    },
    {
      name: 'Coworking Access',
      name_uk: 'Доступ до ветеранського коворкінгу',
      description: 'Monthly subscription to coworking space',
      description_uk: 'Місячний абонемент у коворкінг простір',
      slug: 'coworking-access',
      type: 'digital',
      status: 'active',
      price_points: 2500
    }
  ];

  let totalCreated = 0;
  let totalSkipped = 0;

  for (const product of products) {
    // Check if product already exists
    const { data: existing } = await supabase
      .from('products')
      .select('id')
      .eq('slug', product.slug)
      .single();

    if (existing) {
      console.log(`   Skipping existing product: ${product.name_uk}`);
      totalSkipped++;
      continue;
    }

    const { error } = await supabase.from('products').insert(product);

    if (error) {
      console.error(`   Failed to create product:`, error.message);
    } else {
      console.log(`   Created product: ${product.name_uk} (${product.price_points} points)`);
      totalCreated++;
    }
  }

  console.log(`   Products: ${totalCreated} created, ${totalSkipped} skipped`);
  return totalCreated;
}

// ============================================
// MAIN EXECUTION
// ============================================

async function main() {
  console.log('Starting test data seed for Ukrainian Veterans Platform\n');
  console.log('========================================================');

  try {
    // Test connection
    const { error: connectionError } = await supabase.from('users').select('count').limit(1);
    if (connectionError) {
      throw new Error(`Database connection failed: ${connectionError.message}`);
    }
    console.log('Database connection successful');

    // Get oblasts for geographic distribution
    const oblasts = await getOblasts();

    // Seed all data
    const usersCreated = await seedUsers(oblasts);
    const eventsCreated = await seedEvents(oblasts);
    const votesCreated = await seedVotes();
    const tasksCreated = await seedTasks();
    const challengesCreated = await seedChallenges();
    const productsCreated = await seedProducts();

    console.log('\n========================================================');
    console.log('Test data seeding completed!');
    console.log(`\nSummary:`);
    console.log(`  Users: ${usersCreated}`);
    console.log(`  Events: ${eventsCreated}`);
    console.log(`  Votes: ${votesCreated}`);
    console.log(`  Tasks: ${tasksCreated}`);
    console.log(`  Challenges: ${challengesCreated}`);
    console.log(`  Products: ${productsCreated}`);
    console.log('\nYou can now test the dashboard features with this data.');

  } catch (error) {
    console.error('\nSeeding failed:', error);
    process.exit(1);
  }
}

// Run the script
main();
