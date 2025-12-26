/**
 * Shared API Types for Mobile App (React Native)
 * These types can be copied or imported into the mobile app codebase
 */

// ==========================================
// Authentication Types
// ==========================================

export interface AuthTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at?: number;
  token_type: 'bearer';
  user: AuthUser;
  requires_2fa?: boolean;
}

export interface AuthUser {
  id: string;
  email: string;
  role?: UserRole;
  first_name?: string;
  last_name?: string;
  status?: UserStatus;
  membership_tier?: MembershipTier;
  is_onboarded?: boolean;
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface SignUpRequest {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface Verify2FARequest {
  factor_id: string;
  code: string;
  challenge_id: string;
}

// ==========================================
// User/Member Types
// ==========================================

export type UserRole =
  | 'free_viewer'
  | 'prospect'
  | 'silent_member'
  | 'full_member'
  | 'group_leader'
  | 'regional_leader'
  | 'admin'
  | 'super_admin';

export type UserStatus = 'pending' | 'active' | 'suspended' | 'churned';

export type MembershipTier =
  | 'free'
  | 'basic_49'
  | 'supporter_100'
  | 'supporter_200'
  | 'patron_500';

export interface User {
  id: string;
  clerk_id: string;
  email: string;
  first_name: string;
  last_name: string;
  patronymic?: string;
  phone?: string;
  date_of_birth?: string;
  oblast_id?: string;
  city?: string;
  role: UserRole;
  status: UserStatus;
  membership_tier: MembershipTier;
  membership_paid_until?: string;
  points: number;
  level: number;
  is_email_verified: boolean;
  is_phone_verified: boolean;
  is_identity_verified: boolean;
  two_factor_enabled: boolean;
  avatar_url?: string;
  referral_code?: string;
  referred_by?: string;
  created_at: string;
  updated_at: string;
  oblast?: Oblast;
}

export interface Oblast {
  id: string;
  name: string;
  code: string;
}

export interface UpdateProfileRequest {
  first_name?: string;
  last_name?: string;
  patronymic?: string;
  phone?: string;
  date_of_birth?: string;
  oblast_id?: string;
  city?: string;
}

// ==========================================
// Voting Types
// ==========================================

export type VoteType = 'national' | 'regional' | 'local';
export type VoteStatus = 'draft' | 'active' | 'completed' | 'cancelled';

export interface Vote {
  id: string;
  title: string;
  description: string;
  type: VoteType;
  status: VoteStatus;
  oblast_id?: string;
  created_by: string;
  starts_at: string;
  ends_at: string;
  min_role_to_vote: UserRole;
  created_at: string;
  updated_at: string;
  options?: VoteOption[];
  total_votes?: number;
  user_voted?: boolean;
}

export interface VoteOption {
  id: string;
  vote_id: string;
  text: string;
  votes_count: number;
  created_at: string;
}

export interface CastVoteRequest {
  option_id: string;
}

// ==========================================
// Event Types
// ==========================================

export type EventType = 'online' | 'offline' | 'hybrid';
export type EventStatus = 'draft' | 'published' | 'cancelled' | 'completed';

export interface Event {
  id: string;
  title: string;
  description: string;
  type: EventType;
  status: EventStatus;
  location?: string;
  online_link?: string;
  oblast_id?: string;
  starts_at: string;
  ends_at: string;
  max_participants?: number;
  min_role_to_join: UserRole;
  points_reward: number;
  image_url?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  participants_count?: number;
  is_registered?: boolean;
}

export interface EventRegistration {
  id: string;
  event_id: string;
  user_id: string;
  status: 'registered' | 'attended' | 'cancelled';
  created_at: string;
}

// ==========================================
// News Types
// ==========================================

export type NewsStatus = 'draft' | 'published' | 'archived';

export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  image_url?: string;
  status: NewsStatus;
  author_id: string;
  published_at?: string;
  created_at: string;
  updated_at: string;
  author?: {
    first_name: string;
    last_name: string;
  };
}

// ==========================================
// Payment Types
// ==========================================

export type PaymentStatus = 'pending' | 'success' | 'failure' | 'reversed';

export interface Payment {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  payment_type: 'membership' | 'donation';
  liqpay_order_id?: string;
  liqpay_payment_id?: string;
  membership_tier?: MembershipTier;
  created_at: string;
  updated_at: string;
}

export interface CreatePaymentRequest {
  amount: number;
  payment_type: 'membership' | 'donation';
  membership_tier?: MembershipTier;
}

export interface PaymentFormData {
  data: string;
  signature: string;
}

// ==========================================
// Referral Types
// ==========================================

export interface Referral {
  id: string;
  referrer_id: string;
  referred_id: string;
  status: 'pending' | 'completed' | 'rewarded';
  points_awarded: number;
  created_at: string;
}

export interface ReferralStats {
  total_referrals: number;
  completed_referrals: number;
  total_points_earned: number;
  referral_code: string;
}

// ==========================================
// API Response Types
// ==========================================

export interface ApiError {
  error: string;
  code?: string;
  details?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface SuccessResponse {
  message: string;
  data?: Record<string, unknown>;
}

// ==========================================
// API Endpoints Reference
// ==========================================

/**
 * Mobile Authentication Endpoints:
 * POST /api/mobile/auth/sign-in     - Sign in with email/password
 * POST /api/mobile/auth/sign-up     - Register new account
 * POST /api/mobile/auth/refresh     - Refresh access token
 * POST /api/mobile/auth/sign-out    - Sign out (invalidate session)
 * POST /api/mobile/auth/2fa/verify  - Verify 2FA code
 *
 * Member Endpoints:
 * GET  /api/members/me              - Get current user profile
 * PATCH /api/members/me             - Update current user profile
 * GET  /api/members/[id]            - Get member by ID (admin)
 *
 * Voting Endpoints:
 * GET  /api/voting                  - List all active votes
 * GET  /api/voting/[id]             - Get vote details
 * POST /api/voting/[id]/vote        - Cast a vote
 * GET  /api/voting/[id]/results     - Get vote results
 *
 * Event Endpoints:
 * GET  /api/events                  - List all events
 * GET  /api/events/[id]             - Get event details
 * POST /api/events/[id]/register    - Register for event
 * DELETE /api/events/[id]/register  - Cancel registration
 *
 * News Endpoints:
 * GET  /api/news                    - List published news
 * GET  /api/news/[slug]             - Get news article
 *
 * Payment Endpoints:
 * POST /api/payments/create         - Create payment
 * POST /api/payments/callback       - LiqPay callback
 * GET  /api/payments/history        - Get payment history
 *
 * Referral Endpoints:
 * GET  /api/referrals/stats         - Get referral stats
 * POST /api/referrals/check         - Check referral code
 *
 * Upload Endpoints:
 * POST /api/upload                  - Upload file to S3
 */
