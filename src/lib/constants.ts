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
  name: 'Орден Ветеранів',
  tagline: 'ЄДНІСТЬ. ЧЕСТЬ. СПАДЩИНА.',
  memberGoal: 100_000,
  currency: 'UAH',
  locale: 'uk-UA',
  defaultTimezone: 'Europe/Kyiv',
} as const;

// ===========================================
// VETERAN-SPECIFIC CONSTANTS (Order of Veterans)
// ===========================================

// Veteran Membership Roles (participation-based, not referral-based)
export const VETERAN_MEMBERSHIP_ROLES = {
  applicant: {
    level: 0,
    key: 'applicant',
    label: 'Заявник',
    labelEn: 'Applicant',
    description: 'Подано заявку на членство',
    color: 'gray',
    icon: 'FileText',
    privileges: ['apply'],
  },
  community_member: {
    level: 1,
    key: 'community_member',
    label: 'Член Спільноти',
    labelEn: 'Community Member',
    description: 'Відкрите членство у Спільноті',
    color: 'blue',
    icon: 'Users',
    privileges: ['events', 'newsletter', 'basic_voting', 'mentorship_request'],
  },
  order_candidate: {
    level: 2,
    key: 'order_candidate',
    label: 'Кандидат в Орден',
    labelEn: 'Order Candidate',
    description: 'Номінований до Ордену, випробувальний період',
    color: 'amber',
    icon: 'UserCheck',
    privileges: ['events', 'newsletter', 'basic_voting', 'mentorship_request', 'full_voting', 'tasks'],
  },
  order_member: {
    level: 3,
    key: 'order_member',
    label: 'Член Ордену',
    labelEn: 'Order Member',
    description: 'Повноправний член Ордену після ініціації',
    color: 'green',
    icon: 'Shield',
    privileges: ['events', 'newsletter', 'basic_voting', 'mentorship_request', 'full_voting', 'tasks', 'nomination', 'leadership_eligible'],
  },
  veteran_emeritus: {
    level: 4,
    key: 'veteran_emeritus',
    label: 'Почесний Ветеран',
    labelEn: 'Veteran Emeritus',
    description: 'Почесний статус за видатну службу',
    color: 'gold',
    icon: 'Award',
    privileges: ['events', 'newsletter', 'basic_voting', 'mentorship_request', 'full_voting', 'tasks', 'nomination', 'leadership_eligible', 'advisory_council'],
  },
} as const;

// Ukrainian Military Ranks (for tiebreaker)
export const MILITARY_RANKS = {
  // Рядові
  soldier: { level: 1, label: 'Солдат', labelEn: 'Private', category: 'enlisted' },
  senior_soldier: { level: 2, label: 'Старший солдат', labelEn: 'Senior Private', category: 'enlisted' },
  // Сержанти
  junior_sergeant: { level: 3, label: 'Молодший сержант', labelEn: 'Junior Sergeant', category: 'nco' },
  sergeant: { level: 4, label: 'Сержант', labelEn: 'Sergeant', category: 'nco' },
  senior_sergeant: { level: 5, label: 'Старший сержант', labelEn: 'Senior Sergeant', category: 'nco' },
  master_sergeant: { level: 6, label: 'Головний сержант', labelEn: 'Master Sergeant', category: 'nco' },
  staff_sergeant: { level: 7, label: 'Штаб-сержант', labelEn: 'Staff Sergeant', category: 'nco' },
  chief_sergeant: { level: 8, label: 'Майстер-сержант', labelEn: 'Chief Sergeant', category: 'nco' },
  // Офіцери молодші
  junior_lieutenant: { level: 10, label: 'Молодший лейтенант', labelEn: 'Junior Lieutenant', category: 'junior_officer' },
  lieutenant: { level: 11, label: 'Лейтенант', labelEn: 'Lieutenant', category: 'junior_officer' },
  senior_lieutenant: { level: 12, label: 'Старший лейтенант', labelEn: 'Senior Lieutenant', category: 'junior_officer' },
  captain: { level: 13, label: 'Капітан', labelEn: 'Captain', category: 'junior_officer' },
  // Офіцери старші
  major: { level: 14, label: 'Майор', labelEn: 'Major', category: 'senior_officer' },
  lieutenant_colonel: { level: 15, label: 'Підполковник', labelEn: 'Lieutenant Colonel', category: 'senior_officer' },
  colonel: { level: 16, label: 'Полковник', labelEn: 'Colonel', category: 'senior_officer' },
  // Генерали
  brigadier_general: { level: 17, label: 'Бригадний генерал', labelEn: 'Brigadier General', category: 'general' },
  major_general: { level: 18, label: 'Генерал-майор', labelEn: 'Major General', category: 'general' },
  lieutenant_general: { level: 19, label: 'Генерал-лейтенант', labelEn: 'Lieutenant General', category: 'general' },
  general: { level: 20, label: 'Генерал', labelEn: 'General', category: 'general' },
  general_army: { level: 21, label: 'Генерал армії України', labelEn: 'General of the Army', category: 'general' },
} as const;

// Military Branches
export const MILITARY_BRANCHES = {
  zsu: { label: 'Збройні Сили України', labelEn: 'Armed Forces of Ukraine', abbr: 'ЗСУ' },
  ngu: { label: 'Національна гвардія України', labelEn: 'National Guard of Ukraine', abbr: 'НГУ' },
  dpsu: { label: 'Державна прикордонна служба', labelEn: 'State Border Guard Service', abbr: 'ДПСУ' },
  ssu: { label: 'Служба безпеки України', labelEn: 'Security Service of Ukraine', abbr: 'СБУ' },
  gur: { label: 'Головне управління розвідки', labelEn: 'Defense Intelligence', abbr: 'ГУР' },
  other: { label: 'Інші формування', labelEn: 'Other Formations', abbr: 'Інше' },
} as const;

// Organizational Roles
export const ORGANIZATIONAL_ROLES = {
  honor_court_judge: {
    label: 'Суддя Суду Честі',
    labelEn: 'Honor Court Judge',
    description: 'Розгляд спорів та порушень Кодексу Честі',
    scope: ['national', 'regional'],
  },
  honor_court_head: {
    label: 'Голова Суду Честі',
    labelEn: 'Honor Court Head',
    description: 'Керівництво Судом Честі',
    scope: ['national'],
  },
  komandant: {
    label: 'Комендант',
    labelEn: 'Commandant',
    description: 'Керівник комендатури (регіонального підрозділу)',
    scope: ['regional', 'local'],
  },
  council_thinker: {
    label: 'Член Колегії Мислителів',
    labelEn: 'Council of Thinkers Member',
    description: 'Стратегічне планування та консультування',
    scope: ['national'],
  },
  president: {
    label: 'Президент',
    labelEn: 'President',
    description: 'Керівник організації',
    scope: ['national'],
  },
  vice_president: {
    label: 'Віце-президент',
    labelEn: 'Vice President',
    description: 'Заступник Президента',
    scope: ['national'],
  },
  secretary_general: {
    label: 'Генеральний секретар',
    labelEn: 'Secretary General',
    description: 'Адміністративне керівництво',
    scope: ['national'],
  },
  treasurer: {
    label: 'Скарбник',
    labelEn: 'Treasurer',
    description: 'Фінансове управління',
    scope: ['national', 'regional'],
  },
  business_mentor: {
    label: 'Бізнес-ментор',
    labelEn: 'Business Mentor',
    description: 'Менторство для ветеранів-підприємців',
    scope: ['national', 'regional'],
  },
  news_editor_veteran: {
    label: 'Редактор новин',
    labelEn: 'News Editor',
    description: 'Управління контентом та комунікаціями',
    scope: ['national', 'regional'],
  },
  mental_support_coord: {
    label: 'Координатор психологічної підтримки',
    labelEn: 'Mental Health Coordinator',
    description: 'Координація психологічної допомоги',
    scope: ['national', 'regional'],
  },
  members_admin: {
    label: 'Адміністратор членства',
    labelEn: 'Membership Administrator',
    description: 'Управління членством та верифікацією',
    scope: ['national', 'regional'],
  },
  legal_advisor: {
    label: 'Юридичний консультант',
    labelEn: 'Legal Advisor',
    description: 'Юридична підтримка членів',
    scope: ['national', 'regional'],
  },
  events_coordinator: {
    label: 'Координатор заходів',
    labelEn: 'Events Coordinator',
    description: 'Організація та координація заходів',
    scope: ['national', 'regional', 'local'],
  },
  regional_coordinator: {
    label: 'Регіональний координатор',
    labelEn: 'Regional Coordinator',
    description: 'Координація регіональної діяльності',
    scope: ['regional'],
  },
} as const;

// Business Expertise Areas
export const BUSINESS_EXPERTISE_AREAS = {
  startup: { label: 'Стартапи', labelEn: 'Startups', icon: 'Rocket' },
  ecommerce: { label: 'E-commerce', labelEn: 'E-commerce', icon: 'ShoppingCart' },
  manufacturing: { label: 'Виробництво', labelEn: 'Manufacturing', icon: 'Factory' },
  services: { label: 'Послуги', labelEn: 'Services', icon: 'Briefcase' },
  agriculture: { label: 'Сільське господарство', labelEn: 'Agriculture', icon: 'Wheat' },
  it: { label: 'IT та технології', labelEn: 'IT & Technology', icon: 'Code' },
  finance: { label: 'Фінанси', labelEn: 'Finance', icon: 'DollarSign' },
  marketing: { label: 'Маркетинг', labelEn: 'Marketing', icon: 'TrendingUp' },
  legal: { label: 'Юридичні питання', labelEn: 'Legal', icon: 'Scale' },
  hr: { label: 'HR та управління персоналом', labelEn: 'HR & People Management', icon: 'Users' },
  logistics: { label: 'Логістика', labelEn: 'Logistics', icon: 'Truck' },
  construction: { label: 'Будівництво', labelEn: 'Construction', icon: 'Building' },
  hospitality: { label: 'Готельно-ресторанний бізнес', labelEn: 'Hospitality', icon: 'UtensilsCrossed' },
  education: { label: 'Освіта', labelEn: 'Education', icon: 'GraduationCap' },
  healthcare: { label: 'Охорона здоров\'я', labelEn: 'Healthcare', icon: 'Heart' },
  retail: { label: 'Роздрібна торгівля', labelEn: 'Retail', icon: 'Store' },
  real_estate: { label: 'Нерухомість', labelEn: 'Real Estate', icon: 'Home' },
  consulting: { label: 'Консалтинг', labelEn: 'Consulting', icon: 'Lightbulb' },
  media: { label: 'Медіа та реклама', labelEn: 'Media & Advertising', icon: 'Video' },
  other: { label: 'Інше', labelEn: 'Other', icon: 'MoreHorizontal' },
} as const;

// Participation Activity Types
export const PARTICIPATION_ACTIVITY_TYPES = {
  event_attendance: { label: 'Участь у заході', points: 5 },
  event_organization: { label: 'Організація заходу', points: 25 },
  task_completion: { label: 'Виконання завдання', points: 10 },
  vote_cast: { label: 'Голосування', points: 5 },
  mentorship_session: { label: 'Менторська сесія (учень)', points: 10 },
  mentorship_given: { label: 'Менторська сесія (ментор)', points: 20 },
  volunteer_hours: { label: 'Волонтерська робота', points: 10 }, // per hour
  council_meeting: { label: 'Засідання ради', points: 15 },
  training_completion: { label: 'Завершення навчання', points: 15 },
  content_creation: { label: 'Створення контенту', points: 20 },
  recruitment: { label: 'Залучення нового члена', points: 25 },
  fundraising: { label: 'Фандрейзинг', points: 15 },
  community_service: { label: 'Громадська робота', points: 10 },
  honor_court_service: { label: 'Служба в Суді Честі', points: 30 },
  leadership_role: { label: 'Виконання керівної ролі', points: 50 },
  other: { label: 'Інша активність', points: 5 },
} as const;

// Honor Court Case Types
export const HONOR_CASE_TYPES = {
  dispute: { label: 'Суперечка між членами', labelEn: 'Member Dispute' },
  violation: { label: 'Порушення Кодексу Честі', labelEn: 'Code Violation' },
  reputation: { label: 'Захист репутації', labelEn: 'Reputation Defense' },
  appeal: { label: 'Апеляція на рішення', labelEn: 'Decision Appeal' },
  complaint: { label: 'Скарга', labelEn: 'Complaint' },
} as const;

// Sanction Types
export const SANCTION_TYPES = {
  warning: { label: 'Попередження', labelEn: 'Warning', severity: 1 },
  reprimand: { label: 'Догана', labelEn: 'Reprimand', severity: 2 },
  suspension: { label: 'Тимчасове призупинення', labelEn: 'Suspension', severity: 3 },
  demotion: { label: 'Пониження статусу', labelEn: 'Demotion', severity: 4 },
  expulsion: { label: 'Виключення', labelEn: 'Expulsion', severity: 5 },
  restoration: { label: 'Відновлення честі', labelEn: 'Restoration', severity: 0 },
  none: { label: 'Без санкцій', labelEn: 'No Sanctions', severity: 0 },
} as const;

// Type exports for veteran-specific constants
export type VeteranMembershipRole = keyof typeof VETERAN_MEMBERSHIP_ROLES;
export type MilitaryRank = keyof typeof MILITARY_RANKS;
export type MilitaryBranch = keyof typeof MILITARY_BRANCHES;
export type OrganizationalRole = keyof typeof ORGANIZATIONAL_ROLES;
export type BusinessExpertise = keyof typeof BUSINESS_EXPERTISE_AREAS;
export type ParticipationActivityType = keyof typeof PARTICIPATION_ACTIVITY_TYPES;
export type HonorCaseType = keyof typeof HONOR_CASE_TYPES;
export type SanctionType = keyof typeof SANCTION_TYPES;
