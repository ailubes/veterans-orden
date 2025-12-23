# 🔧 TECHNICAL SPECIFICATION
## Мережа Вільних Людей — Platform Architecture

**Version:** 1.0  
**Last Updated:** December 2024  
**Stack:** Next.js 14 + Clerk + Convex + PostgreSQL

---

## Table of Contents

1. [Tech Stack Overview](#1-tech-stack-overview)
2. [Project Structure](#2-project-structure)
3. [Environment Setup](#3-environment-setup)
4. [Authentication (Clerk)](#4-authentication-clerk)
5. [Database (PostgreSQL)](#5-database-postgresql)
6. [Real-time Backend (Convex)](#6-real-time-backend-convex)
7. [API Routes](#7-api-routes)
8. [Payments (LiqPay)](#8-payments-liqpay)
9. [File Storage](#9-file-storage)
10. [Deployment](#10-deployment)
11. [Development Workflow](#11-development-workflow)

---

## 1. Tech Stack Overview

### 1.1 Core Technologies

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| **Framework** | Next.js | 14.x | App Router, SSR, API routes |
| **Language** | TypeScript | 5.x | Type safety |
| **Styling** | Tailwind CSS | 3.x | Utility-first CSS |
| **Auth** | Clerk | Latest | Authentication, user management |
| **Real-time DB** | Convex | Latest | Real-time sync, subscriptions |
| **SQL Database** | PostgreSQL | 15+ | Persistent data, complex queries |
| **ORM** | Drizzle | Latest | Type-safe SQL |
| **Validation** | Zod | 3.x | Schema validation |
| **Forms** | React Hook Form | 7.x | Form handling |
| **State** | Zustand | 4.x | Client state management |
| **Dates** | date-fns | 2.x | Date manipulation |

### 1.2 Infrastructure

| Service | Provider | Purpose |
|---------|----------|---------|
| **Hosting** | Vercel | Edge deployment |
| **Database** | Neon / Supabase | Serverless PostgreSQL |
| **Real-time** | Convex Cloud | Real-time backend |
| **Auth** | Clerk | Authentication |
| **Payments** | LiqPay | Ukrainian payments |
| **Email** | Resend | Transactional email |
| **SMS** | Twilio | Phone verification |
| **Storage** | Cloudflare R2 | File uploads |
| **Analytics** | PostHog | Product analytics |
| **Monitoring** | Sentry | Error tracking |
| **Push** | OneSignal | Push notifications |

### 1.3 Development Tools

```json
{
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "typescript": "^5",
    "eslint": "^8",
    "eslint-config-next": "14",
    "prettier": "^3",
    "prettier-plugin-tailwindcss": "^0.5",
    "drizzle-kit": "^0.20"
  }
}
```

---

## 2. Project Structure

### 2.1 Folder Layout

```
merezha/
├── .env.local                 # Local environment variables
├── .env.example               # Environment template
├── next.config.js             # Next.js configuration
├── tailwind.config.ts         # Tailwind configuration
├── drizzle.config.ts          # Drizzle ORM configuration
├── convex/                    # Convex backend
│   ├── _generated/            # Auto-generated types
│   ├── schema.ts              # Convex schema
│   ├── functions/             # Convex functions
│   │   ├── members.ts
│   │   ├── votes.ts
│   │   ├── events.ts
│   │   └── stats.ts
│   └── auth.config.ts         # Convex + Clerk auth
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── (marketing)/       # Public pages
│   │   │   ├── page.tsx       # Homepage
│   │   │   ├── manifest/page.tsx
│   │   │   ├── about/page.tsx
│   │   │   ├── news/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [slug]/page.tsx
│   │   │   └── layout.tsx
│   │   ├── (auth)/            # Auth pages
│   │   │   ├── sign-in/[[...sign-in]]/page.tsx
│   │   │   ├── sign-up/[[...sign-up]]/page.tsx
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/       # Member dashboard
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── events/page.tsx
│   │   │   │   ├── votes/page.tsx
│   │   │   │   ├── tasks/page.tsx
│   │   │   │   ├── challenges/page.tsx
│   │   │   │   ├── referrals/page.tsx
│   │   │   │   ├── my-group/page.tsx
│   │   │   │   └── settings/page.tsx
│   │   │   └── layout.tsx
│   │   ├── (admin)/           # Admin dashboard
│   │   │   ├── admin/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── members/page.tsx
│   │   │   │   ├── content/page.tsx
│   │   │   │   ├── events/page.tsx
│   │   │   │   ├── votes/page.tsx
│   │   │   │   ├── analytics/page.tsx
│   │   │   │   └── settings/page.tsx
│   │   │   └── layout.tsx
│   │   ├── api/               # API routes
│   │   │   ├── webhooks/
│   │   │   │   ├── clerk/route.ts
│   │   │   │   ├── liqpay/route.ts
│   │   │   │   └── convex/route.ts
│   │   │   ├── payments/
│   │   │   │   ├── create/route.ts
│   │   │   │   └── verify/route.ts
│   │   │   └── trpc/[trpc]/route.ts
│   │   ├── layout.tsx         # Root layout
│   │   ├── globals.css        # Global styles
│   │   └── providers.tsx      # Context providers
│   ├── components/
│   │   ├── ui/                # Base UI components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── joint.tsx
│   │   │   ├── progress-bar.tsx
│   │   │   ├── animated-counter.tsx
│   │   │   ├── skeleton.tsx
│   │   │   └── index.ts
│   │   ├── layout/            # Layout components
│   │   │   ├── navigation.tsx
│   │   │   ├── footer.tsx
│   │   │   ├── sidebar.tsx
│   │   │   ├── skeleton-grid.tsx
│   │   │   ├── grain-overlay.tsx
│   │   │   └── mobile-nav.tsx
│   │   ├── sections/          # Page sections
│   │   │   ├── hero.tsx
│   │   │   ├── frameworks.tsx
│   │   │   ├── stats-strip.tsx
│   │   │   ├── news-section.tsx
│   │   │   ├── quote.tsx
│   │   │   └── cta.tsx
│   │   ├── dashboard/         # Dashboard components
│   │   │   ├── stats-card.tsx
│   │   │   ├── referral-card.tsx
│   │   │   ├── event-card.tsx
│   │   │   ├── vote-card.tsx
│   │   │   ├── task-card.tsx
│   │   │   └── challenge-card.tsx
│   │   ├── admin/             # Admin components
│   │   │   ├── data-table.tsx
│   │   │   ├── charts/
│   │   │   └── forms/
│   │   └── forms/             # Form components
│   │       ├── registration-form.tsx
│   │       ├── payment-form.tsx
│   │       └── vote-form.tsx
│   ├── lib/                   # Utilities & configs
│   │   ├── db/
│   │   │   ├── index.ts       # Drizzle client
│   │   │   ├── schema.ts      # PostgreSQL schema
│   │   │   └── migrations/
│   │   ├── convex.ts          # Convex client
│   │   ├── clerk.ts           # Clerk utilities
│   │   ├── liqpay.ts          # LiqPay integration
│   │   ├── email.ts           # Resend client
│   │   ├── analytics.ts       # PostHog client
│   │   ├── utils.ts           # Helper functions
│   │   └── constants.ts       # App constants
│   ├── hooks/                 # Custom React hooks
│   │   ├── use-member.ts
│   │   ├── use-real-time-stats.ts
│   │   ├── use-voting.ts
│   │   └── use-referrals.ts
│   ├── types/                 # TypeScript types
│   │   ├── index.ts
│   │   ├── member.ts
│   │   ├── event.ts
│   │   ├── vote.ts
│   │   └── api.ts
│   └── store/                 # Zustand stores
│       ├── user-store.ts
│       └── ui-store.ts
├── public/
│   ├── images/
│   │   ├── logo.png
│   │   └── og-image.png
│   └── fonts/
├── assets/                    # Design reference
│   └── merezha-timber-design.jsx
├── docs/                      # Documentation
│   ├── PRD_merezha.md
│   ├── DESIGN_GUIDE.md
│   ├── TECHNICAL_SPEC.md
│   ├── DATABASE_SCHEMA.md
│   └── USER_FLOWS.md
└── scripts/                   # Utility scripts
    ├── seed.ts
    └── migrate.ts
```

### 2.2 Package.json

```json
{
  "name": "merezha",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "db:generate": "drizzle-kit generate:pg",
    "db:push": "drizzle-kit push:pg",
    "db:studio": "drizzle-kit studio",
    "db:seed": "tsx scripts/seed.ts",
    "convex:dev": "convex dev",
    "convex:deploy": "convex deploy"
  },
  "dependencies": {
    "next": "14.1.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    
    "@clerk/nextjs": "^4.29.0",
    "convex": "^1.8.0",
    
    "drizzle-orm": "^0.29.0",
    "@neondatabase/serverless": "^0.6.0",
    
    "zod": "^3.22.0",
    "react-hook-form": "^7.49.0",
    "@hookform/resolvers": "^3.3.0",
    
    "zustand": "^4.4.0",
    "date-fns": "^3.0.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.2.0",
    "lucide-react": "^0.303.0",
    
    "resend": "^2.1.0",
    "@sentry/nextjs": "^7.92.0",
    "posthog-js": "^1.96.0"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "typescript": "^5.3.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "eslint": "^8.56.0",
    "eslint-config-next": "14.1.0",
    "prettier": "^3.2.0",
    "prettier-plugin-tailwindcss": "^0.5.0",
    "drizzle-kit": "^0.20.0",
    "tsx": "^4.7.0"
  }
}
```

---

## 3. Environment Setup

### 3.1 Environment Variables Template (.env.example)

```bash
# ===========================================
# МЕРЕЖА ВІЛЬНИХ ЛЮДЕЙ - Environment Variables
# ===========================================

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="Мережа Вільних Людей"

# -----------------------------
# CLERK (Authentication)
# https://dashboard.clerk.com
# -----------------------------
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding
CLERK_WEBHOOK_SECRET=whsec_...

# -----------------------------
# CONVEX (Real-time Backend)
# https://dashboard.convex.dev
# -----------------------------
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
CONVEX_DEPLOY_KEY=prod:...

# -----------------------------
# DATABASE (PostgreSQL)
# https://neon.tech or https://supabase.com
# -----------------------------
DATABASE_URL=postgresql://user:password@host:5432/merezha?sslmode=require

# -----------------------------
# LIQPAY (Payments)
# https://www.liqpay.ua/documentation
# -----------------------------
LIQPAY_PUBLIC_KEY=sandbox_...
LIQPAY_PRIVATE_KEY=sandbox_...
LIQPAY_WEBHOOK_URL=https://your-domain.com/api/webhooks/liqpay

# -----------------------------
# RESEND (Email)
# https://resend.com
# -----------------------------
RESEND_API_KEY=re_...
EMAIL_FROM=info@freepeople.org.ua

# -----------------------------
# TWILIO (SMS)
# https://www.twilio.com
# -----------------------------
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+380...

# -----------------------------
# CLOUDFLARE R2 (Storage)
# https://developers.cloudflare.com/r2
# -----------------------------
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=merezha-uploads
R2_PUBLIC_URL=https://uploads.freepeople.org.ua

# -----------------------------
# ANALYTICS & MONITORING
# -----------------------------
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://eu.posthog.com
SENTRY_DSN=https://...@sentry.io/...
SENTRY_AUTH_TOKEN=...

# -----------------------------
# ONESIGNAL (Push Notifications)
# https://onesignal.com
# -----------------------------
NEXT_PUBLIC_ONESIGNAL_APP_ID=...
ONESIGNAL_REST_API_KEY=...

# -----------------------------
# FEATURE FLAGS
# -----------------------------
NEXT_PUBLIC_ENABLE_VOTING=true
NEXT_PUBLIC_ENABLE_EVENTS=true
NEXT_PUBLIC_ENABLE_CHALLENGES=true
NEXT_PUBLIC_ENABLE_PAYMENTS=true
```

### 3.2 Required API Keys Checklist

| Service | Dashboard URL | Required Keys |
|---------|---------------|---------------|
| **Clerk** | dashboard.clerk.com | Publishable key, Secret key, Webhook secret |
| **Convex** | dashboard.convex.dev | Deployment URL, Deploy key |
| **Neon/Supabase** | console.neon.tech | Connection string |
| **LiqPay** | liqpay.ua/admin | Public key, Private key |
| **Resend** | resend.com | API key |
| **Twilio** | console.twilio.com | Account SID, Auth token, Phone |
| **Cloudflare R2** | dash.cloudflare.com | Account ID, Access keys |
| **PostHog** | eu.posthog.com | Project API key |
| **Sentry** | sentry.io | DSN, Auth token |
| **OneSignal** | onesignal.com | App ID, REST API key |

---

## 4. Authentication (Clerk)

### 4.1 Clerk Configuration

```typescript
// src/lib/clerk.ts
import { currentUser, auth } from "@clerk/nextjs";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function getCurrentMember() {
  const { userId } = auth();
  if (!userId) return null;
  
  const member = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
    with: {
      oblast: true,
      group: true,
    },
  });
  
  return member;
}

export async function requireMember() {
  const member = await getCurrentMember();
  if (!member) {
    throw new Error("Unauthorized");
  }
  return member;
}

export async function requireRole(allowedRoles: string[]) {
  const member = await requireMember();
  if (!allowedRoles.includes(member.role)) {
    throw new Error("Forbidden");
  }
  return member;
}
```

### 4.2 Clerk Webhook Handler

```typescript
// src/app/api/webhooks/clerk/route.ts
import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { generateReferralCode } from "@/lib/utils";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  
  if (!WEBHOOK_SECRET) {
    throw new Error("Missing CLERK_WEBHOOK_SECRET");
  }

  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    return new Response("Invalid signature", { status: 400 });
  }

  const eventType = evt.type;

  if (eventType === "user.created") {
    const { id, email_addresses, phone_numbers, first_name, last_name } = evt.data;
    
    await db.insert(users).values({
      clerkId: id,
      email: email_addresses[0]?.email_address ?? "",
      phone: phone_numbers[0]?.phone_number ?? null,
      firstName: first_name ?? "",
      lastName: last_name ?? "",
      role: "prospect",
      status: "pending",
      referralCode: generateReferralCode(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  if (eventType === "user.updated") {
    const { id, email_addresses, phone_numbers, first_name, last_name } = evt.data;
    
    await db
      .update(users)
      .set({
        email: email_addresses[0]?.email_address,
        phone: phone_numbers[0]?.phone_number,
        firstName: first_name ?? undefined,
        lastName: last_name ?? undefined,
        updatedAt: new Date(),
      })
      .where(eq(users.clerkId, id));
  }

  if (eventType === "user.deleted") {
    const { id } = evt.data;
    
    await db
      .update(users)
      .set({ status: "deleted", updatedAt: new Date() })
      .where(eq(users.clerkId, id));
  }

  return new Response("OK", { status: 200 });
}
```

### 4.3 Middleware

```typescript
// middleware.ts
import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: [
    "/",
    "/manifest",
    "/about",
    "/news",
    "/news/(.*)",
    "/api/webhooks/(.*)",
  ],
  ignoredRoutes: [
    "/api/webhooks/clerk",
    "/api/webhooks/liqpay",
  ],
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
```

---

## 5. Database (PostgreSQL)

### 5.1 Drizzle Configuration

```typescript
// drizzle.config.ts
import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

export default {
  schema: "./src/lib/db/schema.ts",
  out: "./src/lib/db/migrations",
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
} satisfies Config;
```

### 5.2 Database Client

```typescript
// src/lib/db/index.ts
import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

neonConfig.fetchConnectionCache = true;

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
```

### 5.3 Schema Overview

See `DATABASE_SCHEMA.md` for complete schema definition.

Key tables:
- `users` — Member profiles
- `oblasts` — Ukrainian regions
- `groups` — Local cells
- `events` — Events with RSVP
- `votes` — Voting sessions
- `vote_options` — Vote choices
- `user_votes` — Cast votes
- `tasks` — Assignable tasks
- `challenges` — Gamification
- `payments` — Transaction history
- `news_articles` — Content
- `notifications` — User notifications

---

## 6. Real-time Backend (Convex)

### 6.1 Convex Schema

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Real-time member stats
  memberStats: defineTable({
    totalMembers: v.number(),
    weeklyGrowth: v.number(),
    lastUpdated: v.number(),
  }),
  
  // Active voting sessions (real-time updates)
  activeVotes: defineTable({
    voteId: v.string(), // PostgreSQL vote ID
    title: v.string(),
    totalVotes: v.number(),
    optionCounts: v.array(v.object({
      optionId: v.string(),
      count: v.number(),
    })),
    endsAt: v.number(),
  }).index("by_voteId", ["voteId"]),
  
  // Live event RSVPs
  eventRsvps: defineTable({
    eventId: v.string(),
    goingCount: v.number(),
    maybeCount: v.number(),
  }).index("by_eventId", ["eventId"]),
  
  // Challenge leaderboards
  leaderboards: defineTable({
    challengeId: v.string(),
    entries: v.array(v.object({
      userId: v.string(),
      name: v.string(),
      score: v.number(),
      rank: v.number(),
    })),
    updatedAt: v.number(),
  }).index("by_challengeId", ["challengeId"]),
  
  // Online presence
  presence: defineTable({
    oderId: v.string(),
    lastSeen: v.number(),
  }).index("by_oderId", ["oderId"]),
});
```

### 6.2 Convex Functions

```typescript
// convex/functions/stats.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getMemberStats = query({
  handler: async (ctx) => {
    const stats = await ctx.db.query("memberStats").first();
    return stats ?? { totalMembers: 0, weeklyGrowth: 0, lastUpdated: Date.now() };
  },
});

export const updateMemberStats = mutation({
  args: {
    totalMembers: v.number(),
    weeklyGrowth: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("memberStats").first();
    
    if (existing) {
      await ctx.db.patch(existing._id, {
        totalMembers: args.totalMembers,
        weeklyGrowth: args.weeklyGrowth,
        lastUpdated: Date.now(),
      });
    } else {
      await ctx.db.insert("memberStats", {
        totalMembers: args.totalMembers,
        weeklyGrowth: args.weeklyGrowth,
        lastUpdated: Date.now(),
      });
    }
  },
});

// Subscribe to real-time updates
export const subscribeToStats = query({
  handler: async (ctx) => {
    return await ctx.db.query("memberStats").first();
  },
});
```

### 6.3 React Integration

```typescript
// src/hooks/use-real-time-stats.ts
"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function useRealTimeStats() {
  const stats = useQuery(api.functions.stats.getMemberStats);
  
  return {
    totalMembers: stats?.totalMembers ?? 0,
    weeklyGrowth: stats?.weeklyGrowth ?? 0,
    isLoading: stats === undefined,
  };
}
```

---

## 7. API Routes

### 7.1 API Structure

```
/api
├── /webhooks
│   ├── /clerk          # Clerk user events
│   ├── /liqpay         # Payment callbacks
│   └── /convex         # Convex sync
├── /payments
│   ├── /create         # Create payment
│   └── /verify         # Verify payment
├── /members
│   ├── /[id]           # Member details
│   └── /referrals      # Referral stats
├── /events
│   ├── /[id]
│   │   └── /rsvp       # RSVP action
├── /votes
│   ├── /[id]
│   │   ├── /cast       # Cast vote
│   │   └── /results    # Get results
├── /tasks
│   └── /[id]
│       └── /complete   # Mark complete
└── /admin
    ├── /members
    ├── /analytics
    └── /content
```

### 7.2 API Response Format

```typescript
// Success response
{
  "success": true,
  "data": { ... }
}

// Error response
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": { ... }
  }
}
```

### 7.3 Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Not authenticated |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid input |
| `CONFLICT` | 409 | Resource conflict (e.g., already voted) |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

---

## 8. Payments (LiqPay)

### 8.1 LiqPay Integration

```typescript
// src/lib/liqpay.ts
import crypto from "crypto";

const PUBLIC_KEY = process.env.LIQPAY_PUBLIC_KEY!;
const PRIVATE_KEY = process.env.LIQPAY_PRIVATE_KEY!;

interface LiqPayParams {
  action: "pay" | "subscribe";
  amount: number;
  currency: "UAH";
  description: string;
  order_id: string;
  result_url?: string;
  server_url?: string;
  subscribe_periodicity?: "month";
}

export function createLiqPayForm(params: LiqPayParams) {
  const data = Buffer.from(
    JSON.stringify({
      public_key: PUBLIC_KEY,
      version: "3",
      ...params,
    })
  ).toString("base64");

  const signature = crypto
    .createHash("sha1")
    .update(PRIVATE_KEY + data + PRIVATE_KEY)
    .digest("base64");

  return { data, signature };
}

export function verifyLiqPayCallback(data: string, signature: string): boolean {
  const expectedSignature = crypto
    .createHash("sha1")
    .update(PRIVATE_KEY + data + PRIVATE_KEY)
    .digest("base64");

  return signature === expectedSignature;
}

export function decodeLiqPayData(data: string) {
  return JSON.parse(Buffer.from(data, "base64").toString("utf-8"));
}
```

### 8.2 Membership Tiers

```typescript
// src/lib/constants.ts
export const MEMBERSHIP_TIERS = {
  basic_49: {
    id: "basic_49",
    name: "Базовий",
    price: 49,
    description: "Повноправний член Мережі",
  },
  supporter_100: {
    id: "supporter_100",
    name: "Підтримка",
    price: 100,
    description: "Базовий + подяка на сайті",
  },
  supporter_200: {
    id: "supporter_200",
    name: "Підтримка+",
    price: 200,
    description: "Підтримка + згадка у звітах",
  },
  patron_500: {
    id: "patron_500",
    name: "Меценат",
    price: 500,
    description: "Максимальна підтримка",
  },
} as const;
```

---

## 9. File Storage

### 9.1 Cloudflare R2 Setup

```typescript
// src/lib/storage.ts
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const R2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function getUploadUrl(key: string, contentType: string) {
  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  return getSignedUrl(R2, command, { expiresIn: 3600 });
}

export async function deleteFile(key: string) {
  const command = new DeleteObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
  });

  await R2.send(command);
}

export function getPublicUrl(key: string) {
  return `${process.env.R2_PUBLIC_URL}/${key}`;
}
```

---

## 10. Deployment

### 10.1 Vercel Configuration

```json
// vercel.json
{
  "framework": "nextjs",
  "regions": ["fra1"],
  "env": {
    "NEXT_PUBLIC_APP_URL": "https://freepeople.org.ua"
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Access-Control-Allow-Methods", "value": "GET, POST, PUT, DELETE, OPTIONS" }
      ]
    }
  ]
}
```

### 10.2 Deployment Checklist

```markdown
## Pre-deployment

- [ ] All environment variables set in Vercel
- [ ] Database migrations applied
- [ ] Convex deployed (`npx convex deploy`)
- [ ] Clerk webhooks configured
- [ ] LiqPay webhooks configured
- [ ] Domain DNS configured

## Post-deployment

- [ ] Verify Clerk authentication works
- [ ] Verify database connectivity
- [ ] Verify Convex real-time updates
- [ ] Test payment flow (sandbox)
- [ ] Test email delivery
- [ ] Configure Sentry releases
- [ ] Set up monitoring alerts
```

---

## 11. Development Workflow

### 11.1 Getting Started

```bash
# Clone repository
git clone https://github.com/org/merezha.git
cd merezha

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# Start Convex dev server (separate terminal)
npx convex dev

# Push database schema
npm run db:push

# Seed initial data
npm run db:seed

# Start development server
npm run dev
```

### 11.2 Git Workflow

```
main          # Production
├── staging   # Staging environment
└── develop   # Development
    ├── feature/auth
    ├── feature/voting
    └── fix/payment-bug
```

### 11.3 Commit Convention

```
feat: add voting system
fix: resolve payment callback issue
docs: update API documentation
style: format code with prettier
refactor: simplify auth middleware
test: add voting unit tests
chore: update dependencies
```

### 11.4 Code Quality

```bash
# Lint code
npm run lint

# Format code
npx prettier --write .

# Type check
npx tsc --noEmit

# Run tests
npm test
```

---

## Quick Start Commands

```bash
# Development
npm run dev              # Start Next.js
npx convex dev          # Start Convex

# Database
npm run db:generate     # Generate migrations
npm run db:push         # Apply schema
npm run db:studio       # Open Drizzle Studio
npm run db:seed         # Seed data

# Deployment
npm run build           # Build for production
npx convex deploy       # Deploy Convex
vercel --prod           # Deploy to Vercel
```

---

**Reference Files:**
- Design: `assets/merezha-timber-design.jsx`
- PRD: `docs/PRD_merezha.md`
- Design Guide: `docs/DESIGN_GUIDE.md`

---

*"ГУРТУЄМОСЬ, ЩОБ ВПЛИВАТИ!"*
