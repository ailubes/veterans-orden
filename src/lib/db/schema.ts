import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
  pgEnum,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ===========================================
// ENUMS
// ===========================================

export const userRoleEnum = pgEnum('user_role', [
  'free_viewer',
  'prospect',
  'silent_member',
  'full_member',
  'group_leader',
  'regional_leader',
  'news_editor',
  'admin',
  'super_admin',
]);

export const userStatusEnum = pgEnum('user_status', [
  'pending',
  'active',
  'suspended',
  'churned',
  'deleted',
]);

export const membershipTierEnum = pgEnum('membership_tier', [
  'free',
  'basic_49',
  'supporter_100',
  'supporter_200',
  'patron_500',
]);

export const verificationMethodEnum = pgEnum('verification_method', [
  'none',
  'email',
  'phone',
  'bankid',
  'diia',
  'manual',
]);

export const eventTypeEnum = pgEnum('event_type', [
  'meeting',
  'rally',
  'training',
  'social',
  'online',
  'other',
]);

export const eventScopeEnum = pgEnum('event_scope', [
  'national',
  'regional',
  'local',
]);

export const eventStatusEnum = pgEnum('event_status', [
  'draft',
  'published',
  'cancelled',
  'completed',
]);

export const rsvpStatusEnum = pgEnum('rsvp_status', [
  'going',
  'maybe',
  'not_going',
]);

export const voteTypeEnum = pgEnum('vote_type', [
  'binary',
  'multiple_choice',
  'ranked',
  'approval',
]);

export const voteTransparencyEnum = pgEnum('vote_transparency', [
  'anonymous',
  'public',
]);

export const voteScopeEnum = pgEnum('vote_scope', [
  'national',
  'regional',
  'group',
]);

export const voteStatusEnum = pgEnum('vote_status', [
  'draft',
  'active',
  'closed',
  'cancelled',
]);

export const taskTypeEnum = pgEnum('task_type', [
  'recruitment',
  'outreach',
  'event_support',
  'content',
  'administrative',
  'other',
]);

export const taskStatusEnum = pgEnum('task_status', [
  'open',
  'in_progress',
  'completed',
  'cancelled',
]);

export const taskPriorityEnum = pgEnum('task_priority', [
  'low',
  'medium',
  'high',
  'urgent',
]);

export const challengeTypeEnum = pgEnum('challenge_type', [
  'weekly',
  'monthly',
  'special',
]);

export const challengeGoalTypeEnum = pgEnum('challenge_goal_type', [
  'referrals',
  'tasks',
  'events',
  'votes',
  'points',
]);

export const challengeStatusEnum = pgEnum('challenge_status', [
  'upcoming',
  'active',
  'completed',
  'cancelled',
]);

export const paymentTypeEnum = pgEnum('payment_type', [
  'membership',
  'donation',
  'event',
]);

export const paymentStatusEnum = pgEnum('payment_status', [
  'pending',
  'completed',
  'failed',
  'refunded',
]);

export const paymentProviderEnum = pgEnum('payment_provider', [
  'liqpay',
  'monobank',
  'manual',
]);

export const newsCategoryEnum = pgEnum('news_category', [
  'announcement',
  'update',
  'success_story',
  'media',
  'education',
]);

export const newsStatusEnum = pgEnum('news_status', [
  'draft',
  'published',
  'archived',
]);

export const notificationTypeEnum = pgEnum('notification_type', [
  'system',
  'vote',
  'event',
  'task',
  'achievement',
  'news',
  'referral',
]);

export const pointsTransactionTypeEnum = pgEnum('points_transaction_type', [
  'earn_task',
  'earn_event',
  'earn_vote',
  'earn_referral',
  'earn_daily_login',
  'earn_content',
  'earn_challenge',
  'earn_admin',
  'spend_marketplace',
  'spend_event',
  'expire_annual',
  'refund',
]);

export const productTypeEnum = pgEnum('product_type', [
  'physical',
  'digital',
  'event_ticket',
]);

export const productStatusEnum = pgEnum('product_status', [
  'draft',
  'active',
  'out_of_stock',
  'discontinued',
]);

export const orderStatusEnum = pgEnum('order_status', [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
]);

export const audienceTypeEnum = pgEnum('audience_type', [
  'all',
  'members',
  'leaders',
  'admins',
]);

export const articleStatusEnum = pgEnum('article_status', [
  'draft',
  'published',
  'archived',
]);

export const emailSendStatusEnum = pgEnum('email_send_status', [
  'pending',
  'sent',
  'failed',
  'bounced',
]);

// Membership role enum (8-tier progression system)
export const membershipRoleEnum = pgEnum('membership_role', [
  'supporter',        // Level 0: Registered, no contribution
  'candidate',        // Level 1: Made 49+ UAH contribution, primary voting
  'member',           // Level 2: 2 recruited candidates, full voting
  'honorary_member',  // Level 3: 2 recruits became members, loyalty program
  'network_leader',   // Level 4: 8 personal + 49 total referrals, nomination rights
  'regional_leader',  // Level 5: 6 helped to leader + 400 total, mayor priority
  'national_leader',  // Level 6: 4 helped to regional + 4000 total, MP priority
  'network_guide',    // Level 7: 2 helped to national + 25000 total, budget control
]);

// Staff role enum (administrative roles, separate from membership)
export const staffRoleEnum = pgEnum('staff_role', [
  'none',
  'news_editor',
  'admin',
  'super_admin',
]);

// Advancement trigger type enum
export const advancementTriggerEnum = pgEnum('advancement_trigger', [
  'contribution',      // Made required contribution
  'referral_count',    // Met direct referral requirement
  'tree_count',        // Met total referral tree requirement
  'helped_advance',    // Enough referrals advanced to required role
  'manual',            // Admin manually advanced
]);

// Advancement mode enum (for organization settings)
export const advancementModeEnum = pgEnum('advancement_mode', [
  'automatic',         // Roles upgrade instantly when requirements met
  'approval_required', // User requests advancement, admin approves
]);

// Advancement request status enum
export const advancementRequestStatusEnum = pgEnum('advancement_request_status', [
  'pending',
  'approved',
  'rejected',
]);

// User sex enum (for avatar defaults)
export const userSexEnum = pgEnum('user_sex', [
  'male',
  'female',
  'not_specified',
]);

// ===========================================
// VETERAN-SPECIFIC ENUMS (Order of Veterans)
// ===========================================

// Veteran membership role (participation-based, not referral-based)
export const veteranMembershipRoleEnum = pgEnum('veteran_membership_role', [
  'applicant',         // Applied, not yet reviewed
  'community_member',  // Спільнота - open membership
  'order_candidate',   // Орден - nominated, in trial period
  'order_member',      // Орден - full member after initiation
  'veteran_emeritus',  // Honorary status for distinguished service
]);

// Ukrainian military ranks
export const militaryRankEnum = pgEnum('military_rank', [
  'soldier',           // Солдат
  'senior_soldier',    // Старший солдат
  'junior_sergeant',   // Молодший сержант
  'sergeant',          // Сержант
  'senior_sergeant',   // Старший сержант
  'master_sergeant',   // Головний сержант
  'staff_sergeant',    // Штаб-сержант
  'chief_sergeant',    // Майстер-сержант
  'junior_lieutenant', // Молодший лейтенант
  'lieutenant',        // Лейтенант
  'senior_lieutenant', // Старший лейтенант
  'captain',           // Капітан
  'major',             // Майор
  'lieutenant_colonel',// Підполковник
  'colonel',           // Полковник
  'brigadier_general', // Бригадний генерал
  'major_general',     // Генерал-майор
  'lieutenant_general',// Генерал-лейтенант
  'general',           // Генерал
  'general_army',      // Генерал армії України
]);

// Ukrainian military branches
export const militaryBranchEnum = pgEnum('military_branch', [
  'zsu',   // Збройні Сили України
  'ngu',   // Національна гвардія
  'dpsu',  // Державна прикордонна служба
  'ssu',   // Служба безпеки
  'gur',   // Головне управління розвідки
  'other', // Інші формування
]);

// Organizational role types
export const orgRoleTypeEnum = pgEnum('org_role_type', [
  'honor_court_judge',      // Суддя Суду Честі
  'honor_court_head',       // Голова Суду Честі
  'komandant',              // Комендант комендатури
  'council_thinker',        // Член Колегії Мислителів
  'president',              // Президент
  'vice_president',         // Віце-президент
  'secretary_general',      // Генеральний секретар
  'treasurer',              // Скарбник
  'business_mentor',        // Бізнес-ментор
  'news_editor_veteran',    // Редактор новин
  'mental_support_coord',   // Координатор псих. підтримки
  'members_admin',          // Адміністратор членства
  'legal_advisor',          // Юридичний консультант
  'events_coordinator',     // Координатор заходів
  'regional_coordinator',   // Регіональний координатор
]);

// Organizational role scope
export const orgRoleScopeEnum = pgEnum('org_role_scope', [
  'national',  // Національний рівень
  'regional',  // Регіональний рівень
  'local',     // Місцевий рівень
]);

// Honor Court case types
export const honorCaseTypeEnum = pgEnum('honor_case_type', [
  'dispute',      // Суперечка між членами
  'violation',    // Порушення Кодексу Честі
  'reputation',   // Захист репутації
  'appeal',       // Апеляція на рішення
  'complaint',    // Скарга на дії члена/керівництва
]);

// Honor Court case status
export const honorCaseStatusEnum = pgEnum('honor_case_status', [
  'submitted',      // Подано
  'under_review',   // На розгляді
  'accepted',       // Прийнято до розгляду
  'mediation',      // Медіація
  'hearing',        // Слухання
  'deliberation',   // Нарада суддів
  'resolved',       // Вирішено
  'closed',         // Закрито
  'appealed',       // Оскаржено
  'rejected',       // Відхилено
]);

// Sanction types
export const sanctionTypeEnum = pgEnum('sanction_type', [
  'warning',      // Попередження
  'reprimand',    // Догана
  'suspension',   // Тимчасове призупинення
  'demotion',     // Пониження статусу
  'expulsion',    // Виключення
  'restoration',  // Відновлення честі
  'none',         // Без санкцій
]);

// Business expertise areas
export const businessExpertiseEnum = pgEnum('business_expertise', [
  'startup',
  'ecommerce',
  'manufacturing',
  'services',
  'agriculture',
  'it',
  'finance',
  'marketing',
  'legal',
  'hr',
  'logistics',
  'construction',
  'hospitality',
  'education',
  'healthcare',
  'retail',
  'real_estate',
  'consulting',
  'media',
  'other',
]);

// Business stage
export const businessStageEnum = pgEnum('business_stage', [
  'idea',
  'planning',
  'started',
  'growing',
  'scaling',
  'mature',
]);

// Mentorship request status
export const mentorshipRequestStatusEnum = pgEnum('mentorship_request_status', [
  'pending',
  'matched',
  'accepted',
  'rejected',
  'cancelled',
  'completed',
]);

// Mentorship session status
export const mentorshipSessionStatusEnum = pgEnum('mentorship_session_status', [
  'scheduled',
  'confirmed',
  'in_progress',
  'completed',
  'cancelled',
  'no_show',
]);

// Participation activity types
export const participationActivityTypeEnum = pgEnum('participation_activity_type', [
  'event_attendance',
  'event_organization',
  'task_completion',
  'vote_cast',
  'mentorship_session',
  'mentorship_given',
  'volunteer_hours',
  'council_meeting',
  'training_completion',
  'content_creation',
  'recruitment',
  'fundraising',
  'community_service',
  'honor_court_service',
  'leadership_role',
  'other',
]);

// ===========================================
// TABLES
// ===========================================

// ----- KATOTTG (Ukrainian Administrative Units) -----
export const katottgCategories = pgTable('katottg_categories', {
  code: varchar('code', { length: 1 }).primaryKey(),
  nameUk: varchar('name_uk', { length: 100 }).notNull(),
  nameEn: varchar('name_en', { length: 100 }).notNull(),
  descriptionUk: varchar('description_uk', { length: 255 }),
  level: integer('level').notNull(),
});

export const katottg = pgTable('katottg', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: varchar('code', { length: 19 }).notNull().unique(),
  category: varchar('category', { length: 1 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  level: integer('level').notNull(),
  oblastCode: varchar('oblast_code', { length: 19 }),
  raionCode: varchar('raion_code', { length: 19 }),
  hromadaCode: varchar('hromada_code', { length: 19 }),
  oblastName: varchar('oblast_name', { length: 255 }),
  raionName: varchar('raion_name', { length: 255 }),
  hromadaName: varchar('hromada_name', { length: 255 }),
  fullPath: text('full_path'),
  nameNormalized: varchar('name_normalized', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  codeIdx: uniqueIndex('katottg_code_idx').on(table.code),
  categoryIdx: index('katottg_category_idx').on(table.category),
  levelIdx: index('katottg_level_idx').on(table.level),
  oblastCodeIdx: index('katottg_oblast_code_idx').on(table.oblastCode),
  raionCodeIdx: index('katottg_raion_code_idx').on(table.raionCode),
  hromadaCodeIdx: index('katottg_hromada_code_idx').on(table.hromadaCode),
  nameNormalizedIdx: index('katottg_name_normalized_idx').on(table.nameNormalized),
}));

// ----- OBLASTS (Ukrainian Regions) -----
export const oblasts = pgTable('oblasts', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  code: varchar('code', { length: 10 }).notNull().unique(),
  leaderId: uuid('leader_id'),
  memberCount: integer('member_count').default(0),
  groupCount: integer('group_count').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ----- COMMANDERIES (Order of Veterans Regional Structure) -----
export const commanderies = pgTable('commanderies', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: varchar('code', { length: 20 }).notNull().unique(),
  name: varchar('name', { length: 100 }).notNull(),
  type: varchar('type', { length: 20 }).notNull(), // 'commandery' | 'city'
  parentCode: varchar('parent_code', { length: 20 }), // Parent commandery code (for city commanderies)
  leaderId: uuid('leader_id'), // Reference to users.id (Komendant)
  memberCount: integer('member_count').default(0),
  groupCount: integer('group_count').default(0),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  codeIdx: uniqueIndex('commanderies_code_idx').on(table.code),
  typeIdx: index('commanderies_type_idx').on(table.type),
  parentCodeIdx: index('commanderies_parent_code_idx').on(table.parentCode),
}));

// ----- GROUPS (Local Cells) -----
export const groups = pgTable('groups', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  oblastId: uuid('oblast_id').references(() => oblasts.id).notNull(),
  commanderyId: uuid('commandery_id').references(() => commanderies.id),
  cityId: varchar('city_id', { length: 50 }),
  leaderId: uuid('leader_id'),
  memberCount: integer('member_count').default(0),
  status: varchar('status', { length: 20 }).default('active'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  oblastIdx: index('groups_oblast_idx').on(table.oblastId),
  commanderyIdx: index('groups_commandery_idx').on(table.commanderyId),
}));

// ----- USERS (Members) -----
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  authId: uuid('auth_id').notNull().unique(), // Supabase Auth user id (references auth.users.id)
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 20 }),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  patronymic: varchar('patronymic', { length: 100 }),
  dateOfBirth: timestamp('date_of_birth'),
  avatarUrl: text('avatar_url'),
  sex: userSexEnum('sex').default('not_specified'),

  // Role & Status (Legacy - kept for backwards compatibility)
  role: userRoleEnum('role').default('prospect').notNull(),
  status: userStatusEnum('status').default('pending').notNull(),

  // New Membership Role System (8-tier progression)
  membershipRole: membershipRoleEnum('membership_role').default('supporter'),
  staffRole: staffRoleEnum('staff_role').default('none'),
  roleAdvancedAt: timestamp('role_advanced_at'),
  totalReferralCount: integer('total_referral_count').default(0),

  // Veteran-Specific Fields (Order of Veterans)
  veteranRole: veteranMembershipRoleEnum('veteran_role').default('applicant'),
  membershipType: varchar('membership_type', { length: 20 }).default('community'), // 'community' or 'order'
  nominatedById: uuid('nominated_by_id'),
  initiationDate: timestamp('initiation_date'),
  trialStartDate: timestamp('trial_start_date'),
  trialEndDate: timestamp('trial_end_date'),

  // Verification
  isEmailVerified: boolean('is_email_verified').default(false),
  isPhoneVerified: boolean('is_phone_verified').default(false),
  isIdentityVerified: boolean('is_identity_verified').default(false),
  verificationMethod: verificationMethodEnum('verification_method').default('none'),

  // Location (Legacy)
  oblastId: uuid('oblast_id').references(() => oblasts.id),
  commanderyId: uuid('commandery_id').references(() => commanderies.id),
  groupId: uuid('group_id').references(() => groups.id),
  city: varchar('city', { length: 100 }),

  // KATOTTG Location (New - Ukrainian administrative units)
  katottgCode: varchar('katottg_code', { length: 19 }),
  settlementName: varchar('settlement_name', { length: 255 }),
  hromadaName: varchar('hromada_name', { length: 255 }),
  raionName: varchar('raion_name', { length: 255 }),
  oblastNameKatottg: varchar('oblast_name_katottg', { length: 255 }),
  locationLastChangedAt: timestamp('location_last_changed_at'), // For 30-day change restriction

  // Delivery Address
  streetAddress: varchar('street_address', { length: 255 }), // Street, building, apartment
  postalCode: varchar('postal_code', { length: 10 }),

  // Nova Poshta Delivery
  novaPoshtaCity: varchar('nova_poshta_city', { length: 100 }),      // City name for Nova Poshta
  novaPoshtaCityRef: varchar('nova_poshta_city_ref', { length: 50 }), // Nova Poshta city reference
  novaPoshtaBranch: varchar('nova_poshta_branch', { length: 100 }),   // Branch number/name
  novaPoshtaBranchRef: varchar('nova_poshta_branch_ref', { length: 50 }), // Nova Poshta branch reference

  // Membership
  memberSince: timestamp('member_since'),
  membershipTier: membershipTierEnum('membership_tier').default('free'),
  membershipPaidUntil: timestamp('membership_paid_until'),

  // Referral
  referredById: uuid('referred_by_id'),
  referralCode: varchar('referral_code', { length: 20 }).notNull().unique(),
  referralCount: integer('referral_count').default(0),

  // Engagement
  points: integer('points').default(0),
  level: integer('level').default(1),
  currentYearPoints: integer('current_year_points').default(0),
  lastLoginAt: timestamp('last_login_at'),
  loginStreak: integer('login_streak').default(0),

  // Preferences
  language: varchar('language', { length: 5 }).default('uk'),
  notificationPreferences: jsonb('notification_preferences').default({}),

  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  lastActiveAt: timestamp('last_active_at'),
}, (table) => ({
  authIdIdx: uniqueIndex('users_auth_id_idx').on(table.authId),
  emailIdx: index('users_email_idx').on(table.email),
  referralCodeIdx: uniqueIndex('users_referral_code_idx').on(table.referralCode),
  oblastIdx: index('users_oblast_idx').on(table.oblastId),
  roleIdx: index('users_role_idx').on(table.role),
  statusIdx: index('users_status_idx').on(table.status),
  katottgCodeIdx: index('users_katottg_code_idx').on(table.katottgCode),
}));

// ----- USER ACHIEVEMENTS -----
export const userAchievements = pgTable('user_achievements', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  achievementId: varchar('achievement_id', { length: 50 }).notNull(),
  earnedAt: timestamp('earned_at').defaultNow().notNull(),
}, (table) => ({
  userIdx: index('user_achievements_user_idx').on(table.userId),
  uniqueAchievement: uniqueIndex('user_achievements_unique').on(table.userId, table.achievementId),
}));

// ----- EVENTS -----
export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  type: eventTypeEnum('type').default('meeting').notNull(),
  scope: eventScopeEnum('scope').default('local').notNull(),

  // Location
  isOnline: boolean('is_online').default(false),
  location: jsonb('location'),
  onlineUrl: text('online_url'),

  // Time
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  timezone: varchar('timezone', { length: 50 }).default('Europe/Kyiv'),

  // Organizer
  organizerId: uuid('organizer_id').references(() => users.id).notNull(),
  oblastId: uuid('oblast_id').references(() => oblasts.id),
  groupId: uuid('group_id').references(() => groups.id),

  // Attendance
  maxAttendees: integer('max_attendees'),
  rsvpDeadline: timestamp('rsvp_deadline'),

  // Ticketing (Paid Events)
  requiresTicketPurchase: boolean('requires_ticket_purchase').default(false),
  ticketPricePoints: integer('ticket_price_points'),
  ticketPriceUah: integer('ticket_price_uah'),
  ticketQuantity: integer('ticket_quantity'), // null = unlimited

  // Counters (denormalized)
  goingCount: integer('going_count').default(0),
  maybeCount: integer('maybe_count').default(0),

  // Status
  status: eventStatusEnum('status').default('draft').notNull(),

  // Media
  imageUrl: text('image_url'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  startDateIdx: index('events_start_date_idx').on(table.startDate),
  statusIdx: index('events_status_idx').on(table.status),
  oblastIdx: index('events_oblast_idx').on(table.oblastId),
  organizerIdx: index('events_organizer_idx').on(table.organizerId),
}));

// ----- EVENT RSVPs -----
export const eventRsvps = pgTable('event_rsvps', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id').references(() => events.id).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  status: rsvpStatusEnum('status').notNull(),
  respondedAt: timestamp('responded_at').defaultNow().notNull(),
  attendedAt: timestamp('attended_at'),

  // Paid event ticket tracking
  ticketPurchased: boolean('ticket_purchased').default(false),
  orderId: uuid('order_id').references(() => orders.id),
}, (table) => ({
  eventUserIdx: uniqueIndex('event_rsvps_event_user_idx').on(table.eventId, table.userId),
  eventIdx: index('event_rsvps_event_idx').on(table.eventId),
  userIdx: index('event_rsvps_user_idx').on(table.userId),
}));

// ----- VOTES -----
export const votes = pgTable('votes', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  type: voteTypeEnum('type').default('binary').notNull(),
  transparency: voteTransparencyEnum('transparency').default('anonymous').notNull(),
  scope: voteScopeEnum('scope').default('national').notNull(),

  // Rules
  quorumRequired: integer('quorum_required'),
  majorityRequired: integer('majority_required').default(50),
  eligibleRoles: jsonb('eligible_roles').default(['full_member']),
  eligibleOblasts: jsonb('eligible_oblasts'),

  // Time
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),

  // Results (denormalized)
  totalVotes: integer('total_votes').default(0),

  // Status
  status: voteStatusEnum('status').default('draft').notNull(),

  // Metadata
  createdById: uuid('created_by_id').references(() => users.id).notNull(),
  oblastId: uuid('oblast_id').references(() => oblasts.id),
  groupId: uuid('group_id').references(() => groups.id),

  // Attachments
  attachments: jsonb('attachments').default([]),

  // Election-specific fields (Order of Veterans)
  isElection: boolean('is_election').default(false),
  positionType: orgRoleTypeEnum('position_type'),
  commanderyScope: uuid('commandery_scope').references(() => commanderies.id),
  useMilitaryTiebreaker: boolean('use_military_tiebreaker').default(true),
  minCandidates: integer('min_candidates').default(1),
  maxWinners: integer('max_winners').default(1),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  statusIdx: index('votes_status_idx').on(table.status),
  endDateIdx: index('votes_end_date_idx').on(table.endDate),
  scopeIdx: index('votes_scope_idx').on(table.scope),
  electionIdx: index('votes_election_idx').on(table.isElection),
}));

// ----- VOTE OPTIONS -----
export const voteOptions = pgTable('vote_options', {
  id: uuid('id').primaryKey().defaultRandom(),
  voteId: uuid('vote_id').references(() => votes.id).notNull(),
  text: varchar('text', { length: 500 }).notNull(),
  description: text('description'),
  order: integer('order').default(0),
  voteCount: integer('vote_count').default(0),
}, (table) => ({
  voteIdx: index('vote_options_vote_idx').on(table.voteId),
}));

// ----- USER VOTES (Cast Votes) -----
export const userVotes = pgTable('user_votes', {
  id: uuid('id').primaryKey().defaultRandom(),
  voteId: uuid('vote_id').references(() => votes.id).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  optionId: uuid('option_id').references(() => voteOptions.id).notNull(),
  rankedChoices: jsonb('ranked_choices'),
  castedAt: timestamp('casted_at').defaultNow().notNull(),
}, (table) => ({
  voteUserIdx: uniqueIndex('user_votes_vote_user_idx').on(table.voteId, table.userId),
  voteIdx: index('user_votes_vote_idx').on(table.voteId),
  userIdx: index('user_votes_user_idx').on(table.userId),
}));

// ----- TASKS -----
export const tasks = pgTable('tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  type: taskTypeEnum('type').default('other').notNull(),

  // Assignment
  assigneeId: uuid('assignee_id').references(() => users.id),
  assigneeType: varchar('assignee_type', { length: 20 }).default('individual'),
  groupId: uuid('group_id').references(() => groups.id),
  oblastId: uuid('oblast_id').references(() => oblasts.id),

  // Progress
  status: taskStatusEnum('status').default('open').notNull(),
  priority: taskPriorityEnum('priority').default('medium').notNull(),
  dueDate: timestamp('due_date'),
  completedAt: timestamp('completed_at'),

  // Rewards
  points: integer('points').default(0),

  // Proof
  requiresProof: boolean('requires_proof').default(false),
  proofUrl: text('proof_url'),

  // Metadata
  createdById: uuid('created_by_id').references(() => users.id).notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  statusIdx: index('tasks_status_idx').on(table.status),
  assigneeIdx: index('tasks_assignee_idx').on(table.assigneeId),
  dueDateIdx: index('tasks_due_date_idx').on(table.dueDate),
}));

// ----- CHALLENGES -----
export const challenges = pgTable('challenges', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  type: challengeTypeEnum('type').default('weekly').notNull(),

  // Goal
  goalType: challengeGoalTypeEnum('goal_type').notNull(),
  goalTarget: integer('goal_target').notNull(),

  // Rewards
  points: integer('points').default(0),
  badgeId: varchar('badge_id', { length: 50 }),

  // Competition
  isCompetitive: boolean('is_competitive').default(false),
  maxWinners: integer('max_winners').default(1),

  // Display
  imageUrl: text('image_url'),

  // Time
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),

  // Status
  status: challengeStatusEnum('status').default('upcoming').notNull(),

  // Creator
  createdById: uuid('created_by_id').references(() => users.id),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  statusIdx: index('challenges_status_idx').on(table.status),
  startDateIdx: index('challenges_start_date_idx').on(table.startDate),
  isCompetitiveIdx: index('challenges_is_competitive_idx').on(table.isCompetitive),
  createdByIdx: index('challenges_created_by_idx').on(table.createdById),
}));

// ----- CHALLENGE PARTICIPANTS -----
export const challengeParticipants = pgTable('challenge_participants', {
  id: uuid('id').primaryKey().defaultRandom(),
  challengeId: uuid('challenge_id').references(() => challenges.id).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  progress: integer('progress').default(0),
  completedAt: timestamp('completed_at'),
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
  rewardClaimed: boolean('reward_claimed').default(false),
  finalRank: integer('final_rank'),
}, (table) => ({
  challengeUserIdx: uniqueIndex('challenge_participants_unique').on(table.challengeId, table.userId),
  challengeIdx: index('challenge_participants_challenge_idx').on(table.challengeId),
  userIdx: index('challenge_participants_user_idx').on(table.userId),
}));

// ----- BADGES -----
export const badges = pgTable('badges', {
  id: varchar('id', { length: 50 }).primaryKey(),
  nameUk: varchar('name_uk', { length: 100 }).notNull(),
  nameEn: varchar('name_en', { length: 100 }).notNull(),
  descriptionUk: text('description_uk'),
  descriptionEn: text('description_en'),
  iconUrl: text('icon_url'),
  category: varchar('category', { length: 50 }).default('challenge'),
  rarity: varchar('rarity', { length: 20 }).default('common'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  categoryIdx: index('badges_category_idx').on(table.category),
  rarityIdx: index('badges_rarity_idx').on(table.rarity),
}));

// ----- PAYMENTS -----
export const payments = pgTable('payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),

  type: paymentTypeEnum('type').notNull(),
  amount: integer('amount').notNull(),
  currency: varchar('currency', { length: 3 }).default('UAH'),

  // Membership specific
  membershipTier: membershipTierEnum('membership_tier'),
  periodStart: timestamp('period_start'),
  periodEnd: timestamp('period_end'),

  // Provider
  provider: paymentProviderEnum('provider').notNull(),
  providerTransactionId: varchar('provider_transaction_id', { length: 255 }),
  providerData: jsonb('provider_data'),

  // Status
  status: paymentStatusEnum('status').default('pending').notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
}, (table) => ({
  userIdx: index('payments_user_idx').on(table.userId),
  statusIdx: index('payments_status_idx').on(table.status),
  providerTxIdx: index('payments_provider_tx_idx').on(table.providerTransactionId),
}));

// ----- NEWS ARTICLES -----
export const newsArticles = pgTable('news_articles', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  excerpt: text('excerpt'),
  content: text('content').notNull(),

  // Media
  featuredImageUrl: text('featured_image_url'),
  images: jsonb('images').default([]),
  videoUrl: text('video_url'),

  // Categorization
  category: newsCategoryEnum('category').default('update').notNull(),
  tags: jsonb('tags').default([]),

  // Visibility
  isPublic: boolean('is_public').default(true),
  isPinned: boolean('is_pinned').default(false),

  // Author
  authorId: uuid('author_id').references(() => users.id).notNull(),

  // Status
  status: newsStatusEnum('status').default('draft').notNull(),
  publishedAt: timestamp('published_at'),

  // Engagement
  viewCount: integer('view_count').default(0),

  // SEO
  metaTitle: varchar('meta_title', { length: 70 }),
  metaDescription: varchar('meta_description', { length: 160 }),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  slugIdx: uniqueIndex('news_articles_slug_idx').on(table.slug),
  statusIdx: index('news_articles_status_idx').on(table.status),
  publishedAtIdx: index('news_articles_published_at_idx').on(table.publishedAt),
  categoryIdx: index('news_articles_category_idx').on(table.category),
}));

// ----- NEWS CATEGORY METADATA -----
export const newsCategoryMeta = pgTable('news_category_meta', {
  id: varchar('id', { length: 50 }).primaryKey(), // matches enum value
  nameUk: varchar('name_uk', { length: 100 }).notNull(),
  nameEn: varchar('name_en', { length: 100 }).notNull(),
  description: text('description'),
  icon: varchar('icon', { length: 50 }), // Lucide icon name
  color: varchar('color', { length: 20 }), // hex color
  order: integer('order').default(0),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ----- NOTIFICATIONS -----
export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),

  type: notificationTypeEnum('type').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  body: text('body').notNull(),

  // Reference
  referenceType: varchar('reference_type', { length: 50 }),
  referenceId: uuid('reference_id'),

  // Data
  data: jsonb('data'),

  // Status
  isRead: boolean('is_read').default(false),
  readAt: timestamp('read_at'),

  // Delivery
  channels: jsonb('channels').default(['in_app']),
  sentAt: timestamp('sent_at'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  userIdx: index('notifications_user_idx').on(table.userId),
  userUnreadIdx: index('notifications_user_unread_idx').on(table.userId, table.isRead),
  createdAtIdx: index('notifications_created_at_idx').on(table.createdAt),
}));

// ----- AUDIT LOG -----
export const auditLog = pgTable('audit_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  action: varchar('action', { length: 100 }).notNull(),
  entityType: varchar('entity_type', { length: 50 }).notNull(),
  entityId: uuid('entity_id'),
  oldData: jsonb('old_data'),
  newData: jsonb('new_data'),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  userIdx: index('audit_log_user_idx').on(table.userId),
  entityIdx: index('audit_log_entity_idx').on(table.entityType, table.entityId),
  createdAtIdx: index('audit_log_created_at_idx').on(table.createdAt),
}));

// ----- USER LOCATION CHANGES (Audit Trail) -----
// Users can only change location once per 30 days
export const userLocationChanges = pgTable('user_location_changes', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),

  // Previous location
  previousKatottgCode: varchar('previous_katottg_code', { length: 19 }),
  previousSettlementName: varchar('previous_settlement_name', { length: 255 }),
  previousHromadaName: varchar('previous_hromada_name', { length: 255 }),
  previousRaionName: varchar('previous_raion_name', { length: 255 }),
  previousOblastName: varchar('previous_oblast_name', { length: 255 }),

  // New location
  newKatottgCode: varchar('new_katottg_code', { length: 19 }),
  newSettlementName: varchar('new_settlement_name', { length: 255 }),
  newHromadaName: varchar('new_hromada_name', { length: 255 }),
  newRaionName: varchar('new_raion_name', { length: 255 }),
  newOblastName: varchar('new_oblast_name', { length: 255 }),

  // Metadata
  changeReason: varchar('change_reason', { length: 100 }), // 'initial_setup', 'user_update', 'admin_override'
  changedBy: uuid('changed_by').references(() => users.id), // NULL if self, user_id if admin
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  userIdx: index('location_changes_user_idx').on(table.userId),
  createdAtIdx: index('location_changes_created_at_idx').on(table.createdAt),
  userDateIdx: index('location_changes_user_date_idx').on(table.userId, table.createdAt),
}));

// ----- ORGANIZATION SETTINGS -----
export const organizationSettings = pgTable('organization_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  key: varchar('key', { length: 100 }).notNull().unique(),
  value: jsonb('value').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  updatedBy: uuid('updated_by').references(() => users.id),
}, (table) => ({
  keyIdx: uniqueIndex('organization_settings_key_idx').on(table.key),
}));

// ----- POINTS TRANSACTIONS -----
export const pointsTransactions = pgTable('points_transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),

  type: pointsTransactionTypeEnum('type').notNull(),
  amount: integer('amount').notNull(), // positive for earn, negative for spend
  balanceAfter: integer('balance_after').notNull(),

  // Year tracking for expiration
  earnedYear: integer('earned_year'),
  expiresAt: timestamp('expires_at'),

  // Reference to source
  referenceType: varchar('reference_type', { length: 50 }),
  referenceId: uuid('reference_id'),

  // Metadata
  description: text('description'),
  metadata: jsonb('metadata'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  createdById: uuid('created_by_id').references(() => users.id), // For admin adjustments
}, (table) => ({
  userIdx: index('points_transactions_user_idx').on(table.userId),
  typeIdx: index('points_transactions_type_idx').on(table.type),
  yearIdx: index('points_transactions_year_idx').on(table.earnedYear),
  createdAtIdx: index('points_transactions_created_at_idx').on(table.createdAt),
}));

// ----- MARKETPLACE: PRODUCTS -----
export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Basic info
  name: varchar('name', { length: 255 }).notNull(),
  nameUk: varchar('name_uk', { length: 255 }).notNull(),
  description: text('description'),
  descriptionUk: text('description_uk'),
  slug: varchar('slug', { length: 255 }).notNull().unique(),

  // Product configuration
  type: productTypeEnum('type').notNull(),
  status: productStatusEnum('status').default('draft').notNull(),

  // Pricing
  pricePoints: integer('price_points').notNull(),
  priceUah: integer('price_uah'), // Optional UAH price (in kopecks)

  // Inventory
  stockQuantity: integer('stock_quantity'), // null = unlimited
  maxPerUser: integer('max_per_user').default(1),

  // Media
  imageUrl: text('image_url'),
  images: jsonb('images'), // Array of image URLs

  // Shipping (for physical products)
  requiresShipping: boolean('requires_shipping').default(false),
  weight: integer('weight'), // grams
  dimensions: jsonb('dimensions'), // { length, width, height } in cm

  // Digital delivery (for digital products)
  digitalAssetUrl: text('digital_asset_url'),
  downloadLimit: integer('download_limit'), // null = unlimited

  // Access control
  requiredLevel: integer('required_level').default(1),
  requiredRole: varchar('required_role', { length: 50 }),

  // Availability
  availableFrom: timestamp('available_from'),
  availableUntil: timestamp('available_until'),

  // Metadata
  featured: boolean('featured').default(false),
  sortOrder: integer('sort_order').default(0),
  tags: jsonb('tags'), // Array of tags

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  createdById: uuid('created_by_id').references(() => users.id),
}, (table) => ({
  typeIdx: index('products_type_idx').on(table.type),
  statusIdx: index('products_status_idx').on(table.status),
  slugIdx: uniqueIndex('products_slug_idx').on(table.slug),
  featuredIdx: index('products_featured_idx').on(table.featured),
}));

// ----- MARKETPLACE: ORDERS -----
export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderNumber: varchar('order_number', { length: 20 }).notNull().unique(),

  // User
  userId: uuid('user_id').references(() => users.id).notNull(),

  // Status
  status: orderStatusEnum('status').default('pending').notNull(),

  // Pricing
  totalPoints: integer('total_points').notNull(),
  totalUah: integer('total_uah').default(0), // In kopecks

  // Shipping info (for physical products)
  requiresShipping: boolean('requires_shipping').default(false),
  shippingAddress: jsonb('shipping_address'), // Full address object

  // Nova Poshta delivery
  novaPoshtaCity: varchar('nova_poshta_city', { length: 100 }),
  novaPoshtaCityRef: varchar('nova_poshta_city_ref', { length: 50 }),
  novaPoshtaBranch: varchar('nova_poshta_branch', { length: 100 }),
  novaPoshtaBranchRef: varchar('nova_poshta_branch_ref', { length: 50 }),

  // Fulfillment
  trackingNumber: varchar('tracking_number', { length: 100 }),
  shippedAt: timestamp('shipped_at'),
  deliveredAt: timestamp('delivered_at'),

  // Notes
  customerNotes: text('customer_notes'),
  adminNotes: text('admin_notes'),

  // Metadata
  metadata: jsonb('metadata'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  cancelledAt: timestamp('cancelled_at'),
  refundedAt: timestamp('refunded_at'),
}, (table) => ({
  userIdx: index('orders_user_idx').on(table.userId),
  statusIdx: index('orders_status_idx').on(table.status),
  orderNumberIdx: uniqueIndex('orders_order_number_idx').on(table.orderNumber),
  createdAtIdx: index('orders_created_at_idx').on(table.createdAt),
}));

// ----- MARKETPLACE: ORDER ITEMS -----
export const orderItems = pgTable('order_items', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Relations
  orderId: uuid('order_id').references(() => orders.id).notNull(),
  productId: uuid('product_id').references(() => products.id).notNull(),

  // Item details
  quantity: integer('quantity').notNull().default(1),
  pricePoints: integer('price_points').notNull(), // Price at time of purchase
  priceUah: integer('price_uah'), // UAH price at time of purchase (kopecks)

  // Product snapshot (in case product changes/deleted)
  productName: varchar('product_name', { length: 255 }).notNull(),
  productType: productTypeEnum('product_type').notNull(),

  // Variant info (size, color, etc)
  variant: jsonb('variant'),

  // Digital delivery
  downloadUrl: text('download_url'),
  downloadCount: integer('download_count').default(0),
  downloadExpiresAt: timestamp('download_expires_at'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  orderIdx: index('order_items_order_idx').on(table.orderId),
  productIdx: index('order_items_product_idx').on(table.productId),
}));

// ----- HELP SYSTEM: CATEGORIES -----
export const helpCategories = pgTable('help_categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  nameUk: varchar('name_uk', { length: 100 }).notNull(),
  nameEn: varchar('name_en', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  description: text('description'),
  icon: varchar('icon', { length: 50 }), // Lucide icon name
  parentId: uuid('parent_id'), // Self-reference for hierarchical categories
  order: integer('order').default(0),
  isVisible: boolean('is_visible').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  slugIdx: uniqueIndex('help_categories_slug_idx').on(table.slug),
  parentIdx: index('help_categories_parent_idx').on(table.parentId),
}));

// ----- HELP SYSTEM: ARTICLES -----
export const helpArticles = pgTable('help_articles', {
  id: uuid('id').primaryKey().defaultRandom(),
  categoryId: uuid('category_id').references(() => helpCategories.id).notNull(),

  // Content
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  content: text('content').notNull(), // HTML from WYSIWYG
  excerpt: text('excerpt'),

  // Video support
  videoUrl: text('video_url'), // YouTube URL

  // Search (tsvector auto-generated by trigger)
  // searchVector is managed by PostgreSQL trigger
  keywords: jsonb('keywords').default([]), // Array of keywords

  // Audience targeting
  audience: audienceTypeEnum('audience').default('all'),

  // SEO
  metaTitle: varchar('meta_title', { length: 70 }),
  metaDescription: varchar('meta_description', { length: 160 }),

  // Engagement metrics
  viewCount: integer('view_count').default(0),
  helpfulCount: integer('helpful_count').default(0),
  notHelpfulCount: integer('not_helpful_count').default(0),

  // Publishing
  status: articleStatusEnum('status').default('draft'),
  publishedAt: timestamp('published_at'),
  authorId: uuid('author_id').references(() => users.id).notNull(),

  // Related articles
  relatedArticleIds: jsonb('related_article_ids').default([]),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  slugIdx: uniqueIndex('help_articles_slug_idx').on(table.slug),
  categoryIdx: index('help_articles_category_idx').on(table.categoryId),
  statusIdx: index('help_articles_status_idx').on(table.status),
  authorIdx: index('help_articles_author_idx').on(table.authorId),
  audienceIdx: index('help_articles_audience_idx').on(table.audience),
  // Note: search_vector GIN index is created in migration SQL
}));

// ----- HELP SYSTEM: ARTICLE FEEDBACK -----
export const helpArticleFeedback = pgTable('help_article_feedback', {
  id: uuid('id').primaryKey().defaultRandom(),
  articleId: uuid('article_id').references(() => helpArticles.id).notNull(),
  userId: uuid('user_id').references(() => users.id),
  isHelpful: boolean('is_helpful').notNull(),
  comment: text('comment'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  articleIdx: index('help_article_feedback_article_idx').on(table.articleId),
  userIdx: index('help_article_feedback_user_idx').on(table.userId),
}));

// ----- HELP SYSTEM: TOOLTIPS -----
export const helpTooltips = pgTable('help_tooltips', {
  id: uuid('id').primaryKey().defaultRandom(),
  pageSlug: varchar('page_slug', { length: 100 }).notNull(), // e.g., "dashboard-votes"
  elementId: varchar('element_id', { length: 100 }).notNull(), // e.g., "vote-submit-button"
  content: text('content').notNull(),
  articleId: uuid('article_id').references(() => helpArticles.id), // Link to full article
  audience: audienceTypeEnum('audience').default('all'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  pageElementIdx: uniqueIndex('help_tooltips_page_element_idx').on(table.pageSlug, table.elementId),
  articleIdx: index('help_tooltips_article_idx').on(table.articleId),
}));

// ----- EMAIL TEMPLATES -----
export const emailTemplates = pgTable('email_templates', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Template identification
  templateKey: varchar('template_key', { length: 100 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),

  // Email content
  subject: varchar('subject', { length: 255 }).notNull(),
  htmlContent: text('html_content').notNull(),
  textContent: text('text_content'),

  // Template variables documentation
  availableVariables: jsonb('available_variables').default([]),
  variableDescriptions: jsonb('variable_descriptions').default({}),
  previewData: jsonb('preview_data').default({}),

  // Status & metadata
  isActive: boolean('is_active').default(true),
  version: integer('version').default(1),

  // Audit
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  createdById: uuid('created_by_id').references(() => users.id),
  updatedById: uuid('updated_by_id').references(() => users.id),
  lastSentAt: timestamp('last_sent_at'),
}, (table) => ({
  keyIdx: uniqueIndex('email_templates_key_idx').on(table.templateKey),
  activeIdx: index('email_templates_active_idx').on(table.isActive),
  updatedAtIdx: index('email_templates_updated_at_idx').on(table.updatedAt),
}));

export const emailTemplateHistory = pgTable('email_template_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  templateId: uuid('template_id').references(() => emailTemplates.id, { onDelete: 'cascade' }).notNull(),

  // Snapshot
  version: integer('version').notNull(),
  subject: varchar('subject', { length: 255 }).notNull(),
  htmlContent: text('html_content').notNull(),
  textContent: text('text_content'),

  // Metadata
  changedById: uuid('changed_by_id').references(() => users.id),
  changedAt: timestamp('changed_at').defaultNow().notNull(),
  changeReason: text('change_reason'),
}, (table) => ({
  templateIdx: index('email_template_history_template_idx').on(table.templateId),
  versionIdx: index('email_template_history_version_idx').on(table.templateId, table.version),
}));

export const emailSendLog = pgTable('email_send_log', {
  id: uuid('id').primaryKey().defaultRandom(),

  templateKey: varchar('template_key', { length: 100 }).notNull(),
  templateVersion: integer('template_version'),

  recipientEmail: varchar('recipient_email', { length: 255 }).notNull(),
  recipientUserId: uuid('recipient_user_id').references(() => users.id),

  subject: varchar('subject', { length: 255 }).notNull(),
  variablesUsed: jsonb('variables_used'),

  status: emailSendStatusEnum('status').default('pending').notNull(),
  providerMessageId: varchar('provider_message_id', { length: 255 }),
  errorMessage: text('error_message'),

  sentAt: timestamp('sent_at').defaultNow().notNull(),
  deliveredAt: timestamp('delivered_at'),
  openedAt: timestamp('opened_at'),
  clickedAt: timestamp('clicked_at'),
}, (table) => ({
  templateIdx: index('email_send_log_template_idx').on(table.templateKey),
  recipientIdx: index('email_send_log_recipient_idx').on(table.recipientEmail),
  userIdx: index('email_send_log_user_idx').on(table.recipientUserId),
  sentAtIdx: index('email_send_log_sent_at_idx').on(table.sentAt),
  statusIdx: index('email_send_log_status_idx').on(table.status),
}));

// ----- ROLE PROGRESSION: ADVANCEMENTS -----
export const roleAdvancements = pgTable('role_advancements', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  fromRole: membershipRoleEnum('from_role').notNull(),
  toRole: membershipRoleEnum('to_role').notNull(),
  advancedAt: timestamp('advanced_at').defaultNow(),
  advancedBy: uuid('advanced_by').references(() => users.id, { onDelete: 'set null' }), // The referrer who helped
  triggerType: advancementTriggerEnum('trigger_type').notNull(),
  triggerData: jsonb('trigger_data').default({}),
  approvedBy: uuid('approved_by').references(() => users.id, { onDelete: 'set null' }), // Admin who approved
  approvedAt: timestamp('approved_at'),
}, (table) => ({
  userIdx: index('role_advancements_user_idx').on(table.userId),
  advancedByIdx: index('role_advancements_advanced_by_idx').on(table.advancedBy),
  toRoleIdx: index('role_advancements_to_role_idx').on(table.toRole),
  advancedAtIdx: index('role_advancements_advanced_at_idx').on(table.advancedAt),
}));

// ----- ROLE PROGRESSION: REQUIREMENTS -----
export const roleRequirements = pgTable('role_requirements', {
  id: uuid('id').primaryKey().defaultRandom(),
  role: membershipRoleEnum('role').notNull().unique(),
  roleLevel: integer('role_level').notNull(),
  displayNameUk: varchar('display_name_uk', { length: 100 }).notNull(),
  descriptionUk: text('description_uk'),

  // Contribution requirement (for candidate level)
  requiresContribution: boolean('requires_contribution').default(false),
  minContributionAmount: integer('min_contribution_amount'), // in kopecks

  // Direct referral requirements
  minDirectReferrals: integer('min_direct_referrals').default(0),
  minDirectReferralsAtRole: membershipRoleEnum('min_direct_referrals_at_role'),

  // Total tree requirements
  minTotalReferrals: integer('min_total_referrals').default(0),

  // "Helped advance" requirements
  minHelpedAdvance: integer('min_helped_advance').default(0),
  helpedAdvanceFromRole: membershipRoleEnum('helped_advance_from_role'),
  helpedAdvanceToRole: membershipRoleEnum('helped_advance_to_role'),

  // Privileges
  privileges: jsonb('privileges').default([]),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ----- ROLE PROGRESSION: USER STATS CACHE -----
export const userReferralStats = pgTable('user_referral_stats', {
  userId: uuid('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),

  // Direct referrals by role
  directSupporters: integer('direct_supporters').default(0),
  directCandidates: integer('direct_candidates').default(0),
  directMembers: integer('direct_members').default(0),
  directHonoraryMembers: integer('direct_honorary_members').default(0),
  directNetworkLeaders: integer('direct_network_leaders').default(0),
  directRegionalLeaders: integer('direct_regional_leaders').default(0),
  directNationalLeaders: integer('direct_national_leaders').default(0),
  directNetworkGuides: integer('direct_network_guides').default(0),

  // Total tree count
  totalTreeCount: integer('total_tree_count').default(0),

  // "Helped advance" counts
  helpedToCandidate: integer('helped_to_candidate').default(0),
  helpedToMember: integer('helped_to_member').default(0),
  helpedToHonorary: integer('helped_to_honorary').default(0),
  helpedToLeader: integer('helped_to_leader').default(0),
  helpedToRegional: integer('helped_to_regional').default(0),
  helpedToNational: integer('helped_to_national').default(0),
  helpedToGuide: integer('helped_to_guide').default(0),

  lastCalculatedAt: timestamp('last_calculated_at').defaultNow(),
});

// ----- ROLE PROGRESSION: ADVANCEMENT REQUESTS -----
export const advancementRequests = pgTable('advancement_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  requestedRole: membershipRoleEnum('requested_role').notNull(),
  currentRole: membershipRoleEnum('current_role').notNull(),
  requestedAt: timestamp('requested_at').defaultNow(),
  status: advancementRequestStatusEnum('status').default('pending'),
  reviewedBy: uuid('reviewed_by').references(() => users.id, { onDelete: 'set null' }),
  reviewedAt: timestamp('reviewed_at'),
  rejectionReason: text('rejection_reason'),
}, (table) => ({
  userIdx: index('advancement_requests_user_idx').on(table.userId),
  statusIdx: index('advancement_requests_status_idx').on(table.status),
  requestedAtIdx: index('advancement_requests_requested_at_idx').on(table.requestedAt),
}));

// ===========================================
// VETERAN-SPECIFIC TABLES (Order of Veterans)
// ===========================================

// ----- MILITARY SERVICE -----
export const militaryService = pgTable('military_service', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),

  // Service details
  rank: militaryRankEnum('rank').notNull(),
  branch: militaryBranchEnum('branch').default('zsu'),
  unitName: varchar('unit_name', { length: 255 }),
  unitType: varchar('unit_type', { length: 100 }),
  serviceStart: timestamp('service_start').notNull(),
  serviceEnd: timestamp('service_end'),
  isCurrentService: boolean('is_current_service').default(false),

  // Combat experience
  combatExperience: boolean('combat_experience').default(false),
  combatDetails: text('combat_details'),
  combatDeployments: jsonb('combat_deployments').default([]), // Array of { location, start, end, operation }

  // Awards and decorations
  awards: jsonb('awards').default([]), // Array of { name, date, citation }

  // Verification
  verified: boolean('verified').default(false),
  verifiedBy: uuid('verified_by').references(() => users.id),
  verifiedAt: timestamp('verified_at'),
  verificationMethod: varchar('verification_method', { length: 50 }),
  documentsUrl: text('documents_url'),
  notes: text('notes'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdx: index('military_service_user_idx').on(table.userId),
  rankIdx: index('military_service_rank_idx').on(table.rank),
  branchIdx: index('military_service_branch_idx').on(table.branch),
  verifiedIdx: index('military_service_verified_idx').on(table.verified),
}));

// ----- USER ORGANIZATIONAL ROLES -----
export const userOrgRoles = pgTable('user_org_roles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  roleType: orgRoleTypeEnum('role_type').notNull(),
  commanderyId: uuid('commandery_id').references(() => commanderies.id), // NULL for national roles
  scope: orgRoleScopeEnum('scope').default('national'),

  // Appointment
  appointedBy: uuid('appointed_by').references(() => users.id),
  appointedAt: timestamp('appointed_at').defaultNow(),
  termStart: timestamp('term_start').notNull(),
  termEnd: timestamp('term_end'), // NULL for indefinite
  isActive: boolean('is_active').default(true),

  // Election reference (if elected)
  electionId: uuid('election_id').references(() => votes.id),

  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  userIdx: index('user_org_roles_user_idx').on(table.userId),
  roleTypeIdx: index('user_org_roles_type_idx').on(table.roleType),
  commanderyIdx: index('user_org_roles_commandery_idx').on(table.commanderyId),
  activeIdx: index('user_org_roles_active_idx').on(table.isActive),
}));

// ----- ORGANIZATIONAL ROLE LABELS -----
export const orgRoleLabels = pgTable('org_role_labels', {
  roleType: varchar('role_type', { length: 50 }).primaryKey(),
  nameUk: varchar('name_uk', { length: 100 }).notNull(),
  nameEn: varchar('name_en', { length: 100 }),
  descriptionUk: text('description_uk'),
  descriptionEn: text('description_en'),
  permissionsJson: jsonb('permissions_json').default([]),
  displayOrder: integer('display_order').default(0),
});

// ----- HONOR COURT CASES -----
export const honorCourtCases = pgTable('honor_court_cases', {
  id: uuid('id').primaryKey().defaultRandom(),
  caseNumber: varchar('case_number', { length: 20 }).notNull().unique(),

  // Case type and status
  caseType: honorCaseTypeEnum('case_type').notNull(),
  status: honorCaseStatusEnum('status').default('submitted'),
  priority: varchar('priority', { length: 20 }).default('normal'),

  // Parties involved
  complainantId: uuid('complainant_id').references(() => users.id),
  respondentId: uuid('respondent_id').references(() => users.id),

  // Case details
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  facts: text('facts'),
  evidence: jsonb('evidence').default([]),

  // Assignment
  assignedJudges: jsonb('assigned_judges').default([]),
  leadJudgeId: uuid('lead_judge_id').references(() => users.id),

  // Related cases
  parentCaseId: uuid('parent_case_id'),
  relatedCases: jsonb('related_cases').default([]),

  // Timeline
  submittedAt: timestamp('submitted_at').defaultNow(),
  acceptedAt: timestamp('accepted_at'),
  hearingDate: timestamp('hearing_date'),
  hearingLocation: text('hearing_location'),
  resolvedAt: timestamp('resolved_at'),

  // Decision
  decision: text('decision'),
  decisionSummary: varchar('decision_summary', { length: 500 }),
  sanctionType: sanctionTypeEnum('sanction_type'),
  sanctionDetails: text('sanction_details'),
  sanctionDurationDays: integer('sanction_duration_days'),

  // Voting
  votesFor: integer('votes_for').default(0),
  votesAgainst: integer('votes_against').default(0),
  votesAbstain: integer('votes_abstain').default(0),

  // Visibility
  isPublic: boolean('is_public').default(false),
  anonymized: boolean('anonymized').default(false),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  createdBy: uuid('created_by').references(() => users.id),
}, (table) => ({
  statusIdx: index('honor_cases_status_idx').on(table.status),
  typeIdx: index('honor_cases_type_idx').on(table.caseType),
  complainantIdx: index('honor_cases_complainant_idx').on(table.complainantId),
  respondentIdx: index('honor_cases_respondent_idx').on(table.respondentId),
  leadJudgeIdx: index('honor_cases_lead_judge_idx').on(table.leadJudgeId),
  caseNumberIdx: index('honor_cases_number_idx').on(table.caseNumber),
}));

// ----- HONOR COURT NOTES -----
export const honorCourtNotes = pgTable('honor_court_notes', {
  id: uuid('id').primaryKey().defaultRandom(),
  caseId: uuid('case_id').references(() => honorCourtCases.id, { onDelete: 'cascade' }).notNull(),
  authorId: uuid('author_id').references(() => users.id).notNull(),

  content: text('content').notNull(),
  noteType: varchar('note_type', { length: 50 }).default('general'),
  isInternal: boolean('is_internal').default(false),
  attachments: jsonb('attachments').default([]),

  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  caseIdx: index('honor_notes_case_idx').on(table.caseId),
  authorIdx: index('honor_notes_author_idx').on(table.authorId),
}));

// ----- HONOR COURT PARTICIPANTS -----
export const honorCourtParticipants = pgTable('honor_court_participants', {
  id: uuid('id').primaryKey().defaultRandom(),
  caseId: uuid('case_id').references(() => honorCourtCases.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id),

  role: varchar('role', { length: 50 }).notNull(), // witness, representative, expert
  party: varchar('party', { length: 20 }), // complainant, respondent, neutral

  externalName: varchar('external_name', { length: 255 }),
  externalContact: text('external_contact'),

  invitedAt: timestamp('invited_at').defaultNow(),
  confirmedAt: timestamp('confirmed_at'),
  declinedAt: timestamp('declined_at'),
  notes: text('notes'),
}, (table) => ({
  caseIdx: index('honor_participants_case_idx').on(table.caseId),
  userIdx: index('honor_participants_user_idx').on(table.userId),
}));

// ----- BUSINESS MENTORS -----
export const businessMentors = pgTable('business_mentors', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),

  // Profile
  bio: text('bio'),
  headline: varchar('headline', { length: 255 }),
  expertise: jsonb('expertise').notNull(), // Array of business_expertise values
  experienceYears: integer('experience_years'),

  // Business background
  companyName: varchar('company_name', { length: 255 }),
  companyRole: varchar('company_role', { length: 100 }),
  companyWebsite: text('company_website'),
  linkedinUrl: text('linkedin_url'),
  portfolioUrl: text('portfolio_url'),

  // Availability
  isActive: boolean('is_active').default(true),
  maxMentees: integer('max_mentees').default(3),
  currentMenteesCount: integer('current_mentees_count').default(0),
  preferredFormat: varchar('preferred_format', { length: 50 }).default('both'),
  preferredLanguage: varchar('preferred_language', { length: 5 }).default('uk'),
  preferredSessionDuration: integer('preferred_session_duration').default(60),

  // Location
  availableCities: jsonb('available_cities').default([]),
  canTravel: boolean('can_travel').default(false),

  // Stats
  totalSessions: integer('total_sessions').default(0),
  totalMentees: integer('total_mentees').default(0),
  totalHours: integer('total_hours').default(0),
  ratingSum: integer('rating_sum').default(0),
  ratingCount: integer('rating_count').default(0),

  // Verification
  verified: boolean('verified').default(false),
  verifiedBy: uuid('verified_by').references(() => users.id),
  verifiedAt: timestamp('verified_at'),
  verificationNotes: text('verification_notes'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdx: index('business_mentors_user_idx').on(table.userId),
  activeIdx: index('business_mentors_active_idx').on(table.isActive),
  verifiedIdx: index('business_mentors_verified_idx').on(table.verified),
}));

// ----- MENTOR AVAILABILITY -----
export const mentorAvailability = pgTable('mentor_availability', {
  id: uuid('id').primaryKey().defaultRandom(),
  mentorId: uuid('mentor_id').references(() => businessMentors.id, { onDelete: 'cascade' }).notNull(),

  dayOfWeek: integer('day_of_week').notNull(), // 0=Sunday, 6=Saturday
  startTime: varchar('start_time', { length: 10 }).notNull(), // HH:MM format
  endTime: varchar('end_time', { length: 10 }).notNull(),
  timezone: varchar('timezone', { length: 50 }).default('Europe/Kyiv'),

  isOnline: boolean('is_online').default(true),
  location: text('location'),
  isActive: boolean('is_active').default(true),

  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  mentorIdx: index('mentor_availability_mentor_idx').on(table.mentorId),
  dayIdx: index('mentor_availability_day_idx').on(table.dayOfWeek),
}));

// ----- MENTORSHIP REQUESTS -----
export const mentorshipRequests = pgTable('mentorship_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  menteeId: uuid('mentee_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),

  // What they're looking for
  preferredExpertise: jsonb('preferred_expertise').notNull(),
  preferredFormat: varchar('preferred_format', { length: 50 }).default('both'),

  // Business info
  businessStage: businessStageEnum('business_stage'),
  businessName: varchar('business_name', { length: 255 }),
  businessDescription: text('business_description'),
  industry: varchar('industry', { length: 100 }),
  goals: text('goals').notNull(),
  challenges: text('challenges'),
  timeline: varchar('timeline', { length: 100 }),

  // Matching
  status: mentorshipRequestStatusEnum('status').default('pending'),
  matchedMentorId: uuid('matched_mentor_id').references(() => businessMentors.id),
  matchedAt: timestamp('matched_at'),
  matchScore: integer('match_score'),
  matchNotes: text('match_notes'),

  // Response
  acceptedAt: timestamp('accepted_at'),
  rejectedAt: timestamp('rejected_at'),
  rejectionReason: text('rejection_reason'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  menteeIdx: index('mentorship_requests_mentee_idx').on(table.menteeId),
  statusIdx: index('mentorship_requests_status_idx').on(table.status),
  mentorIdx: index('mentorship_requests_mentor_idx').on(table.matchedMentorId),
}));

// ----- MENTORSHIPS -----
export const mentorships = pgTable('mentorships', {
  id: uuid('id').primaryKey().defaultRandom(),
  mentorId: uuid('mentor_id').references(() => businessMentors.id, { onDelete: 'cascade' }).notNull(),
  menteeId: uuid('mentee_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  requestId: uuid('request_id').references(() => mentorshipRequests.id),

  // Status
  status: varchar('status', { length: 20 }).default('active'), // active, paused, completed, terminated

  // Dates
  startedAt: timestamp('started_at').defaultNow(),
  pausedAt: timestamp('paused_at'),
  endedAt: timestamp('ended_at'),
  expectedEndDate: timestamp('expected_end_date'),

  // Goals and notes
  goals: jsonb('goals').default([]),
  initialAssessment: text('initial_assessment'),
  finalSummary: text('final_summary'),

  // Progress
  sessionsCompleted: integer('sessions_completed').default(0),
  nextSessionDate: timestamp('next_session_date'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  mentorIdx: index('mentorships_mentor_idx').on(table.mentorId),
  menteeIdx: index('mentorships_mentee_idx').on(table.menteeId),
  statusIdx: index('mentorships_status_idx').on(table.status),
}));

// ----- MENTORSHIP SESSIONS -----
export const mentorshipSessions = pgTable('mentorship_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  mentorshipId: uuid('mentorship_id').references(() => mentorships.id, { onDelete: 'cascade' }).notNull(),

  // Scheduling
  scheduledDate: timestamp('scheduled_date').notNull(),
  durationMinutes: integer('duration_minutes').default(60),
  actualDurationMinutes: integer('actual_duration_minutes'),

  // Location
  isOnline: boolean('is_online').default(true),
  meetingUrl: text('meeting_url'),
  location: text('location'),

  // Status
  status: mentorshipSessionStatusEnum('status').default('scheduled'),
  completedAt: timestamp('completed_at'),
  cancelledAt: timestamp('cancelled_at'),
  cancellationReason: text('cancellation_reason'),
  cancelledBy: uuid('cancelled_by').references(() => users.id),

  // Content
  agenda: text('agenda'),
  notes: text('notes'),
  mentorPrivateNotes: text('mentor_private_notes'),
  actionItems: jsonb('action_items').default([]),

  // Feedback
  menteeRating: integer('mentee_rating'),
  menteeFeedback: text('mentee_feedback'),
  mentorRating: integer('mentor_rating'),
  mentorFeedback: text('mentor_feedback'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  mentorshipIdx: index('sessions_mentorship_idx').on(table.mentorshipId),
  dateIdx: index('sessions_date_idx').on(table.scheduledDate),
  statusIdx: index('sessions_status_idx').on(table.status),
}));

// ----- MENTEE PROGRESS -----
export const menteeProgress = pgTable('mentee_progress', {
  id: uuid('id').primaryKey().defaultRandom(),
  mentorshipId: uuid('mentorship_id').references(() => mentorships.id, { onDelete: 'cascade' }).notNull(),

  milestoneType: varchar('milestone_type', { length: 50 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),

  targetDate: timestamp('target_date'),
  completedAt: timestamp('completed_at'),
  evidenceUrl: text('evidence_url'),
  evidenceDescription: text('evidence_description'),

  verifiedByMentor: boolean('verified_by_mentor').default(false),
  mentorNotes: text('mentor_notes'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  mentorshipIdx: index('progress_mentorship_idx').on(table.mentorshipId),
  completedIdx: index('progress_completed_idx').on(table.completedAt),
}));

// ----- BUSINESS COUNCILS -----
export const businessCouncils = pgTable('business_councils', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),

  // Scope
  scope: orgRoleScopeEnum('scope').default('national'),
  commanderyId: uuid('commandery_id').references(() => commanderies.id),

  // Description
  description: text('description'),
  mission: text('mission'),
  focusAreas: jsonb('focus_areas').default([]),

  // Leadership
  headId: uuid('head_id').references(() => users.id),
  deputyHeadId: uuid('deputy_head_id').references(() => users.id),
  secretaryId: uuid('secretary_id').references(() => users.id),

  // Status
  isActive: boolean('is_active').default(true),
  foundedAt: timestamp('founded_at').defaultNow(),

  // Stats
  memberCount: integer('member_count').default(0),
  activeInitiatives: integer('active_initiatives').default(0),

  // Meetings
  meetingFrequency: varchar('meeting_frequency', { length: 50 }),
  nextMeetingDate: timestamp('next_meeting_date'),
  meetingLocation: text('meeting_location'),
  meetingUrl: text('meeting_url'),

  // Contact
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 20 }),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  scopeIdx: index('councils_scope_idx').on(table.scope),
  commanderyIdx: index('councils_commandery_idx').on(table.commanderyId),
  activeIdx: index('councils_active_idx').on(table.isActive),
  slugIdx: uniqueIndex('councils_slug_idx').on(table.slug),
}));

// ----- BUSINESS COUNCIL MEMBERS -----
export const businessCouncilMembers = pgTable('business_council_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  councilId: uuid('council_id').references(() => businessCouncils.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),

  role: varchar('role', { length: 50 }).default('member'),
  expertise: jsonb('expertise').default([]),
  contributionAreas: text('contribution_areas'),

  joinedAt: timestamp('joined_at').defaultNow(),
  leftAt: timestamp('left_at'),
  isActive: boolean('is_active').default(true),

  notes: text('notes'),
  achievements: text('achievements'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  councilIdx: index('council_members_council_idx').on(table.councilId),
  userIdx: index('council_members_user_idx').on(table.userId),
  activeIdx: index('council_members_active_idx').on(table.isActive),
}));

// ----- BUSINESS COUNCIL MEETINGS -----
export const businessCouncilMeetings = pgTable('business_council_meetings', {
  id: uuid('id').primaryKey().defaultRandom(),
  councilId: uuid('council_id').references(() => businessCouncils.id, { onDelete: 'cascade' }).notNull(),

  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  meetingNumber: integer('meeting_number'),

  scheduledDate: timestamp('scheduled_date').notNull(),
  durationMinutes: integer('duration_minutes').default(90),
  actualStart: timestamp('actual_start'),
  actualEnd: timestamp('actual_end'),

  isOnline: boolean('is_online').default(true),
  meetingUrl: text('meeting_url'),
  location: text('location'),

  agenda: text('agenda'),
  minutes: text('minutes'),
  keyDecisions: jsonb('key_decisions').default([]),

  expectedAttendees: jsonb('expected_attendees').default([]),
  actualAttendees: jsonb('actual_attendees').default([]),

  status: varchar('status', { length: 20 }).default('scheduled'),
  cancelledReason: text('cancelled_reason'),

  actionItems: jsonb('action_items').default([]),
  nextMeetingTopics: text('next_meeting_topics'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  createdBy: uuid('created_by').references(() => users.id),
}, (table) => ({
  councilIdx: index('council_meetings_council_idx').on(table.councilId),
  dateIdx: index('council_meetings_date_idx').on(table.scheduledDate),
  statusIdx: index('council_meetings_status_idx').on(table.status),
}));

// ----- COUNCIL INITIATIVES -----
export const councilInitiatives = pgTable('council_initiatives', {
  id: uuid('id').primaryKey().defaultRandom(),
  councilId: uuid('council_id').references(() => businessCouncils.id, { onDelete: 'cascade' }).notNull(),

  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  objectives: text('objectives'),

  focusArea: varchar('focus_area', { length: 50 }),
  initiativeType: varchar('initiative_type', { length: 50 }),

  leadId: uuid('lead_id').references(() => users.id),
  teamMembers: jsonb('team_members').default([]),

  startDate: timestamp('start_date'),
  targetEndDate: timestamp('target_end_date'),
  actualEndDate: timestamp('actual_end_date'),

  status: varchar('status', { length: 20 }).default('planning'),

  targetParticipants: integer('target_participants'),
  actualParticipants: integer('actual_participants'),
  budget: integer('budget'),
  spent: integer('spent'),

  outcomes: text('outcomes'),
  lessonsLearned: text('lessons_learned'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  councilIdx: index('initiatives_council_idx').on(table.councilId),
  statusIdx: index('initiatives_status_idx').on(table.status),
  leadIdx: index('initiatives_lead_idx').on(table.leadId),
}));

// ----- PARTICIPATION RECORDS -----
export const participationRecords = pgTable('participation_records', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),

  activityType: participationActivityTypeEnum('activity_type').notNull(),
  activityId: uuid('activity_id'),
  activityTable: varchar('activity_table', { length: 50 }),

  title: varchar('title', { length: 255 }),
  description: text('description'),

  pointsEarned: integer('points_earned').default(0),
  hoursContributed: integer('hours_contributed'),
  impactScore: integer('impact_score'),

  verified: boolean('verified').default(false),
  verifiedBy: uuid('verified_by').references(() => users.id),
  verifiedAt: timestamp('verified_at'),
  verificationMethod: varchar('verification_method', { length: 50 }),

  evidenceUrl: text('evidence_url'),
  evidenceNotes: text('evidence_notes'),

  commanderyId: uuid('commandery_id').references(() => commanderies.id),
  activityDate: timestamp('activity_date').notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  createdBy: uuid('created_by').references(() => users.id),
}, (table) => ({
  userIdx: index('participation_user_idx').on(table.userId),
  typeIdx: index('participation_type_idx').on(table.activityType),
  dateIdx: index('participation_date_idx').on(table.activityDate),
  verifiedIdx: index('participation_verified_idx').on(table.verified),
  commanderyIdx: index('participation_commandery_idx').on(table.commanderyId),
}));

// ----- PARTICIPATION STATS -----
export const participationStats = pgTable('participation_stats', {
  userId: uuid('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),

  // Activity counts
  totalEventsAttended: integer('total_events_attended').default(0),
  totalEventsOrganized: integer('total_events_organized').default(0),
  totalTasksCompleted: integer('total_tasks_completed').default(0),
  totalVotesCast: integer('total_votes_cast').default(0),
  totalMentorshipSessions: integer('total_mentorship_sessions').default(0),
  totalMentorshipGiven: integer('total_mentorship_given').default(0),
  totalVolunteerActivities: integer('total_volunteer_activities').default(0),
  totalCouncilMeetings: integer('total_council_meetings').default(0),
  totalTrainingsCompleted: integer('total_trainings_completed').default(0),

  // Time metrics
  totalHoursVolunteered: integer('total_hours_volunteered').default(0),
  totalMentorshipHours: integer('total_mentorship_hours').default(0),

  // Points
  totalParticipationPoints: integer('total_participation_points').default(0),
  currentYearPoints: integer('current_year_points').default(0),
  pointsThisMonth: integer('points_this_month').default(0),

  // Streaks
  currentActivityStreak: integer('current_activity_streak').default(0),
  longestActivityStreak: integer('longest_activity_streak').default(0),
  lastActivityDate: timestamp('last_activity_date'),

  // Rankings
  yearlyRank: integer('yearly_rank'),
  overallRank: integer('overall_rank'),
  commanderyRank: integer('commandery_rank'),

  // Level
  participationLevel: integer('participation_level').default(1),
  nextLevelPoints: integer('next_level_points'),

  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  lastCalculatedAt: timestamp('last_calculated_at').defaultNow(),
});

// ----- PARTICIPATION MILESTONES -----
export const participationMilestones = pgTable('participation_milestones', {
  id: varchar('id', { length: 50 }).primaryKey(),
  nameUk: varchar('name_uk', { length: 100 }).notNull(),
  nameEn: varchar('name_en', { length: 100 }),
  descriptionUk: text('description_uk'),
  descriptionEn: text('description_en'),

  activityType: participationActivityTypeEnum('activity_type'),
  requiredCount: integer('required_count'),
  requiredPoints: integer('required_points'),
  requiredHours: integer('required_hours'),

  pointsReward: integer('points_reward').default(0),
  badgeId: varchar('badge_id', { length: 50 }).references(() => badges.id),

  icon: varchar('icon', { length: 50 }),
  displayOrder: integer('display_order').default(0),
  isActive: boolean('is_active').default(true),
});

// ----- USER MILESTONES -----
export const userMilestones = pgTable('user_milestones', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  milestoneId: varchar('milestone_id', { length: 50 }).references(() => participationMilestones.id).notNull(),

  achievedAt: timestamp('achieved_at').defaultNow().notNull(),
  pointsAwarded: integer('points_awarded').default(0),
}, (table) => ({
  userIdx: index('user_milestones_user_idx').on(table.userId),
  milestoneIdx: index('user_milestones_milestone_idx').on(table.milestoneId),
  uniqueMilestone: uniqueIndex('user_milestones_unique').on(table.userId, table.milestoneId),
}));

// ----- ELECTION CANDIDATES -----
export const electionCandidates = pgTable('election_candidates', {
  id: uuid('id').primaryKey().defaultRandom(),
  voteId: uuid('vote_id').references(() => votes.id, { onDelete: 'cascade' }).notNull(),
  candidateId: uuid('candidate_id').references(() => users.id).notNull(),
  optionId: uuid('option_id').references(() => voteOptions.id),

  // Candidate profile
  platformStatement: text('platform_statement'),
  qualifications: text('qualifications'),
  endorsements: jsonb('endorsements').default([]),

  // Military info for tiebreaker
  highestMilitaryRank: militaryRankEnum('highest_military_rank'),
  totalServiceYears: integer('total_service_years'),
  combatExperience: boolean('combat_experience').default(false),
  rankNumeric: integer('rank_numeric'),

  // Nomination
  nominatedBy: uuid('nominated_by').references(() => users.id),
  nominatedAt: timestamp('nominated_at').defaultNow(),
  acceptedNomination: boolean('accepted_nomination').default(false),
  acceptedAt: timestamp('accepted_at'),
  declinedReason: text('declined_reason'),

  // Results
  finalVoteCount: integer('final_vote_count').default(0),
  finalPercentage: integer('final_percentage'),
  finalRank: integer('final_rank'),
  isElected: boolean('is_elected').default(false),
  tiedWith: jsonb('tied_with').default([]),
  wonByTiebreaker: boolean('won_by_tiebreaker').default(false),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  voteIdx: index('election_candidates_vote_idx').on(table.voteId),
  candidateIdx: index('election_candidates_user_idx').on(table.candidateId),
  rankIdx: index('election_candidates_rank_idx').on(table.finalRank),
  electedIdx: index('election_candidates_elected_idx').on(table.isElected),
}));

// ----- ELECTION NOMINATIONS -----
export const electionNominations = pgTable('election_nominations', {
  id: uuid('id').primaryKey().defaultRandom(),
  voteId: uuid('vote_id').references(() => votes.id, { onDelete: 'cascade' }).notNull(),
  nomineeId: uuid('nominee_id').references(() => users.id).notNull(),
  nominatorId: uuid('nominator_id').references(() => users.id),

  isSelfNomination: boolean('is_self_nomination').default(false),
  nominationStatement: text('nomination_statement'),
  endorsementStatement: text('endorsement_statement'),

  status: varchar('status', { length: 20 }).default('pending'),
  responseAt: timestamp('response_at'),
  responseNotes: text('response_notes'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  voteIdx: index('election_nominations_vote_idx').on(table.voteId),
  nomineeIdx: index('election_nominations_nominee_idx').on(table.nomineeId),
  statusIdx: index('election_nominations_status_idx').on(table.status),
}));

// ===========================================
// RELATIONS
// ===========================================

// ----- KATOTTG RELATIONS -----
export const katottgCategoriesRelations = relations(katottgCategories, ({ many }) => ({
  locations: many(katottg),
}));

export const katottgRelations = relations(katottg, ({ one }) => ({
  categoryRef: one(katottgCategories, {
    fields: [katottg.category],
    references: [katottgCategories.code],
  }),
}));

export const oblastsRelations = relations(oblasts, ({ one, many }) => ({
  leader: one(users, {
    fields: [oblasts.leaderId],
    references: [users.id],
  }),
  groups: many(groups),
  users: many(users),
  events: many(events),
}));

export const groupsRelations = relations(groups, ({ one, many }) => ({
  oblast: one(oblasts, {
    fields: [groups.oblastId],
    references: [oblasts.id],
  }),
  leader: one(users, {
    fields: [groups.leaderId],
    references: [users.id],
  }),
  members: many(users),
  events: many(events),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  oblast: one(oblasts, {
    fields: [users.oblastId],
    references: [oblasts.id],
  }),
  group: one(groups, {
    fields: [users.groupId],
    references: [groups.id],
  }),
  referredBy: one(users, {
    fields: [users.referredById],
    references: [users.id],
    relationName: 'referrals',
  }),
  referrals: many(users, {
    relationName: 'referrals',
  }),
  achievements: many(userAchievements),
  organizedEvents: many(events),
  eventRsvps: many(eventRsvps),
  createdVotes: many(votes),
  userVotes: many(userVotes),
  tasks: many(tasks),
  challengeParticipations: many(challengeParticipants),
  payments: many(payments),
  newsArticles: many(newsArticles),
  notifications: many(notifications),
  orders: many(orders),
  createdProducts: many(products),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  organizer: one(users, {
    fields: [events.organizerId],
    references: [users.id],
  }),
  oblast: one(oblasts, {
    fields: [events.oblastId],
    references: [oblasts.id],
  }),
  group: one(groups, {
    fields: [events.groupId],
    references: [groups.id],
  }),
  rsvps: many(eventRsvps),
}));

export const eventRsvpsRelations = relations(eventRsvps, ({ one }) => ({
  event: one(events, {
    fields: [eventRsvps.eventId],
    references: [events.id],
  }),
  user: one(users, {
    fields: [eventRsvps.userId],
    references: [users.id],
  }),
}));

export const votesRelations = relations(votes, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [votes.createdById],
    references: [users.id],
  }),
  oblast: one(oblasts, {
    fields: [votes.oblastId],
    references: [oblasts.id],
  }),
  group: one(groups, {
    fields: [votes.groupId],
    references: [groups.id],
  }),
  options: many(voteOptions),
  userVotes: many(userVotes),
}));

export const voteOptionsRelations = relations(voteOptions, ({ one, many }) => ({
  vote: one(votes, {
    fields: [voteOptions.voteId],
    references: [votes.id],
  }),
  userVotes: many(userVotes),
}));

export const userVotesRelations = relations(userVotes, ({ one }) => ({
  vote: one(votes, {
    fields: [userVotes.voteId],
    references: [votes.id],
  }),
  user: one(users, {
    fields: [userVotes.userId],
    references: [users.id],
  }),
  option: one(voteOptions, {
    fields: [userVotes.optionId],
    references: [voteOptions.id],
  }),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  assignee: one(users, {
    fields: [tasks.assigneeId],
    references: [users.id],
  }),
  group: one(groups, {
    fields: [tasks.groupId],
    references: [groups.id],
  }),
  oblast: one(oblasts, {
    fields: [tasks.oblastId],
    references: [oblasts.id],
  }),
  createdBy: one(users, {
    fields: [tasks.createdById],
    references: [users.id],
  }),
}));

export const challengesRelations = relations(challenges, ({ one, many }) => ({
  participants: many(challengeParticipants),
  createdBy: one(users, {
    fields: [challenges.createdById],
    references: [users.id],
  }),
  badge: one(badges, {
    fields: [challenges.badgeId],
    references: [badges.id],
  }),
}));

export const badgesRelations = relations(badges, ({ many }) => ({
  challenges: many(challenges),
}));

export const challengeParticipantsRelations = relations(challengeParticipants, ({ one }) => ({
  challenge: one(challenges, {
    fields: [challengeParticipants.challengeId],
    references: [challenges.id],
  }),
  user: one(users, {
    fields: [challengeParticipants.userId],
    references: [users.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  user: one(users, {
    fields: [payments.userId],
    references: [users.id],
  }),
}));

export const newsArticlesRelations = relations(newsArticles, ({ one }) => ({
  author: one(users, {
    fields: [newsArticles.authorId],
    references: [users.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [products.createdById],
    references: [users.id],
  }),
  orderItems: many(orderItems),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

export const helpCategoriesRelations = relations(helpCategories, ({ one, many }) => ({
  parent: one(helpCategories, {
    fields: [helpCategories.parentId],
    references: [helpCategories.id],
    relationName: 'subcategories',
  }),
  subcategories: many(helpCategories, {
    relationName: 'subcategories',
  }),
  articles: many(helpArticles),
}));

export const helpArticlesRelations = relations(helpArticles, ({ one, many }) => ({
  category: one(helpCategories, {
    fields: [helpArticles.categoryId],
    references: [helpCategories.id],
  }),
  author: one(users, {
    fields: [helpArticles.authorId],
    references: [users.id],
  }),
  feedback: many(helpArticleFeedback),
  tooltips: many(helpTooltips),
}));

export const helpArticleFeedbackRelations = relations(helpArticleFeedback, ({ one }) => ({
  article: one(helpArticles, {
    fields: [helpArticleFeedback.articleId],
    references: [helpArticles.id],
  }),
  user: one(users, {
    fields: [helpArticleFeedback.userId],
    references: [users.id],
  }),
}));

export const helpTooltipsRelations = relations(helpTooltips, ({ one }) => ({
  article: one(helpArticles, {
    fields: [helpTooltips.articleId],
    references: [helpArticles.id],
  }),
}));

export const emailTemplatesRelations = relations(emailTemplates, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [emailTemplates.createdById],
    references: [users.id],
  }),
  updatedBy: one(users, {
    fields: [emailTemplates.updatedById],
    references: [users.id],
  }),
  history: many(emailTemplateHistory),
}));

export const emailTemplateHistoryRelations = relations(emailTemplateHistory, ({ one }) => ({
  template: one(emailTemplates, {
    fields: [emailTemplateHistory.templateId],
    references: [emailTemplates.id],
  }),
  changedBy: one(users, {
    fields: [emailTemplateHistory.changedById],
    references: [users.id],
  }),
}));

export const emailSendLogRelations = relations(emailSendLog, ({ one }) => ({
  recipientUser: one(users, {
    fields: [emailSendLog.recipientUserId],
    references: [users.id],
  }),
}));

// ----- USER LOCATION CHANGES RELATIONS -----
export const userLocationChangesRelations = relations(userLocationChanges, ({ one }) => ({
  user: one(users, {
    fields: [userLocationChanges.userId],
    references: [users.id],
  }),
  changedByUser: one(users, {
    fields: [userLocationChanges.changedBy],
    references: [users.id],
    relationName: 'locationChangesAdmin',
  }),
}));

// ----- ROLE PROGRESSION RELATIONS -----

export const roleAdvancementsRelations = relations(roleAdvancements, ({ one }) => ({
  user: one(users, {
    fields: [roleAdvancements.userId],
    references: [users.id],
  }),
  advancedByUser: one(users, {
    fields: [roleAdvancements.advancedBy],
    references: [users.id],
    relationName: 'helpedAdvancements',
  }),
  approvedByUser: one(users, {
    fields: [roleAdvancements.approvedBy],
    references: [users.id],
  }),
}));

export const userReferralStatsRelations = relations(userReferralStats, ({ one }) => ({
  user: one(users, {
    fields: [userReferralStats.userId],
    references: [users.id],
  }),
}));

export const advancementRequestsRelations = relations(advancementRequests, ({ one }) => ({
  user: one(users, {
    fields: [advancementRequests.userId],
    references: [users.id],
  }),
  reviewer: one(users, {
    fields: [advancementRequests.reviewedBy],
    references: [users.id],
  }),
}));

// ===========================================
// VETERAN-SPECIFIC RELATIONS (Order of Veterans)
// ===========================================

// ----- MILITARY SERVICE RELATIONS -----
export const militaryServiceRelations = relations(militaryService, ({ one }) => ({
  user: one(users, {
    fields: [militaryService.userId],
    references: [users.id],
  }),
  verifiedByUser: one(users, {
    fields: [militaryService.verifiedBy],
    references: [users.id],
    relationName: 'militaryServiceVerifier',
  }),
}));

// ----- USER ORG ROLES RELATIONS -----
export const userOrgRolesRelations = relations(userOrgRoles, ({ one }) => ({
  user: one(users, {
    fields: [userOrgRoles.userId],
    references: [users.id],
  }),
  commandery: one(commanderies, {
    fields: [userOrgRoles.commanderyId],
    references: [commanderies.id],
  }),
  appointedByUser: one(users, {
    fields: [userOrgRoles.appointedBy],
    references: [users.id],
    relationName: 'orgRoleAppointer',
  }),
  election: one(votes, {
    fields: [userOrgRoles.electionId],
    references: [votes.id],
  }),
}));

// ----- HONOR COURT RELATIONS -----
export const honorCourtCasesRelations = relations(honorCourtCases, ({ one, many }) => ({
  complainant: one(users, {
    fields: [honorCourtCases.complainantId],
    references: [users.id],
    relationName: 'honorCaseComplainant',
  }),
  respondent: one(users, {
    fields: [honorCourtCases.respondentId],
    references: [users.id],
    relationName: 'honorCaseRespondent',
  }),
  leadJudge: one(users, {
    fields: [honorCourtCases.leadJudgeId],
    references: [users.id],
    relationName: 'honorCaseLeadJudge',
  }),
  createdByUser: one(users, {
    fields: [honorCourtCases.createdBy],
    references: [users.id],
  }),
  notes: many(honorCourtNotes),
  participants: many(honorCourtParticipants),
}));

export const honorCourtNotesRelations = relations(honorCourtNotes, ({ one }) => ({
  case: one(honorCourtCases, {
    fields: [honorCourtNotes.caseId],
    references: [honorCourtCases.id],
  }),
  author: one(users, {
    fields: [honorCourtNotes.authorId],
    references: [users.id],
  }),
}));

export const honorCourtParticipantsRelations = relations(honorCourtParticipants, ({ one }) => ({
  case: one(honorCourtCases, {
    fields: [honorCourtParticipants.caseId],
    references: [honorCourtCases.id],
  }),
  user: one(users, {
    fields: [honorCourtParticipants.userId],
    references: [users.id],
  }),
}));

// ----- BUSINESS MENTOR RELATIONS -----
export const businessMentorsRelations = relations(businessMentors, ({ one, many }) => ({
  user: one(users, {
    fields: [businessMentors.userId],
    references: [users.id],
  }),
  verifiedByUser: one(users, {
    fields: [businessMentors.verifiedBy],
    references: [users.id],
    relationName: 'mentorVerifier',
  }),
  availability: many(mentorAvailability),
  mentorships: many(mentorships),
  requests: many(mentorshipRequests),
}));

export const mentorAvailabilityRelations = relations(mentorAvailability, ({ one }) => ({
  mentor: one(businessMentors, {
    fields: [mentorAvailability.mentorId],
    references: [businessMentors.id],
  }),
}));

export const mentorshipRequestsRelations = relations(mentorshipRequests, ({ one }) => ({
  mentee: one(users, {
    fields: [mentorshipRequests.menteeId],
    references: [users.id],
  }),
  matchedMentor: one(businessMentors, {
    fields: [mentorshipRequests.matchedMentorId],
    references: [businessMentors.id],
  }),
}));

export const mentorshipsRelations = relations(mentorships, ({ one, many }) => ({
  mentor: one(businessMentors, {
    fields: [mentorships.mentorId],
    references: [businessMentors.id],
  }),
  mentee: one(users, {
    fields: [mentorships.menteeId],
    references: [users.id],
  }),
  request: one(mentorshipRequests, {
    fields: [mentorships.requestId],
    references: [mentorshipRequests.id],
  }),
  sessions: many(mentorshipSessions),
  progress: many(menteeProgress),
}));

export const mentorshipSessionsRelations = relations(mentorshipSessions, ({ one }) => ({
  mentorship: one(mentorships, {
    fields: [mentorshipSessions.mentorshipId],
    references: [mentorships.id],
  }),
  cancelledByUser: one(users, {
    fields: [mentorshipSessions.cancelledBy],
    references: [users.id],
  }),
}));

export const menteeProgressRelations = relations(menteeProgress, ({ one }) => ({
  mentorship: one(mentorships, {
    fields: [menteeProgress.mentorshipId],
    references: [mentorships.id],
  }),
}));

// ----- BUSINESS COUNCIL RELATIONS -----
export const businessCouncilsRelations = relations(businessCouncils, ({ one, many }) => ({
  commandery: one(commanderies, {
    fields: [businessCouncils.commanderyId],
    references: [commanderies.id],
  }),
  head: one(users, {
    fields: [businessCouncils.headId],
    references: [users.id],
    relationName: 'councilHead',
  }),
  deputyHead: one(users, {
    fields: [businessCouncils.deputyHeadId],
    references: [users.id],
    relationName: 'councilDeputy',
  }),
  secretary: one(users, {
    fields: [businessCouncils.secretaryId],
    references: [users.id],
    relationName: 'councilSecretary',
  }),
  members: many(businessCouncilMembers),
  meetings: many(businessCouncilMeetings),
  initiatives: many(councilInitiatives),
}));

export const businessCouncilMembersRelations = relations(businessCouncilMembers, ({ one }) => ({
  council: one(businessCouncils, {
    fields: [businessCouncilMembers.councilId],
    references: [businessCouncils.id],
  }),
  user: one(users, {
    fields: [businessCouncilMembers.userId],
    references: [users.id],
  }),
}));

export const businessCouncilMeetingsRelations = relations(businessCouncilMeetings, ({ one }) => ({
  council: one(businessCouncils, {
    fields: [businessCouncilMeetings.councilId],
    references: [businessCouncils.id],
  }),
  createdByUser: one(users, {
    fields: [businessCouncilMeetings.createdBy],
    references: [users.id],
  }),
}));

export const councilInitiativesRelations = relations(councilInitiatives, ({ one }) => ({
  council: one(businessCouncils, {
    fields: [councilInitiatives.councilId],
    references: [businessCouncils.id],
  }),
  lead: one(users, {
    fields: [councilInitiatives.leadId],
    references: [users.id],
  }),
}));

// ----- PARTICIPATION RELATIONS -----
export const participationRecordsRelations = relations(participationRecords, ({ one }) => ({
  user: one(users, {
    fields: [participationRecords.userId],
    references: [users.id],
  }),
  verifiedByUser: one(users, {
    fields: [participationRecords.verifiedBy],
    references: [users.id],
    relationName: 'participationVerifier',
  }),
  commandery: one(commanderies, {
    fields: [participationRecords.commanderyId],
    references: [commanderies.id],
  }),
  createdByUser: one(users, {
    fields: [participationRecords.createdBy],
    references: [users.id],
    relationName: 'participationCreator',
  }),
}));

export const participationStatsRelations = relations(participationStats, ({ one }) => ({
  user: one(users, {
    fields: [participationStats.userId],
    references: [users.id],
  }),
}));

export const participationMilestonesRelations = relations(participationMilestones, ({ one, many }) => ({
  badge: one(badges, {
    fields: [participationMilestones.badgeId],
    references: [badges.id],
  }),
  userMilestones: many(userMilestones),
}));

export const userMilestonesRelations = relations(userMilestones, ({ one }) => ({
  user: one(users, {
    fields: [userMilestones.userId],
    references: [users.id],
  }),
  milestone: one(participationMilestones, {
    fields: [userMilestones.milestoneId],
    references: [participationMilestones.id],
  }),
}));

// ----- ELECTION RELATIONS -----
export const electionCandidatesRelations = relations(electionCandidates, ({ one }) => ({
  vote: one(votes, {
    fields: [electionCandidates.voteId],
    references: [votes.id],
  }),
  candidate: one(users, {
    fields: [electionCandidates.candidateId],
    references: [users.id],
  }),
  option: one(voteOptions, {
    fields: [electionCandidates.optionId],
    references: [voteOptions.id],
  }),
  nominatedByUser: one(users, {
    fields: [electionCandidates.nominatedBy],
    references: [users.id],
    relationName: 'electionNominator',
  }),
}));

export const electionNominationsRelations = relations(electionNominations, ({ one }) => ({
  vote: one(votes, {
    fields: [electionNominations.voteId],
    references: [votes.id],
  }),
  nominee: one(users, {
    fields: [electionNominations.nomineeId],
    references: [users.id],
  }),
  nominator: one(users, {
    fields: [electionNominations.nominatorId],
    references: [users.id],
    relationName: 'nominatedBy',
  }),
}));
