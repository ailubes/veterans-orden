/**
 * Features Configuration
 *
 * Toggle features on/off for Order of Veterans.
 * All core features are enabled as per requirements.
 */

export const featuresConfig = {
  // Core platform features
  voting: true,          // Democratic voting system
  events: true,          // Event management and RSVP
  tasks: true,           // Task assignments and tracking
  referrals: true,       // Referral and recruitment system
  marketplace: true,     // Marketplace for merch and fundraising
  gamification: true,    // Points, badges, and achievements
  news: true,            // News/CMS system

  // Additional features
  notifications: true,   // Email and in-app notifications
  analytics: true,       // User activity analytics
  messaging: true,       // Internal messaging system
  helpCenter: true,      // Help articles and support

  // Content management
  tinaCMS: true,         // TinaCMS for content editing

  // Social features
  userProfiles: true,    // Public user profiles
  achievements: true,    // Badge and achievement system
  leaderboards: true,    // Ranking and leaderboards

  // Admin features
  adminDashboard: true,  // Full admin panel
  userManagement: true,  // User roles and permissions
  contentModeration: true, // Content review and moderation
  reporting: true,       // Analytics and reports

  // Payment features
  subscriptions: true,   // Recurring membership payments
  donations: true,       // One-time donations
  refunds: true,         // Payment refunds

  // Security features
  twoFactor: true,       // 2FA authentication
  auditLog: true,        // Activity audit trail
  rls: true,             // Row-level security (database)
} as const;

export type FeaturesConfig = typeof featuresConfig;
