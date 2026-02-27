# Орден Ветеранів — API Reference

**Last updated:** 2026-02-25 (attendees export, attendance tracking)
**Base URL:** `https://ordenv.org`
**Framework:** Next.js 14 App Router
**Auth:** Supabase (cookies for web, Bearer token for mobile)

---

## Authentication

All API routes require authentication. Two methods are supported:

| Method | Used by | Format |
|--------|---------|--------|
| Cookie | Web (Next.js SSR) | `sb-*` Supabase session cookies |
| Bearer | Mobile (Expo) | `Authorization: Bearer <access_token>` |

Both methods are handled transparently by `getAuthenticatedUser(request)` from `src/lib/auth/get-user.ts`.

```ts
// Auth helpers
getAuthenticatedUser(request)            // web + mobile
getAuthenticatedUserWithProfile(request) // includes DB users row
requireAdminUser(request)                // staff_role check
```

> **Admin check:** uses `staff_role` field on `users` table (`none | news_editor | admin | super_admin`), NOT the legacy `role` field.

---

## Users Table — Key Fields

The `users` table is the central data model. Key columns:

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | Primary key |
| `auth_id` | text | Supabase `auth.users.id` |
| `email` | varchar | Unique |
| `first_name` | varchar | |
| `last_name` | varchar | |
| `patronymic` | varchar | По батькові |
| `date_of_birth` | timestamp | |
| `phone` | varchar(20) | Primary phone |
| `additional_phone` | varchar(20) | Secondary phone |
| `has_viber` | boolean | Viber on primary phone |
| `has_whatsapp` | boolean | WhatsApp on primary phone |
| `has_signal` | boolean | Signal on primary phone |
| `telegram_id` | bigint | Set when Telegram linked |
| `facebook_url` | varchar(255) | |
| `bio` | text | Short bio |
| `education` | varchar(20) | `secondary` \| `vocational` \| `higher` |
| `profession` | varchar(255) | |
| `katottg_code` | varchar(19) | КАТОТТГ code for settlement |
| `settlement_name` | varchar(255) | From КАТОТТГ |
| `hromada_name` | varchar(255) | From КАТОТТГ |
| `raion_name` | varchar(255) | From КАТОТТГ |
| `oblast_name_katottg` | varchar(255) | From КАТОТТГ |
| `city` | varchar(100) | Legacy free-text city |
| `points` | integer | Gamification points |
| `level` | integer | Gamification level |
| `status` | user_status | `pending \| active \| suspended \| churned \| deleted` |
| `staff_role` | staff_role | `none \| news_editor \| admin \| super_admin` |
| `membership_tier` | membership_tier | `free \| basic_49 \| ...` |
| `push_token` | text | Expo push token |
| `onboarding_completed_at` | timestamptz | null = not completed |

---

## Endpoints

### Profile

#### `GET /api/members/me`
Returns current user's full profile row (+ joined `oblast`).

**Response:**
```json
{
  "id": "uuid",
  "first_name": "Іван",
  "last_name": "Коваленко",
  "patronymic": "Петрович",
  "email": "user@example.com",
  "phone": "+380991234567",
  "additional_phone": null,
  "has_viber": false,
  "has_whatsapp": true,
  "has_signal": false,
  "facebook_url": null,
  "bio": null,
  "education": "higher",
  "profession": "Інженер",
  "katottg_code": "UA80060010010",
  "settlement_name": "Київ",
  "hromada_name": "Київська міська громада",
  "raion_name": "Київський район",
  "oblast_name_katottg": "Київська область",
  "telegram_id": 123456789,
  "points": 150,
  "level": 3,
  "status": "active",
  "staff_role": "none",
  "isOnboarded": true,
  "oblast": { "id": "uuid", "name": "Київська", "code": "KY" }
}
```

#### `PATCH /api/members/me`
Update editable profile fields. All fields optional.

**Request body:**
```json
{
  "firstName": "Іван",
  "lastName": "Коваленко",
  "city": "Київ",
  "bio": "Ветеран ЗСУ",
  "phone": "+380991234567",
  "additionalPhone": "+380671234567",
  "hasViber": true,
  "hasWhatsapp": false,
  "hasSignal": false,
  "facebookUrl": "https://facebook.com/user",
  "education": "higher",
  "profession": "Інженер",
  "katottgCode": "UA80060010010",
  "settlementName": "Київ",
  "hromadaName": "Київська міська громада",
  "raionName": "Київський район",
  "oblastNameKatottg": "Київська область"
}
```

**Response:** Updated user row.

---

### КАТОТТГ (Settlement Search)

#### `GET /api/katottg?search=<query>`
Search Ukrainian settlements (level 4 — міста, селища, села) by name.
Minimum 2 characters. Returns up to 20 results.

**Response:**
```json
{
  "results": [
    {
      "code": "UA80060010010",
      "name": "Київ",
      "hromada_name": "Київська міська громада",
      "raion_name": "Київський район",
      "oblast_name": "Київська область",
      "full_path": "Київська область / Київський район / Київська громада / Київ"
    }
  ]
}
```

---

### Notifications

#### `GET /api/members/notifications`
```json
{
  "notifications": [{ "id": "uuid", "title": "", "body": "", "is_read": false, "created_at": "" }],
  "unreadCount": 3
}
```

#### `POST /api/members/notifications/:id/read`
Marks a notification as read. Returns `{ "success": true }`.

---

### Events

#### `GET /api/events`
```json
{ "events": [{ "id": "uuid", "title": "", "start_date": "", "location": {}, "status": "published" }] }
```

#### `POST /api/events/:id/rsvp`
```json
// Request
{ "status": "going" | "maybe" | "not_going" }
// Response
{ "success": true }
```

---

### Tasks

#### `GET /api/tasks`
```json
{ "tasks": [{ "id": "uuid", "title": "", "description": "", "points": 50, "priority": "high", "status": "open" }] }
```

#### `POST /api/tasks/:id/complete`
```json
// Request
{ "report": "Виконав завдання..." }
// Response
{ "success": true }
```

---

### Votes

#### `GET /api/votes`
```json
{ "votes": [{ "id": "uuid", "title": "", "options": [], "status": "active" }] }
```

#### `POST /api/votes/:id/cast`
```json
// Request
{ "option_id": "uuid" }
// Response
{ "success": true }
```

---

### Resources

#### `GET /api/resources`
#### `GET /api/resources?category=jobs|legal|support|healthcare`
```json
{ "resources": [{ "id": "uuid", "title": "", "description": "", "category": "jobs", "url": "" }] }
```

---

### Challenges

#### `GET /api/challenges`
```json
{ "challenges": [{ "id": "uuid", "title": "", "goal_type": "", "goal_target": 10, "points": 100, "status": "active" }] }
```

---

### Points / Leaderboard

#### `GET /api/me/points`
Returns current user's points history and stats.

#### `GET /api/leaderboard`
```json
{
  "leaderboard": [
    { "userId": "uuid", "firstName": "Іван", "lastName": "К.", "value": 500, "rank": 1 }
  ]
}
```

> **Note:** Leaderboard returns camelCase fields (`userId`, `firstName`, `lastName`, `value`, `rank`).

---

### Social Network

#### Posts

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/posts?cursor=&limit=&type=&userId=` | Paginated posts feed |
| `GET` | `/api/posts/:id` | Single post |
| `POST` | `/api/posts` | Create post |
| `PUT` | `/api/posts/:id` | Update post |
| `DELETE` | `/api/posts/:id` | Delete post |
| `POST` | `/api/posts/:id/like` | Like/react to post |
| `DELETE` | `/api/posts/:id/like` | Unlike post |

**Create post request:**
```json
{
  "content": "Текст допису",
  "content_type": "text",
  "media_urls": [],
  "visibility": "members"
}
```

**Post response shape:**
```json
{
  "posts": [
    {
      "id": "uuid", "content": "", "content_type": "text",
      "author": { "id": "uuid", "first_name": "", "last_name": "", "avatar_url": null },
      "likes_count": 5, "comments_count": 2, "is_liked": false,
      "created_at": "", "updated_at": ""
    }
  ],
  "nextCursor": "uuid | null"
}
```

#### Comments

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/posts/:postId/comments` | List comments |
| `POST` | `/api/posts/:postId/comments` | Create comment |
| `PUT` | `/api/comments/:id` | Edit comment |
| `DELETE` | `/api/comments/:id` | Delete comment |
| `POST` | `/api/comments/:id/like` | Like comment |
| `DELETE` | `/api/comments/:id/like` | Unlike comment |
| `GET` | `/api/comments/:id/replies` | Get replies |

#### Follows

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/users/:userId/follow` | Follow user |
| `DELETE` | `/api/users/:userId/follow` | Unfollow user |
| `GET` | `/api/follows/followers?userId=` | Get followers |
| `GET` | `/api/follows/following?userId=` | Get following |

#### Feed

#### `GET /api/feed?cursor=&limit=&type=`
```json
{ "feed": [...posts], "nextCursor": "uuid | null" }
```

---

### Community

#### `GET /api/community?search=&unit=&city=&profession=&page=&limit=`
Member directory with filters.

```json
{
  "members": [
    { "id": "uuid", "first_name": "", "last_name": "", "city": "", "profession": "", "avatar_url": null }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 150, "totalPages": 8 }
}
```

---

### User Profiles

#### `GET /api/users/:id`
```json
{ "profile": { "id": "uuid", "first_name": "", "last_name": "", "bio": "", "avatar_url": null } }
```

#### `GET /api/users/:id/posts?cursor=`
```json
{ "posts": [...], "nextCursor": "uuid | null" }
```

---

### Messaging (Direct Messages)

#### `GET /api/messaging/conversations?page=`
```json
{
  "conversations": [
    {
      "id": "uuid",
      "otherParticipant": { "id": "uuid", "firstName": "", "lastName": "", "avatarUrl": null },
      "lastMessage": { "content": "", "createdAt": "" },
      "unreadCount": 2
    }
  ],
  "total": 10, "page": 1, "totalPages": 1
}
```

#### `GET /api/messaging/dm/:userId`
Get or create a DM conversation with a user.
```json
{ "conversation": { "id": "uuid", "otherParticipant": {...} }, "created": false }
```

#### `GET /api/messaging/conversations/:id/messages?cursor=`
```json
{
  "messages": [
    {
      "id": "uuid",
      "senderId": "uuid",
      "sender": { "firstName": "", "lastName": "" },
      "content": "Привіт",
      "type": "text",
      "isDeleted": false,
      "isEdited": false,
      "createdAt": ""
    }
  ],
  "hasMore": false,
  "nextCursor": null
}
```

#### `POST /api/messaging/conversations/:id/messages`
```json
// Request
{ "content": "Повідомлення", "type": "text" }
// Response
{ "message": {...} }
```

#### `POST /api/messaging/messages/:id/read`
Mark message as read. Returns `{ "success": true }`.

#### `GET /api/messaging/unread`
```json
{ "totalUnread": 3, "byConversation": { "uuid": 2, "uuid2": 1 } }
```

---

### Push Notifications

#### `POST /api/user/push-token`
Register Expo push token.
```json
// Request
{ "token": "ExponentPushToken[...]" }
// Response
{ "success": true }
```

---

### Onboarding

#### `POST /api/user/onboarding-complete`
Mark onboarding as completed. Sets `onboarding_completed_at` timestamp.

---

### Payments (Hutko)

#### `POST /api/payments/hutko-callback`
Webhook for Hutko payment gateway. Verifies signature and updates membership.
See `src/lib/payments/hutko.ts` for implementation details.

---

### Admin Routes

All admin routes require `staff_role IN ('admin', 'super_admin')`.

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/admin/members` | List all members |
| `GET` | `/api/admin/members/:id` | Member detail |
| `PATCH` | `/api/admin/members/:id` | Update member (status, role, etc.) |
| `GET` | `/api/admin/stats` | Platform statistics |
| `GET/POST/PUT/DELETE` | `/api/admin/resources/:id` | Manage veteran resources |
| `POST` | `/api/admin/notifications/send` | Send notification to members |
| `GET/PUT/DELETE` | `/api/admin/events/:id` | Get / update / delete event |
| `GET` | `/api/admin/events/:id/attendees` | Attendee list with personal data (JSON or CSV) |
| `POST` | `/api/admin/events/:id/attendance` | Mark users as attended + award points |
| `DELETE` | `/api/admin/events/:id/attendance` | Remove attendance marks |
| `GET/POST/PUT` | `/api/admin/tasks/*` | Manage tasks |
| `GET/POST/PUT` | `/api/admin/votes/*` | Manage votes |

#### `GET /api/admin/events/:id/attendees`

Returns the full attendee list with personal data for an event.

**Query params:**

| Param | Values | Default | Description |
|-------|--------|---------|-------------|
| `status` | `all` \| `going` \| `maybe` \| `not_going` | `all` | Filter by RSVP status |
| `format` | `json` \| `csv` | `json` | Response format |

**JSON response:**
```json
{
  "event": { "title": "Назва події", "start_date": "2026-03-15T10:00:00" },
  "attendees": [
    {
      "number": 1,
      "last_name": "Коваленко",
      "first_name": "Іван",
      "patronymic": "Петрович",
      "date_of_birth": "15.03.1985",
      "email": "user@example.com",
      "phone": "+380991234567",
      "additional_phone": "",
      "location": "Київ, Київська міська громада, Київський район, Київська область",
      "profession": "Інженер",
      "education": "Вища",
      "rsvp_status": "Підтвердив",
      "rsvp_date": "01.03.2026",
      "attended": "Ні"
    }
  ]
}
```

**CSV response** (`?format=csv`):
- Returns `Content-Disposition: attachment; filename="event_title_date_attendees.csv"`
- UTF-8 with BOM (opens correctly in Excel)
- Columns: №, Прізвище, Ім'я, По батькові, Дата народження, Email, Телефон, Додатковий телефон, Місце проживання, Професія, Освіта, Статус RSVP, Дата реєстрації, Присутній

#### `POST /api/admin/events/:id/attendance`

Mark one or more users as attended and award points.

```json
// Request
{ "userIds": ["uuid1", "uuid2"] }
// Response
{
  "message": "Attendance processed",
  "pointsAwarded": 50,
  "results": {
    "success": ["uuid1"],
    "alreadyAttended": [],
    "noRsvp": ["uuid2"],
    "errors": []
  }
}
```

#### `DELETE /api/admin/events/:id/attendance`

Remove attendance marks (does not refund points).

```json
// Request
{ "userIds": ["uuid1"] }
// Response
{ "message": "Attendance marks removed", "count": 1 }
```

---

### Telegram Bot

#### `POST /api/telegram/webhook`
Receives updates from Telegram. Secret validated via `TELEGRAM_WEBHOOK_SECRET` header.

#### `POST /api/telegram/send`
Send a Telegram message to a user (internal use).
```json
{ "userId": "uuid", "message": "Текст повідомлення" }
```

#### `POST /api/telegram/link`
Link Telegram account to a user profile.

---

### Cron

#### `GET /api/cron/billing`
Recurring billing job. Requires `Authorization: Bearer <CRON_SECRET>`.
Charges due members, suspends overdue members.

---

## Error Responses

All errors follow the format:
```json
{ "error": "Human-readable error message" }
```

| Status | Meaning |
|--------|---------|
| `401` | Not authenticated |
| `403` | Forbidden (insufficient role) |
| `404` | Resource not found |
| `500` | Internal server error |

---

## Mobile API Client

The mobile app (`/mobile/lib/api.ts`) wraps all endpoints in a typed `api` object:

```ts
api.me.get()
api.me.update({ phone, education, ... })
api.katottg.search(query)
api.events.list()
api.events.rsvp(id, status)
api.tasks.list()
api.tasks.complete(id, report)
api.votes.list()
api.votes.cast(id, optionId)
api.resources.list(category?)
api.notifications.list()
api.notifications.markRead(id)
api.challenges.getAll()
api.pushToken.register(token)
api.posts.list(cursor?, limit?, type?, userId?)
api.posts.get(id)
api.posts.create(data)
api.posts.like(id)
api.posts.unlike(id)
api.comments.list(postId)
api.comments.create(postId, content, parent_id?)
api.follows.follow(userId)
api.follows.unfollow(userId)
api.follows.followers(userId?)
api.follows.following(userId?)
api.feed.get(cursor?, limit?, type?)
api.community.list(filters?)
api.users.get(id)
api.users.posts(id, cursor?)
api.messaging.conversations(page?)
api.messaging.dm(userId)
api.messaging.messages(conversationId, cursor?)
api.messaging.sendMessage(conversationId, content)
api.messaging.markRead(messageId)
api.messaging.unread()
```

---

## Environment Variables

| Variable | Used by | Purpose |
|----------|---------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Web + Mobile | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Web + Mobile | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Admin DB operations |
| `TELEGRAM_BOT_TOKEN` | Server | Telegram bot |
| `TELEGRAM_WEBHOOK_SECRET` | Server | Webhook validation |
| `CRON_SECRET` | Server | Billing cron auth |
| `EXPO_PUBLIC_APP_URL` | Mobile | Base URL for API calls |
| `EXPO_PUBLIC_SUPABASE_URL` | Mobile | Supabase URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Mobile | Supabase anon key |
