/**
 * Comprehensive Zod validation schemas for API requests
 *
 * These schemas provide type-safe request validation across all API endpoints,
 * ensuring data integrity and preventing malformed requests from reaching the database.
 */

import { z } from 'zod';

// ===================================================================
// COMMON SCHEMAS
// ===================================================================

export const uuidSchema = z.string().uuid('Invalid UUID format');

export const emailSchema = z.string().email('Invalid email address').toLowerCase();

export const phoneSchema = z
  .string()
  .regex(/^\+380\d{9}$/, 'Phone must be in format +380XXXXXXXXX')
  .optional()
  .nullable();

export const dateSchema = z.string().datetime('Invalid date format').or(z.date());

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// ===================================================================
// AUTHENTICATION SCHEMAS
// ===================================================================

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(8, 'Password must be at least 8 characters'),
  two_factor_code: z.string().regex(/^\d{6}$/, '2FA code must be 6 digits').optional(),
});

export const signUpSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password too long'),
  first_name: z.string().min(2, 'First name must be at least 2 characters').max(50),
  last_name: z.string().min(2, 'Last name must be at least 2 characters').max(50),
  patronymic: z.string().max(50).optional().nullable(),
  phone: phoneSchema,
  date_of_birth: z.string().date().optional().nullable(),
  referral_code: z.string().max(20).optional().nullable(),
});

export const refreshTokenSchema = z.object({
  refresh_token: z.string().min(1, 'Refresh token is required'),
});

export const verify2FASchema = z.object({
  code: z.string().regex(/^\d{6}$/, '2FA code must be 6 digits'),
});

// ===================================================================
// USER PROFILE SCHEMAS
// ===================================================================

export const updateProfileSchema = z.object({
  first_name: z.string().min(2).max(50).optional(),
  last_name: z.string().min(2).max(50).optional(),
  patronymic: z.string().max(50).optional().nullable(),
  phone: phoneSchema,
  bio: z.string().max(500).optional().nullable(),
  date_of_birth: z.string().date().optional().nullable(),
  sex: z.enum(['male', 'female', 'not_specified']).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  avatar_url: z.string().url().optional().nullable(),
});

export const updatePasswordSchema = z.object({
  current_password: z.string().min(8),
  new_password: z.string().min(8).max(100),
  confirm_password: z.string().min(8).max(100),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Passwords don't match",
  path: ['confirm_password'],
});

export const enable2FASchema = z.object({
  secret: z.string().min(1),
  code: z.string().regex(/^\d{6}$/),
});

export const uploadAvatarSchema = z.object({
  fileName: z.string().min(1, 'File name is required'),
  fileType: z.enum(['image/jpeg', 'image/png', 'image/webp', 'image/gif'], {
    errorMap: () => ({ message: 'Only images (JPG, PNG, WebP, GIF) are allowed' }),
  }),
  fileSize: z.number().int().min(1).max(5 * 1024 * 1024, 'Maximum file size is 5MB'),
});

export const updateAvatarUrlSchema = z.object({
  avatarUrl: z.string().url('Invalid avatar URL'),
});

export const searchUsersSchema = z.object({
  q: z.string().min(2, 'Search query must be at least 2 characters').optional().default(''),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
});

// ===================================================================
// EVENT SCHEMAS
// ===================================================================

export const createEventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().min(10).max(5000).optional().nullable(),
  location: z.string().max(200).optional().nullable(),
  online_link: z.string().url('Invalid URL').optional().nullable(),
  start_date: dateSchema,
  end_date: dateSchema.optional().nullable(),
  event_type: z.enum(['meeting', 'workshop', 'conference', 'social', 'other']),
  max_attendees: z.number().int().min(1).optional().nullable(),
  points_reward: z.number().int().min(0).default(0),
  price_uah: z.number().min(0).optional().nullable(),
  price_points: z.number().int().min(0).optional().nullable(),
  requires_approval: z.boolean().default(false),
});

export const updateEventSchema = createEventSchema.partial();

export const rsvpEventSchema = z.object({
  status: z.enum(['going', 'maybe', 'not_going'], {
    errorMap: () => ({ message: 'Status must be going, maybe, or not_going' }),
  }),
});

export const eventRSVPSchema = z.object({
  notes: z.string().max(500).optional(),
});

// ===================================================================
// VOTE SCHEMAS
// ===================================================================

export const createVoteSchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().min(10).max(5000),
  vote_type: z.enum(['simple_majority', 'two_thirds', 'consensus']),
  start_date: dateSchema,
  end_date: dateSchema,
  minimum_participation: z.number().int().min(1).optional(),
  is_anonymous: z.boolean().default(false),
  eligible_roles: z.array(z.string()).optional(),
  options: z.array(
    z.object({
      text: z.string().min(1).max(200),
      order: z.number().int().min(0),
    })
  ).min(2, 'At least 2 options required'),
});

export const castVoteSchema = z.object({
  option_id: uuidSchema,
});

// ===================================================================
// TASK SCHEMAS
// ===================================================================

export const createTaskSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(5000),
  type: z.enum(['event', 'project', 'recruitment', 'advocacy', 'education', 'other']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  points: z.number().int().min(0).max(1000),
  due_date: dateSchema.optional().nullable(),
  max_assignees: z.number().int().min(1).default(1),
  required_role: z.string().optional().nullable(),
  requires_approval: z.boolean().default(true),
});

export const updateTaskSchema = createTaskSchema.partial();

export const submitTaskSchema = z.object({
  notes: z.string().max(1000),
  proof_url: z.string().url().optional().nullable(),
  attachments: z.array(z.string().url()).max(5).optional(),
});

// ===================================================================
// MESSAGING SCHEMAS
// ===================================================================

export const createConversationSchema = z.object({
  type: z.enum(['direct', 'group']),
  participantIds: z.array(uuidSchema).min(1).max(100),
  name: z.string().min(2).max(100).optional().nullable(),
  description: z.string().max(500).optional().nullable(),
});

export const sendMessageSchema = z.object({
  content: z.string().min(1).max(5000),
  reply_to_id: uuidSchema.optional().nullable(),
  attachments: z.array(
    z.object({
      url: z.string().url(),
      type: z.enum(['image', 'video', 'document', 'audio']),
      size: z.number().int().min(0),
      name: z.string().max(200),
    })
  ).max(10).optional(),
});

export const updateMessageSchema = z.object({
  content: z.string().min(1).max(5000),
});

// ===================================================================
// MARKETPLACE SCHEMAS
// ===================================================================

export const checkoutSchema = z.object({
  items: z.array(
    z.object({
      productId: uuidSchema,
      quantity: z.number().int().min(1).max(100),
      variant: z.string().max(50).optional().nullable(),
    })
  ).min(1).max(50),
  shippingAddress: z.string().max(500).optional().nullable(),
  novaPoshtaCity: z.string().max(100).optional().nullable(),
  novaPoshtaCityRef: z.string().max(100).optional().nullable(),
  novaPoshtaBranch: z.string().max(200).optional().nullable(),
  novaPoshtaBranchRef: z.string().max(100).optional().nullable(),
  customerNotes: z.string().max(500).optional().nullable(),
});

export const createProductSchema = z.object({
  name_uk: z.string().min(2).max(200),
  name_en: z.string().min(2).max(200).optional(),
  description_uk: z.string().min(10).max(2000),
  description_en: z.string().max(2000).optional().nullable(),
  type: z.enum(['physical', 'digital', 'voucher', 'experience']),
  price_points: z.number().int().min(0),
  price_uah: z.number().min(0).optional().nullable(),
  stock_quantity: z.number().int().min(0).optional().nullable(),
  max_per_user: z.number().int().min(1).default(1),
  requires_shipping: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  images: z.array(z.string().url()).max(10).optional(),
});

// ===================================================================
// PAYMENT SCHEMAS
// ===================================================================

export const createPaymentSchema = z.object({
  tierId: z.enum(['basic_49', 'supporter_100', 'supporter_200', 'patron_500']),
});

// ===================================================================
// NOTIFICATION SCHEMAS
// ===================================================================

export const markNotificationReadSchema = z.object({
  notification_id: uuidSchema,
});

// ===================================================================
// ADMIN SCHEMAS
// ===================================================================

export const createUserSchema = z.object({
  email: emailSchema,
  first_name: z.string().min(2).max(50),
  last_name: z.string().min(2).max(50),
  role: z.enum([
    'free_viewer',
    'prospect',
    'silent_member',
    'full_member',
    'group_leader',
    'regional_leader',
    'admin',
    'super_admin',
  ]),
  membership_tier: z.enum(['free', 'basic_49', 'supporter_100', 'supporter_200', 'patron_500']),
  points: z.number().int().min(0).default(0),
});

export const updateUserRoleSchema = z.object({
  role: z.enum([
    'free_viewer',
    'prospect',
    'silent_member',
    'full_member',
    'group_leader',
    'regional_leader',
    'admin',
    'super_admin',
  ]),
  staff_role: z.enum(['none', 'moderator', 'admin', 'super_admin']).optional(),
});

export const awardPointsSchema = z.object({
  user_id: uuidSchema,
  amount: z.number().int().min(1).max(10000),
  type: z.string().max(50),
  description: z.string().max(200),
});

// ===================================================================
// QUERY PARAMETER SCHEMAS
// ===================================================================

export const eventsQuerySchema = paginationSchema.extend({
  status: z.enum(['draft', 'published', 'cancelled']).optional(),
  type: z.enum(['meeting', 'workshop', 'conference', 'social', 'other']).optional(),
  upcoming: z.coerce.boolean().optional(),
});

export const votesQuerySchema = paginationSchema.extend({
  status: z.enum(['draft', 'active', 'closed']).optional(),
});

export const tasksQuerySchema = paginationSchema.extend({
  status: z.enum(['open', 'in_progress', 'pending_review', 'completed', 'cancelled']).optional(),
  type: z.enum(['event', 'project', 'recruitment', 'advocacy', 'education', 'other']).optional(),
  assignee_id: uuidSchema.optional(),
});

export const productsQuerySchema = paginationSchema.extend({
  type: z.enum(['physical', 'digital', 'voucher', 'experience']).optional(),
  featured: z.coerce.boolean().optional(),
});

export const leaderboardQuerySchema = z.object({
  type: z.enum(['points', 'tasks']).default('points'),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  period: z.enum(['all', 'month', 'week']).default('all'),
});

// ===================================================================
// TYPE EXPORTS
// ===================================================================

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type CreateVoteInput = z.infer<typeof createVoteSchema>;
export type CastVoteInput = z.infer<typeof castVoteSchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type SubmitTaskInput = z.infer<typeof submitTaskSchema>;
export type CreateConversationInput = z.infer<typeof createConversationSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type EventsQuery = z.infer<typeof eventsQuerySchema>;
export type VotesQuery = z.infer<typeof votesQuerySchema>;
export type TasksQuery = z.infer<typeof tasksQuerySchema>;
export type LeaderboardQuery = z.infer<typeof leaderboardQuerySchema>;
