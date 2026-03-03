# Repository Guidelines

## Project Structure & Module Organization
This repository contains a Next.js web app and an Expo mobile app.

- `src/app/`: Next.js App Router pages and API routes (`src/app/api/**/route.ts`).
- `src/components/`, `src/lib/`, `src/hooks/`, `src/types/`: shared UI, business logic, utilities, and types.
- `config/`: organization/theme/feature configuration.
- `content/pages/`: MDX content pages.
- `supabase/migrations/`: SQL migrations (timestamped files).
- `__tests__/`: API and integration tests.
- `mobile/`: Expo Router mobile client with its own `package.json`.
- `public/`, `assets/`, `docs/`: static files, design assets, and docs.

## Build, Test, and Development Commands
Web app (repo root):

- `npm run dev`: run Next.js locally on port `3030`.
- `npm run build`: production build.
- `npm run start`: run built app.
- `npm run lint`: run Next.js ESLint checks.
- `npm run db:generate | db:push | db:studio`: Drizzle schema workflow.
- `npm run db:seed`: seed database data.

Mobile app (`mobile/`):

- `npm run start`, `npm run android`, `npm run ios`, `npm run web`: Expo development.
- `npm run lint`: Expo linting.

Tests:

- `npx vitest __tests__/api/*.test.ts`: run API unit tests.
- `npx tsx __tests__/integration/live-api-tests.ts`: run live endpoint checks.

## Coding Style & Naming Conventions
- Language: TypeScript (`strict: true`), React function components.
- Indentation: 2 spaces; keep existing quote style and semicolon usage per file.
- Use path aliases: `@/*` and `@config/*`.
- File naming: kebab-case for component/util files (for example, `role-journey.tsx`); Next route files must use `page.tsx` and `route.ts`.
- Linting/formatting: `next lint`, ESLint (`next/core-web-vitals`, `next/typescript`), Prettier (+ `prettier-plugin-tailwindcss`).

## Testing Guidelines
- Prefer Vitest for fast API logic/validation tests under `__tests__/api/`.
- Name tests `*.test.ts` and group with clear `describe()` blocks by endpoint/feature.
- Keep live integration checks in `__tests__/integration/` and avoid running them in normal CI unless explicitly needed.
- No enforced coverage threshold is currently configured; add tests for any new API route or critical logic path.

## Commit & Pull Request Guidelines
- Follow Conventional Commit style used in history: `fix: ...`, `style: ...`, `feat: ...` (imperative, concise).
- One logical change per commit; include migration/config updates in the same PR when behavior depends on them.
- PRs should include:
  - clear summary and scope,
  - linked issue/task,
  - verification steps (commands run),
  - screenshots/video for UI changes (web and/or mobile),
  - notes on environment variables, migrations, or deployment impact.
