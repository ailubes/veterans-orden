# Орден Ветеранів — Claude Code Guide

## Project Overview

**Орден Ветеранів** (`ordenv.org`) — a membership platform for Ukrainian veterans.

## Tech Stack

- **Framework:** Next.js 14 App Router + TypeScript + Tailwind CSS
- **Auth:** Supabase (cookie-based for web, Bearer token for mobile)
- **Database:** Supabase PostgreSQL — project `sdnmeiebiishngzacmyi`, region eu-north-1
- **Payments:** Hutko (Fondy-based, active) + LiqPay (stub)
- **Mobile:** Expo SDK 52 + Expo Router in `/mobile/` (excluded from main tsconfig)
- **Deploy:** PM2 on Linux, domain `ordenv.org`

## Brand

- Always use **"Орден Ветеранів"** / **"Ордені"** — never "Мережа Вільних Людей"
- All user-facing text in Ukrainian
- Code, comments, and variable names in English

## Key Auth Helpers (`src/lib/auth/get-user.ts`)

- `getAuthenticatedUser(request)` — works for both web (cookies) and mobile (Bearer token)
- `getAuthenticatedUserWithProfile(request)` — includes DB profile from `users` table
- `requireAdminUser(request)` — admin check

**Admin check:** use `staff_role` field on the `users` table, NOT `role`.

## Supabase

**CRITICAL:** Before any Supabase MCP operation, call `mcp__supabase__list_projects` to verify the project ID. Never hardcode or assume IDs.

- Project ID: `sdnmeiebiishngzacmyi`
- URL: `https://sdnmeiebiishngzacmyi.supabase.co`

## Payment Integration (Hutko)

- Provider lib: `src/lib/payments/hutko.ts`
- Token API: POST `https://pay.hutko.org/api/checkout/token/`
- Recurring API: POST `https://pay.hutko.org/api/checkout/recurring/`
- Callback: `POST /api/payments/hutko-callback`
- Admin settings keys: `payment_hutko_enabled`, `payment_hutko_merchant_id`, `payment_hutko_secret_key`

## Project Structure

```
src/
├── app/                  # Next.js pages (App Router)
│   ├── (dashboard)/      # Protected dashboard pages
│   ├── (admin)/          # Admin pages
│   ├── api/              # API routes
│   └── ...
├── components/           # Shared UI components
├── lib/                  # Utilities (auth, payments, supabase, telegram)
└── hooks/                # React hooks
mobile/                   # Expo mobile app (separate project)
supabase/
└── migrations/           # SQL migrations (ordered by timestamp prefix)
```

## Telegram Bot

- Bot: @Orden_of_veterans_bot
- Token env var: `TELEGRAM_BOT_TOKEN`
- Webhook: `POST /api/telegram/webhook`
- Library: `src/lib/telegram/`

## Rules

- Never make assumptions — ask the user when uncertain
- Run `npm run build` after significant changes to check for type errors
- Restart server with `pm2 restart ordenv` after deploying
