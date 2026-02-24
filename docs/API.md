# Орден Ветеранів — Backend API Reference

> **Base URL:** `https://ordenv.org`
> **Version:** 2026-02
> **Total endpoints:** 155

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [Standard Patterns](#2-standard-patterns)
3. [Mobile Auth](#3-mobile-auth)
4. [Public Endpoints](#4-public-endpoints)
5. [Member Endpoints](#5-member-endpoints)
   - [Profile](#51-profile)
   - [Points & Stats](#52-points--stats)
   - [Progression & Roles](#53-progression--roles)
   - [Tasks](#54-tasks)
   - [Votes](#55-votes)
   - [Events](#56-events)
   - [Challenges](#57-challenges)
   - [Notifications](#58-notifications)
   - [Messaging](#59-messaging)
   - [Resources](#510-resources)
   - [Help](#511-help)
   - [Marketplace](#512-marketplace)
   - [Badges & Achievements](#513-badges--achievements)
6. [Admin Endpoints](#6-admin-endpoints)
   - [Members](#61-members)
   - [Tasks (Admin)](#62-tasks-admin)
   - [Votes (Admin)](#63-votes-admin)
   - [Events (Admin)](#64-events-admin)
   - [Challenges (Admin)](#65-challenges-admin)
   - [Notifications (Admin)](#66-notifications-admin)
   - [News (Admin)](#67-news-admin)
   - [Resources (Admin)](#68-resources-admin)
   - [Help System (Admin)](#69-help-system-admin)
   - [Marketplace (Admin)](#610-marketplace-admin)
   - [Settings (Admin)](#611-settings-admin)
   - [Analytics (Admin)](#612-analytics-admin)
   - [Submissions](#613-submissions)
   - [Roles & Advancement](#614-roles--advancement)
   - [Upload & Files](#615-upload--files)
   - [Search](#616-search)
   - [2FA (Admin)](#617-2fa-admin)
   - [Impersonation](#618-impersonation)
   - [Email & Pages](#619-email--pages)
7. [Webhook Endpoints](#7-webhook-endpoints)
8. [Geographic APIs](#8-geographic-apis)

---

## 1. Authentication

### How Auth Works

The API supports two authentication mechanisms:

#### Web (Cookie-based)
Supabase session cookies are set automatically on login via the web app. Used for browser requests from `ordenv.org`.

#### Mobile / Telegram Bot (Bearer Token)
Pass the Supabase JWT in the `Authorization` header:

```
Authorization: Bearer <access_token>
```

The `access_token` is obtained from the [Mobile Auth endpoints](#3-mobile-auth) or directly from the Supabase client.

#### Access Levels

| Level | Description | Identified by |
|-------|-------------|---------------|
| `public` | No auth required | — |
| `member` | Any authenticated user | Valid session |
| `admin` | Staff admin | `users.staff_role IN ('admin', 'super_admin')` |
| `super_admin` | Super admin only | `users.staff_role = 'super_admin'` |
| `regional_leader` | Membership-based leader | `users.membership_role` in leader tier |
| `news_editor` | Content editors | `users.staff_role = 'news_editor'` |

---

## 2. Standard Patterns

### Error Responses

All errors return JSON with an `error` field:

```json
{ "error": "Description of the problem" }
```

| HTTP Status | Meaning |
|-------------|---------|
| `400` | Validation error / bad request body |
| `401` | Not authenticated |
| `403` | Authenticated but lacks permission |
| `404` | Resource not found |
| `409` | Conflict (duplicate, already exists) |
| `500` | Internal server error |

### Pagination

Endpoints that return lists use one of two patterns:

**Offset-based:**
```json
{
  "pagination": {
    "limit": 20,
    "offset": 0,
    "total": 150,
    "hasMore": true
  }
}
```
Query params: `limit`, `offset`

**Page-based:**
```json
{
  "page": 1,
  "totalPages": 8,
  "total": 150
}
```
Query params: `page`, `limit`

### Timestamps

All timestamps are stored as UTC and returned as ISO 8601 strings:
- With timezone: `"2026-02-24T10:30:00+00:00"` (TIMESTAMPTZ columns)
- Without timezone: `"2026-02-24T10:30:00"` (legacy TIMESTAMP columns — append `Z` when parsing client-side to get correct UTC)

**Safe parsing in JS/TS:**
```ts
const toUtc = (s: string) => s.endsWith('Z') || s.includes('+') ? s : s + 'Z';
new Date(toUtc(deliveredAt));
```

### Membership Roles (Progression Order)

```
supporter → candidate → member → activist → leader → network_leader → regional_leader → national_leader
```

### Notification Types (DB Enum)

```
system | vote | event | task | achievement | news | referral
```

---

## 3. Mobile Auth

All mobile auth routes are under `/api/mobile/auth/`. These return Supabase JWTs for use as Bearer tokens.

### `POST /api/mobile/auth/sign-in`

**Auth:** None

**Request body:**
```json
{
  "email": "user@example.com",
  "password": "secret"
}
```

**Response:**
```json
{
  "access_token": "...",
  "refresh_token": "...",
  "expires_in": 3600,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "member",
    "staff_role": null,
    "first_name": "Іван",
    "last_name": "Петренко",
    "status": "active",
    "membership_tier": "standard",
    "is_onboarded": true,
    "requires_2fa": false
  }
}
```

If `requires_2fa: true`, proceed to `/api/mobile/auth/2fa/verify`.

---

### `POST /api/mobile/auth/sign-up`

**Auth:** None

**Request body:**
```json
{
  "email": "user@example.com",
  "password": "secret",
  "first_name": "Іван",
  "last_name": "Петренко"
}
```

**Response:**
```json
{
  "access_token": "...",
  "refresh_token": "...",
  "user": { "id": "...", "is_onboarded": false },
  "needs_confirmation": false
}
```

---

### `POST /api/mobile/auth/sign-out`

**Auth:** Bearer token

**Response:**
```json
{ "message": "Signed out successfully" }
```

---

### `POST /api/mobile/auth/refresh`

**Auth:** None

**Request body:**
```json
{ "refresh_token": "..." }
```

**Response:**
```json
{
  "access_token": "...",
  "refresh_token": "...",
  "expires_in": 3600
}
```

---

### `POST /api/mobile/auth/2fa/verify`

**Auth:** None

**Request body:**
```json
{
  "factor_id": "...",
  "challenge_id": "...",
  "code": "123456"
}
```

**Response:**
```json
{
  "access_token": "...",
  "refresh_token": "...",
  "session": { ... }
}
```

---

### `POST /api/auth/reset-password`

**Auth:** None

Triggers password reset email.

**Request body:**
```json
{ "email": "user@example.com" }
```

---

## 4. Public Endpoints

These require no authentication.

### `GET /api/stats`

Overall platform stats for homepage.

**Response:**
```json
{
  "totalMembers": 1247,
  "weeklyGrowth": 23
}
```

---

### `GET /api/leaderboard`

**Query params:**
| Param | Values | Default |
|-------|--------|---------|
| `type` | `points` \| `tasks` | `points` |
| `limit` | number | `10` |
| `period` | `week` \| `month` \| `all` | `month` |

**Response:**
```json
{
  "type": "points",
  "period": "month",
  "leaderboard": [
    {
      "rank": 1,
      "userId": "uuid",
      "firstName": "Іван",
      "lastName": "П.",
      "avatarUrl": "https://...",
      "value": 3200,
      "isCurrentUser": false
    }
  ],
  "currentUserRank": 14,
  "totalParticipants": 450
}
```

---

### `GET /api/challenges`

**Query params:** `status` (`active`|`upcoming`|`completed`), `type`, `limit`, `offset`

**Response:**
```json
{
  "challenges": [
    {
      "id": "uuid",
      "title": "...",
      "description": "...",
      "type": "...",
      "status": "active",
      "startDate": "...",
      "endDate": "...",
      "reward": { "points": 500, "badge": "..." },
      "participantCount": 87
    }
  ],
  "pagination": { ... }
}
```

---

### `GET /api/challenges/[id]`

Returns full challenge details.

---

### `GET /api/challenges/[id]/leaderboard`

**Query params:** `limit`

**Response:**
```json
{
  "leaderboard": [ { "rank": 1, "userId": "...", "firstName": "...", "score": 1200 } ],
  "currentUserRank": null
}
```

---

### `GET /api/badges`

All available badges in the system.

**Response:**
```json
{ "badges": [ { "id": "...", "name": "...", "description": "...", "imageUrl": "..." } ] }
```

---

### `GET /api/help/categories`

**Response:**
```json
{
  "categories": [
    {
      "id": "uuid",
      "slug": "getting-started",
      "nameUk": "Початок роботи",
      "nameEn": "Getting Started",
      "icon": "BookOpen",
      "articleCount": 5
    }
  ]
}
```

---

### `GET /api/help/articles`

**Query params:** `categoryId`, `limit` (max 100), `offset`, `search`

Audience filtering is server-enforced based on the requesting user's roles (unauthenticated users only see `audience=all` articles).

**Response:**
```json
{
  "articles": [
    {
      "id": "uuid",
      "slug": "first-steps",
      "title": "...",
      "excerpt": "...",
      "view_count": 142,
      "video_url": null,
      "category": { "id": "...", "name_uk": "...", "slug": "..." },
      "author": { "id": "...", "first_name": "...", "last_name": "..." }
    }
  ],
  "pagination": { "limit": 20, "offset": 0, "total": 45, "hasMore": true }
}
```

---

### `GET /api/help/articles/search`

**Query params:** `q` (required), `limit`

---

### `GET /api/help/articles/[slug]`

**Response:**
```json
{
  "article": {
    "id": "uuid",
    "slug": "...",
    "title": "...",
    "content": "...",
    "excerpt": "...",
    "video_url": null,
    "view_count": 200,
    "helpful_count": 45,
    "not_helpful_count": 3,
    "category": { "id": "...", "name_uk": "...", "slug": "...", "icon": "..." },
    "author": { "id": "...", "first_name": "...", "last_name": "...", "avatar_url": "..." }
  },
  "relatedArticles": [ { "id": "...", "title": "...", "slug": "...", "view_count": 88 } ]
}
```

---

### `GET /api/katottg/oblasts`

List of all Ukrainian oblasts (KATOTTG codes).

**Response:**
```json
{ "oblasts": [ { "code": "UA01", "name": "Вінницька область" } ] }
```

---

### `GET /api/katottg/[code]`

Oblast details by KATOTTG code.

---

### `GET /api/katottg/search`

**Query params:** `q` (min 2 chars, required), `limit` (max 50), `category`, `oblastCode`

**Response:**
```json
{ "results": [ { ... } ], "query": "Київ", "total": 12 }
```

---

### `GET /api/nova-poshta/divisions`

Nova Poshta branch lookup (for delivery).

**Query params:** `city` (required, min 2 chars), `cityRef`, `limit`

**Response:**
```json
{
  "divisions": [
    {
      "id": "...",
      "name": "Відділення №1",
      "shortName": "В/Д №1",
      "city": "Київ",
      "address": "вул. Хрещатик, 1",
      "status": "Working"
    }
  ],
  "cities": [ { "ref": "...", "description": "Київ" } ]
}
```

---

### `GET /api/navigation`

Navigation menu structure for the site.

**Response:**
```json
{
  "items": [ { "href": "/about", "label": "Про нас", "parentSlug": null, "sortOrder": 1 } ],
  "timestamp": "..."
}
```

---

### `GET /api/marketplace/events`

Public event listings with ticket availability.

**Response:**
```json
{
  "events": [ { "id": "...", "title": "...", "date": "...", "price": 200, "capacity": 100 } ],
  "ticketsSold": { "event-uuid": 42 }
}
```

---

### `POST /api/order-applications`

Submit a new membership application (no auth required).

**Request body:**
```json
{
  "name": "Іван Петренко",
  "contact": "+380501234567",
  "applicant_status": "veteran",
  "motivation": "..."
}
```

**Response:**
```json
{ "success": true }
```

---

## 5. Member Endpoints

All endpoints in this section require authentication (Bearer or cookie).

---

### 5.1 Profile

#### `GET /api/user/me`

Get the current user's own profile.

**Response:**
```json
{
  "id": "uuid",
  "firstName": "Іван",
  "lastName": "Петренко",
  "patronymic": "Іванович",
  "email": "user@example.com",
  "phone": "+380501234567",
  "avatarUrl": "https://...",
  "membershipRole": "member",
  "staffRole": null,
  "oblastId": "uuid",
  "city": "Київ",
  "status": "active",
  "membershipTier": "standard",
  "referralCode": "ABC123",
  "isOnboarded": true,
  "createdAt": "..."
}
```

---

#### `GET /api/members/me`

Alias for user profile (same data, slightly different shape).

---

#### `PATCH /api/members/me`

Update own profile.

**Request body:**
```json
{
  "firstName": "Іван",
  "lastName": "Петренко",
  "city": "Київ",
  "oblastId": "uuid"
}
```

---

#### `POST /api/user/upload-avatar`

Get a pre-signed S3 upload URL for avatar upload.

**Request body:**
```json
{
  "fileName": "photo.jpg",
  "fileType": "image/jpeg",
  "fileSize": 204800
}
```

**Response:**
```json
{
  "uploadUrl": "https://s3.amazonaws.com/...",
  "publicUrl": "https://cdn.ordenv.org/avatars/uuid.jpg",
  "s3Key": "avatars/uuid.jpg",
  "expiresIn": 300
}
```

After uploading to S3, confirm with:

#### `PATCH /api/user/upload-avatar`

**Request body:**
```json
{ "avatarUrl": "https://cdn.ordenv.org/avatars/uuid.jpg" }
```

---

#### `POST /api/user/onboarding-complete`

Mark user's onboarding tour as completed. Call after user finishes the welcome flow.

**Response:**
```json
{ "success": true }
```

---

#### `POST /api/user/push-token`

Register or update the device push notification token (Expo).

**Request body:**
```json
{ "token": "ExponentPushToken[xxx]" }
```

---

#### `GET /api/user/search`
#### `GET /api/users/search`

Search for members by name (for DMs, mentions, etc.).

**Query params:** `q` (min 2 chars), `limit` (default 10)

**Response:**
```json
{
  "users": [
    {
      "id": "uuid",
      "firstName": "Іван",
      "lastName": "Петренко",
      "avatarUrl": "https://...",
      "membershipRole": "member"
    }
  ]
}
```

---

#### `POST /api/user/activity`

Record user activity (triggers streak update). Call when user opens the app / performs an action.

**Response:**
```json
{
  "success": true,
  "data": {
    "streak": 5,
    "newMilestone": null
  }
}
```

---

### 5.2 Points & Stats

#### `GET /api/me/points`

Points balance and transaction history.

**Query params:** `limit` (max 100, default 50), `offset`, `type`

**Response:**
```json
{
  "balance": {
    "total": 2450,
    "currentYear": 1800,
    "expiringSoon": 300,
    "expirationDate": "2026-12-31"
  },
  "history": {
    "transactions": [
      {
        "id": "uuid",
        "amount": 100,
        "type": "task_complete",
        "description": "Завдання: Привітати нового учасника",
        "createdAt": "..."
      }
    ],
    "pagination": { "limit": 50, "offset": 0, "total": 34, "hasMore": false }
  }
}
```

---

#### `GET /api/me/stats`

Aggregated user stats for dashboard display.

**Response:**
```json
{
  "taskStats": { "completed": 12, "pending": 3, "total": 15 },
  "pointsStats": { "total": 2450, "thisMonth": 400 },
  "submissionStats": { "approved": 10, "rejected": 1, "pending": 2 },
  "activity": { "lastActive": "...", "daysActive30": 18 },
  "rank": 47,
  "memberSince": "2025-06-15"
}
```

---

#### `GET /api/me/login-streak`

Current login/activity streak.

**Response:**
```json
{
  "current": 7,
  "longest": 21,
  "totalDays": 89,
  "lastActivityDate": "2026-02-24"
}
```

---

#### `POST /api/me/login-streak`

Record a login event (call on app open). Awards streak bonus points if applicable.

**Response:**
```json
{
  "success": true,
  "streakUpdated": true,
  "currentStreak": 8,
  "pointsAwarded": 10
}
```

---

### 5.3 Progression & Roles

#### `GET /api/user/progression`

Full progression overview for the dashboard progression page.

**Response:**
```json
{
  "currentRole": {
    "role": "member",
    "level": 3,
    "displayName": "Член організації",
    "icon": "⚔️",
    "color": "#B8860B"
  },
  "roleJourney": [
    { "role": "supporter", "displayName": "Прихильник", "achieved": true, "date": "..." },
    { "role": "candidate", "displayName": "Кандидат", "achieved": true, "date": "..." },
    { "role": "member", "displayName": "Член", "achieved": true, "date": "..." },
    { "role": "activist", "displayName": "Активіст", "achieved": false, "date": null }
  ],
  "tasks": {
    "incomplete": [ { "id": "...", "title": "...", "pointsReward": 50 } ],
    "completed": [ { "id": "...", "title": "...", "completedAt": "..." } ]
  },
  "streak": {
    "current": 7,
    "longest": 21,
    "totalDays": 89,
    "nextMilestone": 10
  },
  "achievements": [ { "id": "...", "title": "...", "awardedAt": "..." } ],
  "milestones": [ { "id": "...", "type": "streak", "title": "7 днів активності" } ],
  "progress": {
    "currentRole": "member",
    "nextRole": "activist",
    "isEligible": false,
    "progressPercent": 68,
    "requirements": [ ... ]
  }
}
```

---

#### `GET /api/user/role-progress`

Compact role progress summary (for sidebar widgets).

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "membershipRole": "member",
    "staffRole": null,
    "roleAdvancedAt": "2025-09-01",
    "referralCode": "ABC123"
  },
  "progress": {
    "currentRole": "member",
    "nextRole": "activist",
    "isEligible": false,
    "progressPercent": 68,
    "requirements": [
      { "key": "tasks_completed", "label": "Завдань виконано", "current": 8, "required": 10, "met": false }
    ]
  },
  "stats": {
    "directReferrals": 3,
    "totalTreeCount": 12,
    "helpedAdvance": 1
  }
}
```

---

#### `POST /api/user/check-advancement`

Check if the user is eligible to advance to the next role and automatically advance if so.

**Response:**
```json
{
  "advanced": true,
  "newRole": "activist",
  "previousRole": "member",
  "progress": { ... },
  "message": "Вітаємо! Ви стали Активістом!"
}
```

---

#### `POST /api/user/milestones/[id]/celebrate`

Mark a milestone as seen/celebrated (clears the celebration prompt).

**Response:**
```json
{ "success": true, "data": { "id": "...", "type": "streak", "title": "...", "isCelebrated": true } }
```

---

#### `GET /api/user/achievements/[id]/badge`

Get badge image/details for a specific achievement.

---

#### `GET /api/badges/my`

All badges the current user has earned.

**Response:**
```json
{ "badges": [ { "id": "...", "name": "...", "imageUrl": "...", "awardedAt": "..." } ] }
```

---

### 5.4 Tasks

#### `POST /api/tasks/[id]/claim`

Claim an available task (assigns it to the user).

**Response:**
```json
{ "success": true }
```

---

#### `POST /api/tasks/[id]/complete`

Submit task completion.

**Request body:**
```json
{
  "proofType": "url",
  "proofUrl": "https://example.com/proof",
  "proofImageUrl": "https://cdn.ordenv.org/proofs/uuid.jpg"
}
```
All proof fields are optional depending on task requirements.

**Response:**
```json
{
  "success": true,
  "pointsEarned": 100,
  "pendingReview": false,
  "message": "Завдання виконано! +100 балів"
}
```

If `pendingReview: true`, points are pending admin approval.

---

#### `POST /api/features/check`

Check if a feature is unlocked for the current user based on role.

**Request body:**
```json
{ "featureKey": "messaging" }
```

**Response:**
```json
{
  "unlocked": true,
  "displayName": "Повідомлення",
  "description": "Спілкуйтеся з іншими членами",
  "requiredRole": "candidate",
  "currentRole": "member"
}
```

---

### 5.5 Votes

#### `POST /api/votes/[id]/cast`

Cast a vote.

**Request body:**
```json
{
  "optionId": "uuid",
  "rankedChoices": ["uuid1", "uuid2", "uuid3"]
}
```
`optionId` for single-choice, `rankedChoices` for ranked-choice votes.

**Response:**
```json
{
  "success": true,
  "pointsEarned": 50
}
```

---

### 5.6 Events

#### `POST /api/events/[id]/rsvp`

Create or update RSVP for an event.

**Request body:**
```json
{ "status": "going" }
```
`status`: `going` | `maybe`

**Response:**
```json
{ "success": true, "status": "going" }
```

---

#### `DELETE /api/events/[id]/rsvp`

Cancel RSVP. Returns 400 if a ticket was already purchased.

---

#### `POST /api/marketplace/events/[id]/checkout`

Purchase a ticket for a paid event.

**Response:**
```json
{
  "success": true,
  "order": { "id": "...", "status": "paid", "amount": 200 },
  "message": "Квиток придбано!"
}
```

---

### 5.7 Challenges

#### `POST /api/challenges/[id]/join`

Join a challenge.

**Response:**
```json
{ "success": true, "participant": { "id": "...", "joinedAt": "..." }, "message": "Ви приєдналися!" }
```

---

#### `POST /api/challenges/[id]/leave`

Leave a challenge (only if not completed).

---

#### `GET /api/challenges/my`

Challenges the current user is participating in.

---

### 5.8 Notifications

#### `GET /api/members/notifications`

Get the user's notifications.

**Query params:**
| Param | Default | Description |
|-------|---------|-------------|
| `page` | `1` | Page number |
| `limit` | `20` | Max 50 |
| `filter` | `all` | `all` \| `unread` |
| `type` | — | Filter by notification type |

**Response:**
```json
{
  "notifications": [
    {
      "id": "recipient-uuid",
      "notificationId": "notification-uuid",
      "title": "Нове голосування!",
      "message": "Доступне нове голосування. Ваш голос важливий.",
      "type": "vote",
      "isRead": false,
      "readAt": null,
      "deliveredAt": "2026-02-24T10:30:00Z",
      "sender": null
    }
  ],
  "unreadCount": 3,
  "total": 24,
  "page": 1,
  "totalPages": 2
}
```

**Notification types:** `system` | `vote` | `event` | `task` | `achievement` | `news` | `referral`

---

#### `POST /api/members/notifications/[id]/read`

Mark a single notification as read.

---

#### `POST /api/members/notifications/read-all`

Mark all notifications as read.

**Response:**
```json
{ "success": true, "markedCount": 5, "unreadCount": 0 }
```

---

### 5.9 Messaging

#### `GET /api/messaging/conversations`

List user's conversations.

**Query params:** `page`, `limit` (max 50)

**Response:**
```json
{
  "conversations": [
    {
      "id": "uuid",
      "type": "dm",
      "name": null,
      "participants": [ { "id": "...", "firstName": "...", "lastName": "...", "avatarUrl": "..." } ],
      "lastMessage": { "content": "Привіт!", "sentAt": "...", "senderId": "..." },
      "unreadCount": 2,
      "isMuted": false
    }
  ],
  "total": 8,
  "page": 1,
  "totalPages": 1
}
```

---

#### `POST /api/messaging/conversations`

Create a new conversation (group or DM).

**Request body:**
```json
{
  "type": "dm",
  "participantIds": ["user-uuid"],
  "name": null,
  "description": null
}
```

---

#### `GET /api/messaging/dm/[userId]`

Get or create a DM conversation with a specific user.

**Response:**
```json
{
  "conversation": { "id": "...", ... },
  "created": false
}
```

---

#### `GET /api/messaging/conversations/[id]`

Get conversation details.

---

#### `PATCH /api/messaging/conversations/[id]`

Update conversation title.

**Request body:**
```json
{ "title": "Нова назва" }
```

---

#### `POST /api/messaging/conversations/[id]/mute`

Mute/unmute a conversation.

**Request body:**
```json
{ "muted": true }
```

---

#### `GET /api/messaging/conversations/[id]/messages`

Get messages in a conversation (paginated).

**Query params:** `limit`, `before` (cursor for older messages)

---

#### `GET /api/messaging/conversations/[id]/participants`

List conversation participants.

---

#### `POST /api/messaging/conversations/[id]/participants/[userId]`

Add a participant to a conversation.

---

#### `DELETE /api/messaging/conversations/[id]/participants/[userId]`

Remove a participant from a conversation.

---

#### `GET /api/messaging/unread`

Total unread message counts.

**Response:**
```json
{
  "totalUnread": 5,
  "byConversation": {
    "conversation-uuid-1": 3,
    "conversation-uuid-2": 2
  }
}
```

---

#### `GET /api/messaging/presence`

Get online presence status for a set of users.

**Query params:** `userIds` (comma-separated UUIDs)

**Response:**
```json
{
  "presence": [
    { "userId": "...", "isOnline": true, "lastSeen": "..." }
  ]
}
```

---

#### `POST /api/messaging/presence`

Update own presence status.

**Request body:**
```json
{
  "isOnline": true,
  "currentConversationId": "uuid"
}
```

---

#### `PATCH /api/messaging/messages/[id]`

Edit a message.

**Request body:**
```json
{ "content": "Відредаговане повідомлення" }
```

---

#### `DELETE /api/messaging/messages/[id]`

Delete a message.

---

#### `POST /api/messaging/messages/[id]/read`

Mark a message as read.

---

#### `POST /api/messaging/messages/[id]/forward`

Forward a message to another conversation.

**Request body:**
```json
{ "targetConversationId": "uuid" }
```

---

#### `POST /api/messaging/messages/[id]/pin`

Pin/unpin a message.

---

#### `POST /api/messaging/messages/[id]/star`

Star/unstar a message.

---

#### `POST /api/messaging/messages/[id]/reactions`

Add/remove emoji reaction.

**Request body:**
```json
{ "emoji": "👍" }
```

---

#### `POST /api/members/messages/send`

Send a direct message (simple version).

**Request body:**
```json
{
  "recipientId": "uuid",
  "body": "Привіт!"
}
```

---

### 5.10 Resources

#### `GET /api/resources`

Get all veteran resources. Optionally filter by category.

**Query params:** `category` (`jobs` | `legal` | `support` | `healthcare`)

**Response:**
```json
{
  "resources": [
    {
      "id": "uuid",
      "title": "...",
      "description": "...",
      "category": "legal",
      "url": "https://...",
      "phone": "...",
      "address": "...",
      "isActive": true
    }
  ]
}
```

---

#### `GET /api/resources/[category]`

Resources for a specific category.

**Path params:** `category` → `jobs` | `legal` | `support` | `healthcare`

---

### 5.11 Help

#### `GET /api/help/tooltips/[pageSlug]`

Get contextual tooltips for a dashboard page. Audience-filtered by user role.

**Response:**
```json
{
  "tooltips": {
    "points-balance": {
      "id": "uuid",
      "content": "Ваш поточний баланс балів.",
      "article": { "slug": "how-points-work", "title": "Як працюють бали" }
    }
  }
}
```

---

#### `POST /api/help/feedback`

Submit helpfulness feedback for an article.

**Request body:**
```json
{
  "articleId": "uuid",
  "helpful": true,
  "feedback": "Дуже корисна стаття!"
}
```

---

### 5.12 Marketplace

#### `GET /api/marketplace/products`

**Query params:** `category`, `limit`, `offset`

**Response:**
```json
{
  "products": [
    { "id": "...", "name": "...", "slug": "...", "price": 500, "category": "merch", "imageUrl": "..." }
  ],
  "pagination": { ... }
}
```

---

#### `GET /api/marketplace/products/[slug]`

Product details.

---

#### `GET /api/marketplace/orders`

User's order history.

**Query params:** `limit`, `offset`

---

#### `GET /api/marketplace/orders/[id]`

Single order details.

---

#### `POST /api/marketplace/checkout`

Purchase a product.

**Request body:**
```json
{
  "productId": "uuid",
  "quantity": 1
}
```

---

### 5.13 Badges & Achievements

#### `GET /api/badges/my`

User's earned badges.

#### `GET /api/user/achievements/[id]/badge`

Badge image/details for a specific achievement ID.

---

## 6. Admin Endpoints

All endpoints in this section require `staff_role IN ('admin', 'super_admin')` unless otherwise noted. Pass Bearer token or use admin session cookie.

---

### 6.1 Members

#### `GET /api/admin/members` *(implicit — use search)*

Use `/api/admin/search?type=members&q=...` for member lookup.

---

#### `POST /api/admin/members/create`

**Auth:** super_admin

Create a new member with Supabase Auth account.

**Request body:**
```json
{
  "first_name": "Іван",
  "last_name": "Петренко",
  "patronymic": "Іванович",
  "email": "ivan@example.com",
  "phone": "+380501234567",
  "oblast_id": "uuid",
  "city": "Київ",
  "role": "member",
  "status": "active",
  "membership_tier": "standard",
  "points": 0
}
```

**Response:**
```json
{
  "success": true,
  "member": { "id": "uuid", ... },
  "credentials": { "email": "...", "temporaryPassword": "..." }
}
```

---

#### `GET /api/admin/members/[id]`

Get member details. Regional leaders can only access members in their referral tree.

---

#### `PATCH /api/admin/members/[id]`

Update member fields.

**Request body** (all optional):
```json
{
  "first_name": "...",
  "last_name": "...",
  "email": "...",
  "phone": "...",
  "oblast_id": "uuid",
  "city": "...",
  "role": "member",
  "staff_role": "admin",
  "status": "active",
  "is_email_verified": true
}
```

---

#### `DELETE /api/admin/members/[id]`

Soft-delete a member (`status = 'deleted'`).

---

#### `POST /api/admin/members/[id]/verify`

Toggle verification status.

**Request body:**
```json
{
  "verifyType": "email",
  "method": "manual"
}
```

---

#### `POST /api/admin/members/[id]/suspend`

Toggle suspension. Provide reason when suspending.

**Request body:**
```json
{ "reason": "Порушення правил спільноти" }
```

---

#### `POST /api/admin/members/[id]/adjust-points`

Manually adjust a member's points.

**Request body:**
```json
{
  "adjustment": 500,
  "reason": "Участь у заході"
}
```

**Response:**
```json
{
  "message": "Points adjusted by +500",
  "adjustment": 500,
  "data": { "newBalance": 2950 }
}
```

---

#### `GET /api/admin/members/[id]/activity`

Member's activity log.

**Query params:** `limit`, `offset`

---

#### `GET /api/admin/members/[id]/advance-role`

Get role advancement progress for a member.

---

#### `POST /api/admin/members/[id]/advance-role`

Manually advance a member's role.

**Request body:**
```json
{
  "toRole": "activist",
  "reason": "Виняткова активність"
}
```

---

#### `POST /api/admin/members/bulk-delete`

**Request body:**
```json
{ "memberIds": ["uuid1", "uuid2"] }
```

---

#### `POST /api/admin/members/bulk-status`

**Request body:**
```json
{
  "memberIds": ["uuid1", "uuid2"],
  "status": "active"
}
```

---

#### `POST /api/admin/members/import`

Upload a CSV file. Send as `multipart/form-data` with field `file`.

---

#### `GET /api/admin/members/export`

Download members as CSV.

**Query params:** `status`, `role`, `limit`

---

### 6.2 Tasks (Admin)

#### `PATCH /api/admin/tasks/[id]`

Update task.

**Request body:**
```json
{
  "title": "...",
  "description": "...",
  "status": "active",
  "priority": "high",
  "points_reward": 100,
  "requires_proof": true,
  "due_date": "2026-03-01T00:00:00Z"
}
```

---

#### `DELETE /api/admin/tasks/[id]`

**Auth:** super_admin only.

---

### 6.3 Votes (Admin)

#### `GET /api/admin/votes/[id]`

Full vote details with creator info.

**Response:**
```json
{ "data": { "id": "...", "question": "...", "vote_type": "single_choice", "status": "active", "options": [...], "creator": {...} } }
```

---

#### `PATCH /api/admin/votes/[id]`

**Request body:**
```json
{
  "question": "...",
  "description": "...",
  "vote_type": "single_choice",
  "transparency": "public",
  "scope": "all",
  "start_date": "...",
  "end_date": "...",
  "requires_quorum": false,
  "quorum_percentage": 51,
  "allow_change_vote": false,
  "status": "active"
}
```

---

#### `DELETE /api/admin/votes/[id]`

---

#### `POST /api/admin/votes/[id]/close`

Close a vote by setting its end date.

**Request body:**
```json
{ "endDate": "2026-02-24T23:59:59Z" }
```

---

### 6.4 Events (Admin)

#### `GET /api/admin/events/[id]`

#### `PATCH /api/admin/events/[id]`

**Request body:**
```json
{
  "title": "...",
  "description": "...",
  "start_date": "...",
  "end_date": "...",
  "location": "...",
  "capacity": 100,
  "points_reward": 200,
  "status": "published"
}
```

---

#### `DELETE /api/admin/events/[id]`

Soft-delete (sets status to `cancelled`).

---

#### `POST /api/admin/events/[id]/attendance`

Mark attendees and award points.

**Request body:**
```json
{ "userIds": ["uuid1", "uuid2"] }
```

**Response:**
```json
{
  "message": "Attendance recorded",
  "pointsAwarded": 200,
  "results": [ { "userId": "...", "success": true } ]
}
```

---

#### `DELETE /api/admin/events/[id]/attendance`

Remove attendance records. No point refund.

**Request body:**
```json
{ "userIds": ["uuid1"] }
```

---

### 6.5 Challenges (Admin)

#### `GET /api/admin/challenges`

**Query params:** `status`, `type`, `limit`, `offset`

---

#### `POST /api/admin/challenges`

Create a challenge.

#### `GET /api/admin/challenges/[id]`
#### `PATCH /api/admin/challenges/[id]`
#### `DELETE /api/admin/challenges/[id]`

#### `POST /api/admin/challenges/[id]/activate`
#### `POST /api/admin/challenges/[id]/cancel`
#### `POST /api/admin/challenges/[id]/complete`

Complete the challenge and distribute rewards.

#### `GET /api/admin/challenges/[id]/participants`

**Query params:** `limit`

---

### 6.6 Notifications (Admin)

#### `POST /api/admin/notifications/send`

Send a notification to a targeted group.

**Request body:**
```json
{
  "title": "Важливе оголошення",
  "message": "Текст повідомлення...",
  "type": "system",
  "scope": "all",
  "scopeValue": null
}
```

**Scope options:**

| `scope` | `scopeValue` | Description |
|---------|--------------|-------------|
| `all` | — | All active members |
| `role` | role name | Members with that membership role |
| `oblast` | oblast UUID | Members in that oblast |
| `tier` | tier name | Members of that payment tier |
| `payment_expired` | — | Members with expired payments |
| `never_paid` | — | Members on free tier |
| `user` | user UUID | Single specific user |
| `referral_tree` | — | Regional leader's referral tree only |

**Type options:** `system` | `vote` | `event` | `task` | `achievement` | `news` | `referral`

**Response:**
```json
{
  "success": true,
  "notificationId": "uuid",
  "recipientCount": 342,
  "message": "Notification sent to 342 users"
}
```

---

#### `GET /api/admin/notifications/history`

Notification send history (paginated).

**Query params:** `page`

**Response:**
```json
{
  "notifications": [
    {
      "id": "uuid",
      "title": "...",
      "body": "...",
      "type": "system",
      "sent_at": "...",
      "data": {
        "scope": "all",
        "recipient_count": 342,
        "sent_by_name": "Іван Адмін"
      },
      "sender": { "first_name": "Іван", "last_name": "Адмін", "email": "..." }
    }
  ],
  "total": 24,
  "page": 1,
  "totalPages": 2
}
```

---

### 6.7 News (Admin)

#### `PATCH /api/admin/news/[id]`

Update article.

**Request body:**
```json
{
  "title": "...",
  "slug": "...",
  "excerpt": "...",
  "content": "...",
  "category": "uuid",
  "status": "published",
  "featured_image_url": "https://...",
  "shouldSetPublishedAt": true
}
```

---

#### `DELETE /api/admin/news/[id]`

**Auth:** super_admin only.

---

#### `GET /api/admin/news/check-slug`

Check if a news slug is available.

**Query params:** `slug`, `excludeId` (when editing)

---

#### `GET /api/admin/categories`
#### `POST /api/admin/categories`

Manage news categories.

#### `GET /api/admin/categories/[id]`
#### `PATCH /api/admin/categories/[id]`
#### `DELETE /api/admin/categories/[id]`

---

### 6.8 Resources (Admin)

#### `GET /api/admin/resources`

List all veteran resources.

#### `POST /api/admin/resources`

Create a resource.

**Request body:**
```json
{
  "title": "...",
  "description": "...",
  "category": "legal",
  "url": "https://...",
  "phone": "...",
  "address": "...",
  "is_active": true
}
```

#### `GET /api/admin/resources/[id]`
#### `PUT /api/admin/resources/[id]`
#### `DELETE /api/admin/resources/[id]`

---

### 6.9 Help System (Admin)

#### `GET /api/admin/help/categories`
#### `POST /api/admin/help/categories`

**Request body:**
```json
{
  "nameUk": "Початок роботи",
  "nameEn": "Getting Started",
  "slug": "getting-started",
  "description": "...",
  "icon": "BookOpen",
  "parentId": null,
  "order": 1,
  "isVisible": true
}
```

#### `PUT /api/admin/help/categories/[id]`
#### `DELETE /api/admin/help/categories/[id]`

Only if no articles or subcategories exist.

---

#### `POST /api/admin/help/articles`

**Request body:**
```json
{
  "categoryId": "uuid",
  "title": "Як розпочати",
  "slug": "how-to-start",
  "content": "Markdown content...",
  "excerpt": "Короткий опис",
  "videoUrl": null,
  "audience": "members",
  "status": "published",
  "relatedArticleIds": ["uuid1"]
}
```

**Audience values:** `all` | `members` | `leaders` | `admins`

#### `PUT /api/admin/help/articles/[id]`
#### `DELETE /api/admin/help/articles/[id]`

---

#### `GET /api/admin/help/tooltips`
#### `POST /api/admin/help/tooltips`

**Request body:**
```json
{
  "pageSlug": "dashboard-points",
  "elementId": "points-balance",
  "content": "Ваш поточний баланс балів.",
  "articleId": "uuid",
  "audience": "members",
  "isActive": true
}
```

#### `PUT /api/admin/help/tooltips/[id]`
#### `DELETE /api/admin/help/tooltips/[id]`

---

#### `GET /api/admin/help/analytics`

Help system usage stats (searches, views, helpfulness).

---

### 6.10 Marketplace (Admin)

#### `GET /api/admin/marketplace/products`
#### `POST /api/admin/marketplace/products`
#### `GET /api/admin/marketplace/products/[id]`
#### `PATCH /api/admin/marketplace/products/[id]`
#### `DELETE /api/admin/marketplace/products/[id]`
#### `POST /api/admin/marketplace/products/check-slug`

Check slug availability: `{ "slug": "..." }` → `{ "available": true }`

---

#### `GET /api/admin/marketplace/orders`

**Query params:** `status`, `limit`, `offset`

#### `GET /api/admin/marketplace/orders/[id]`
#### `PATCH /api/admin/marketplace/orders/[id]`

Update order status: `{ "status": "fulfilled" }`

---

### 6.11 Settings (Admin)

#### `GET /api/admin/settings/organization`
#### `PATCH /api/admin/settings/organization` *(super_admin)*

Organization-wide settings (name, contacts, payment config).

---

#### `GET /api/admin/settings/messaging`
#### `PATCH /api/admin/settings/messaging` *(super_admin)*

SMS/email provider configuration.

---

#### `GET /api/admin/settings/oblasts`
#### `PATCH /api/admin/settings/oblasts` *(super_admin)*

Oblast data management.

---

#### `GET /api/admin/settings/advancement-mode`
#### `PATCH /api/admin/settings/advancement-mode` *(super_admin)*

Automatic vs manual role advancement mode.

---

#### `GET /api/admin/settings/roles`

Role definitions and requirements.

---

#### `POST /api/admin/settings/roles/assign`

Assign a role to a member.

**Request body:**
```json
{
  "memberId": "uuid",
  "role": "activist"
}
```

---

#### `GET /api/admin/settings/system` *(super_admin)*

System-level settings (feature flags, limits).

---

#### `GET /api/admin/role-requirements`

Role advancement requirements for all roles.

---

### 6.12 Analytics (Admin)

#### `GET /api/admin/analytics/growth`

Member growth over the last 30 days.

**Response:**
```json
{
  "data": [
    { "date": "2026-01-25", "new_members": 12, "total_members": 1235 }
  ]
}
```

---

#### `GET /api/admin/analytics/engagement`

Engagement metrics (events, votes, tasks) over the last 7 days.

**Response:**
```json
{
  "data": [
    { "date": "2026-02-18", "events": 3, "votes": 45, "tasks": 67 }
  ]
}
```

---

#### `GET /api/admin/analytics/tasks`

Task statistics.

**Response:**
```json
{
  "overview": { "total": 450, "completed": 380, "pending": 42, "rejected": 28 },
  "statusCounts": { ... },
  "typeCounts": { ... },
  "priorityCounts": { ... },
  "dailyTrend": [ { "date": "...", "count": 12 } ],
  "topPerformers": [ { "userId": "...", "firstName": "...", "tasksCompleted": 34 } ]
}
```

---

### 6.13 Submissions

#### `GET /api/admin/submissions`

Pending task proof submissions.

**Query params:** `status` (`pending`|`approved`|`rejected`), `taskId`, `limit`, `offset`

---

#### `POST /api/admin/submissions/[id]/review`

Approve or reject a submission.

**Request body:**
```json
{
  "approved": true,
  "feedback": "Відмінна робота!"
}
```

---

### 6.14 Roles & Advancement

#### `GET /api/admin/advancement-requests`

Get pending advancement requests.

**Query params:** `includeRecent=true`

**Response:**
```json
{
  "pendingRequests": [ { "id": "...", "userId": "...", "requestedRole": "activist", "createdAt": "..." } ],
  "recentAdvancements": [ { ... } ]
}
```

---

#### `POST /api/admin/advancement-requests`

Approve or reject an advancement request.

**Request body:**
```json
{
  "requestId": "uuid",
  "approved": true,
  "rejectionReason": null
}
```

---

### 6.15 Upload & Files

#### `POST /api/admin/upload`

Upload a file (image, document).

Send as `multipart/form-data` with field `file`.

**Response:**
```json
{ "url": "https://cdn.ordenv.org/files/uuid.jpg", "fileId": "uuid" }
```

---

#### `POST /api/upload`

General file upload for members.

Send as `multipart/form-data` with fields:
- `file` — the file
- `context` — `task_proof` | `user_avatar`

**Response:**
```json
{ "url": "https://cdn.ordenv.org/uploads/uuid.jpg", "s3Key": "...", "size": 204800 }
```

---

### 6.16 Search

#### `GET /api/admin/search`

Global search across entities.

**Query params:** `q`, `type` (`members`|`events`|`news`|`tasks`), `limit`

---

### 6.17 2FA (Admin)

#### `POST /api/admin/2fa/setup`

Initialize 2FA (returns QR code URI for authenticator app).

**Response:**
```json
{
  "secret": "BASE32SECRET",
  "qrcodeUri": "otpauth://...",
  "backupCodes": ["code1", "code2", ...]
}
```

---

#### `POST /api/admin/2fa/enable`

Confirm setup by verifying the first code.

**Request body:**
```json
{ "code": "123456" }
```

---

#### `POST /api/admin/2fa/disable`

Disable 2FA by verifying current code.

**Request body:**
```json
{ "code": "123456" }
```

---

### 6.18 Impersonation

#### `POST /api/admin/members/[id]/impersonate`

**Auth:** super_admin only.

Start an impersonation session for a member.

**Response:**
```json
{ "token": "...", "expiresAt": "..." }
```

---

#### `GET /api/admin/impersonation/status`

Check if currently impersonating someone.

---

### 6.19 Email & Pages

#### `POST /api/admin/send-email`

Send transactional email.

**Request body:**
```json
{
  "type": "welcome",
  "memberId": "uuid"
}
```

---

#### `GET /api/admin/email-templates`
#### `GET /api/admin/email-templates/[key]`
#### `PATCH /api/admin/email-templates/[key]`

**Request body:**
```json
{
  "subject": "...",
  "htmlContent": "...",
  "textContent": "...",
  "isActive": true,
  "changeReason": "Updated footer"
}
```

---

#### `POST /api/admin/email-templates/[key]/test`

Send a test email.

**Request body:**
```json
{ "testEmail": "admin@example.com" }
```

---

#### `GET /api/admin/pages`
#### `POST /api/admin/pages`
#### `GET /api/admin/pages/[id]`
#### `PATCH /api/admin/pages/[id]`
#### `DELETE /api/admin/pages/[id]`
#### `POST /api/admin/pages/reseed` *(super_admin)*

CMS page management.

---

## 7. Webhook Endpoints

These are called by external payment providers. Do not call manually.

### `POST /api/payments/hutko-callback`

Called by HUTKO payment gateway on payment completion.

Signature verification: `SHA1(secret|sorted_values)` or `SHA1(secret|values|secret)`

On success updates:
- `payments` table: `rectoken`, `period_start`, `period_end`
- `users` table: `membership_tier`, `membership_role`, `membership_paid_until`, `status = 'active'`

---

### `POST /api/payments/hutko-chargeback`

Called by HUTKO on chargeback events.

---

### `POST /api/payments/pumb-callback`

Called by PUMB PayHub2 on payment completion (when PUMB provider is enabled in org settings).

---

### `POST /api/payments/callback`

Generic payment callback handler.

---

### `GET /api/cron/billing`

**Auth:** `Authorization: Bearer <CRON_SECRET>` (not a user token)

Recurring billing cron job. Called daily at 09:00 Kyiv time.

- Charges members whose `membership_paid_until < now + 5 days`
- Suspends overdue members (`membership_paid_until < now - 3 days`)

---

## 8. Geographic APIs

### `GET /api/katottg/oblasts`

All 25 Ukrainian oblasts.

### `GET /api/katottg/[code]`

Oblast by KATOTTG code (e.g., `UA01`).

### `GET /api/katottg/search`

Full-text search across KATOTTG database (cities, villages, raions).

**Query params:** `q` (min 2 chars), `limit` (max 50), `category`, `oblastCode`

### `GET /api/nova-poshta/divisions`

Nova Poshta delivery branches by city.

**Query params:** `city` (min 2 chars), `cityRef`, `limit`

---

## Appendix: Payment Flow

### Starting a Payment (Mobile)

```
1. POST /api/payments/create
   Body: { tierId: "standard", isAnnual: false }
   Returns: { hutkoToken, orderId, amount }

2. Redirect user to: https://pay.hutko.org/checkout?token=<hutkoToken>
   OR render in WebView

3. HUTKO calls POST /api/payments/hutko-callback automatically
   (no client action needed)

4. Poll user profile until membership_tier changes:
   GET /api/user/me  →  membership_tier: "standard"
```

### Membership Tiers

| Tier | Monthly | Annual |
|------|---------|--------|
| `free` | 0 UAH | 0 UAH |
| `standard` | 99 UAH | 990 UAH |
| `premium` | 299 UAH | 2990 UAH |

---

## Appendix: Role Advancement Requirements

Advancement is checked via `POST /api/user/check-advancement`. Requirements differ per role; use `GET /api/admin/role-requirements` to get current thresholds. Typical requirements:

- **Tasks completed** (count)
- **Points earned** (total)
- **Active days** (streak)
- **Referrals** (direct invites)
- **Events attended** (count)
- **Days as current role** (minimum tenure)
