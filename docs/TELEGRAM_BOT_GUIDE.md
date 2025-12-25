# Мережа Вільних Людей — Telegram Bot Development Guide

> **Version:** 1.0
> **Platform:** Telegram Bot API
> **Framework:** Node.js / grammY or Telegraf
> **Language:** Ukrainian (uk-UA)

---

## Table of Contents

1. [Bot Overview](#1-bot-overview)
2. [Bot Setup & Configuration](#2-bot-setup--configuration)
3. [Architecture](#3-architecture)
4. [Database Schema Changes](#4-database-schema-changes)
5. [Authentication & Linking](#5-authentication--linking)
6. [Command Reference](#6-command-reference)
7. [Referral & Invitation System](#7-referral--invitation-system)
8. [Notification Delivery](#8-notification-delivery)
9. [Conversation Flows](#9-conversation-flows)
10. [Inline Features](#10-inline-features)
11. [Webhook Integration](#11-webhook-integration)
12. [Security Considerations](#12-security-considerations)
13. [Localization](#13-localization)
14. [Error Handling](#14-error-handling)
15. [Deployment](#15-deployment)

---

## 1. Bot Overview

### Purpose

The Telegram bot serves as a companion channel for Мережа Вільних Людей, enabling:

- **Account Linking**: Connect Telegram account to web platform account
- **Referral Invitations**: Invite contacts directly from Telegram using personal referral codes
- **Notifications**: Receive platform updates (votes, events, tasks) via Telegram
- **Quick Actions**: Vote, RSVP, view stats without opening the web app
- **Member Communication**: Contact referrer or regional leader

### Bot Identity

```
Bot Name: Мережа Вільних Людей
Username: @MerezhaVilnykhBot (example)
Description: Офіційний бот Мережі Вільних Людей.
             Гуртуємось, щоб впливати!
```

### Core Features Priority

| Priority | Feature | Description |
|----------|---------|-------------|
| P0 | Account Linking | Link Telegram to platform account |
| P0 | Referral Sharing | Share referral code/link to contacts |
| P0 | Contact Invitations | Bulk invite from Telegram contacts |
| P1 | Notifications | Receive votes, events, tasks alerts |
| P1 | Quick Stats | View points, referrals, level |
| P2 | Voting | Cast votes directly in Telegram |
| P2 | Event RSVP | Respond to event invitations |
| P3 | Admin Broadcast | Send notifications via bot |

---

## 2. Bot Setup & Configuration

### 2.1 Create Bot with BotFather

```
1. Open @BotFather in Telegram
2. Send /newbot
3. Name: Мережа Вільних Людей
4. Username: MerezhaVilnykhBot
5. Save the bot token securely
```

### 2.2 Configure Bot Settings

```
/setdescription
Офіційний бот Мережі Вільних Людей — громадянської організації,
що об'єднує вільних людей України.

🔗 Прив'яжіть акаунт
📨 Запрошуйте друзів
🗳️ Голосуйте
📅 Відстежуйте події

Гуртуємось, щоб впливати!

/setabouttext
Мережа Вільних Людей | freepeople.org.ua

/setcommands
start - Почати роботу з ботом
link - Прив'язати акаунт
invite - Запросити друзів
mystats - Моя статистика
referrals - Мої запрошення
help - Довідка
settings - Налаштування
```

### 2.3 Environment Variables

```bash
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_BOT_USERNAME=MerezhaVilnykhBot
TELEGRAM_WEBHOOK_URL=https://freepeople.org.ua/api/telegram/webhook
TELEGRAM_WEBHOOK_SECRET=your-random-secret-string-32-chars

# Integration with existing platform
NEXT_PUBLIC_APP_URL=https://freepeople.org.ua
SUPABASE_SERVICE_ROLE_KEY=existing-key
DATABASE_URL=existing-database-url
```

### 2.4 Webhook Setup

```bash
# Set webhook (run once during deployment)
curl -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://freepeople.org.ua/api/telegram/webhook",
    "secret_token": "your-random-secret-string-32-chars",
    "allowed_updates": ["message", "callback_query", "inline_query", "my_chat_member"],
    "drop_pending_updates": true
  }'
```

---

## 3. Architecture

### 3.1 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        TELEGRAM CLOUD                           │
│                                                                  │
│    ┌──────────┐                           ┌──────────────┐      │
│    │  Users   │◄─────────────────────────►│ Telegram API │      │
│    └──────────┘                           └───────┬──────┘      │
│                                                   │              │
└───────────────────────────────────────────────────┼──────────────┘
                                                    │
                                          Webhook POST
                                                    │
                                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                     FREEPEOPLE.ORG.UA                           │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                   Next.js API Routes                        │ │
│  │                                                             │ │
│  │  /api/telegram/webhook     ← Receives all bot updates      │ │
│  │  /api/telegram/link        ← Account linking endpoint      │ │
│  │  /api/telegram/send        ← Internal: send messages       │ │
│  │                                                             │ │
│  └─────────────────────────────┬───────────────────────────────┘ │
│                                │                                 │
│                                ▼                                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                   Bot Handler Service                       │ │
│  │                                                             │ │
│  │  ├── Command Handlers (/start, /link, /invite, etc.)      │ │
│  │  ├── Callback Query Handlers (inline buttons)              │ │
│  │  ├── Inline Query Handlers (share referral)               │ │
│  │  └── Message Handlers (contact sharing)                    │ │
│  │                                                             │ │
│  └─────────────────────────────┬───────────────────────────────┘ │
│                                │                                 │
│                                ▼                                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    PostgreSQL (Supabase)                    │ │
│  │                                                             │ │
│  │  users (+ telegram_id, telegram_username)                  │ │
│  │  telegram_invitations (tracking sent invites)              │ │
│  │  notifications (bot message delivery)                      │ │
│  │                                                             │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 File Structure

```
src/
├── app/
│   └── api/
│       └── telegram/
│           ├── webhook/
│           │   └── route.ts          # Main webhook handler
│           ├── link/
│           │   └── route.ts          # Account linking
│           └── send/
│               └── route.ts          # Internal message sender
│
├── lib/
│   └── telegram/
│       ├── bot.ts                    # Bot instance & config
│       ├── handlers/
│       │   ├── commands.ts           # Command handlers
│       │   ├── callbacks.ts          # Callback query handlers
│       │   ├── inline.ts             # Inline query handlers
│       │   └── contacts.ts           # Contact sharing handlers
│       ├── keyboards.ts              # Keyboard builders
│       ├── messages.ts               # Message templates (Ukrainian)
│       ├── api.ts                    # Telegram API wrapper
│       └── utils.ts                  # Helper functions
│
└── types/
    └── telegram.ts                   # TypeScript types
```

### 3.3 Technology Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| Bot Framework | grammY or Telegraf | Telegram Bot API wrapper |
| Runtime | Next.js API Routes | Webhook handler |
| Database | PostgreSQL (Supabase) | User data, invitations |
| Queue | Vercel Cron / Bull | Scheduled notifications |
| Monitoring | PostHog / Sentry | Analytics & errors |

---

## 4. Database Schema Changes

### 4.1 Users Table Extensions

```sql
-- Add Telegram-specific columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS
  telegram_id BIGINT UNIQUE;

ALTER TABLE users ADD COLUMN IF NOT EXISTS
  telegram_username VARCHAR(32);

ALTER TABLE users ADD COLUMN IF NOT EXISTS
  telegram_first_name VARCHAR(64);

ALTER TABLE users ADD COLUMN IF NOT EXISTS
  telegram_linked_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE users ADD COLUMN IF NOT EXISTS
  telegram_notifications_enabled BOOLEAN DEFAULT true;

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_users_telegram_id
  ON users(telegram_id) WHERE telegram_id IS NOT NULL;
```

### 4.2 Telegram Invitations Table

```sql
-- Track invitations sent via Telegram
CREATE TABLE IF NOT EXISTS telegram_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Who sent the invitation
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sender_telegram_id BIGINT NOT NULL,

  -- Invitation details
  recipient_phone VARCHAR(20),           -- Phone number if shared
  recipient_telegram_id BIGINT,          -- Telegram ID if known
  recipient_telegram_username VARCHAR(32),

  -- Referral tracking
  referral_code VARCHAR(20) NOT NULL,    -- Sender's referral code

  -- Status tracking
  status VARCHAR(20) DEFAULT 'sent',     -- sent, clicked, registered, expired
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  clicked_at TIMESTAMP WITH TIME ZONE,
  registered_at TIMESTAMP WITH TIME ZONE,

  -- Metadata
  invitation_method VARCHAR(20),         -- contact, forward, inline, direct
  message_id INTEGER,                    -- Telegram message ID

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_telegram_invitations_sender
  ON telegram_invitations(sender_id);
CREATE INDEX idx_telegram_invitations_recipient_phone
  ON telegram_invitations(recipient_phone);
CREATE INDEX idx_telegram_invitations_status
  ON telegram_invitations(status);
```

### 4.3 Notification Delivery Table Extension

```sql
-- Add Telegram delivery tracking to notification_recipients
ALTER TABLE notification_recipients ADD COLUMN IF NOT EXISTS
  telegram_message_id INTEGER;

ALTER TABLE notification_recipients ADD COLUMN IF NOT EXISTS
  telegram_sent_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE notification_recipients ADD COLUMN IF NOT EXISTS
  telegram_error TEXT;
```

---

## 5. Authentication & Linking

### 5.1 Linking Flow

```
┌─────────────┐
│ User sends  │
│  /start or  │
│   /link     │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│ Bot sends linking options:                                   │
│                                                              │
│ 🔗 Прив'язка акаунту                                        │
│                                                              │
│ Щоб отримувати сповіщення та запрошувати друзів,           │
│ прив'яжіть свій акаунт Мережі до Telegram.                  │
│                                                              │
│ Оберіть спосіб:                                             │
│                                                              │
│ [📧 За Email]  [📱 За телефоном]  [🔑 За кодом]            │
│                                                              │
└─────────────────────────────┬───────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│  Email Flow   │    │  Phone Flow   │    │  Code Flow    │
│               │    │               │    │               │
│ Enter email   │    │ Share contact │    │ Get code from │
│      ↓        │    │      ↓        │    │ web dashboard │
│ Verify code   │    │ Match phone   │    │      ↓        │
│ sent to email │    │ in database   │    │ Enter code    │
│      ↓        │    │      ↓        │    │ in bot        │
│ Link account  │    │ Link account  │    │ Link account  │
└───────────────┘    └───────────────┘    └───────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │ ✅ Акаунт       │
                    │ прив'язано!     │
                    │                 │
                    │ Тепер ви можете │
                    │ запрошувати     │
                    │ друзів та       │
                    │ отримувати      │
                    │ сповіщення.     │
                    │                 │
                    │ [📨 Запросити]  │
                    │ [📊 Статистика] │
                    └─────────────────┘
```

### 5.2 Linking via Email

```typescript
// Step 1: User provides email
async function handleEmailLinking(ctx: Context, email: string) {
  // Validate email format
  if (!isValidEmail(email)) {
    return ctx.reply('❌ Невірний формат email. Спробуйте ще раз.');
  }

  // Check if user exists
  const user = await supabase
    .from('users')
    .select('id, first_name, telegram_id')
    .eq('email', email.toLowerCase())
    .single();

  if (!user.data) {
    return ctx.reply(
      '❌ Користувача з таким email не знайдено.\n\n' +
      'Переконайтесь, що ви зареєстровані на freepeople.org.ua'
    );
  }

  if (user.data.telegram_id) {
    return ctx.reply('⚠️ Цей акаунт вже прив\'язано до іншого Telegram.');
  }

  // Generate 6-digit code
  const code = generateVerificationCode();

  // Store code temporarily (Redis or DB)
  await storeVerificationCode(ctx.from.id, {
    code,
    userId: user.data.id,
    email,
    expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
  });

  // Send code via email
  await sendVerificationEmail(email, code, user.data.first_name);

  return ctx.reply(
    `📧 Код підтвердження надіслано на ${maskEmail(email)}\n\n` +
    'Введіть 6-значний код:'
  );
}

// Step 2: User enters verification code
async function handleVerificationCode(ctx: Context, code: string) {
  const stored = await getVerificationCode(ctx.from.id);

  if (!stored || stored.expiresAt < Date.now()) {
    return ctx.reply('❌ Код прострочений. Почніть спочатку: /link');
  }

  if (stored.code !== code) {
    return ctx.reply('❌ Невірний код. Спробуйте ще раз.');
  }

  // Link account
  await linkTelegramAccount(stored.userId, ctx.from);

  return ctx.reply(
    '✅ Акаунт успішно прив\'язано!\n\n' +
    'Тепер ви можете:\n' +
    '📨 /invite — Запросити друзів\n' +
    '📊 /mystats — Переглянути статистику\n' +
    '⚙️ /settings — Налаштування сповіщень',
    { reply_markup: mainMenuKeyboard }
  );
}
```

### 5.3 Linking via Phone (Contact Sharing)

```typescript
async function handleContactSharing(ctx: Context) {
  const contact = ctx.message.contact;

  // User must share their own contact
  if (contact.user_id !== ctx.from.id) {
    return ctx.reply(
      '❌ Будь ласка, поділіться своїм контактом, ' +
      'а не контактом іншої людини.'
    );
  }

  const phone = normalizePhoneNumber(contact.phone_number);

  // Find user by phone
  const user = await supabase
    .from('users')
    .select('id, first_name, telegram_id')
    .eq('phone', phone)
    .single();

  if (!user.data) {
    return ctx.reply(
      '❌ Користувача з таким номером не знайдено.\n\n' +
      'Переконайтесь, що ви вказали цей номер при реєстрації на freepeople.org.ua'
    );
  }

  if (user.data.telegram_id && user.data.telegram_id !== ctx.from.id) {
    return ctx.reply('⚠️ Цей акаунт вже прив\'язано до іншого Telegram.');
  }

  // Link immediately (phone ownership verified by Telegram)
  await linkTelegramAccount(user.data.id, ctx.from);

  return ctx.reply(
    `✅ Вітаємо, ${user.data.first_name}!\n\n` +
    'Ваш акаунт успішно прив\'язано до Telegram.',
    { reply_markup: mainMenuKeyboard }
  );
}
```

### 5.4 Link Account Function

```typescript
async function linkTelegramAccount(
  userId: string,
  telegramUser: TelegramUser
) {
  await supabase
    .from('users')
    .update({
      telegram_id: telegramUser.id,
      telegram_username: telegramUser.username || null,
      telegram_first_name: telegramUser.first_name,
      telegram_linked_at: new Date().toISOString(),
      telegram_notifications_enabled: true,
    })
    .eq('id', userId);

  // Log analytics event
  await trackEvent('telegram_account_linked', {
    userId,
    telegramId: telegramUser.id,
  });
}
```

### 5.5 Direct Registration in Telegram

Users can register directly in Telegram without visiting the website. This is especially useful for invitations sent via Telegram contacts.

#### 5.5.1 Registration Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│  User clicks invitation link or /start                          │
│  t.me/MerezhaVilnykhBot?start=REF123456                         │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  🇺🇦 Мережа Вільних Людей                                        │
│                                                                  │
│  Вітаємо! Вас запросив [Referrer Name].                         │
│                                                                  │
│  [🔗 Прив'язати існуючий акаунт]                                │
│  [📝 Зареєструватися в Telegram]                                │
│  [🌐 Зареєструватися на сайті]                                  │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           │ Click "Зареєструватися в Telegram"
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 1: Phone Number                                            │
│                                                                  │
│  📱 Для реєстрації нам потрібен ваш номер телефону.            │
│  Це дозволить підтвердити вашу особу.                           │
│                                                                  │
│  [📱 Поділитися номером телефону]                               │
│  [❌ Скасувати]                                                  │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           │ Share contact
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 2: Email Address                                           │
│                                                                  │
│  📧 Введіть вашу email адресу:                                  │
│                                                                  │
│  (Буде використана для входу на сайт та сповіщень)              │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           │ Enter email
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 3: Verify Email                                            │
│                                                                  │
│  📬 Код підтвердження надіслано на user@example.com             │
│                                                                  │
│  Введіть 6-значний код:                                         │
│                                                                  │
│  [🔄 Надіслати повторно]                                        │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           │ Enter verification code
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 4: Personal Information                                    │
│                                                                  │
│  👤 Як вас звати?                                               │
│                                                                  │
│  Ім'я та прізвище (українською):                                │
│  Приклад: Іван Петренко                                         │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           │ Enter name
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 5: Select Oblast                                           │
│                                                                  │
│  🗺️ Оберіть вашу область:                                       │
│                                                                  │
│  [Київська] [Львівська] [Одеська]                               │
│  [Харківська] [Дніпропетровська] [...]                          │
│  [🔍 Пошук...]                                                  │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           │ Select oblast
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 6: Create Password (Optional)                              │
│                                                                  │
│  🔐 Створіть пароль для входу на сайт:                          │
│  (мінімум 8 символів)                                           │
│                                                                  │
│  [⏭️ Пропустити — створити пароль пізніше]                      │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           │ Enter password or skip
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  ✅ REGISTRATION COMPLETE                                        │
│                                                                  │
│  🎉 Вітаємо, Іване!                                             │
│                                                                  │
│  Ви успішно приєдналися до Мережі Вільних Людей!               │
│                                                                  │
│  📊 Ваш реферальний код: XYZ78901                               │
│  👤 Вас запросив: [Referrer Name]                               │
│  📍 Область: Київська                                           │
│                                                                  │
│  Що далі?                                                        │
│  • Запросіть друзів та отримайте +25 балів за кожного           │
│  • Перегляньте відкриті голосування                             │
│  • Відвідайте найближчі події                                   │
│                                                                  │
│  [📨 Запросити друзів]                                          │
│  [🗳️ Голосування]                                               │
│  [📅 Події]                                                      │
│  [🌐 Відкрити сайт]                                             │
└─────────────────────────────────────────────────────────────────┘
```

#### 5.5.2 Registration Session State

```typescript
// src/lib/telegram/types.ts

interface RegistrationSession {
  step: 'phone' | 'email' | 'verify_email' | 'name' | 'oblast' | 'password';
  referralCode?: string;         // Referrer's code from deep link
  referrerId?: string;           // Referrer's user ID
  referrerName?: string;         // For display

  // Collected data
  telegramId: number;
  telegramUsername?: string;
  phone?: string;
  email?: string;
  emailVerificationCode?: string;
  emailVerificationExpires?: number;
  firstName?: string;
  lastName?: string;
  oblastId?: string;

  // Timestamps
  startedAt: number;
  lastActivityAt: number;
  expiresAt: number;             // 30 minutes timeout
}

// Store sessions in Redis or memory with TTL
const registrationSessions = new Map<number, RegistrationSession>();
```

#### 5.5.3 Registration Command Handler

```typescript
// src/lib/telegram/handlers/registration.ts

import { Context, InlineKeyboard, Keyboard } from 'grammy';
import { supabase } from '@/lib/supabase';
import { generateReferralCode, generateVerificationCode } from '@/lib/utils';
import { sendVerificationEmail } from '@/lib/email';
import { oblasts } from '@/lib/constants';

// Start registration flow
bot.callbackQuery('register_telegram', async (ctx) => {
  await ctx.answerCallbackQuery();

  const telegramId = ctx.from.id;

  // Check if already registered
  const existingUser = await supabase
    .from('users')
    .select('id')
    .eq('telegram_id', telegramId)
    .single();

  if (existingUser.data) {
    return ctx.reply(
      '⚠️ Ви вже зареєстровані!\n\n' +
      'Використовуйте /mystats для перегляду профілю.'
    );
  }

  // Get stored referral code if any
  const storedRefCode = await getStoredReferralCode(telegramId);
  let referrerInfo = null;

  if (storedRefCode) {
    const { data: referrer } = await supabase
      .from('users')
      .select('id, first_name, last_name')
      .eq('referral_code', storedRefCode)
      .single();

    if (referrer) {
      referrerInfo = {
        id: referrer.id,
        name: `${referrer.first_name} ${referrer.last_name}`,
        code: storedRefCode,
      };
    }
  }

  // Initialize registration session
  const session: RegistrationSession = {
    step: 'phone',
    telegramId,
    telegramUsername: ctx.from.username,
    referralCode: referrerInfo?.code,
    referrerId: referrerInfo?.id,
    referrerName: referrerInfo?.name,
    startedAt: Date.now(),
    lastActivityAt: Date.now(),
    expiresAt: Date.now() + 30 * 60 * 1000, // 30 min
  };

  registrationSessions.set(telegramId, session);

  // Request phone number
  const keyboard = new Keyboard()
    .requestContact('📱 Поділитися номером телефону')
    .row()
    .text('❌ Скасувати')
    .resized();

  let message = '📝 *Реєстрація в Мережі Вільних Людей*\n\n';

  if (referrerInfo) {
    message += `👤 Вас запросив: ${referrerInfo.name}\n\n`;
  }

  message +=
    '*Крок 1 з 5: Номер телефону*\n\n' +
    'Для реєстрації потрібен ваш номер телефону.\n' +
    'Це допоможе підтвердити вашу особу та захистити акаунт.\n\n' +
    '🔒 Ваш номер буде захищено та не буде публічним.';

  return ctx.reply(message, {
    parse_mode: 'Markdown',
    reply_markup: keyboard,
  });
});

// Handle phone number submission
bot.on('message:contact', async (ctx) => {
  const contact = ctx.message.contact;
  const telegramId = ctx.from.id;

  // Must be own contact
  if (contact.user_id !== telegramId) {
    return ctx.reply(
      '❌ Будь ласка, поділіться *своїм* номером телефону.',
      { parse_mode: 'Markdown' }
    );
  }

  const session = registrationSessions.get(telegramId);
  if (!session || session.step !== 'phone') {
    return; // Not in registration flow
  }

  // Check if phone already registered
  const phone = normalizePhoneNumber(contact.phone_number);
  const existingUser = await supabase
    .from('users')
    .select('id, telegram_id')
    .eq('phone', phone)
    .single();

  if (existingUser.data) {
    // Phone exists - offer to link instead
    if (!existingUser.data.telegram_id) {
      return ctx.reply(
        '📱 Цей номер вже зареєстровано!\n\n' +
        'Бажаєте прив\'язати існуючий акаунт до Telegram?',
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: '✅ Так, прив\'язати', callback_data: `link_phone:${phone}` }],
              [{ text: '❌ Ні, скасувати', callback_data: 'cancel_registration' }],
            ]
          }
        }
      );
    }
    return ctx.reply(
      '❌ Цей номер телефону вже зареєстровано.\n\n' +
      'Якщо це ваш акаунт, використайте /link для прив\'язки.'
    );
  }

  // Save phone and move to email step
  session.phone = phone;
  session.step = 'email';
  session.lastActivityAt = Date.now();

  await ctx.reply(
    '✅ Номер телефону підтверджено!\n\n' +
    '*Крок 2 з 5: Email адреса*\n\n' +
    'Введіть вашу email адресу:\n\n' +
    '💡 Email буде використано для:\n' +
    '• Входу на сайт freepeople.org.ua\n' +
    '• Важливих сповіщень\n' +
    '• Відновлення паролю',
    {
      parse_mode: 'Markdown',
      reply_markup: { remove_keyboard: true },
    }
  );
});

// Handle email input
bot.on('message:text', async (ctx) => {
  const telegramId = ctx.from.id;
  const text = ctx.message.text.trim();

  const session = registrationSessions.get(telegramId);
  if (!session) return;

  // Check session expiry
  if (Date.now() > session.expiresAt) {
    registrationSessions.delete(telegramId);
    return ctx.reply(
      '⏰ Час реєстрації вичерпано.\n' +
      'Почніть спочатку: /start'
    );
  }

  session.lastActivityAt = Date.now();

  switch (session.step) {
    case 'email':
      await handleEmailInput(ctx, session, text);
      break;
    case 'verify_email':
      await handleEmailVerification(ctx, session, text);
      break;
    case 'name':
      await handleNameInput(ctx, session, text);
      break;
    case 'password':
      await handlePasswordInput(ctx, session, text);
      break;
  }
});

// Email input handler
async function handleEmailInput(ctx: Context, session: RegistrationSession, email: string) {
  // Validate email format
  if (!isValidEmail(email)) {
    return ctx.reply(
      '❌ Невірний формат email.\n\n' +
      'Введіть коректну email адресу:'
    );
  }

  email = email.toLowerCase();

  // Check if email already exists
  const existingUser = await supabase
    .from('users')
    .select('id, telegram_id')
    .eq('email', email)
    .single();

  if (existingUser.data) {
    if (!existingUser.data.telegram_id) {
      return ctx.reply(
        '📧 Цей email вже зареєстровано!\n\n' +
        'Бажаєте прив\'язати існуючий акаунт?',
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: '✅ Так, прив\'язати', callback_data: 'link_start' }],
              [{ text: '🔄 Ввести інший email', callback_data: 'retry_email' }],
            ]
          }
        }
      );
    }
    return ctx.reply(
      '❌ Цей email вже зареєстровано.\n\n' +
      'Введіть інший email:'
    );
  }

  // Generate and send verification code
  const code = generateVerificationCode(); // 6 digits
  session.email = email;
  session.emailVerificationCode = code;
  session.emailVerificationExpires = Date.now() + 10 * 60 * 1000; // 10 min
  session.step = 'verify_email';

  // Send email
  await sendVerificationEmail(email, code);

  return ctx.reply(
    `📬 *Крок 3 з 5: Підтвердження email*\n\n` +
    `Код підтвердження надіслано на:\n` +
    `📧 \`${email}\`\n\n` +
    `Введіть 6-значний код з листа:`,
    {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔄 Надіслати код повторно', callback_data: 'resend_email_code' }],
          [{ text: '✏️ Змінити email', callback_data: 'change_email' }],
        ]
      }
    }
  );
}

// Email verification handler
async function handleEmailVerification(ctx: Context, session: RegistrationSession, code: string) {
  // Clean input
  code = code.replace(/\D/g, '');

  if (code.length !== 6) {
    return ctx.reply('❌ Код має містити 6 цифр. Спробуйте ще:');
  }

  if (Date.now() > session.emailVerificationExpires!) {
    return ctx.reply(
      '⏰ Код прострочений.\n\n' +
      'Натисніть кнопку, щоб отримати новий код:',
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔄 Надіслати новий код', callback_data: 'resend_email_code' }],
          ]
        }
      }
    );
  }

  if (code !== session.emailVerificationCode) {
    return ctx.reply('❌ Невірний код. Спробуйте ще раз:');
  }

  // Email verified - move to name step
  session.step = 'name';

  // Pre-fill name from Telegram if available
  const telegramName = ctx.from.first_name +
    (ctx.from.last_name ? ` ${ctx.from.last_name}` : '');

  return ctx.reply(
    `✅ Email підтверджено!\n\n` +
    `*Крок 4 з 5: Ваше ім'я*\n\n` +
    `Введіть ваше ім'я та прізвище українською:\n\n` +
    `💡 Приклад: Іван Петренко\n\n` +
    (telegramName ? `_Ваше ім'я в Telegram: ${telegramName}_` : ''),
    { parse_mode: 'Markdown' }
  );
}

// Name input handler
async function handleNameInput(ctx: Context, session: RegistrationSession, name: string) {
  // Parse name (expect "FirstName LastName")
  const parts = name.trim().split(/\s+/);

  if (parts.length < 2) {
    return ctx.reply(
      '❌ Будь ласка, введіть ім\'я ТА прізвище.\n\n' +
      'Приклад: Іван Петренко'
    );
  }

  // Validate Ukrainian characters
  const ukrainianRegex = /^[А-ЯІЇЄҐа-яіїєґ'\-\s]+$/;
  if (!ukrainianRegex.test(name)) {
    return ctx.reply(
      '❌ Будь ласка, введіть ім\'я українською мовою.\n\n' +
      'Приклад: Іван Петренко'
    );
  }

  session.firstName = parts[0];
  session.lastName = parts.slice(1).join(' ');
  session.step = 'oblast'; // Changed from 'password' to 'oblast'

  // Show oblast selection
  return showOblastSelection(ctx, session);
}

// Oblast selection
async function showOblastSelection(ctx: Context, session: RegistrationSession) {
  // Fetch oblasts from DB
  const { data: oblastList } = await supabase
    .from('oblasts')
    .select('id, name, code')
    .order('name');

  if (!oblastList || oblastList.length === 0) {
    // Fallback - skip oblast
    session.step = 'password';
    return showPasswordStep(ctx, session);
  }

  // Create inline keyboard with oblasts (4 per row)
  const keyboard: { text: string; callback_data: string }[][] = [];
  let row: { text: string; callback_data: string }[] = [];

  for (const oblast of oblastList) {
    row.push({
      text: oblast.name.replace(' область', ''),
      callback_data: `reg_oblast:${oblast.id}`,
    });

    if (row.length === 2) {
      keyboard.push(row);
      row = [];
    }
  }

  if (row.length > 0) {
    keyboard.push(row);
  }

  // Add skip option
  keyboard.push([{ text: '⏭️ Пропустити', callback_data: 'reg_oblast:skip' }]);

  return ctx.reply(
    `👤 ${session.firstName}, дякуємо!\n\n` +
    `*Крок 5 з 5: Ваша область*\n\n` +
    `Оберіть область проживання:\n\n` +
    `_Це допоможе знайти місцеві події та голосування_`,
    {
      parse_mode: 'Markdown',
      reply_markup: { inline_keyboard: keyboard },
    }
  );
}

// Handle oblast selection
bot.callbackQuery(/^reg_oblast:(.+)$/, async (ctx) => {
  await ctx.answerCallbackQuery();

  const telegramId = ctx.from.id;
  const session = registrationSessions.get(telegramId);

  if (!session || session.step !== 'oblast') {
    return ctx.reply('❌ Сесія реєстрації не знайдена. Почніть спочатку: /start');
  }

  const oblastId = ctx.match[1];

  if (oblastId !== 'skip') {
    session.oblastId = oblastId;
  }

  session.step = 'password';

  // Delete oblast selection message
  await ctx.deleteMessage().catch(() => {});

  return showPasswordStep(ctx, session);
});

// Password step
async function showPasswordStep(ctx: Context, session: RegistrationSession) {
  return ctx.reply(
    `🔐 *Останній крок: Пароль*\n\n` +
    `Створіть пароль для входу на сайт freepeople.org.ua\n\n` +
    `Вимоги:\n` +
    `• Мінімум 8 символів\n` +
    `• Рекомендовано: літери, цифри, спецсимволи\n\n` +
    `Введіть пароль:`,
    {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '⏭️ Пропустити — створити пізніше', callback_data: 'reg_skip_password' }],
        ]
      }
    }
  );
}

// Password input handler
async function handlePasswordInput(ctx: Context, session: RegistrationSession, password: string) {
  // Validate password
  if (password.length < 8) {
    return ctx.reply(
      '❌ Пароль занадто короткий.\n\n' +
      'Мінімум 8 символів. Спробуйте ще:'
    );
  }

  // Complete registration
  await completeRegistration(ctx, session, password);
}

// Skip password
bot.callbackQuery('reg_skip_password', async (ctx) => {
  await ctx.answerCallbackQuery();

  const telegramId = ctx.from.id;
  const session = registrationSessions.get(telegramId);

  if (!session || session.step !== 'password') {
    return ctx.reply('❌ Сесія не знайдена. Почніть спочатку: /start');
  }

  await ctx.deleteMessage().catch(() => {});

  // Complete without password (will need to set via "forgot password" on web)
  await completeRegistration(ctx, session, null);
});

// Complete registration
async function completeRegistration(
  ctx: Context,
  session: RegistrationSession,
  password: string | null
) {
  try {
    // Generate referral code for new user
    const referralCode = generateReferralCode();

    // Create Supabase Auth user
    let authUserId: string;

    if (password) {
      // Create with password
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: session.email!,
        password,
        email_confirm: true, // Already verified via code
        user_metadata: {
          first_name: session.firstName,
          last_name: session.lastName,
        },
      });

      if (authError) throw authError;
      authUserId = authData.user.id;
    } else {
      // Create without password (passwordless)
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: session.email!,
        email_confirm: true,
        user_metadata: {
          first_name: session.firstName,
          last_name: session.lastName,
        },
      });

      if (authError) throw authError;
      authUserId = authData.user.id;
    }

    // Create user record in database
    const { data: newUser, error: dbError } = await supabase
      .from('users')
      .insert({
        clerk_id: authUserId, // Supabase Auth ID stored in clerk_id field
        email: session.email,
        phone: session.phone,
        first_name: session.firstName,
        last_name: session.lastName,
        role: 'prospect',
        status: 'active',
        is_email_verified: true,
        is_phone_verified: true,
        verification_method: 'phone',
        oblast_id: session.oblastId || null,
        referred_by_id: session.referrerId || null,
        referral_code: referralCode,
        telegram_id: session.telegramId,
        telegram_username: session.telegramUsername || null,
        telegram_linked_at: new Date().toISOString(),
        telegram_notifications_enabled: true,
        member_since: new Date().toISOString(),
        points: 0,
        level: 1,
      })
      .select()
      .single();

    if (dbError) throw dbError;

    // Award referral points to referrer
    if (session.referrerId) {
      await supabase.rpc('award_referral_points', {
        referrer_id: session.referrerId,
        points_amount: 25,
      });

      // Update referral count
      await supabase
        .from('users')
        .update({
          referral_count: supabase.raw('referral_count + 1'),
        })
        .eq('id', session.referrerId);

      // Notify referrer
      const { data: referrer } = await supabase
        .from('users')
        .select('telegram_id')
        .eq('id', session.referrerId)
        .single();

      if (referrer?.telegram_id) {
        await ctx.api.sendMessage(
          referrer.telegram_id,
          `🎉 *Чудові новини!*\n\n` +
          `${session.firstName} ${session.lastName} приєднався до Мережі за вашим запрошенням!\n\n` +
          `✨ Вам нараховано *+25 балів*`,
          { parse_mode: 'Markdown' }
        ).catch(() => {});
      }

      // Update telegram_invitations if exists
      await supabase
        .from('telegram_invitations')
        .update({
          status: 'registered',
          registered_at: new Date().toISOString(),
        })
        .eq('referral_code', session.referralCode)
        .eq('recipient_telegram_id', session.telegramId);
    }

    // Get oblast name for confirmation
    let oblastName = '';
    if (session.oblastId) {
      const { data: oblast } = await supabase
        .from('oblasts')
        .select('name')
        .eq('id', session.oblastId)
        .single();
      oblastName = oblast?.name || '';
    }

    // Clean up session
    registrationSessions.delete(session.telegramId);

    // Send success message
    let successMessage =
      `🎉 *Вітаємо, ${session.firstName}!*\n\n` +
      `Ви успішно приєдналися до Мережі Вільних Людей!\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━\n` +
      `📧 Email: ${session.email}\n` +
      `📱 Телефон: ${session.phone}\n`;

    if (oblastName) {
      successMessage += `📍 Область: ${oblastName}\n`;
    }

    successMessage +=
      `🔗 Ваш код: \`${referralCode}\`\n` +
      `━━━━━━━━━━━━━━━━━━━━━\n\n`;

    if (session.referrerName) {
      successMessage += `👤 Вас запросив: ${session.referrerName}\n\n`;
    }

    successMessage +=
      `*Що далі?*\n` +
      `• Запросіть друзів — отримайте +25 балів за кожного\n` +
      `• Перегляньте відкриті голосування\n` +
      `• Знайдіть події у вашому регіоні\n\n`;

    if (!password) {
      successMessage +=
        `⚠️ _Для входу на сайт використайте "Забув пароль" щоб створити пароль_\n\n`;
    }

    successMessage += `_Гуртуємось, щоб впливати!_`;

    const keyboard = new InlineKeyboard()
      .text('📨 Запросити друзів', 'invite_menu').row()
      .text('🗳️ Голосування', 'votes_list')
      .text('📅 Події', 'events_list').row()
      .url('🌐 Відкрити сайт', 'https://freepeople.org.ua/dashboard');

    await ctx.reply(successMessage, {
      parse_mode: 'Markdown',
      reply_markup: keyboard,
    });

    // Track analytics
    await trackEvent('telegram_registration_completed', {
      userId: newUser.id,
      telegramId: session.telegramId,
      hasReferrer: !!session.referrerId,
      hasPassword: !!password,
    });

  } catch (error) {
    console.error('[Telegram Registration] Error:', error);

    await ctx.reply(
      '❌ Виникла помилка при реєстрації.\n\n' +
      'Будь ласка, спробуйте пізніше або зареєструйтесь на сайті:\n' +
      'freepeople.org.ua/sign-up'
    );
  }
}

// Resend email verification code
bot.callbackQuery('resend_email_code', async (ctx) => {
  await ctx.answerCallbackQuery();

  const session = registrationSessions.get(ctx.from.id);
  if (!session || !session.email) {
    return ctx.reply('❌ Сесія не знайдена. Почніть спочатку: /start');
  }

  // Generate new code
  const code = generateVerificationCode();
  session.emailVerificationCode = code;
  session.emailVerificationExpires = Date.now() + 10 * 60 * 1000;

  await sendVerificationEmail(session.email, code);

  return ctx.reply(
    `✅ Новий код надіслано на ${session.email}\n\n` +
    'Введіть 6-значний код:'
  );
});

// Cancel registration
bot.callbackQuery('cancel_registration', async (ctx) => {
  await ctx.answerCallbackQuery();

  registrationSessions.delete(ctx.from.id);

  return ctx.reply(
    'Реєстрацію скасовано.\n\n' +
    'Щоб почати знову, надішліть /start',
    { reply_markup: { remove_keyboard: true } }
  );
});
```

#### 5.5.4 Update /start Command for Registration

```typescript
// Updated /start command to include registration option
bot.command('start', async (ctx) => {
  const telegramId = ctx.from.id;

  // Check if already registered/linked
  const user = await getUserByTelegramId(telegramId);

  if (user) {
    // Already linked - show main menu
    return ctx.reply(
      `👋 Вітаємо, ${user.first_name}!\n\n` +
      `📊 Ваші бали: ${user.points}\n` +
      `👥 Запрошено: ${user.referral_count}\n` +
      `🎯 Рівень: ${user.level}\n\n` +
      'Оберіть дію:',
      { reply_markup: mainMenuKeyboard }
    );
  }

  // Check for referral code in deep link: /start REF123456
  const refCode = ctx.message.text.split(' ')[1];
  let referrerInfo = null;

  if (refCode) {
    await storeReferralCode(telegramId, refCode);

    // Get referrer name
    const { data: referrer } = await supabase
      .from('users')
      .select('first_name, last_name')
      .eq('referral_code', refCode)
      .single();

    if (referrer) {
      referrerInfo = {
        name: `${referrer.first_name} ${referrer.last_name}`,
        code: refCode,
      };
    }
  }

  // Not registered - show welcome with registration option
  let welcomeMessage = '🇺🇦 *Мережа Вільних Людей*\n\n';

  if (referrerInfo) {
    welcomeMessage += `👤 Вас запрошує: *${referrerInfo.name}*\n\n`;
  }

  welcomeMessage +=
    'Ласкаво просимо до громадянської організації,\n' +
    'що об\'єднує вільних людей України.\n\n' +
    '*Гуртуємось, щоб впливати!*\n\n' +
    'Оберіть дію:';

  const keyboard = new InlineKeyboard()
    .text('📝 Зареєструватися', 'register_telegram').row()
    .text('🔗 Прив\'язати існуючий акаунт', 'link_start').row()
    .url('🌐 Дізнатися більше', 'https://freepeople.org.ua');

  return ctx.reply(welcomeMessage, {
    parse_mode: 'Markdown',
    reply_markup: keyboard,
  });
});
```

#### 5.5.5 Helper Functions

```typescript
// src/lib/telegram/utils.ts

// Generate 6-digit verification code
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Generate 8-character referral code
export function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No O, I, 0, 1
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
}

// Normalize Ukrainian phone number
export function normalizePhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '');

  if (digits.startsWith('380')) {
    return '+' + digits;
  }
  if (digits.startsWith('80')) {
    return '+3' + digits;
  }
  if (digits.startsWith('0')) {
    return '+38' + digits;
  }

  return '+' + digits;
}

// Store referral code for later use
const referralCodeStore = new Map<number, { code: string; expiresAt: number }>();

export async function storeReferralCode(telegramId: number, code: string) {
  referralCodeStore.set(telegramId, {
    code,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  });
}

export async function getStoredReferralCode(telegramId: number): Promise<string | null> {
  const stored = referralCodeStore.get(telegramId);
  if (!stored || Date.now() > stored.expiresAt) {
    referralCodeStore.delete(telegramId);
    return null;
  }
  return stored.code;
}
```

#### 5.5.6 API Endpoint for Telegram Registration

```typescript
// src/app/api/telegram/register/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    // Verify request is from our bot (via secret header)
    const botSecret = request.headers.get('x-bot-secret');
    if (botSecret !== process.env.TELEGRAM_BOT_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      telegram_id,
      telegram_username,
      email,
      phone,
      first_name,
      last_name,
      oblast_id,
      referral_code,
      password,
    } = body;

    // Validate required fields
    if (!telegram_id || !email || !phone || !first_name || !last_name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check for existing user
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .or(`telegram_id.eq.${telegram_id},email.eq.${email},phone.eq.${phone}`)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
    }

    // Get referrer if code provided
    let referrerId = null;
    if (referral_code) {
      const { data: referrer } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('referral_code', referral_code)
        .single();
      referrerId = referrer?.id || null;
    }

    // Create Supabase Auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: password || undefined,
      email_confirm: true,
      phone,
      phone_confirm: true,
      user_metadata: { first_name, last_name },
    });

    if (authError) {
      console.error('[Telegram Register] Auth error:', authError);
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    // Generate unique referral code
    const newReferralCode = generateUniqueReferralCode();

    // Create user record
    const { data: newUser, error: dbError } = await supabaseAdmin
      .from('users')
      .insert({
        clerk_id: authData.user.id,
        email,
        phone,
        first_name,
        last_name,
        role: 'prospect',
        status: 'active',
        is_email_verified: true,
        is_phone_verified: true,
        verification_method: 'phone',
        oblast_id: oblast_id || null,
        referred_by_id: referrerId,
        referral_code: newReferralCode,
        telegram_id,
        telegram_username: telegram_username || null,
        telegram_linked_at: new Date().toISOString(),
        telegram_notifications_enabled: true,
        member_since: new Date().toISOString(),
        points: 0,
        level: 1,
      })
      .select()
      .single();

    if (dbError) {
      console.error('[Telegram Register] DB error:', dbError);
      // Rollback auth user
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    // Award referral bonus
    if (referrerId) {
      await supabaseAdmin.rpc('award_referral_points', {
        referrer_id: referrerId,
        points_amount: 25,
      });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        referral_code: newReferralCode,
        points: 0,
        level: 1,
      },
    });
  } catch (error) {
    console.error('[Telegram Register] Error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

function generateUniqueReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
```

---

## 6. Command Reference

### 6.1 Public Commands

| Command | Description | Access |
|---------|-------------|--------|
| `/start` | Welcome message & linking prompt | All users |
| `/link` | Link Telegram to platform account | Unlinked users |
| `/invite` | Open invitation menu | Linked users |
| `/mystats` | View personal statistics | Linked users |
| `/referrals` | View referral list | Linked users |
| `/help` | Show help message | All users |
| `/settings` | Notification settings | Linked users |

### 6.2 Command Implementations

```typescript
// /start command
bot.command('start', async (ctx) => {
  const user = await getUserByTelegramId(ctx.from.id);

  if (user) {
    // Already linked - show main menu
    return ctx.reply(
      `👋 Вітаємо, ${user.first_name}!\n\n` +
      `📊 Ваші бали: ${user.points}\n` +
      `👥 Запрошено: ${user.referral_count}\n` +
      `🎯 Рівень: ${user.level}\n\n` +
      'Оберіть дію:',
      { reply_markup: mainMenuKeyboard }
    );
  }

  // Check for referral code in deep link
  const refCode = ctx.message.text.split(' ')[1];
  if (refCode) {
    await storeReferralCode(ctx.from.id, refCode);
  }

  // Not linked - show welcome & link prompt
  return ctx.reply(
    '🇺🇦 *Мережа Вільних Людей*\n\n' +
    'Вітаємо у офіційному боті Мережі!\n\n' +
    'Щоб почати, прив\'яжіть свій акаунт:',
    {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔗 Прив\'язати акаунт', callback_data: 'link_start' }],
          [{ text: '📝 Зареєструватися', url: 'https://freepeople.org.ua/sign-up' }],
        ]
      }
    }
  );
});

// /mystats command
bot.command('mystats', async (ctx) => {
  const user = await requireLinkedUser(ctx);
  if (!user) return;

  const stats = await getUserStats(user.id);

  return ctx.reply(
    `📊 *Ваша статистика*\n\n` +
    `👤 ${user.first_name} ${user.last_name}\n` +
    `📧 ${user.email}\n\n` +
    `━━━━━━━━━━━━━━━━\n` +
    `🎯 Рівень: ${user.level}\n` +
    `⭐ Бали: ${user.points.toLocaleString('uk-UA')}\n` +
    `👥 Запрошено: ${user.referral_count}\n` +
    `━━━━━━━━━━━━━━━━\n\n` +
    `📈 *Цього місяця:*\n` +
    `   └ Нових запрошень: ${stats.monthlyReferrals}\n` +
    `   └ Балів отримано: +${stats.monthlyPoints}\n` +
    `   └ Голосувань: ${stats.monthlyVotes}\n`,
    {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '📨 Запросити друзів', callback_data: 'invite_menu' }],
          [{ text: '🏆 Рейтинг', callback_data: 'leaderboard' }],
        ]
      }
    }
  );
});
```

---

## 7. Referral & Invitation System

### 7.1 Invitation Methods

```
┌─────────────────────────────────────────────────────────────────┐
│                    ЗАПРОШЕННЯ ДРУЗІВ                            │
│                                                                  │
│  Ваш реферальний код: ABC12345                                  │
│  Запрошено: 12 осіб | +120 балів                                │
│                                                                  │
│  Оберіть спосіб запрошення:                                     │
│                                                                  │
│  ┌─────────────────┐  ┌─────────────────┐                       │
│  │ 📱 З контактів  │  │ 📤 Переслати   │                       │
│  │                 │  │    посилання    │                       │
│  └─────────────────┘  └─────────────────┘                       │
│                                                                  │
│  ┌─────────────────┐  ┌─────────────────┐                       │
│  │ 📋 Копіювати    │  │ 🔗 QR-код      │                       │
│  │    посилання    │  │                 │                       │
│  └─────────────────┘  └─────────────────┘                       │
│                                                                  │
│  [🔙 Головне меню]                                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 7.2 Contact Sharing Flow (Key Feature)

```typescript
// User clicks "📱 З контактів"
bot.callbackQuery('invite_from_contacts', async (ctx) => {
  await ctx.answerCallbackQuery();

  return ctx.reply(
    '📱 *Запрошення з контактів*\n\n' +
    'Надішліть контакти друзів, яких хочете запросити.\n\n' +
    '💡 Ви можете надіслати декілька контактів поспіль.\n\n' +
    'Коли закінчите, натисніть "Готово".',
    {
      parse_mode: 'Markdown',
      reply_markup: {
        keyboard: [
          [{ text: '📱 Поділитися контактом', request_contact: false }],
          [{ text: '✅ Готово' }],
          [{ text: '❌ Скасувати' }],
        ],
        resize_keyboard: true,
        one_time_keyboard: false,
      }
    }
  );
});

// Handle received contacts
bot.on('message:contact', async (ctx) => {
  const contact = ctx.message.contact;
  const user = await requireLinkedUser(ctx);
  if (!user) return;

  // Don't allow inviting yourself
  if (contact.user_id === ctx.from.id) {
    return ctx.reply('😅 Ви не можете запросити самого себе!');
  }

  const phone = normalizePhoneNumber(contact.phone_number);

  // Check if already registered
  const existingUser = await supabase
    .from('users')
    .select('id, first_name')
    .eq('phone', phone)
    .single();

  if (existingUser.data) {
    return ctx.reply(
      `ℹ️ ${contact.first_name} вже є учасником Мережі!`
    );
  }

  // Check if already invited by this user
  const existingInvite = await supabase
    .from('telegram_invitations')
    .select('id, sent_at')
    .eq('sender_id', user.id)
    .eq('recipient_phone', phone)
    .single();

  if (existingInvite.data) {
    const sentDate = new Date(existingInvite.data.sent_at);
    return ctx.reply(
      `ℹ️ Ви вже надсилали запрошення для ${contact.first_name}\n` +
      `📅 ${formatDate(sentDate, 'uk-UA')}`
    );
  }

  // Store invitation record
  await supabase.from('telegram_invitations').insert({
    sender_id: user.id,
    sender_telegram_id: ctx.from.id,
    recipient_phone: phone,
    recipient_telegram_id: contact.user_id || null,
    referral_code: user.referral_code,
    invitation_method: 'contact',
  });

  // If contact has Telegram, send invitation message
  if (contact.user_id) {
    try {
      await ctx.api.sendMessage(
        contact.user_id,
        `👋 Вітаю!\n\n` +
        `${user.first_name} ${user.last_name} запрошує вас приєднатися ` +
        `до *Мережі Вільних Людей* — громадянської організації, ` +
        `що об'єднує вільних людей України.\n\n` +
        `🔗 Приєднуйтесь за посиланням:\n` +
        `freepeople.org.ua/signup/${user.referral_code}\n\n` +
        `_Гуртуємось, щоб впливати!_`,
        {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [[
              {
                text: '✨ Приєднатися',
                url: `https://freepeople.org.ua/signup/${user.referral_code}`
              }
            ]]
          }
        }
      );

      await ctx.reply(`✅ Запрошення надіслано для ${contact.first_name}!`);
    } catch (error) {
      // User may have blocked unknown messages
      await ctx.reply(
        `⚠️ Не вдалося надіслати повідомлення ${contact.first_name}.\n` +
        `Можливо, в налаштуваннях приватності заблоковано повідомлення.\n\n` +
        `📋 Ви можете поділитися посиланням вручну:\n` +
        `freepeople.org.ua/signup/${user.referral_code}`
      );
    }
  } else {
    // No Telegram - suggest SMS or manual sharing
    await ctx.reply(
      `📱 ${contact.first_name} не має Telegram.\n\n` +
      `Поділіться посиланням через SMS або месенджер:\n` +
      `freepeople.org.ua/signup/${user.referral_code}`
    );
  }
});

// User clicks "Готово" - show summary
bot.hears('✅ Готово', async (ctx) => {
  const user = await requireLinkedUser(ctx);
  if (!user) return;

  // Get today's invitations
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data: todayInvites } = await supabase
    .from('telegram_invitations')
    .select('id')
    .eq('sender_id', user.id)
    .gte('sent_at', today.toISOString());

  const count = todayInvites?.length || 0;

  await ctx.reply(
    `✅ *Запрошення завершено*\n\n` +
    `📊 Сьогодні надіслано: ${count} запрошень\n` +
    `👥 Всього запрошено: ${user.referral_count} осіб\n\n` +
    `💡 Ви отримаєте *+25 балів* за кожного, хто зареєструється!`,
    {
      parse_mode: 'Markdown',
      reply_markup: { remove_keyboard: true }
    }
  );

  // Return to main menu
  setTimeout(() => {
    ctx.reply('Оберіть дію:', { reply_markup: mainMenuKeyboard });
  }, 1000);
});
```

### 7.3 Share Link Flow

```typescript
// Share via inline keyboard
bot.callbackQuery('invite_share_link', async (ctx) => {
  await ctx.answerCallbackQuery();

  const user = await requireLinkedUser(ctx);
  if (!user) return;

  const link = `https://freepeople.org.ua/signup/${user.referral_code}`;

  return ctx.reply(
    `🔗 *Ваше персональне посилання:*\n\n` +
    `\`${link}\`\n\n` +
    `Поділіться ним з друзями!\n\n` +
    `💡 Натисніть на посилання, щоб скопіювати.`,
    {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{
            text: '📤 Переслати в чат',
            switch_inline_query: ''
          }],
          [{ text: '🔙 Назад', callback_data: 'invite_menu' }],
        ]
      }
    }
  );
});
```

### 7.4 Inline Query for Sharing

```typescript
// Handle inline queries for sharing referral link
bot.on('inline_query', async (ctx) => {
  const user = await getUserByTelegramId(ctx.from.id);

  if (!user) {
    return ctx.answerInlineQuery([{
      type: 'article',
      id: 'not_linked',
      title: '🔗 Прив\'яжіть акаунт',
      description: 'Щоб запрошувати друзів, спочатку прив\'яжіть акаунт',
      input_message_content: {
        message_text: 'Приєднуйтесь до Мережі Вільних Людей!\nhttps://freepeople.org.ua',
      }
    }]);
  }

  const link = `https://freepeople.org.ua/signup/${user.referral_code}`;

  return ctx.answerInlineQuery([
    {
      type: 'article',
      id: 'invite_full',
      title: '📨 Запросити до Мережі',
      description: 'Надіслати запрошення з вашим кодом',
      thumbnail_url: 'https://freepeople.org.ua/og-image.png',
      input_message_content: {
        message_text:
          `👋 Привіт!\n\n` +
          `Запрошую тебе приєднатися до *Мережі Вільних Людей* — ` +
          `громадянської організації, що об'єднує активних українців.\n\n` +
          `🔗 Приєднуйся: ${link}\n\n` +
          `_Гуртуємось, щоб впливати!_`,
        parse_mode: 'Markdown',
      },
      reply_markup: {
        inline_keyboard: [[
          { text: '✨ Приєднатися', url: link }
        ]]
      }
    },
    {
      type: 'article',
      id: 'invite_short',
      title: '🔗 Тільки посилання',
      description: 'Надіслати тільки посилання',
      input_message_content: {
        message_text: link,
      }
    }
  ], { cache_time: 0 });
});
```

### 7.5 Referral Tracking

```typescript
// Track when invitation link is clicked
// (via redirect page that logs analytics)

// When new user registers with referral code
async function handleNewRegistrationWithReferral(
  newUser: User,
  referralCode: string
) {
  // Find referrer
  const referrer = await supabase
    .from('users')
    .select('id, telegram_id, points, referral_count')
    .eq('referral_code', referralCode)
    .single();

  if (!referrer.data) return;

  // Update referrer stats
  await supabase
    .from('users')
    .update({
      referral_count: referrer.data.referral_count + 1,
      points: referrer.data.points + 25, // Signup bonus
    })
    .eq('id', referrer.data.id);

  // Update invitation status if exists
  await supabase
    .from('telegram_invitations')
    .update({
      status: 'registered',
      registered_at: new Date().toISOString(),
    })
    .eq('referral_code', referralCode)
    .eq('status', 'sent');

  // Notify referrer via Telegram
  if (referrer.data.telegram_id) {
    await sendTelegramMessage(
      referrer.data.telegram_id,
      `🎉 *Новий учасник!*\n\n` +
      `${newUser.first_name} приєднався до Мережі за вашим запрошенням!\n\n` +
      `✨ Вам нараховано *+25 балів*\n` +
      `👥 Всього запрошено: ${referrer.data.referral_count + 1}`,
      { parse_mode: 'Markdown' }
    );
  }
}
```

---

## 8. Notification Delivery

### 8.1 Notification Types via Telegram

| Type | Description | Delivery |
|------|-------------|----------|
| `vote` | New vote available | Immediate |
| `event` | New event / reminder | Immediate |
| `task` | New task assigned | Immediate |
| `referral` | Someone joined via your code | Immediate |
| `achievement` | Level up, badge earned | Immediate |
| `news` | Important announcements | Batched (daily) |
| `system` | System alerts | Immediate |

### 8.2 Sending Notifications

```typescript
interface TelegramNotification {
  userId: string;          // Platform user ID
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;
  actionLabel?: string;
}

async function sendTelegramNotification(notification: TelegramNotification) {
  // Get user's Telegram ID
  const user = await supabase
    .from('users')
    .select('telegram_id, telegram_notifications_enabled, first_name')
    .eq('id', notification.userId)
    .single();

  if (!user.data?.telegram_id || !user.data.telegram_notifications_enabled) {
    return { success: false, reason: 'not_enabled' };
  }

  const emoji = getNotificationEmoji(notification.type);

  let text = `${emoji} *${notification.title}*\n\n${notification.message}`;

  const keyboard = notification.actionUrl ? {
    inline_keyboard: [[{
      text: notification.actionLabel || 'Детальніше',
      url: notification.actionUrl,
    }]]
  } : undefined;

  try {
    const result = await bot.api.sendMessage(
      user.data.telegram_id,
      text,
      {
        parse_mode: 'Markdown',
        reply_markup: keyboard,
      }
    );

    // Track delivery
    await supabase
      .from('notification_recipients')
      .update({
        telegram_message_id: result.message_id,
        telegram_sent_at: new Date().toISOString(),
      })
      .eq('user_id', notification.userId)
      .eq('notification_id', notification.notificationId);

    return { success: true, messageId: result.message_id };
  } catch (error) {
    // Handle blocked bot, deactivated account, etc.
    await handleTelegramError(user.data.telegram_id, error);
    return { success: false, error };
  }
}

function getNotificationEmoji(type: NotificationType): string {
  const emojis: Record<NotificationType, string> = {
    vote: '🗳️',
    event: '📅',
    task: '✅',
    referral: '🎉',
    achievement: '🏆',
    news: '📢',
    system: '⚠️',
  };
  return emojis[type] || '📌';
}
```

### 8.3 Vote Notification with Inline Voting

```typescript
async function sendVoteNotification(
  telegramId: number,
  vote: Vote
) {
  const voteTypeLabel = getVoteTypeLabel(vote.vote_type);
  const deadline = formatDate(vote.ends_at, 'uk-UA');

  let keyboard: InlineKeyboardMarkup;

  if (vote.vote_type === 'yes_no') {
    keyboard = {
      inline_keyboard: [
        [
          { text: '✅ ТАК', callback_data: `vote:${vote.id}:yes` },
          { text: '❌ НІ', callback_data: `vote:${vote.id}:no` },
        ],
        [
          { text: '⏭️ Утриматися', callback_data: `vote:${vote.id}:abstain` },
        ],
        [
          { text: '📖 Детальніше', url: `https://freepeople.org.ua/votes/${vote.id}` },
        ],
      ]
    };
  } else {
    keyboard = {
      inline_keyboard: [[
        { text: '🗳️ Голосувати', url: `https://freepeople.org.ua/votes/${vote.id}` },
      ]]
    };
  }

  await bot.api.sendMessage(
    telegramId,
    `🗳️ *Нове голосування*\n\n` +
    `*${vote.title}*\n\n` +
    `${vote.description.substring(0, 200)}...\n\n` +
    `📋 Тип: ${voteTypeLabel}\n` +
    `⏰ До: ${deadline}`,
    {
      parse_mode: 'Markdown',
      reply_markup: keyboard,
    }
  );
}

// Handle inline vote
bot.callbackQuery(/^vote:(.+):(yes|no|abstain)$/, async (ctx) => {
  const [, voteId, choice] = ctx.match;
  const user = await requireLinkedUser(ctx);
  if (!user) return;

  try {
    // Cast vote via API
    const response = await fetch(`${API_URL}/api/votes/${voteId}/cast`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await getServiceToken()}`,
      },
      body: JSON.stringify({
        userId: user.id,
        choice: choice === 'yes' ? true : choice === 'no' ? false : null,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return ctx.answerCallbackQuery({
        text: `❌ ${error.message}`,
        show_alert: true,
      });
    }

    // Update message to show vote cast
    await ctx.editMessageText(
      ctx.callbackQuery.message.text + `\n\n✅ *Ваш голос: ${getChoiceLabel(choice)}*`,
      { parse_mode: 'Markdown' }
    );

    await ctx.answerCallbackQuery({
      text: '✅ Голос зараховано!',
    });
  } catch (error) {
    await ctx.answerCallbackQuery({
      text: '❌ Помилка. Спробуйте на сайті.',
      show_alert: true,
    });
  }
});
```

---

## 9. Conversation Flows

### 9.1 Settings Flow

```
/settings
    │
    ▼
┌─────────────────────────────────────────┐
│ ⚙️ Налаштування                          │
│                                          │
│ 🔔 Сповіщення: ✅ Увімкнено              │
│                                          │
│ [🔕 Вимкнути сповіщення]                 │
│ [📋 Типи сповіщень]                      │
│ [🔗 Відв'язати акаунт]                   │
│ [🔙 Головне меню]                        │
└─────────────────────────────────────────┘
    │
    │ Click "Типи сповіщень"
    ▼
┌─────────────────────────────────────────┐
│ 📋 Типи сповіщень                        │
│                                          │
│ Оберіть, які сповіщення отримувати:      │
│                                          │
│ ☑️ Голосування                           │
│ ☑️ Події                                 │
│ ☑️ Завдання                              │
│ ☑️ Реферали                              │
│ ☐ Новини                                 │
│                                          │
│ [💾 Зберегти]  [🔙 Назад]                │
└─────────────────────────────────────────┘
```

### 9.2 Help Flow

```typescript
bot.command('help', async (ctx) => {
  const user = await getUserByTelegramId(ctx.from.id);

  let helpText = `📚 *Довідка*\n\n`;

  if (user) {
    helpText += `*Доступні команди:*\n\n` +
      `/mystats — Ваша статистика\n` +
      `/referrals — Список запрошених\n` +
      `/invite — Запросити друзів\n` +
      `/settings — Налаштування\n` +
      `/help — Ця довідка\n\n` +
      `*Швидкі дії:*\n` +
      `• Надішліть контакт — запросити друга\n` +
      `• Використайте @${BOT_USERNAME} в чаті — поділитися посиланням\n`;
  } else {
    helpText += `Щоб почати користуватися ботом, прив'яжіть акаунт:\n\n` +
      `/link — Прив'язати акаунт\n\n` +
      `Ще не зареєстровані?\n` +
      `👉 freepeople.org.ua/sign-up`;
  }

  helpText += `\n\n` +
    `💬 *Потрібна допомога?*\n` +
    `Зв'яжіться з підтримкою: @MerezhaSupportBot`;

  return ctx.reply(helpText, { parse_mode: 'Markdown' });
});
```

---

## 10. Inline Features

### 10.1 Inline Mode Configuration

```typescript
// Enable inline mode in BotFather:
// /setinline
// Placeholder: Пошук або запрошення...

bot.on('inline_query', async (ctx) => {
  const query = ctx.inlineQuery.query.trim().toLowerCase();
  const user = await getUserByTelegramId(ctx.from.id);

  const results: InlineQueryResult[] = [];

  // Always show invite option for linked users
  if (user) {
    results.push({
      type: 'article',
      id: 'invite',
      title: '📨 Запросити до Мережі',
      description: `Ваш код: ${user.referral_code}`,
      input_message_content: {
        message_text: generateInviteMessage(user),
        parse_mode: 'Markdown',
      },
      reply_markup: {
        inline_keyboard: [[
          {
            text: '✨ Приєднатися',
            url: `https://freepeople.org.ua/signup/${user.referral_code}`
          }
        ]]
      }
    });
  }

  // Search functionality (if query provided)
  if (query.length >= 2 && user) {
    // Could search votes, events, etc.
  }

  return ctx.answerInlineQuery(results, { cache_time: 0 });
});
```

---

## 11. Webhook Integration

### 11.1 Webhook Handler

```typescript
// src/app/api/telegram/webhook/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { Bot, webhookCallback } from 'grammy';
import { bot, setupHandlers } from '@/lib/telegram/bot';

// Initialize handlers once
setupHandlers(bot);

// Create webhook handler
const handleUpdate = webhookCallback(bot, 'std/http');

export async function POST(request: NextRequest) {
  // Verify webhook secret
  const secretHeader = request.headers.get('x-telegram-bot-api-secret-token');

  if (secretHeader !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    console.error('Invalid webhook secret');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Process update
    const response = await handleUpdate(request);
    return response;
  } catch (error) {
    console.error('Webhook error:', error);
    // Always return 200 to prevent Telegram retries
    return NextResponse.json({ ok: true });
  }
}

// Health check
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    bot: process.env.TELEGRAM_BOT_USERNAME
  });
}
```

### 11.2 Bot Instance

```typescript
// src/lib/telegram/bot.ts

import { Bot, Context, session } from 'grammy';
import {
  setupCommandHandlers,
  setupCallbackHandlers,
  setupMessageHandlers,
  setupInlineHandlers,
} from './handlers';

// Create bot instance
export const bot = new Bot<Context>(process.env.TELEGRAM_BOT_TOKEN!);

// Setup all handlers
export function setupHandlers(bot: Bot<Context>) {
  // Error handling
  bot.catch((err) => {
    console.error('Bot error:', err);
  });

  // Session middleware (for multi-step flows)
  bot.use(session({
    initial: () => ({
      step: null,
      data: {},
    }),
  }));

  // Register handlers
  setupCommandHandlers(bot);
  setupCallbackHandlers(bot);
  setupMessageHandlers(bot);
  setupInlineHandlers(bot);
}
```

---

## 12. Security Considerations

### 12.1 Webhook Security

```typescript
// Always verify the secret token
function verifyWebhook(request: NextRequest): boolean {
  const secret = request.headers.get('x-telegram-bot-api-secret-token');
  return secret === process.env.TELEGRAM_WEBHOOK_SECRET;
}
```

### 12.2 User Verification

```typescript
// Prevent impersonation by always checking telegram_id
async function requireLinkedUser(ctx: Context): Promise<User | null> {
  const user = await getUserByTelegramId(ctx.from?.id);

  if (!user) {
    await ctx.reply(
      '🔗 Спочатку прив\'яжіть свій акаунт:\n/link',
      { reply_markup: { remove_keyboard: true } }
    );
    return null;
  }

  return user;
}
```

### 12.3 Rate Limiting

```typescript
// Implement rate limiting for sensitive actions
const rateLimiter = new Map<number, number[]>();

function checkRateLimit(telegramId: number, action: string, limit: number, windowMs: number): boolean {
  const key = `${telegramId}:${action}`;
  const now = Date.now();
  const timestamps = rateLimiter.get(telegramId) || [];

  // Remove old timestamps
  const recent = timestamps.filter(t => now - t < windowMs);

  if (recent.length >= limit) {
    return false; // Rate limited
  }

  recent.push(now);
  rateLimiter.set(telegramId, recent);
  return true;
}

// Usage
bot.command('invite', async (ctx) => {
  if (!checkRateLimit(ctx.from.id, 'invite', 10, 60000)) {
    return ctx.reply('⏳ Занадто багато запитів. Зачекайте хвилину.');
  }
  // ... handle invite
});
```

### 12.4 Input Validation

```typescript
// Always sanitize and validate user input
function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML
    .substring(0, 1000);   // Limit length
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
}

function normalizePhoneNumber(phone: string): string {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');

  // Handle Ukrainian numbers
  if (digits.startsWith('380')) {
    return '+' + digits;
  }
  if (digits.startsWith('80') || digits.startsWith('0')) {
    return '+38' + digits.replace(/^8?0?/, '0');
  }

  return '+' + digits;
}
```

---

## 13. Localization

### 13.1 Message Templates

```typescript
// src/lib/telegram/messages.ts

export const messages = {
  // Welcome & Auth
  welcome: {
    guest: `🇺🇦 *Мережа Вільних Людей*\n\n` +
           `Вітаємо у офіційному боті Мережі!\n\n` +
           `Щоб почати, прив'яжіть свій акаунт:`,

    linked: (name: string) =>
           `👋 Вітаємо, ${name}!\n\nОберіть дію:`,
  },

  // Linking
  link: {
    prompt: `🔗 *Прив'язка акаунту*\n\n` +
            `Оберіть спосіб прив'язки:`,

    emailPrompt: `📧 Введіть email, вказаний при реєстрації:`,

    codeSent: (email: string) =>
              `📧 Код підтвердження надіслано на ${email}\n\n` +
              `Введіть 6-значний код:`,

    success: `✅ Акаунт успішно прив'язано!\n\n` +
             `Тепер ви можете:\n` +
             `📨 /invite — Запросити друзів\n` +
             `📊 /mystats — Переглянути статистику`,

    alreadyLinked: `⚠️ Ваш Telegram вже прив'язано до акаунту.`,

    notFound: `❌ Користувача не знайдено.\n\n` +
              `Переконайтесь, що ви зареєстровані на freepeople.org.ua`,

    invalidCode: `❌ Невірний код. Спробуйте ще раз.`,

    expiredCode: `❌ Код прострочений. Почніть спочатку: /link`,
  },

  // Invitations
  invite: {
    menu: (code: string, count: number) =>
          `📨 *Запрошення друзів*\n\n` +
          `Ваш код: \`${code}\`\n` +
          `Запрошено: ${count} осіб\n\n` +
          `Оберіть спосіб:`,

    contactPrompt: `📱 *Запрошення з контактів*\n\n` +
                   `Надішліть контакти друзів для запрошення.\n\n` +
                   `💡 Ви можете надіслати декілька контактів.`,

    sent: (name: string) => `✅ Запрошення надіслано для ${name}!`,

    alreadyMember: (name: string) => `ℹ️ ${name} вже є учасником Мережі!`,

    alreadyInvited: (name: string) => `ℹ️ Ви вже надсилали запрошення для ${name}`,

    noTelegram: (name: string) =>
                `📱 ${name} не має Telegram.\n` +
                `Поділіться посиланням вручну.`,

    done: (todayCount: number, totalCount: number) =>
          `✅ *Запрошення завершено*\n\n` +
          `📊 Сьогодні: ${todayCount}\n` +
          `👥 Всього: ${totalCount}\n\n` +
          `💡 +25 балів за кожного нового учасника!`,
  },

  // Notifications
  notifications: {
    newVote: `🗳️ *Нове голосування*`,
    newEvent: `📅 *Нова подія*`,
    eventReminder: `⏰ *Нагадування*`,
    newTask: `✅ *Нове завдання*`,
    referralJoined: (name: string) => `🎉 ${name} приєднався за вашим запрошенням!`,
    pointsEarned: (points: number) => `✨ Вам нараховано +${points} балів`,
  },

  // Errors
  errors: {
    generic: `❌ Виникла помилка. Спробуйте пізніше.`,
    notLinked: `🔗 Спочатку прив'яжіть акаунт: /link`,
    rateLimit: `⏳ Занадто багато запитів. Зачекайте.`,
    maintenance: `🔧 Бот на технічному обслуговуванні.`,
  },

  // Buttons
  buttons: {
    linkAccount: '🔗 Прив\'язати акаунт',
    register: '📝 Зареєструватися',
    invite: '📨 Запросити друзів',
    myStats: '📊 Моя статистика',
    referrals: '👥 Мої запрошення',
    settings: '⚙️ Налаштування',
    help: '❓ Довідка',
    back: '🔙 Назад',
    mainMenu: '🏠 Головне меню',
    done: '✅ Готово',
    cancel: '❌ Скасувати',
  },
};
```

### 13.2 Keyboard Builders

```typescript
// src/lib/telegram/keyboards.ts

import { InlineKeyboard, Keyboard } from 'grammy';
import { messages } from './messages';

export const mainMenuKeyboard = new InlineKeyboard()
  .text(messages.buttons.invite, 'invite_menu').row()
  .text(messages.buttons.myStats, 'my_stats')
  .text(messages.buttons.referrals, 'my_referrals').row()
  .text(messages.buttons.settings, 'settings')
  .text(messages.buttons.help, 'help');

export const linkMethodKeyboard = new InlineKeyboard()
  .text('📧 За Email', 'link_email').row()
  .text('📱 За телефоном', 'link_phone').row()
  .text('🔑 За кодом', 'link_code');

export const inviteMethodKeyboard = new InlineKeyboard()
  .text('📱 З контактів', 'invite_from_contacts')
  .text('📤 Переслати', 'invite_share_link').row()
  .text('📋 Копіювати', 'invite_copy_link')
  .text('🔗 QR-код', 'invite_qr').row()
  .text(messages.buttons.back, 'main_menu');

export const contactSharingKeyboard = new Keyboard()
  .requestContact('📱 Поділитися контактом').row()
  .text(messages.buttons.done).row()
  .text(messages.buttons.cancel)
  .resized();
```

---

## 14. Error Handling

### 14.1 Error Types

```typescript
// src/lib/telegram/errors.ts

export class BotError extends Error {
  constructor(
    message: string,
    public code: string,
    public userMessage: string
  ) {
    super(message);
  }
}

export const BotErrors = {
  NOT_LINKED: new BotError(
    'User not linked',
    'NOT_LINKED',
    messages.errors.notLinked
  ),

  RATE_LIMITED: new BotError(
    'Rate limited',
    'RATE_LIMITED',
    messages.errors.rateLimit
  ),

  USER_NOT_FOUND: new BotError(
    'User not found in database',
    'USER_NOT_FOUND',
    messages.link.notFound
  ),
};
```

### 14.2 Global Error Handler

```typescript
bot.catch((err) => {
  const ctx = err.ctx;
  const error = err.error;

  console.error('Bot error:', {
    update_id: ctx.update.update_id,
    error: error instanceof Error ? error.message : error,
    user: ctx.from?.id,
  });

  // Send user-friendly message
  if (error instanceof BotError) {
    ctx.reply(error.userMessage).catch(() => {});
  } else {
    ctx.reply(messages.errors.generic).catch(() => {});
  }

  // Report to monitoring
  captureException(error, {
    extra: {
      update: ctx.update,
      user: ctx.from,
    },
  });
});
```

### 14.3 Handle Telegram API Errors

```typescript
async function handleTelegramError(telegramId: number, error: any) {
  const errorCode = error?.error_code;

  switch (errorCode) {
    case 403:
      // User blocked the bot
      await supabase
        .from('users')
        .update({
          telegram_notifications_enabled: false,
          // Optionally: telegram_id: null to fully unlink
        })
        .eq('telegram_id', telegramId);
      break;

    case 400:
      if (error.description?.includes('chat not found')) {
        // User deleted their account
        await supabase
          .from('users')
          .update({ telegram_id: null })
          .eq('telegram_id', telegramId);
      }
      break;

    case 429:
      // Rate limited - implement backoff
      console.warn('Telegram rate limit hit');
      break;
  }
}
```

---

## 15. Deployment

### 15.1 Environment Setup

```bash
# Production environment variables
TELEGRAM_BOT_TOKEN=your-production-bot-token
TELEGRAM_BOT_USERNAME=MerezhaVilnykhBot
TELEGRAM_WEBHOOK_URL=https://freepeople.org.ua/api/telegram/webhook
TELEGRAM_WEBHOOK_SECRET=$(openssl rand -hex 32)
```

### 15.2 Webhook Registration Script

```typescript
// scripts/setup-telegram-webhook.ts

async function setupWebhook() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const webhookUrl = process.env.TELEGRAM_WEBHOOK_URL;
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;

  const response = await fetch(
    `https://api.telegram.org/bot${token}/setWebhook`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: webhookUrl,
        secret_token: secret,
        allowed_updates: [
          'message',
          'callback_query',
          'inline_query',
          'my_chat_member',
        ],
        drop_pending_updates: true,
      }),
    }
  );

  const result = await response.json();
  console.log('Webhook setup result:', result);
}

setupWebhook();
```

### 15.3 Vercel Configuration

```json
// vercel.json
{
  "functions": {
    "src/app/api/telegram/webhook/route.ts": {
      "maxDuration": 30
    }
  }
}
```

### 15.4 Health Monitoring

```typescript
// Cron job to check bot health
// src/app/api/cron/telegram-health/route.ts

export async function GET() {
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getMe`
    );
    const data = await response.json();

    if (!data.ok) {
      throw new Error('Bot API error');
    }

    // Check webhook status
    const webhookInfo = await fetch(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getWebhookInfo`
    ).then(r => r.json());

    return Response.json({
      status: 'healthy',
      bot: data.result.username,
      webhook: {
        url: webhookInfo.result.url,
        pending_count: webhookInfo.result.pending_update_count,
        last_error: webhookInfo.result.last_error_message,
      },
    });
  } catch (error) {
    return Response.json({ status: 'unhealthy', error }, { status: 500 });
  }
}
```

---

## API Base URL

```
Production: https://freepeople.org.ua/api/telegram
Bot Username: @MerezhaVilnykhBot
```

---

## Quick Reference

### Commands

| Command | Description |
|---------|-------------|
| `/start` | Start bot / main menu |
| `/link` | Link Telegram account |
| `/invite` | Invite friends |
| `/mystats` | View statistics |
| `/referrals` | View referral list |
| `/settings` | Notification settings |
| `/help` | Help information |

### Callback Patterns

| Pattern | Action |
|---------|--------|
| `link_*` | Account linking flows |
| `invite_*` | Invitation methods |
| `vote:ID:CHOICE` | Inline voting |
| `settings_*` | Settings toggles |

### Database Tables

| Table | Purpose |
|-------|---------|
| `users` | Extended with telegram_* columns |
| `telegram_invitations` | Track sent invitations |
| `notification_recipients` | Track Telegram delivery |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Dec 2025 | Initial specification |

---

*"Гуртуємось, щоб впливати!"*
