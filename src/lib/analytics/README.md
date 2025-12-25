# Analytics Quick Reference

## Adding Tracking to New Features

### 1. Import the tracking function

```tsx
import { posthog } from '@/lib/analytics/posthog';
// or use helper functions
import { trackVoteCast } from '@/lib/analytics/events';
```

### 2. Track the event

```tsx
// Simple event
posthog.capture('button_clicked', {
  button_name: 'submit_vote',
  user_id: userId,
});

// Or use helper
trackVoteCast(userId, voteId, voteTitle, option);
```

### 3. Add to events.ts if reusable

```typescript
// src/lib/analytics/events.ts
export const trackNewFeature = (userId: string, data: unknown) => {
  posthog.capture('new_feature_used', {
    user_id: userId,
    ...data,
  });
};
```

## Event Naming Convention

- Use **snake_case** for event names
- Be specific: `vote_cast` not `click`
- Use past tense: `payment_completed` not `complete_payment`

## Examples

### Button Click
```tsx
<button onClick={() => posthog.capture('cta_clicked', { location: 'homepage' })}>
```

### Form Submit
```tsx
const handleSubmit = () => {
  posthog.capture('form_submitted', { form_type: 'contact' });
};
```

### API Call
```tsx
const fetchData = async () => {
  const result = await api.call();
  posthog.capture('data_fetched', { endpoint: 'users', count: result.length });
};
```

## User Properties

Update user properties when they change:

```tsx
posthog.people.set({
  membership_tier: 'patron_500',
  points: 150,
});
```

## Best Practices

✅ **DO:**
- Track user actions, not technical events
- Include context (user_id, entity_id, etc.)
- Use consistent naming

❌ **DON'T:**
- Track PII beyond what's necessary
- Track every mouse move
- Use vague event names

## Testing

```typescript
// Check if event was sent
posthog.debug(); // Enable in dev tools

// Manually trigger
posthog.capture('test_event', { test: true });
```

Check PostHog dashboard after 5-10 seconds.
