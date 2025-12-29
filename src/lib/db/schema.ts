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

// ----- GROUPS (Local Cells) -----
export const groups = pgTable('groups', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  oblastId: uuid('oblast_id').references(() => oblasts.id).notNull(),
  cityId: varchar('city_id', { length: 50 }),
  leaderId: uuid('leader_id'),
  memberCount: integer('member_count').default(0),
  status: varchar('status', { length: 20 }).default('active'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  oblastIdx: index('groups_oblast_idx').on(table.oblastId),
}));

// ----- USERS (Members) -----
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  clerkId: varchar('clerk_id', { length: 255 }).notNull().unique(), // Now stores Supabase Auth user id
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 20 }),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  patronymic: varchar('patronymic', { length: 100 }),
  dateOfBirth: timestamp('date_of_birth'),
  avatarUrl: text('avatar_url'),

  // Role & Status (Legacy - kept for backwards compatibility)
  role: userRoleEnum('role').default('prospect').notNull(),
  status: userStatusEnum('status').default('pending').notNull(),

  // New Membership Role System (8-tier progression)
  membershipRole: membershipRoleEnum('membership_role').default('supporter'),
  staffRole: staffRoleEnum('staff_role').default('none'),
  roleAdvancedAt: timestamp('role_advanced_at'),
  totalReferralCount: integer('total_referral_count').default(0),

  // Verification
  isEmailVerified: boolean('is_email_verified').default(false),
  isPhoneVerified: boolean('is_phone_verified').default(false),
  isIdentityVerified: boolean('is_identity_verified').default(false),
  verificationMethod: verificationMethodEnum('verification_method').default('none'),

  // Location (Legacy)
  oblastId: uuid('oblast_id').references(() => oblasts.id),
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
  clerkIdIdx: uniqueIndex('users_clerk_id_idx').on(table.clerkId),
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

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  statusIdx: index('votes_status_idx').on(table.status),
  endDateIdx: index('votes_end_date_idx').on(table.endDate),
  scopeIdx: index('votes_scope_idx').on(table.scope),
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
