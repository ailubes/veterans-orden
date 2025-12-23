# 🚀 Мережа Вільних Людей - Claude Code Orchestration

A specialized agent orchestration system for building the Мережа Вільних Людей platform with Claude Code.

Based on [claude-code-agents-wizard-v2](https://github.com/IncomeStreamSurfer/claude-code-agents-wizard-v2), customized for this project.

## 🎯 What Is This?

This orchestration system transforms Claude Code into a coordinated development team:

| Agent | Role | Context |
|-------|------|---------|
| 🧠 **Claude** | Orchestrator (200k context) | Big picture, todos, delegation |
| ✍️ **@coder** | Implements features | Fresh context per task |
| 👁️ **@tester** | Verifies with Playwright | Fresh context per test |
| 🆘 **@stuck** | Human escalation | Fresh context per problem |

## ⚡ Key Features

- **No Fallbacks**: Problems go to humans, not workarounds
- **Visual Testing**: Playwright screenshots verify every implementation
- **Todo Tracking**: Always know exactly where the project stands
- **Human Control**: @stuck agent ensures you're in the loop
- **Design Compliance**: Timber design system enforced

## 🚀 Quick Start

### Prerequisites

1. **Claude Code CLI** installed
2. **Node.js** 18+ 
3. **PostgreSQL** database (Neon/Supabase)
4. **Clerk** account for auth
5. **Convex** account for real-time
6. **LiqPay** account for payments

### Installation

```bash
# Clone this repository
git clone https://github.com/your-org/merezha.git
cd merezha

# Copy documentation
cp -r docs/ ./docs/
cp -r assets/ ./assets/

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# Start Claude Code
claude
```

### First Command

Tell Claude:

```
Read the docs in order: 
1. docs/TECHNICAL_SPEC.md 
2. docs/DATABASE_SCHEMA.md 
3. docs/USER_FLOWS.md 
4. docs/DESIGN_GUIDE.md

Then create the Phase 1 todos and start building.
```

## 📖 How It Works

### The Workflow

```
YOU: "Build the homepage"
    ↓
CLAUDE: Creates detailed todos using TodoWrite
    ↓
CLAUDE: Invokes @coder for todo #1
    ↓
CODER (fresh context): Implements feature
    ↓
    ├─→ Problem? → Invokes @stuck → You decide → Continue
    ↓
CODER: Reports completion
    ↓
CLAUDE: Invokes @tester
    ↓
TESTER (fresh context): Playwright screenshots + tests
    ↓
    ├─→ Test fails? → Invokes @stuck → You decide → Continue
    ↓
TESTER: Reports success
    ↓
CLAUDE: Marks todo complete, moves to next
    ↓
Repeat until all todos done ✅
```

### The "No Fallbacks" Rule

```
Traditional AI: Hits error → tries workaround → might fail silently

This system: Hits error → asks YOU → you decide → proceeds correctly
```

Every agent is **hardwired** to invoke @stuck rather than guess.

## 📁 Project Structure

```
merezha/
├── .claude/
│   ├── CLAUDE.md              # Orchestrator instructions
│   └── agents/
│       ├── coder.md           # Coder subagent
│       ├── tester.md          # Tester subagent
│       └── stuck.md           # Human escalation
├── .mcp.json                  # Playwright MCP config
├── docs/
│   ├── PRD_merezha.md        # Product requirements
│   ├── TECHNICAL_SPEC.md      # Technical architecture
│   ├── DATABASE_SCHEMA.md     # Database design
│   ├── USER_FLOWS.md          # User journeys
│   └── DESIGN_GUIDE.md        # Timber design system
├── assets/
│   └── merezha-timber-design.jsx  # Reference UI
├── src/
│   ├── app/                   # Next.js pages
│   ├── components/            # UI components
│   ├── lib/                   # Utilities
│   └── hooks/                 # React hooks
├── convex/                    # Real-time backend
└── public/                    # Static assets
```

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Auth | Clerk |
| Real-time | Convex |
| Database | PostgreSQL (Drizzle) |
| Payments | LiqPay |
| Testing | Playwright |

## 📋 Documentation Reference

| Document | Purpose |
|----------|---------|
| `TECHNICAL_SPEC.md` | Stack, dependencies, environment, API routes |
| `DATABASE_SCHEMA.md` | 16 PostgreSQL tables, Drizzle schema, relations |
| `USER_FLOWS.md` | Registration, voting, payments, admin workflows |
| `DESIGN_GUIDE.md` | Timber design: colors, typography, components |
| `PRD_merezha.md` | Complete product requirements, roadmap |

## 🎨 Design System: Structural Timber

```css
/* Colors */
--canvas: #f4f1eb;       /* Background */
--timber-dark: #2c2824;  /* Primary text */
--timber-beam: #4a4238;  /* Secondary dark */
--accent: #d45d3a;       /* CTAs, highlights */
--grain: #e8e2d6;        /* Text on dark */

/* Fonts */
font-family: 'Syne', sans-serif;      /* Headlines */
font-family: 'Space Mono', monospace;  /* Body */
```

## 💡 Example Session

```
You: "Build the homepage hero section"

Claude creates todos:
  [ ] Create SkeletonGrid component
  [ ] Add GrainOverlay SVG filter
  [ ] Build Navigation component
  [ ] Create Hero section with counter
  [ ] Add floating timber element

Claude invokes @coder(todo #1: "Create SkeletonGrid")

Coder: Creates src/components/layout/skeleton-grid.tsx
Coder: Reports completion

Claude invokes @tester("Verify SkeletonGrid renders")

Tester: Navigates to localhost:3000
Tester: Takes screenshot
Tester: Verifies 5-column grid visible
Tester: Reports success

Claude: Marks todo #1 complete ✓

Claude invokes @coder(todo #2: "Add GrainOverlay")
... and so on
```

## 🆘 When @stuck Is Invoked

```
🆘 HUMAN DECISION REQUIRED

CONTEXT:
@coder is setting up LiqPay integration

PROBLEM:
Missing LIQPAY_PRIVATE_KEY in environment

OPTIONS:
1. Provide the LiqPay private key now
2. Use sandbox/test credentials
3. Skip payment setup for now
4. Other (please specify)

⏳ Waiting for your decision...
```

You respond, and development continues.

## 🔧 Commands Reference

```bash
# Development
npm run dev              # Start Next.js
npx convex dev          # Start Convex

# Database
npm run db:generate     # Generate migrations
npm run db:push         # Apply schema
npm run db:studio       # Open Drizzle Studio
npm run db:seed         # Seed data

# Testing
npx playwright test     # Run E2E tests

# Build
npm run build           # Production build
npm run lint            # Lint code
```

## 📝 Phase 1 Checklist

```
SETUP:
[ ] Initialize Next.js 14 with TypeScript
[ ] Configure Tailwind + Timber tokens
[ ] Set up Drizzle + PostgreSQL
[ ] Initialize Convex

AUTH:
[ ] Configure Clerk
[ ] Create auth pages
[ ] Set up webhooks
[ ] Implement middleware

PAGES:
[ ] Homepage with Timber design
[ ] Animated member counter
[ ] Hero section
[ ] Frameworks cards
[ ] Stats strip
[ ] News section
[ ] Footer

COMPONENTS:
[ ] Button (primary, outline)
[ ] Card (light, dark, joints)
[ ] Navigation
[ ] SkeletonGrid
[ ] GrainOverlay
[ ] AnimatedCounter
```

## 🔥 Pro Tips

1. **Trust the process** — Let Claude manage todos
2. **Review screenshots** — Visual proof of every change
3. **Make decisions fast** — @stuck needs your input
4. **Check the docs** — Everything is documented
5. **Run tests often** — Catch issues early

## 🤝 Contributing

This is a private project for Мережа Вільних Людей.

## 📜 License

Proprietary - All rights reserved.

---

**Ready to build?** Run `claude` in this directory and tell it:

> "Read all docs and create the Phase 1 todos. Let's build Мережа Вільних Людей!"

🚀

*"ГУРТУЄМОСЬ, ЩОБ ВПЛИВАТИ!"*
