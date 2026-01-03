# Наступні кроки розробки - Орден Ветеранів

Цей документ містить детальні інструкції для продовження розробки платформи Order of Veterans.

---

## 📊 Поточний статус

### ✅ Завершено (Фаза 1)

Система конфігурації та адаптери повністю готові:
- Конфігурація організації, теми, регіонів, платежів, функцій
- Адаптери для контенту, тем, регіонів, платежів
- Брутальна CSS-тема
- Оновлено Tailwind та globals.css

###

 📋 Необхідно виконати (Фаза 2-4)

---

## Фаза 2: Оновлення компонентів (6-8 годин)

### 2.1. Оновити Layout (src/app/layout.tsx)

**Файл:** `/src/app/layout.tsx` (lines 5-56)

**Що робити:**
```typescript
import { ContentAdapter } from '@/lib/content/ContentAdapter';
import { ThemeProvider } from '@/lib/themes/ThemeProvider';

export const metadata: Metadata = {
  title: ContentAdapter.getOrgName('full'),
  description: ContentAdapter.getMission('description'),
  keywords: [/* додайте ключові слова для SEO */],
  openGraph: {
    title: ContentAdapter.getOrgName('full'),
    description: ContentAdapter.getMission('description'),
    url: ContentAdapter.getDomain(),
    siteName: ContentAdapter.getOrgName('short'),
    // ... інші OG теги
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk">
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### 2.2. Оновити Navigation (src/components/layout/navigation.tsx)

**Файл:** `/src/components/layout/navigation.tsx`

**Що робити:**
```typescript
import { ContentAdapter } from '@/lib/content/ContentAdapter';

export function Navigation() {
  const navLinks = ContentAdapter.getNavigation();
  const orgName = ContentAdapter.getOrgName('short');

  return (
    <nav>
      <Logo />
      {navLinks.map((link) => (
        <Link key={link.href} href={link.href}>
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
```

### 2.3. Оновити Footer (src/components/layout/footer.tsx)

**Файл:** `/src/components/layout/footer.tsx`

**Що робити:**
```typescript
import { ContentAdapter } from '@/lib/content/ContentAdapter';

export function Footer() {
  const social = ContentAdapter.getSocialLinks();
  const orgName = ContentAdapter.getOrgName('full');
  const legal = ContentAdapter.getLegal();

  return (
    <footer>
      <p>© {legal.registrationYear} {orgName}</p>
      <div>
        {social.telegram && <a href={social.telegram}>Telegram</a>}
        {social.facebook && <a href={social.facebook}>Facebook</a>}
        {/* ... інші соцмережі */}
      </div>
    </footer>
  );
}
```

### 2.4. Оновити Hero (src/components/sections/hero.tsx)

**Файл:** `/src/components/sections/hero.tsx`

**Що робити:**
```typescript
import { ContentAdapter } from '@/lib/content/ContentAdapter';

export function Hero() {
  const tagline = ContentAdapter.getMission('tagline');
  const statement = ContentAdapter.getMission('statement');
  const memberGoal = ContentAdapter.getMemberGoal();
  const milestones = ContentAdapter.getMilestones();

  return (
    <section className="hero">
      <h1>{tagline}</h1>
      <p>{statement}</p>
      <div className="milestones">
        {milestones.map((m) => (
          <div key={m.target}>
            <span>{m.target.toLocaleString('uk-UA')}</span>
            <span>{m.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
```

---

## Фаза 3: TinaCMS Integration (8-10 годин)

### 3.1. Встановити залежності

```bash
npm install tinacms @tinacms/cli
```

### 3.2. Створити TinaCMS конфігурацію

**Створити:** `.tina/config.ts`

```typescript
import { defineConfig } from "tinacms";

export default defineConfig({
  branch: "main",
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID,
  token: process.env.TINA_TOKEN,
  build: {
    outputFolder: "admin",
    publicFolder: "public",
  },
  media: {
    tina: {
      mediaRoot: "uploads",
      publicFolder: "public",
    },
  },
  schema: {
    collections: [
      {
        name: "news",
        label: "Новини",
        path: "content/news",
        format: "mdx",
        fields: [
          { type: "string", name: "title", label: "Заголовок", required: true },
          { type: "string", name: "excerpt", label: "Опис", ui: { component: "textarea" } },
          { type: "datetime", name: "publishedAt", label: "Дата публікації" },
          { type: "image", name: "coverImage", label: "Зображення" },
          { type: "string", name: "author", label: "Автор" },
          { type: "string", name: "category", label: "Категорія",
            options: ["announcement", "update", "success_story", "media"] },
          { type: "rich-text", name: "body", label: "Контент", isBody: true },
        ],
      },
      {
        name: "pages",
        label: "Сторінки",
        path: "content/pages",
        format: "mdx",
        fields: [
          { type: "string", name: "title", label: "Заголовок", required: true },
          { type: "string", name: "description", label: "Опис" },
          { type: "rich-text", name: "body", label: "Контент", isBody: true },
        ],
      },
      {
        name: "settings",
        label: "Налаштування",
        path: "content/settings",
        format: "json",
        ui: { allowedActions: { create: false, delete: false } },
        fields: [
          { type: "string", name: "siteName", label: "Назва сайту" },
          { type: "string", name: "tagline", label: "Гасло" },
          { type: "string", name: "mission", label: "Місія", ui: { component: "textarea" } },
          { type: "number", name: "memberGoal", label: "Ціль членів" },
          {
            type: "object",
            name: "navigation",
            label: "Навігація",
            list: true,
            fields: [
              { type: "string", name: "label", label: "Назва" },
              { type: "string", name: "href", label: "Посилання" },
            ],
          },
          {
            type: "object",
            name: "social",
            label: "Соцмережі",
            fields: [
              { type: "string", name: "telegram", label: "Telegram" },
              { type: "string", name: "facebook", label: "Facebook" },
              { type: "string", name: "instagram", label: "Instagram" },
              { type: "string", name: "youtube", label: "YouTube" },
            ],
          },
        ],
      },
    ],
  },
});
```

### 3.3. Створити директорії контенту

```bash
mkdir -p content/news
mkdir -p content/pages
mkdir -p content/events
mkdir -p content/settings
```

### 3.4. Створити початковий файл налаштувань

**Створити:** `content/settings/site.json`

```json
{
  "siteName": "Орден Ветеранів",
  "tagline": "МІЦНІСТЬ, ЯКА НЕ ТРІСКАЄ",
  "mission": "Об'єднуємо ветеранів у братерство честі та дії",
  "memberGoal": 10000,
  "navigation": [
    { "label": "ПРО ОРДЕН", "href": "/about" },
    { "label": "НАПРЯМИ", "href": "/directions" },
    { "label": "ПОДІЇ", "href": "/events" },
    { "label": "НОВИНИ", "href": "/news" }
  ],
  "social": {
    "telegram": "",
    "facebook": "",
    "instagram": "",
    "youtube": ""
  }
}
```

### 3.5. Оновити ContentAdapter для читання з Tina

**Оновити:** `/src/lib/content/ContentAdapter.ts`

```typescript
import { organizationConfig } from '@/../../config/organization.config';

// Можна також читати з TinaCMS:
// import siteSettings from '@/../../content/settings/site.json';

export class ContentAdapter {
  // Залишити як є, або змінити на:
  static getOrgName(variant: 'full' | 'short' | 'english' = 'full'): string {
    // return siteSettings.siteName; // З TinaCMS
    return organizationConfig.name[variant]; // З конфігу
  }

  // ... інші методи
}
```

### 3.6. Додати Tina Provider

**Створити:** `/src/lib/tina/TinaProvider.tsx`

```typescript
'use client';

import { TinaProvider as TinaProviderBase } from 'tinacms';

export function TinaProvider({ children }: { children: React.ReactNode }) {
  return <TinaProviderBase>{children}</TinaProviderBase>;
}
```

**Оновити:** `/src/app/layout.tsx`

```typescript
import { TinaProvider } from '@/lib/tina/TinaProvider';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ThemeProvider>
          <TinaProvider>
            {children}
          </TinaProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### 3.7. Створити admin маршрут

**Створити:** `/src/app/admin/tina/page.tsx`

```typescript
'use client';

import { TinaAdmin } from 'tinacms';

export default function AdminPage() {
  return <TinaAdmin />;
}
```

### 3.8. Оновити package.json scripts

```json
{
  "scripts": {
    "dev": "tinacms dev -c \"next dev\"",
    "build": "tinacms build && next build",
    "start": "next start",
    "tina:build": "tinacms build"
  }
}
```

---

## Фаза 4: Database Schema (4-6 годин)

### 4.1. Оновити schema.ts для commanderies

**Файл:** `/src/lib/db/schema.ts` (біля line 317)

**Що робити:**

1. Створити нову таблицю `commanderies`:

```typescript
import { regionalConfig } from '@/../../config/regional.config';

export const commanderies = pgTable(regionalConfig.tableName, {
  id: uuid('id').primaryKey().defaultRandom(),
  code: varchar('code', { length: 20 }).notNull().unique(),
  name: varchar('name', { length: 100 }).notNull(),
  type: varchar('type', { length: 20 }).notNull(), // 'commandery' or 'city'
  parent: varchar('parent', { length: 20 }), // parent commandery code
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
```

2. Оновити поле в таблиці `users`:

```typescript
export const users = pgTable('users', {
  // ... існуючі поля
  commanderyId: uuid('commandery_id').references(() => commanderies.id),
  // або видалити oblastId якщо він був
});
```

3. Аналогічно для `groups` та інших таблиць з регіональною прив'язкою.

### 4.2. Створити seed script для commanderies

**Створити:** `/scripts/seed-commanderies.ts`

```typescript
import { db } from '@/lib/db';
import { commanderies } from '@/lib/db/schema';
import { regionalConfig } from '@/../../config/regional.config';

async function seedCommanderies() {
  console.log('Seeding commanderies...');

  for (const unit of regionalConfig.units) {
    await db.insert(commanderies).values({
      code: unit.code,
      name: unit.name,
      type: unit.type,
      parent: unit.parent,
    }).onConflictDoNothing();
  }

  console.log('✅ Commanderies seeded successfully');
}

seedCommanderies().catch(console.error);
```

**Запустити:**
```bash
npx tsx scripts/seed-commanderies.ts
```

---

## Фаза 5: Environment Variables (1 година)

### 5.1. Створити .env.local

**Створити:** `.env.local`

```bash
# App
NEXT_PUBLIC_APP_NAME="Орден Ветеранів"
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database - Supabase
DATABASE_URL=postgresql://[USER]:[PASSWORD]@[HOST]:[PORT]/[DATABASE]
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# VST Bank Payments (додати коли отримаєте credentials)
VSTBANK_MERCHANT_ID=
VSTBANK_API_KEY=
VSTBANK_SECRET_KEY=
VSTBANK_WEBHOOK_SECRET=
VSTBANK_API_URL=

# TinaCMS
NEXT_PUBLIC_TINA_CLIENT_ID=
TINA_TOKEN=

# Email (налаштувати пізніше)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=info@veterans-orden.org

# Storage (S3 або R2)
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=eu-north-1
AWS_S3_BUCKET=veterans-uploads

# Analytics
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Sentry
SENTRY_DSN=
```

### 5.2. Створити .env.example

Копіюйте `.env.local` але видаліть значення:

```bash
cp .env.local .env.example
# Відредагуйте .env.example - видаліть реальні значення
```

---

## Фаза 6: Logo & Assets (1-2 години)

### 6.1. Додати логотип

**Додати файл:** `logo-veterans-orden.png` до `/public/`

### 6.2. Оновити Logo component

**Файл:** `/src/components/ui/logo.tsx`

```typescript
import Image from 'next/image';

export function Logo() {
  return (
    <Image
      src="/logo-veterans-orden.png"
      alt="Орден Ветеранів"
      width={120}
      height={40}
    />
  );
}
```

### 6.3. Згенерувати favicons

Використайте онлайн-сервіс (напр. https://realfavicongenerator.net/):
- Завантажте `logo-veterans-orden.png`
- Згенеруйте набір іконок
- Розмістіть у `/public/`

---

## Фаза 7: Testing & Build (2-3 години)

### 7.1. Перевірити TypeScript помилки

```bash
npm run type-check
# або
npx tsc --noEmit
```

**Виправити помилки** якщо є.

### 7.2. Тест build

```bash
npm run build
```

**Виправити помилки компіляції** якщо є.

### 7.3. Локальний тест

```bash
npm run dev
```

Відкрийте http://localhost:3000 та перевірте:
- ✅ Брутальна тема застосована
- ✅ Навігація показує правильні посилання
- ✅ Footer показує правильну інформацію
- ✅ Hero показує "МІЦНІСТЬ, ЯКА НЕ ТРІСКАЄ"
- ✅ Немає console errors

---

## Фаза 8: Deployment (2-4 години)

### 8.1. Netlify Setup (Staging)

1. Зайдіть на https://app.netlify.com/
2. "Add new site" → "Import an existing project"
3. Підключіть GitHub repo: `ailubes/veterans-orden`
4. Build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
5. Environment variables: додайте всі з `.env.local`
6. Deploy!

**Staging URL:** `https://veterans-orden.netlify.app`

### 8.2. Custom Domain (Netlify)

1. Domain settings → Add custom domain
2. Додайте `veterans-orden.org`
3. Configure DNS:
   - A record: `75.2.60.5`
   - AAAA record: `2600:1f18:26ad:bd00:f19d:29c5:521:ec5e`
4. SSL certificate (автоматично)

### 8.3. Production (Self-hosted) - Опційно

Див. детальні інструкції в плані (`/home/lubes/.claude/plans/mossy-snuggling-stroustrup.md`) розділ "Step 3.12"

---

## Checklist перед деплоєм

- [ ] Всі компоненти оновлені (layout, navigation, footer, hero)
- [ ] TinaCMS встановлено та налаштовано
- [ ] Database schema оновлено (commanderies table)
- [ ] Commanderies засіяно (seed script)
- [ ] .env.local створено з усіма необхідними змінними
- [ ] Logo додано
- [ ] `npm run build` працює без помилок
- [ ] Локально перевірено на http://localhost:3000
- [ ] Git committed & pushed
- [ ] Netlify налаштовано
- [ ] Custom domain підключено

---

## Troubleshooting

### Помилки TypeScript після оновлення

**Проблема:** `Cannot find module '@/../../config/organization.config'`

**Рішення:** Перевірте `tsconfig.json` paths:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### CSS не застосовується

**Проблема:** Brutalist theme не відображається

**Рішення:**
1. Перевірте `globals.css` - чи є `@import '../styles/themes/_brutalist.css';`
2. Перевірте ThemeProvider обгортає додаток
3. Перезапустіть dev server

### TinaCMS не працює

**Проблема:** `/admin/tina` показує 404

**Рішення:**
1. Перевірте чи встановлено `tinacms` та `@tinacms/cli`
2. Перевірте чи є `.tina/config.ts`
3. Запустіть через `tinacms dev -c "next dev"`

---

## Додаткові ресурси

- **TinaCMS Docs:** https://tina.io/docs/
- **Tailwind CSS:** https://tailwindcss.com/docs
- **Supabase Docs:** https://supabase.com/docs
- **Netlify Docs:** https://docs.netlify.com/

---

## Питання?

Якщо щось незрозуміло, перегляньте:
1. Цей файл (NEXT_STEPS.md)
2. План розробки: `/home/lubes/.claude/plans/mossy-snuggling-stroustrup.md`
3. Existing documentation in `/docs/`

**Успіхів у розробці! 💪**

МІЦНІСТЬ, ЯКА НЕ ТРІСКАЄ
