# Analytics Setup - PostHog

## Overview

The platform uses **PostHog** for product analytics, user behavior tracking, and funnel analysis.

## Configuration

### Environment Variables

Add to `.env.local`:

```bash
NEXT_PUBLIC_POSTHOG_KEY=phc_your_key_here
NEXT_PUBLIC_POSTHOG_HOST=https://eu.posthog.com  # or your self-hosted instance
```

### PostHog Project Setup

1. Create account at [posthog.com](https://posthog.com)
2. Create new project
3. Copy Project API Key to `NEXT_PUBLIC_POSTHOG_KEY`
4. Choose EU hosting (GDPR compliant) or self-host

## What's Tracked

### Automatic Events

- ✅ **Page Views** - Every route navigation
- ✅ **User Identity** - When users complete onboarding
- ✅ **Session Tracking** - User sessions and activity

### Custom Events

#### **User Journey**
```typescript
// Sign up
trackUserSignUp(userId, method, tier?)

// Sign in
trackUserSignIn(userId)

// Onboarding
trackOnboardingStarted(userId)
trackOnboardingStepCompleted(userId, step)
trackOnboardingCompleted(userId, tier, hasPayment)
```

#### **Payments**
```typescript
trackPaymentInitiated(userId, tier, amount)
trackPaymentCompleted(userId, tier, amount, orderId)
trackPaymentFailed(userId, tier, amount, error)
```

#### **Voting**
```typescript
trackVoteViewed(userId, voteId, voteTitle)
trackVoteCast(userId, voteId, voteTitle, option)
trackVoteCreated(userId, voteId, voteType, scope)
```

#### **Events**
```typescript
trackEventViewed(userId, eventId, eventTitle)
trackEventRSVP(userId, eventId, eventTitle, status)
trackEventCreated(userId, eventId, eventType, scope)
```

#### **Tasks**
```typescript
trackTaskViewed(userId, taskId, taskTitle)
trackTaskClaimed(userId, taskId, taskTitle, points)
trackTaskCompleted(userId, taskId, taskTitle, points)
```

#### **Referrals**
```typescript
trackReferralLinkShared(userId, method)
trackReferralConverted(referrerId, newUserId, tier)
```

#### **Content**
```typescript
trackNewsArticleViewed(userId | null, articleId, articleTitle)
```

#### **Admin Actions**
```typescript
trackAdminActionPerformed(adminId, action, entityType, entityId)
```

## Usage Examples

### In React Components

```tsx
import { trackVoteCast, identifyUser } from '@/lib/analytics/events';

// Track vote casting
const handleVote = async (option: string) => {
  await castVote(voteId, option);
  trackVoteCast(user.id, voteId, vote.question, option);
};

// Identify user on login
useEffect(() => {
  if (user) {
    identifyUser(user.id, user.email, {
      first_name: user.firstName,
      last_name: user.lastName,
      tier: user.membershipTier,
    });
  }
}, [user]);
```

### In API Routes

For server-side tracking, log events that can be imported to PostHog:

```typescript
// API route
console.log('[Analytics] User action:', {
  event: 'payment_completed',
  user_id: userId,
  properties: { tier, amount },
});
```

## Key Funnels to Monitor

### 1. **Registration Funnel**
```
Landing Page View
  → Sign Up Started
    → Onboarding Started
      → Personal Details Completed
        → Location Selected
          → Tier Selected
            → Payment Initiated (if paid)
              → Onboarding Completed
```

**Metric:** Completion rate at each step

### 2. **Engagement Funnel**
```
Dashboard Visit
  → Vote Viewed
    → Vote Cast
```

**Metric:** % of viewers who cast votes

### 3. **Conversion Funnel**
```
Free User
  → Tier Selection Page Visit
    → Payment Initiated
      → Payment Completed
```

**Metric:** Free → Paid conversion rate

### 4. **Referral Funnel**
```
Referral Link Shared
  → New User Signup (with referral code)
    → Referral Converted (completed onboarding)
```

**Metric:** Referral conversion rate

## User Properties

PostHog automatically tracks these user properties:

- `email` - User email
- `first_name` - First name
- `last_name` - Last name
- `oblast` - Ukrainian region
- `city` - City
- `tier` - Membership tier
- `created_at` - Account creation date
- `last_active` - Last activity timestamp

## Dashboard Setup

### Recommended Insights

1. **Active Users**
   - Metric: Daily/Weekly/Monthly Active Users
   - Filter: By tier, oblast, role

2. **Onboarding Completion Rate**
   - Funnel: onboarding_started → onboarding_completed
   - Breakdown: By tier selected

3. **Vote Participation**
   - Metric: vote_cast events per vote
   - Formula: (votes_cast / eligible_voters) × 100

4. **Payment Success Rate**
   - Funnel: payment_initiated → payment_completed
   - Filter: By tier

5. **Referral Performance**
   - Metric: referral_converted events
   - Breakdown: By referrer_id

### Feature Flags (Future)

PostHog supports feature flags for A/B testing:

```typescript
import { posthog } from '@/lib/analytics/posthog';

const showNewFeature = posthog.isFeatureEnabled('new-voting-ui');
```

## Privacy & GDPR

- ✅ **No autocapture** - Only explicit events tracked
- ✅ **EU hosting** - Data stored in EU (if using eu.posthog.com)
- ✅ **User anonymity** - Can be toggled
- ✅ **Data retention** - Configurable in PostHog settings

### Opt-out

Users can opt out via settings (future implementation):

```typescript
import { posthog } from '@/lib/analytics/posthog';

posthog.opt_out_capturing();
```

## Debugging

### Development Mode

PostHog debug mode is enabled in development:

```typescript
// Automatic in dev environment
posthog.debug(); // See events in console
```

### Check if Events Fire

Open browser console and look for:
```
[PostHog] Tracking event: onboarding_started
```

### PostHog Dashboard

Live events visible at:
`https://app.posthog.com/project/YOUR_PROJECT_ID/events`

## Performance

- ✅ Events sent asynchronously (no blocking)
- ✅ Batched for efficiency
- ✅ < 5KB additional bundle size
- ✅ Lazy loaded (doesn't block initial render)

## Testing

### Manual Testing

1. Start dev server: `npm run dev`
2. Open browser DevTools → Console
3. Complete onboarding flow
4. Check PostHog dashboard for events (5-10 sec delay)

### Event Validation

```typescript
import { posthog } from '@/lib/analytics/posthog';

// Check if PostHog is initialized
console.log('PostHog initialized:', posthog._isInitialized);

// Get current user ID
console.log('User ID:', posthog.get_distinct_id());
```

## Troubleshooting

### Events Not Showing

1. **Check API key**: Verify `NEXT_PUBLIC_POSTHOG_KEY` is set
2. **Check network**: Look for calls to posthog.com in Network tab
3. **Check console**: Errors will appear in browser console
4. **Check project**: Ensure PostHog project is not paused

### Duplicate Events

- Caused by React strict mode (dev only)
- Wrap useEffect with proper dependencies
- Use PostHog's deduplication (automatic)

## Next Steps

### Add More Tracking

```typescript
// Example: Track search
export const trackSearch = (userId: string, query: string, results: number) => {
  posthog.capture('search_performed', {
    user_id: userId,
    query,
    results_count: results,
  });
};
```

### Create Dashboards

1. Login to PostHog
2. Go to Insights
3. Create charts for KPIs
4. Add to dashboard

### Set Up Alerts

Configure alerts for:
- Payment failures spike
- Onboarding drop-off
- Low vote participation

---

**Documentation complete! Analytics are now tracking user behavior across the platform.** 📊
