// Membership tiers
export const MEMBERSHIP_TIERS = {
  basic_49: {
    id: 'basic_49',
    name: 'Базовий',
    price: 49,
    description: 'Повноправний член Мережі',
    benefits: ['Голосування', 'Події', 'Завдання', 'Реферали'],
  },
  supporter_100: {
    id: 'supporter_100',
    name: 'Підтримка',
    price: 100,
    description: 'Базовий + подяка на сайті',
    benefits: ['Все з Базового', 'Ім\'я на сторінці подяки'],
  },
  supporter_200: {
    id: 'supporter_200',
    name: 'Підтримка+',
    price: 200,
    description: 'Підтримка + згадка у звітах',
    benefits: ['Все з Підтримки', 'Згадка у щомісячних звітах'],
  },
  patron_500: {
    id: 'patron_500',
    name: 'Меценат',
    price: 500,
    description: 'Максимальна підтримка',
    benefits: ['Все з Підтримки+', 'Персональна подяка'],
  },
} as const;

// User roles hierarchy (Legacy - kept for backwards compatibility)
export const USER_ROLES = {
  free_viewer: { level: 0, label: 'Безкоштовний глядач' },
  prospect: { level: 1, label: 'Кандидат' },
  silent_member: { level: 2, label: 'Тихий член' },
  full_member: { level: 3, label: 'Повний член' },
  group_leader: { level: 4, label: 'Лідер осередку' },
  regional_leader: { level: 5, label: 'Обласний координатор' },
  admin: { level: 6, label: 'Адміністратор' },
  super_admin: { level: 7, label: 'Супер-адміністратор' },
} as const;

// New Membership Role Progression System (8-tier hierarchy)
export const MEMBERSHIP_ROLES = {
  supporter: {
    level: 0,
    key: 'supporter',
    label: 'Прихильник',
    description: 'Зареєстрований користувач без внеску',
    color: 'gray',
    icon: 'UserPlus',
    privileges: ['newsletter'],
  },
  candidate: {
    level: 1,
    key: 'candidate',
    label: 'Кандидат в члени',
    description: 'Зробив перший внесок від 49 грн',
    color: 'blue',
    icon: 'UserCheck',
    privileges: ['newsletter', 'primary_voting'],
  },
  member: {
    level: 2,
    key: 'member',
    label: 'Член Мережі',
    description: 'Залучив 2 кандидатів',
    color: 'green',
    icon: 'Users',
    privileges: ['newsletter', 'primary_voting', 'full_voting', 'events', 'tasks'],
  },
  honorary_member: {
    level: 3,
    key: 'honorary_member',
    label: 'Почесний Член',
    description: '2 залучених стали Членами',
    color: 'purple',
    icon: 'Award',
    privileges: ['newsletter', 'primary_voting', 'full_voting', 'events', 'tasks', 'loyalty_program'],
  },
  network_leader: {
    level: 4,
    key: 'network_leader',
    label: 'Лідер Мережі',
    description: '8 особистих + 49 загальних рефералів',
    color: 'orange',
    icon: 'Crown',
    privileges: ['newsletter', 'primary_voting', 'full_voting', 'events', 'tasks', 'loyalty_program', 'nomination', 'leaders_council'],
  },
  regional_leader: {
    level: 5,
    key: 'regional_leader',
    label: 'Регіональний лідер',
    description: '6 допомогли стати Лідерами + 400 загальних',
    color: 'red',
    icon: 'MapPin',
    privileges: ['newsletter', 'primary_voting', 'full_voting', 'events', 'tasks', 'loyalty_program', 'nomination', 'leaders_council', 'mayor_priority'],
  },
  national_leader: {
    level: 6,
    key: 'national_leader',
    label: 'Національний лідер',
    description: '4 допомогли стати Регіональними + 4000 загальних',
    color: 'gold',
    icon: 'Globe',
    privileges: ['newsletter', 'primary_voting', 'full_voting', 'events', 'tasks', 'loyalty_program', 'nomination', 'leaders_council', 'mayor_priority', 'mp_priority', 'president_priority'],
  },
  network_guide: {
    level: 7,
    key: 'network_guide',
    label: 'Провідник Мережі',
    description: '2 допомогли стати Національними + 25000 загальних',
    color: 'platinum',
    icon: 'Star',
    privileges: ['newsletter', 'primary_voting', 'full_voting', 'events', 'tasks', 'loyalty_program', 'nomination', 'leaders_council', 'mayor_priority', 'mp_priority', 'president_priority', 'budget_control'],
  },
} as const;

// Staff roles (administrative, separate from membership progression)
export const STAFF_ROLES = {
  none: { level: 0, label: 'Без ролі', description: 'Звичайний користувач' },
  news_editor: { level: 1, label: 'Редактор новин', description: 'Управління контентом та новинами' },
  admin: { level: 2, label: 'Адміністратор', description: 'Управління користувачами та налаштуваннями' },
  super_admin: { level: 3, label: 'Супер-адміністратор', description: 'Повний доступ до системи' },
} as const;

// Privilege labels in Ukrainian
export const PRIVILEGE_LABELS = {
  newsletter: 'Розсилка новин',
  primary_voting: 'Голосування на праймеріз',
  full_voting: 'Повне голосування',
  events: 'Участь у подіях',
  tasks: 'Виконання завдань',
  loyalty_program: 'Програма лояльності',
  nomination: 'Право на номінацію',
  leaders_council: 'Рада Лідерів',
  mayor_priority: 'Пріоритет на мера',
  mp_priority: 'Пріоритет на депутата',
  president_priority: 'Пріоритет на президента',
  budget_control: 'Контроль 70% бюджету',
} as const;

// Membership role type
export type MembershipRole = keyof typeof MEMBERSHIP_ROLES;
export type StaffRole = keyof typeof STAFF_ROLES;

// Ukrainian labels for membership roles (for UI display)
export const MEMBERSHIP_ROLES_UA: Record<MembershipRole, string> = {
  supporter: 'Прихильник',
  candidate: 'Кандидат',
  member: 'Член Мережі',
  honorary_member: 'Почесний Член',
  network_leader: 'Лідер Мережі',
  regional_leader: 'Регіональний лідер',
  national_leader: 'Національний лідер',
  network_guide: 'Провідник Мережі',
};

// Event types
export const EVENT_TYPES = {
  online: { label: 'Онлайн', icon: 'video' },
  offline: { label: 'Офлайн', icon: 'map-pin' },
  hybrid: { label: 'Гібрид', icon: 'globe' },
} as const;

// Vote types
export const VOTE_TYPES = {
  binary: { label: 'Так/Ні', description: 'Просте голосування за або проти' },
  multiple_choice: { label: 'Вибір', description: 'Вибір одного варіанту з кількох' },
  ranked: { label: 'Рейтинговий', description: 'Розташування варіантів за пріоритетом' },
  approval: { label: 'Схвалення', description: 'Вибір кількох прийнятних варіантів' },
} as const;

// Vote transparency modes
export const VOTE_TRANSPARENCY = {
  anonymous: { label: 'Анонімне', description: 'Індивідуальні голоси приховані' },
  public: { label: 'Публічне', description: 'Голоси видимі всім членам' },
} as const;

// Task types
export const TASK_TYPES = {
  recruitment: { label: 'Рекрутинг', icon: 'users' },
  outreach: { label: 'Охоплення', icon: 'megaphone' },
  event_support: { label: 'Підтримка подій', icon: 'calendar' },
  content: { label: 'Контент', icon: 'file-text' },
  administrative: { label: 'Адміністративне', icon: 'briefcase' },
} as const;

// Points for actions
export const POINTS = {
  vote_cast: 10,
  event_rsvp: 5,
  task_complete_base: 10,
  referral_signup: 25,
  referral_paid: 50,
  challenge_complete: 100,
} as const;

// Ukrainian administrative units (24 oblasts + Crimea + Kyiv + Sevastopol)
export const UKRAINIAN_OBLASTS = [
  { code: 'UA-05', name: 'Вінницька область' },
  { code: 'UA-07', name: 'Волинська область' },
  { code: 'UA-09', name: 'Луганська область' },
  { code: 'UA-12', name: 'Дніпропетровська область' },
  { code: 'UA-14', name: 'Донецька область' },
  { code: 'UA-18', name: 'Житомирська область' },
  { code: 'UA-21', name: 'Закарпатська область' },
  { code: 'UA-23', name: 'Запорізька область' },
  { code: 'UA-26', name: 'Івано-Франківська область' },
  { code: 'UA-30', name: 'Київ' },
  { code: 'UA-32', name: 'Київська область' },
  { code: 'UA-35', name: 'Кіровоградська область' },
  { code: 'UA-40', name: 'Севастополь' },
  { code: 'UA-43', name: 'Автономна Республіка Крим' },
  { code: 'UA-46', name: 'Львівська область' },
  { code: 'UA-48', name: 'Миколаївська область' },
  { code: 'UA-51', name: 'Одеська область' },
  { code: 'UA-53', name: 'Полтавська область' },
  { code: 'UA-56', name: 'Рівненська область' },
  { code: 'UA-59', name: 'Сумська область' },
  { code: 'UA-61', name: 'Тернопільська область' },
  { code: 'UA-63', name: 'Харківська область' },
  { code: 'UA-65', name: 'Херсонська область' },
  { code: 'UA-68', name: 'Хмельницька область' },
  { code: 'UA-71', name: 'Черкаська область' },
  { code: 'UA-74', name: 'Чернігівська область' },
  { code: 'UA-77', name: 'Чернівецька область' },
] as const;

// App configuration
export const APP_CONFIG = {
  name: 'Мережа Вільних Людей',
  tagline: 'ГУРТУЄМОСЬ, ЩОБ ВПЛИВАТИ!',
  memberGoal: 1_000_000,
  currency: 'UAH',
  locale: 'uk-UA',
  defaultTimezone: 'Europe/Kyiv',
} as const;
