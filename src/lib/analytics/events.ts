import { posthog } from './posthog';

/**
 * Analytics Events Tracking
 *
 * Centralized event tracking for PostHog analytics
 */

// User Events
export const trackUserSignUp = (userId: string, method: string, tier?: string) => {
  posthog.capture('user_signed_up', {
    user_id: userId,
    method,
    tier,
  });
};

export const trackUserSignIn = (userId: string) => {
  posthog.capture('user_signed_in', {
    user_id: userId,
  });
};

export const trackOnboardingStarted = (userId: string) => {
  posthog.capture('onboarding_started', {
    user_id: userId,
  });
};

export const trackOnboardingStepCompleted = (userId: string, step: string) => {
  posthog.capture('onboarding_step_completed', {
    user_id: userId,
    step,
  });
};

export const trackOnboardingCompleted = (userId: string, tier: string, hasPayment: boolean) => {
  posthog.capture('onboarding_completed', {
    user_id: userId,
    tier,
    has_payment: hasPayment,
  });
};

// Payment Events
export const trackPaymentInitiated = (userId: string, tier: string, amount: number) => {
  posthog.capture('payment_initiated', {
    user_id: userId,
    tier,
    amount,
    currency: 'UAH',
  });
};

export const trackPaymentCompleted = (userId: string, tier: string, amount: number, orderId: string) => {
  posthog.capture('payment_completed', {
    user_id: userId,
    tier,
    amount,
    currency: 'UAH',
    order_id: orderId,
  });
};

export const trackPaymentFailed = (userId: string, tier: string, amount: number, error: string) => {
  posthog.capture('payment_failed', {
    user_id: userId,
    tier,
    amount,
    currency: 'UAH',
    error,
  });
};

// Voting Events
export const trackVoteViewed = (userId: string, voteId: string, voteTitle: string) => {
  posthog.capture('vote_viewed', {
    user_id: userId,
    vote_id: voteId,
    vote_title: voteTitle,
  });
};

export const trackVoteCast = (userId: string, voteId: string, voteTitle: string, option: string) => {
  posthog.capture('vote_cast', {
    user_id: userId,
    vote_id: voteId,
    vote_title: voteTitle,
    option,
  });
};

export const trackVoteCreated = (userId: string, voteId: string, voteType: string, scope: string) => {
  posthog.capture('vote_created', {
    user_id: userId,
    vote_id: voteId,
    vote_type: voteType,
    scope,
  });
};

// Event Events
export const trackEventViewed = (userId: string, eventId: string, eventTitle: string) => {
  posthog.capture('event_viewed', {
    user_id: userId,
    event_id: eventId,
    event_title: eventTitle,
  });
};

export const trackEventRSVP = (userId: string, eventId: string, eventTitle: string, status: string) => {
  posthog.capture('event_rsvp', {
    user_id: userId,
    event_id: eventId,
    event_title: eventTitle,
    rsvp_status: status,
  });
};

export const trackEventCreated = (userId: string, eventId: string, eventType: string, scope: string) => {
  posthog.capture('event_created', {
    user_id: userId,
    event_id: eventId,
    event_type: eventType,
    scope,
  });
};

// Task Events
export const trackTaskViewed = (userId: string, taskId: string, taskTitle: string) => {
  posthog.capture('task_viewed', {
    user_id: userId,
    task_id: taskId,
    task_title: taskTitle,
  });
};

export const trackTaskClaimed = (userId: string, taskId: string, taskTitle: string, points: number) => {
  posthog.capture('task_claimed', {
    user_id: userId,
    task_id: taskId,
    task_title: taskTitle,
    points,
  });
};

export const trackTaskCompleted = (userId: string, taskId: string, taskTitle: string, points: number) => {
  posthog.capture('task_completed', {
    user_id: userId,
    task_id: taskId,
    task_title: taskTitle,
    points,
  });
};

// Referral Events
export const trackReferralLinkShared = (userId: string, method: string) => {
  posthog.capture('referral_link_shared', {
    user_id: userId,
    method, // 'copy', 'qr', 'telegram', etc.
  });
};

export const trackReferralConverted = (referrerId: string, newUserId: string, tier: string) => {
  posthog.capture('referral_converted', {
    referrer_id: referrerId,
    new_user_id: newUserId,
    tier,
  });
};

// Content Events
export const trackNewsArticleViewed = (userId: string | null, articleId: string, articleTitle: string) => {
  posthog.capture('news_article_viewed', {
    user_id: userId,
    article_id: articleId,
    article_title: articleTitle,
  });
};

// Admin Events
export const trackAdminActionPerformed = (
  adminId: string,
  action: string,
  entityType: string,
  entityId: string
) => {
  posthog.capture('admin_action_performed', {
    admin_id: adminId,
    action,
    entity_type: entityType,
    entity_id: entityId,
  });
};

// Identify user for PostHog
export const identifyUser = (
  userId: string,
  email: string,
  properties?: Record<string, unknown>
) => {
  posthog.identify(userId, {
    email,
    ...properties,
  });
};

// Reset user identity (on logout)
export const resetUser = () => {
  posthog.reset();
};
