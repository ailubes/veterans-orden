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

// ===========================================
// TABLES
// ===========================================

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

  // Role & Status
  role: userRoleEnum('role').default('prospect').notNull(),
  status: userStatusEnum('status').default('pending').notNull(),

  // Verification
  isEmailVerified: boolean('is_email_verified').default(false),
  isPhoneVerified: boolean('is_phone_verified').default(false),
  isIdentityVerified: boolean('is_identity_verified').default(false),
  verificationMethod: verificationMethodEnum('verification_method').default('none'),

  // Location
  oblastId: uuid('oblast_id').references(() => oblasts.id),
  groupId: uuid('group_id').references(() => groups.id),
  city: varchar('city', { length: 100 }),

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

  // Time
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),

  // Status
  status: challengeStatusEnum('status').default('upcoming').notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  statusIdx: index('challenges_status_idx').on(table.status),
  startDateIdx: index('challenges_start_date_idx').on(table.startDate),
}));

// ----- CHALLENGE PARTICIPANTS -----
export const challengeParticipants = pgTable('challenge_participants', {
  id: uuid('id').primaryKey().defaultRandom(),
  challengeId: uuid('challenge_id').references(() => challenges.id).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  progress: integer('progress').default(0),
  completedAt: timestamp('completed_at'),
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
}, (table) => ({
  challengeUserIdx: uniqueIndex('challenge_participants_unique').on(table.challengeId, table.userId),
  challengeIdx: index('challenge_participants_challenge_idx').on(table.challengeId),
  userIdx: index('challenge_participants_user_idx').on(table.userId),
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
  featuredImage: text('featured_image'),
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

// ===========================================
// RELATIONS
// ===========================================

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

export const challengesRelations = relations(challenges, ({ many }) => ({
  participants: many(challengeParticipants),
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
