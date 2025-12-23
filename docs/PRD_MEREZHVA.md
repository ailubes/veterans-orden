# Product Requirements Document (PRD)
## МЕРЕЖА ВІЛЬНИХ ЛЮДЕЙ — Digital Platform

**Version:** 1.0  
**Date:** December 2024  
**Author:** Product Team  
**Status:** Draft

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Product Vision](#2-product-vision)
3. [Goals & Success Metrics](#3-goals--success-metrics)
4. [User Personas & Roles](#4-user-personas--roles)
5. [Technical Architecture](#5-technical-architecture)
6. [Feature Specifications](#6-feature-specifications)
7. [Public Website](#7-public-website)
8. [Member Dashboard](#8-member-dashboard)
9. [Admin Dashboard](#9-admin-dashboard)
10. [Mobile Application](#10-mobile-application)
11. [Security & Compliance](#11-security--compliance)
12. [Integrations](#12-integrations)
13. [Roadmap & Phases](#13-roadmap--phases)
14. [Appendix](#14-appendix)

---

## 1. Executive Summary

### 1.1 Overview

**Мережа Вільних Людей** (Network of Free People) is a Ukrainian civic political action network with the mission to unite 1,000,000 citizens to influence political processes democratically. This PRD outlines the requirements for a comprehensive digital platform consisting of:

- **Public Website** — Marketing, information, and member acquisition
- **Member Portal** — Dashboard, voting, tasks, events, communication
- **Admin System** — Management, analytics, content administration
- **Mobile Application** — iOS & Android apps for on-the-go engagement

### 1.2 Problem Statement

Current challenges:
- Manual member tracking and referral management
- Limited engagement tools between weekly YouTube broadcasts
- No centralized voting/decision-making platform
- Difficulty coordinating regional activities
- Lack of real-time progress visibility toward 1M goal

### 1.3 Solution

A unified digital platform that:
- Automates member onboarding and referral tracking
- Provides real-time engagement through challenges, tasks, and events
- Enables democratic decision-making through secure voting
- Coordinates regional and group activities
- Offers comprehensive analytics for leadership

---

## 2. Product Vision

### 2.1 Vision Statement

> "To build the most effective civic engagement platform in Ukraine that empowers citizens to collectively influence political outcomes through transparent, democratic processes."

### 2.2 Core Principles

| Principle | Description |
|-----------|-------------|
| **Transparency** | All decisions, finances, and activities are visible to members |
| **Democratic** | Every member has equal voting power on key decisions |
| **Decentralized** | Regional leaders have autonomy within guidelines |
| **Gamified** | Engagement through challenges, achievements, leaderboards |
| **Mobile-First** | Primary interactions happen on mobile devices |
| **Real-Time** | Live updates on membership, voting, activities |

### 2.3 Tagline

**"ГУРТУЄМОСЬ, ЩОБ ВПЛИВАТИ!"** — We unite to influence!

---

## 3. Goals & Success Metrics

### 3.1 Primary Goals

| Goal | Target | Timeframe |
|------|--------|-----------|
| Member acquisition | 100,000 members | 12 months |
| Member acquisition | 1,000,000 members | 36 months |
| Weekly active users | 40% of members | Ongoing |
| Referral rate | 1+ referral per member/month | Ongoing |
| Voting participation | 60% on major decisions | Ongoing |
| Event attendance | 30% RSVP conversion | Ongoing |

### 3.2 Key Performance Indicators (KPIs)

**Acquisition:**
- New members per day/week/month
- Referral conversion rate
- Source attribution (direct, referral, social, YouTube)
- Geographic distribution

**Engagement:**
- Daily/Weekly/Monthly Active Users (DAU/WAU/MAU)
- Session duration
- Feature usage rates
- Challenge completion rate
- Task completion rate

**Retention:**
- Churn rate
- Re-engagement rate
- Membership renewal rate
- NPS score

**Community:**
- Voting participation rate
- Event RSVP and attendance rates
- Regional group activity
- Content engagement (news, updates)

---

## 4. User Personas & Roles

### 4.1 Role Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│                      SUPER ADMIN                            │
│            (Full system access, technical staff)            │
├─────────────────────────────────────────────────────────────┤
│                         ADMIN                               │
│         (Leadership: Виконавчий директор, Рада)             │
├─────────────────────────────────────────────────────────────┤
│                    REGIONAL LEADER                          │
│            (Обласний координатор, 24 oblasts)               │
├─────────────────────────────────────────────────────────────┤
│                     GROUP LEADER                            │
│        (Лідер осередку, district/city level)                │
├─────────────────────────────────────────────────────────────┤
│                     FULL MEMBER                             │
│      (Повноправний член, verified, paid, active)            │
├─────────────────────────────────────────────────────────────┤
│                    SILENT MEMBER                            │
│    (Тихий член, registered but limited participation)       │
├─────────────────────────────────────────────────────────────┤
│                       PROSPECT                              │
│           (Registered but not yet verified/paid)            │
├─────────────────────────────────────────────────────────────┤
│                     FREE VIEWER                             │
│         (View-only access, no participation rights)         │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Role Definitions

#### 4.2.1 Super Admin
**Who:** Technical administrators, founders
**Permissions:**
- Full system access
- User role management
- System configuration
- Database access
- Audit logs
- Feature flags

#### 4.2.2 Admin
**Who:** Виконавчий директор, Спостережна рада members
**Permissions:**
- All member management
- Content management (news, announcements)
- Event creation (national level)
- Voting creation (national level)
- Financial reports access
- Analytics dashboard
- Regional leader management
- Challenge creation
- Push notification sending

#### 4.2.3 Regional Leader (Обласний координатор)
**Who:** Coordinators for each of 24 oblasts + Kyiv
**Permissions:**
- View members in their region
- Create regional events
- Create regional tasks
- Regional announcements
- Moderate regional discussions
- Appoint group leaders
- Regional analytics
- Escalate issues to Admin

#### 4.2.4 Group Leader (Лідер осередку)
**Who:** Local cell leaders (district, city, community level)
**Permissions:**
- View members in their group
- Create local events
- Assign tasks to group members
- Local announcements
- Lead local meetings
- Report to Regional Leader
- Group-level analytics

#### 4.2.5 Full Member (Повноправний член)
**Who:** Verified, dues-paid, active members
**Requirements:**
- Completed registration
- Identity verified (BankID/Дія)
- Paid membership fee
- Completed onboarding
**Permissions:**
- Vote on all decisions
- Participate in primaries
- Access member directory
- Join/create working groups
- Full event access
- Task assignment
- Referral system access
- Achievement system

#### 4.2.6 Silent Member (Тихий член)
**Who:** Members who prefer minimal involvement
**Requirements:**
- Completed registration
- Basic verification
- Paid membership fee (optional reduced)
**Permissions:**
- View content and news
- Vote on major decisions only
- Attend events (limited)
- Basic referral access
- No task assignments
- Receive newsletters

#### 4.2.7 Prospect
**Who:** Registered but not yet full member
**Permissions:**
- View public content
- Complete verification process
- Pay membership fee
- Access onboarding materials

#### 4.2.8 Free Viewer (Безкоштовний глядач)
**Who:** Users who want to observe without participating
**Requirements:**
- Completed basic registration (email only)
**Permissions:**
- View public news and content
- View public events (no RSVP)
- See member counter and progress
- Read manifesto and about pages
**Restrictions:**
- ❌ No voting rights
- ❌ No task assignments
- ❌ No challenge participation
- ❌ No referral tracking/rewards
- ❌ No group membership
- ❌ No member directory access
- ❌ No members-only content

### 4.3 User Personas

#### Persona 1: "Олександр" — The Active Advocate
- **Age:** 35
- **Location:** Kyiv
- **Occupation:** IT Professional
- **Tech Savvy:** High
- **Motivation:** Passionate about gun rights, wants to actively contribute
- **Behavior:** Checks app daily, completes challenges, recruits friends
- **Role:** Full Member → Group Leader

#### Persona 2: "Марія" — The Silent Supporter
- **Age:** 52
- **Location:** Kharkiv
- **Occupation:** Teacher
- **Tech Savvy:** Medium
- **Motivation:** Supports the cause but limited time
- **Behavior:** Reads news, votes when notified, occasional donations
- **Role:** Silent Member

#### Persona 3: "Віктор" — The Regional Organizer
- **Age:** 42
- **Location:** Lviv
- **Occupation:** Small business owner
- **Tech Savvy:** Medium-High
- **Motivation:** Build local community, political aspirations
- **Behavior:** Organizes events, recruits locally, manages team
- **Role:** Regional Leader

#### Persona 4: "Андрій" — The Young Digital Native
- **Age:** 24
- **Location:** Odesa
- **Occupation:** Student
- **Tech Savvy:** Very High
- **Motivation:** Political change, social media influence
- **Behavior:** Mobile-only, shares content, engages with gamification
- **Role:** Full Member (aspiring Group Leader)

---

## 5. Technical Architecture

### 5.1 Technology Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Frontend (Web)** | Next.js 14 (App Router) | SSR, SEO, React ecosystem |
| **Frontend (Mobile)** | React Native + Expo | Code sharing with web, cross-platform |
| **Authentication** | Clerk | Easy setup, social login, MFA, Ukrainian phone support |
| **Real-time Backend** | Convex | Real-time sync, serverless, TypeScript |
| **Database** | PostgreSQL (Supabase/Neon) | Relational data, complex queries |
| **File Storage** | Cloudflare R2 / AWS S3 | Documents, images, media |
| **Hosting** | Vercel | Edge network, auto-scaling |
| **Analytics** | PostHog / Plausible | Privacy-focused, self-hostable |
| **Push Notifications** | OneSignal / Firebase | Cross-platform push |
| **Email** | Resend / SendGrid | Transactional emails |
| **SMS** | Twilio / Ukrainian provider | Verification, alerts |
| **Payments** | LiqPay / Monobank | Ukrainian payment methods |
| **CDN** | Cloudflare | Ukrainian edge nodes |
| **Monitoring** | Sentry | Error tracking |

### 5.2 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                           CLIENTS                                   │
├─────────────────┬─────────────────┬─────────────────────────────────┤
│   Web (Next.js) │  iOS (RN/Expo)  │       Android (RN/Expo)         │
└────────┬────────┴────────┬────────┴─────────────────┬───────────────┘
         │                 │                          │
         └────────────────┬┴──────────────────────────┘
                          │
                    ┌─────▼─────┐
                    │  Vercel   │ (Edge Functions)
                    │  CDN      │
                    └─────┬─────┘
                          │
         ┌────────────────┼────────────────┐
         │                │                │
    ┌────▼────┐     ┌─────▼─────┐    ┌─────▼─────┐
    │  Clerk  │     │  Convex   │    │ Next.js   │
    │  Auth   │     │ Real-time │    │   API     │
    └────┬────┘     └─────┬─────┘    └─────┬─────┘
         │                │                │
         └────────────────┼────────────────┘
                          │
                    ┌─────▼─────┐
                    │ PostgreSQL│
                    │ (Supabase)│
                    └─────┬─────┘
                          │
         ┌────────────────┼────────────────┐
         │                │                │
    ┌────▼────┐     ┌─────▼─────┐    ┌─────▼─────┐
    │   R2   │     │  LiqPay   │    │ OneSignal │
    │ Storage│     │ Payments  │    │   Push    │
    └─────────┘     └───────────┘    └───────────┘
```

### 5.3 Data Models (Core Entities)

```typescript
// Core User/Member
interface User {
  id: string;
  clerkId: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  patronymic?: string;
  
  // Role & Status
  role: 'free_viewer' | 'prospect' | 'silent_member' | 'full_member' | 'group_leader' | 'regional_leader' | 'admin' | 'super_admin';
  status: 'pending' | 'active' | 'suspended' | 'churned';
  
  // Verification
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isIdentityVerified: boolean;
  verificationMethod?: 'bankid' | 'diia' | 'manual';
  
  // Location
  oblastId: string;
  cityId?: string;
  districtId?: string;
  
  // Membership
  memberSince: Date;
  membershipPaidUntil?: Date;
  membershipTier: 'free' | 'basic_49' | 'supporter_100' | 'supporter_200' | 'supporter_500';
  
  // Referral
  referredBy?: string; // userId
  referralCode: string;
  referralCount: number;
  
  // Engagement
  points: number;
  level: number;
  achievements: string[];
  
  // Preferences
  language: 'uk' | 'en';
  notificationPreferences: NotificationPreferences;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastActiveAt: Date;
}

// Regional Organization
interface Oblast {
  id: string;
  name: string;
  code: string; // UA-01, UA-02, etc.
  leaderId?: string;
  memberCount: number;
  groupCount: number;
}

interface Group {
  id: string;
  name: string;
  oblastId: string;
  cityId?: string;
  leaderId: string;
  memberCount: number;
  createdAt: Date;
  status: 'active' | 'inactive';
}

// Events
interface Event {
  id: string;
  title: string;
  description: string;
  type: 'meeting' | 'rally' | 'training' | 'social' | 'online' | 'other';
  scope: 'national' | 'regional' | 'local';
  
  // Location
  isOnline: boolean;
  location?: {
    address: string;
    city: string;
    oblastId: string;
    coordinates?: { lat: number; lng: number };
  };
  onlineUrl?: string;
  
  // Time
  startDate: Date;
  endDate: Date;
  timezone: string;
  
  // Organizer
  organizerId: string;
  oblastId?: string;
  groupId?: string;
  
  // Attendance
  maxAttendees?: number;
  rsvpDeadline?: Date;
  rsvps: RSVP[];
  
  // Status
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  
  createdAt: Date;
  updatedAt: Date;
}

interface RSVP {
  userId: string;
  status: 'going' | 'maybe' | 'not_going';
  respondedAt: Date;
  attendedAt?: Date;
}

// Voting
interface Vote {
  id: string;
  title: string;
  description: string;
  type: 'binary' | 'multiple_choice' | 'ranked' | 'approval';
  scope: 'national' | 'regional' | 'group';
  
  // Transparency setting
  transparency: 'anonymous' | 'public';
  // anonymous = votes are completely hidden, only aggregates shown
  // public = individual votes are visible to all members
  
  // Options
  options: VoteOption[];
  
  // Rules
  quorumRequired?: number; // percentage
  majorityRequired: number; // percentage (50, 66, etc.)
  eligibleRoles: string[];
  eligibleOblasts?: string[];
  
  // Time
  startDate: Date;
  endDate: Date;
  
  // Results
  totalVotes: number;
  results?: VoteResults;
  
  // Status
  status: 'draft' | 'active' | 'closed' | 'cancelled';
  
  createdBy: string;
  createdAt: Date;
}

interface VoteOption {
  id: string;
  text: string;
  description?: string;
  voteCount: number;
}

// Tasks
interface Task {
  id: string;
  title: string;
  description: string;
  type: 'recruitment' | 'outreach' | 'event_support' | 'content' | 'administrative' | 'other';
  
  // Assignment
  assigneeId?: string;
  assigneeType: 'individual' | 'group' | 'regional';
  groupId?: string;
  oblastId?: string;
  
  // Progress
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: Date;
  completedAt?: Date;
  
  // Rewards
  points: number;
  
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// News/Content
interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string; // Rich text/Markdown
  
  // Media
  featuredImage?: string;
  images: string[];
  videoUrl?: string;
  
  // Categorization
  category: 'announcement' | 'update' | 'success_story' | 'media' | 'education';
  tags: string[];
  
  // Visibility
  isPublic: boolean; // Public or members-only
  isPinned: boolean;
  
  // Author
  authorId: string;
  
  // Status
  status: 'draft' | 'published' | 'archived';
  publishedAt?: Date;
  
  // Engagement
  viewCount: number;
  
  createdAt: Date;
  updatedAt: Date;
}

// Challenges (Gamification)
interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'weekly' | 'monthly' | 'special';
  
  // Goals
  goal: {
    type: 'referrals' | 'tasks' | 'events' | 'votes' | 'points';
    target: number;
  };
  
  // Rewards
  points: number;
  badge?: string;
  
  // Time
  startDate: Date;
  endDate: Date;
  
  // Leaderboard
  leaderboard: LeaderboardEntry[];
  
  status: 'upcoming' | 'active' | 'completed';
  
  createdAt: Date;
}

interface LeaderboardEntry {
  userId: string;
  progress: number;
  rank: number;
}

// Payments/Membership
interface Payment {
  id: string;
  userId: string;
  
  type: 'membership' | 'donation' | 'event';
  amount: number;
  currency: 'UAH';
  
  // Provider
  provider: 'liqpay' | 'monobank' | 'manual';
  providerTransactionId?: string;
  
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  
  createdAt: Date;
  completedAt?: Date;
}

// Notifications
interface Notification {
  id: string;
  userId: string;
  
  type: 'system' | 'vote' | 'event' | 'task' | 'achievement' | 'news' | 'referral';
  title: string;
  body: string;
  
  data?: Record<string, any>;
  
  isRead: boolean;
  readAt?: Date;
  
  // Delivery
  channels: ('push' | 'email' | 'sms' | 'in_app')[];
  sentAt: Date;
  
  createdAt: Date;
}
```

### 5.4 API Structure

```
/api
├── /auth              # Clerk webhooks
├── /users
│   ├── GET /me
│   ├── PATCH /me
│   ├── GET /:id
│   └── /referrals
├── /members
│   ├── GET /          # List (admin)
│   ├── GET /stats
│   └── GET /leaderboard
├── /events
│   ├── GET /
│   ├── POST /
│   ├── GET /:id
│   ├── PATCH /:id
│   ├── DELETE /:id
│   └── POST /:id/rsvp
├── /votes
│   ├── GET /
│   ├── POST /
│   ├── GET /:id
│   ├── POST /:id/cast
│   └── GET /:id/results
├── /tasks
│   ├── GET /
│   ├── POST /
│   ├── PATCH /:id
│   └── POST /:id/complete
├── /news
│   ├── GET /
│   ├── POST /
│   ├── GET /:slug
│   ├── PATCH /:id
│   └── DELETE /:id
├── /challenges
│   ├── GET /
│   ├── GET /active
│   └── GET /:id/leaderboard
├── /regions
│   ├── GET /oblasts
│   ├── GET /oblasts/:id
│   └── GET /oblasts/:id/groups
├── /payments
│   ├── POST /membership
│   ├── POST /donation
│   └── GET /history
├── /notifications
│   ├── GET /
│   ├── POST /mark-read
│   └── PATCH /preferences
├── /admin
│   ├── /analytics
│   ├── /users
│   ├── /content
│   └── /settings
└── /webhooks
    ├── /clerk
    ├── /liqpay
    └── /monobank
```

---

## 6. Feature Specifications

### 6.1 Feature Priority Matrix

| Feature | Priority | Phase | Effort |
|---------|----------|-------|--------|
| User Registration & Auth | P0 | 1 | M |
| Member Profile | P0 | 1 | M |
| Referral System | P0 | 1 | L |
| Public Homepage | P0 | 1 | M |
| News Section | P0 | 1 | M |
| Member Counter (Live) | P0 | 1 | S |
| Basic Dashboard | P0 | 1 | L |
| Payment Integration | P0 | 1 | L |
| Role Management | P1 | 1 | M |
| Events + RSVP | P1 | 2 | L |
| Voting System | P1 | 2 | XL |
| Tasks | P1 | 2 | M |
| Challenges & Gamification | P1 | 2 | L |
| Regional Structure | P1 | 2 | L |
| Admin Dashboard | P1 | 2 | XL |
| Push Notifications | P2 | 2 | M |
| Calendar Integration | P2 | 3 | M |
| Mobile App (MVP) | P2 | 3 | XL |
| Document Library | P2 | 3 | M |
| Discussion Forums | P3 | 4 | L |
| Primaries System | P3 | 4 | XL |
| Advanced Analytics | P3 | 4 | L |
| Mobile App (Full) | P3 | 4 | XL |

**Effort Key:** S = Small (1-2 days), M = Medium (3-5 days), L = Large (1-2 weeks), XL = Extra Large (2-4 weeks)

---

## 7. Public Website

### 7.1 Homepage

#### 7.1.1 Hero Section
- Live member counter (real-time via Convex)
- Progress bar toward 1,000,000 goal
- Primary CTA: "Вступити до Мережі"
- Secondary CTA: "Маніфест"
- Tagline: "ГУРТУЄМОСЬ, ЩОБ ВПЛИВАТИ!"
- Weekly growth indicator (+XX за тиждень)

#### 7.1.2 News Section (NEW)
```
┌─────────────────────────────────────────────────────────────┐
│  📰 НОВИНИ МЕРЕЖІ                        [Всі новини →]    │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │ [Featured]   │ │ [Article 2]  │ │ [Article 3]  │        │
│  │              │ │              │ │              │        │
│  │ Main News    │ │ Title...     │ │ Title...     │        │
│  │ Article      │ │              │ │              │        │
│  │              │ │ Date         │ │ Date         │        │
│  │ [Read More]  │ └──────────────┘ └──────────────┘        │
│  └──────────────┘                                           │
│                                                             │
│  📺 ОСТАННІЙ ВИПУСК "ЗБРОЙОВИЙ ЛОБІСТ"                      │
│  ┌─────────────────────────────────────┐                   │
│  │ [YouTube Embed - Latest Episode]    │                   │
│  └─────────────────────────────────────┘                   │
└─────────────────────────────────────────────────────────────┘
```

Features:
- Latest 3-4 news articles
- Featured/pinned article highlighted
- YouTube latest episode embed
- Category filters
- "All News" link to full news page

#### 7.1.3 Why Join Section
- Key value propositions (4 cards)
- Statistics from ДІЯ vote (1,014,256)
- Quote from Manifesto

#### 7.1.4 How It Works
- 3-step process explanation
- OSBB analogy visualization
- Animated infographic

#### 7.1.5 Leadership Section
- Key leaders with photos
- Link to full "Про нас" page

#### 7.1.6 CTA Section
- Large "Доєднатись" button
- YouTube channel link
- Trust indicators

### 7.2 News Page (/news)

```
┌─────────────────────────────────────────────────────────────┐
│  НОВИНИ                                                     │
├─────────────────────────────────────────────────────────────┤
│  [Всі] [Оголошення] [Оновлення] [Успіхи] [Медіа] [Освіта]  │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │ [Featured Article - Full Width]                      │   │
│  │ Large image, title, excerpt, date, author           │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │ Article      │ │ Article      │ │ Article      │        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │ Article      │ │ Article      │ │ Article      │        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
│                                                             │
│                    [Load More]                              │
└─────────────────────────────────────────────────────────────┘
```

Features:
- Category filtering
- Search functionality
- Pagination / infinite scroll
- Share buttons on articles
- Related articles
- Members-only articles (locked for non-members)

### 7.3 Manifesto Page (/manifest)

- Full manifesto text
- Key points highlighted
- Signatories counter
- Download PDF option
- Share functionality

### 7.4 About Page (/about)

- Organization history with timeline
- Leadership team (full)
- Documents (Статут, etc.)
- Partners (УАВЗ, ЗБРОЙОВИЙ ЛОБІСТ)
- Contact information
- Legal details (ЄДРПОУ, address)

### 7.5 Registration Flow

```
Step 1: Basic Info
├── Email
├── Phone (optional for free tier)
├── Password (Clerk)
└── Referral code (optional)

Step 2: Choose Account Type
├── 👁️ FREE VIEWER (Безкоштовно)
│   └── View-only access, no participation
│
└── 👤 MEMBER (Член Мережі)
    └── Continue to Step 3

Step 3: Personal Details (Members only)
├── First name
├── Last name
├── Patronymic
├── Date of birth
└── Oblast / City

Step 4: Verification (Members only)
├── Email verification (Clerk)
├── Phone verification (SMS)
└── Identity verification (BankID/Дія) [required for full member]

Step 5: Membership Tier Selection
┌─────────────────────────────────────────────────────────────┐
│  Оберіть рівень підтримки:                                 │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   49 ₴/міс  │  │  100 ₴/міс  │  │  200 ₴/міс  │        │
│  │   БАЗОВИЙ   │  │  ПІДТРИМКА  │  │  ПІДТРИМКА+ │        │
│  │             │  │             │  │             │        │
│  │ • Голосування│ │ • Все з     │  │ • Все з     │        │
│  │ • Завдання  │  │   базового  │  │   100 ₴     │        │
│  │ • Челенджі  │  │ • Подяка на │  │ • Згадка в  │        │
│  │ • Реферали  │  │   сайті     │  │   звітах    │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                    500 ₴/міс                        │   │
│  │                    МЕЦЕНАТ                          │   │
│  │                                                     │   │
│  │  • Все з попередніх рівнів                         │   │
│  │  • Особиста подяка від керівництва                 │   │
│  │  • Пріоритетна підтримка                           │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘

Step 6: Payment
├── LiqPay / Monobank
├── Monthly subscription setup
└── Payment confirmation

Step 7: Onboarding
├── Welcome video
├── How to use the platform
├── First task: Share referral link
└── Join regional group
```

### 7.6 Membership Tiers

| Tier | Price | Features |
|------|-------|----------|
| **Free Viewer** | 0 ₴ | View-only: news, events list, member counter. No participation. |
| **Базовий (Basic)** | 49 ₴/month | Full member rights: voting, tasks, challenges, referrals, events RSVP, group membership |
| **Підтримка (Supporter)** | 100 ₴/month | All Basic + Thank you on website supporters page |
| **Підтримка+ (Supporter Plus)** | 200 ₴/month | All Supporter + Mentioned in monthly reports |
| **Меценат (Patron)** | 500 ₴/month | All above + Personal thank you from leadership + Priority support |

**Notes:**
- All paid tiers have identical participation rights
- Higher tiers are voluntary contributions to support the organization
- Members can upgrade/downgrade anytime
- Annual payment option with discount (10 months for price of 12)

---

## 8. Member Dashboard

### 8.1 Dashboard Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│  [Logo] МЕРЕЖА ВІЛЬНИХ ЛЮДЕЙ          🔔 [Notifications] [Profile] │
├──────────────┬──────────────────────────────────────────────────────┤
│              │                                                      │
│  📊 Overview │  Вітаємо, Олександре!                               │
│  📰 News     │                                                      │
│  📅 Events   │  ┌─────────────────┐  ┌─────────────────┐           │
│  🗳️ Voting   │  │ YOUR STATS      │  │ NETWORK STATS   │           │
│  ✅ Tasks    │  │                 │  │                 │           │
│  🏆 Challenges│  │ Referrals: 12   │  │ Members: 4,569  │           │
│  👥 My Group │  │ Points: 850     │  │ This week: +35  │           │
│  ⚙️ Settings │  │ Level: 5        │  │ Goal: 0.46%     │           │
│              │  └─────────────────┘  └─────────────────┘           │
│              │                                                      │
│              │  📋 ACTIVE TASKS                                     │
│              │  ┌─────────────────────────────────────────────┐    │
│              │  │ □ Запросити 3 друзів          Due: Dec 25   │    │
│              │  │ □ Взяти участь у голосуванні  Due: Dec 20   │    │
│              │  └─────────────────────────────────────────────┘    │
│              │                                                      │
│              │  🏆 ACTIVE CHALLENGE                                 │
│              │  ┌─────────────────────────────────────────────┐    │
│              │  │ Челендж тижня: 3 реферали                   │    │
│              │  │ [████████░░░░░░░░░░] 2/3 completed          │    │
│              │  │ Your rank: #45                               │    │
│              │  └─────────────────────────────────────────────┘    │
│              │                                                      │
│              │  📅 UPCOMING EVENTS                                  │
│              │  ┌─────────────────────────────────────────────┐    │
│              │  │ Dec 24 - Онлайн-зустріч Київського осередку │    │
│              │  │ Dec 30 - Загальні збори Мережі              │    │
│              │  └─────────────────────────────────────────────┘    │
│              │                                                      │
└──────────────┴──────────────────────────────────────────────────────┘
```

### 8.2 Dashboard Features

#### 8.2.1 Personal Stats Card
- Total referrals (with breakdown: pending, active)
- Points earned
- Current level & progress to next
- Achievements earned
- Member since date
- Membership status

#### 8.2.2 Network Stats Card (Real-time)
- Total members
- Growth this week
- Progress to 1M goal
- Your contribution percentage

#### 8.2.3 Referral Section
```
┌─────────────────────────────────────────────────────────────┐
│  🔗 YOUR REFERRAL LINK                                      │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ https://freepeople.org.ua/join?ref=ABC123    [Copy] │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [Share to Telegram] [Share to Facebook] [Share to Viber]  │
│                                                             │
│  📊 Your Referrals                                         │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Total: 12  │  Active: 10  │  Pending: 2           │    │
│  └────────────────────────────────────────────────────┘    │
│                                                             │
│  Recent:                                                    │
│  • Марія К. joined Dec 15 ✓                                │
│  • Іван П. pending verification...                         │
│  • Олег С. joined Dec 12 ✓                                 │
└─────────────────────────────────────────────────────────────┘
```

### 8.3 Events Section

#### 8.3.1 Events List
```
┌─────────────────────────────────────────────────────────────┐
│  📅 ПОДІЇ                                                   │
│  [Всі] [Мої] [Онлайн] [Моя область] [Минулі]               │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🟢 ONLINE                           Dec 24, 19:00   │   │
│  │ Онлайн-зустріч Київського осередку                  │   │
│  │ 45 going • 12 maybe                                 │   │
│  │ [RSVP: Going ▼]                      [Details →]    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 📍 Lviv                              Dec 30, 14:00  │   │
│  │ Загальні збори Львівського осередку                 │   │
│  │ 23 going • 8 maybe                                  │   │
│  │ [RSVP ▼]                             [Details →]    │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

#### 8.3.2 Event Detail Page
- Full description
- Date, time, timezone
- Location (map for in-person) or online link
- Organizer info
- RSVP options (Going / Maybe / Not Going)
- Attendee list (for members)
- Add to calendar (Google, Apple, Outlook)
- Share event
- Comments/Discussion (optional)

#### 8.3.3 Calendar View
- Monthly/weekly/agenda views
- Filter by type, region
- iCal subscription export
- Integration with Google Calendar

### 8.4 Voting Section

#### 8.4.1 Active Votes List
```
┌─────────────────────────────────────────────────────────────┐
│  🗳️ ГОЛОСУВАННЯ                                            │
│  [Активні] [Завершені] [Мої голоси]                        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🔴 ACTIVE  🔒 ANONYMOUS          Ends: Dec 25, 23:59│   │
│  │ Затвердження Положення про праймеріз                │   │
│  │                                                      │   │
│  │ Participation: 1,234 / 4,569 (27%)                  │   │
│  │ Quorum: 50% required                                 │   │
│  │                                                      │   │
│  │ [Vote Now →]                     You haven't voted  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🔴 ACTIVE  👁️ PUBLIC             Ends: Dec 28, 23:59│   │
│  │ Вибір кандидата на посаду регіонального лідера      │   │
│  │                                                      │   │
│  │ Participation: 456 / 890 (51%)                      │   │
│  │ ⚠️ Your vote will be visible to all members          │   │
│  │                                                      │   │
│  │ [Vote Now →]                     You haven't voted  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ✅ COMPLETED  🔒 ANONYMOUS            Dec 15, 2024  │   │
│  │ Вибір пріоритетних вимог                            │   │
│  │                                                      │   │
│  │ Result: "Право на зброю" - 89% ✓                    │   │
│  │                                                      │   │
│  │ [View Results →]                      You voted ✓   │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

**Vote Transparency Types:**
- 🔒 **ANONYMOUS** — Individual votes are completely hidden. Only aggregate results shown. Nobody (including admins) can see how specific members voted.
- 👁️ **PUBLIC** — Individual votes are visible to all members. Used for leadership elections, public accountability votes, or when transparency is required by organization rules.

#### 8.4.2 Voting Interface
```
┌─────────────────────────────────────────────────────────────┐
│  🗳️ Затвердження Положення про праймеріз                   │
│                                                             │
│  Чи підтримуєте ви запропоноване Положення про             │
│  проведення внутрішніх праймеріз Мережі?                   │
│                                                             │
│  📄 [View Full Document]                                    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ○ ЗА (Підтримую)                                    │   │
│  │ ○ ПРОТИ (Не підтримую)                              │   │
│  │ ○ УТРИМУЮСЬ                                         │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ⚠️ Your vote is final and cannot be changed               │
│                                                             │
│  [Submit Vote]                                              │
│                                                             │
│  Voting ends: Dec 25, 2024 at 23:59 Kyiv time              │
│  Current participation: 27% (need 50% quorum)              │
└─────────────────────────────────────────────────────────────┘
```

#### 8.4.3 Vote Types Supported
- **Binary** (Yes/No/Abstain)
- **Multiple Choice** (select one)
- **Approval** (select all that apply)
- **Ranked Choice** (order preferences)

### 8.5 Tasks Section

```
┌─────────────────────────────────────────────────────────────┐
│  ✅ ЗАВДАННЯ                                                │
│  [Мої] [Доступні] [Завершені]                              │
├─────────────────────────────────────────────────────────────┤
│  MY ACTIVE TASKS                                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ □ Запросити 3 нових членів цього тижня              │   │
│  │   🏆 +50 points  │  Due: Dec 25                      │   │
│  │   Progress: 2/3 [██████████░░░░░]                    │   │
│  │   [View Details]                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ □ Поділитись новиною в соцмережах                   │   │
│  │   🏆 +20 points  │  Due: Dec 20                      │   │
│  │   [Mark Complete] [View Details]                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  AVAILABLE TASKS                                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Допомогти з організацією події в Києві              │   │
│  │   🏆 +100 points  │  Volunteers needed: 5            │   │
│  │   [Take Task]                                        │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

Task Features:
- Auto-assigned based on membership tier
- Voluntary task pickup
- Progress tracking
- Point rewards
- Due date reminders
- Completion verification (some require proof)

### 8.6 Challenges & Gamification

```
┌─────────────────────────────────────────────────────────────┐
│  🏆 ЧЕЛЕНДЖІ                                                │
├─────────────────────────────────────────────────────────────┤
│  🔥 ACTIVE CHALLENGE                                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Weekly Challenge: Recruit 3 Friends                  │   │
│  │ Dec 16 - Dec 22                                      │   │
│  │                                                      │   │
│  │ Your progress: 2/3 [████████████░░░░░░]             │   │
│  │ Your rank: #45 of 234 participants                  │   │
│  │                                                      │   │
│  │ Reward: 🏅 "Рекрутер тижня" badge + 100 points      │   │
│  │                                                      │   │
│  │ 🏆 TOP PERFORMERS:                                   │   │
│  │  1. Олександр П. - 12 referrals                     │   │
│  │  2. Марія К. - 9 referrals                          │   │
│  │  3. Іван С. - 7 referrals                           │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  📅 UPCOMING                                                │
│  • Monthly Challenge starts Jan 1                          │
│                                                             │
│  🏅 YOUR ACHIEVEMENTS                                       │
│  [🌟 Засновник] [🔥 Активіст] [📢 Рекрутер]               │
│                                                             │
│  Level 5: Активний член                                     │
│  [████████████████░░░░] 850/1000 XP to Level 6             │
└─────────────────────────────────────────────────────────────┘
```

Gamification Elements:
- **Points** — Earned for tasks, referrals, voting, events
- **Levels** — Progression system (1-20)
- **Badges/Achievements** — Special recognition
- **Leaderboards** — Weekly, monthly, all-time
- **Challenges** — Time-limited competitions
- **Streaks** — Daily/weekly engagement rewards

### 8.7 My Group / Regional Section

```
┌─────────────────────────────────────────────────────────────┐
│  👥 КИЇВСЬКИЙ ОСЕРЕДОК                                      │
│  Regional Leader: Олександр Петренко                       │
├─────────────────────────────────────────────────────────────┤
│  📊 STATS                                                   │
│  Members: 456  │  This week: +12  │  Rank: #3 nationally   │
│                                                             │
│  📅 UPCOMING EVENTS                                         │
│  • Dec 24 - Онлайн-зустріч (45 going)                      │
│  • Dec 30 - Новорічна зустріч (23 going)                   │
│                                                             │
│  📢 ANNOUNCEMENTS                                           │
│  • Dec 18 - Нові завдання на тиждень                       │
│  • Dec 15 - Вітаємо нових членів!                          │
│                                                             │
│  👥 MEMBERS (456)                                           │
│  [View Directory] - Full Members only                       │
│                                                             │
│  💬 DISCUSSION                                              │
│  [Go to Telegram Group]                                     │
└─────────────────────────────────────────────────────────────┘
```

### 8.8 Profile & Settings

```
┌─────────────────────────────────────────────────────────────┐
│  ⚙️ НАЛАШТУВАННЯ                                            │
├─────────────────────────────────────────────────────────────┤
│  👤 PROFILE                                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ [Avatar]  Олександр Петренко                        │   │
│  │           @oleksandr_p                              │   │
│  │           Київ, Київська область                    │   │
│  │           Member since: Dec 2024                    │   │
│  │           [Edit Profile]                            │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  💳 MEMBERSHIP                                              │
│  Status: Full Member (Active)                               │
│  Next payment: Jan 15, 2025                                 │
│  [Manage Subscription] [Payment History]                    │
│                                                             │
│  🔔 NOTIFICATIONS                                           │
│  □ Push notifications                                       │
│  □ Email notifications                                      │
│  □ SMS for urgent                                           │
│  [Manage Preferences]                                       │
│                                                             │
│  🌐 LANGUAGE                                                │
│  [🇺🇦 Українська ▼]                                         │
│                                                             │
│  🔒 SECURITY                                                │
│  [Change Password] [Two-Factor Auth] [Connected Devices]   │
│                                                             │
│  📄 DOCUMENTS                                               │
│  [Download My Data] [Delete Account]                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 9. Admin Dashboard

### 9.1 Admin Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│  [Logo] ADMIN PANEL                    [Switch to Member View] [👤] │
├──────────────┬──────────────────────────────────────────────────────┤
│              │                                                      │
│  📊 Overview │  NETWORK OVERVIEW                                    │
│  👥 Members  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  📰 Content  │  │  4,569  │ │  +247   │ │  67%    │ │  89%    │   │
│  📅 Events   │  │ Total   │ │ This    │ │ Active  │ │ Verified│   │
│  🗳️ Voting   │  │ Members │ │ Month   │ │ Rate    │ │ Members │   │
│  ✅ Tasks    │  └─────────┘ └─────────┘ └─────────┘ └─────────┘   │
│  🏆 Challenges│                                                     │
│  🗺️ Regions  │  📈 GROWTH CHART (Last 30 days)                     │
│  💰 Payments │  ┌─────────────────────────────────────────────┐    │
│  📊 Analytics│  │  [Line chart showing daily signups]          │    │
│  ⚙️ Settings │  │                                              │    │
│              │  └─────────────────────────────────────────────┘    │
│              │                                                      │
│              │  🗺️ REGIONAL BREAKDOWN                               │
│              │  ┌─────────────────────────────────────────────┐    │
│              │  │  [Map of Ukraine with member density]        │    │
│              │  └─────────────────────────────────────────────┘    │
│              │                                                      │
│              │  🏆 TOP RECRUITERS THIS WEEK                         │
│              │  1. Олександр П. - 12 referrals                     │
│              │  2. Марія К. - 9 referrals                          │
│              │  3. Іван С. - 7 referrals                           │
│              │                                                      │
└──────────────┴──────────────────────────────────────────────────────┘
```

### 9.2 Members Management

```
┌─────────────────────────────────────────────────────────────────────┐
│  👥 MEMBERS MANAGEMENT                                              │
├─────────────────────────────────────────────────────────────────────┤
│  [Search...] [Filter by Role ▼] [Filter by Oblast ▼] [Export CSV]  │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────┬──────────────────┬──────────┬────────┬──────────┬───────┐ │
│  │ ID  │ Name             │ Role     │ Oblast │ Status   │ Action│ │
│  ├─────┼──────────────────┼──────────┼────────┼──────────┼───────┤ │
│  │ 001 │ Олександр П.     │ Full     │ Київ   │ Active   │ [···] │ │
│  │ 002 │ Марія К.         │ Leader   │ Харків │ Active   │ [···] │ │
│  │ 003 │ Іван С.          │ Silent   │ Львів  │ Active   │ [···] │ │
│  │ 004 │ Петро В.         │ Prospect │ Одеса  │ Pending  │ [···] │ │
│  └─────┴──────────────────┴──────────┴────────┴──────────┴───────┘ │
│                                                                     │
│  [← Prev] Page 1 of 456 [Next →]                                   │
└─────────────────────────────────────────────────────────────────────┘
```

Admin Member Actions:
- View full profile
- Edit role/permissions
- Verify identity manually
- Suspend/unsuspend
- View activity log
- View referral tree
- Send direct notification
- Impersonate (for support)

### 9.3 Content Management

```
┌─────────────────────────────────────────────────────────────────────┐
│  📰 CONTENT MANAGEMENT                                              │
├─────────────────────────────────────────────────────────────────────┤
│  [+ New Article] [+ New Announcement]                               │
│                                                                     │
│  [All] [Published] [Drafts] [Scheduled]                            │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ 📌 PINNED                                                    │   │
│  │ Маніфест Мережі Вільних Людей                               │   │
│  │ Published: Dec 1, 2024  │  Views: 12,456                    │   │
│  │ [Edit] [Unpin] [View]                                        │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Мережа проголосувала за Положення про праймеріз             │   │
│  │ Published: Dec 15, 2024  │  Views: 2,345                    │   │
│  │ [Edit] [Pin] [Archive]                                       │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

Content Editor Features:
- Rich text editor (Markdown support)
- Image upload & management
- Video embed (YouTube)
- Scheduling
- SEO settings (meta, OG tags)
- Public/Members-only toggle
- Category & tags
- Preview before publish

### 9.4 Events Management

- Create/edit/delete events
- View all RSVPs
- Send reminders
- Mark attendance
- Event analytics (views, RSVPs, attendance rate)
- Duplicate events
- Recurring events

### 9.5 Voting Management

- Create new votes
- Configure vote type, options, rules
- Set eligibility criteria
- Monitor participation in real-time
- Close voting early if needed
- View detailed results
- Export results
- Audit trail

### 9.6 Analytics Dashboard

```
┌─────────────────────────────────────────────────────────────────────┐
│  📊 ANALYTICS                                                       │
├─────────────────────────────────────────────────────────────────────┤
│  Date Range: [Last 30 days ▼]  [Export Report]                     │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ MEMBERSHIP GROWTH                                            │   │
│  │ [Line chart: daily new members, cumulative total]           │   │
│  │                                                              │   │
│  │ Total: 4,569  │  Δ30d: +247 (+5.7%)                         │   │
│  │ Projection to 1M: 18 months at current rate                 │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌──────────────────────┐  ┌──────────────────────┐                │
│  │ MEMBER BREAKDOWN     │  │ ACQUISITION SOURCE   │                │
│  │ [Pie: roles]         │  │ [Pie: referral/      │                │
│  │                      │  │  direct/social/YT]   │                │
│  │ Full: 3,200 (70%)    │  │ Referral: 65%        │                │
│  │ Silent: 1,100 (24%)  │  │ Direct: 20%          │                │
│  │ Prospect: 269 (6%)   │  │ YouTube: 10%         │                │
│  └──────────────────────┘  │ Social: 5%           │                │
│                            └──────────────────────┘                │
│                                                                     │
│  ┌──────────────────────┐  ┌──────────────────────┐                │
│  │ ENGAGEMENT           │  │ REGIONAL             │                │
│  │                      │  │                      │                │
│  │ WAU: 2,100 (46%)     │  │ Top 5 Oblasts:       │                │
│  │ Voting: 67%          │  │ 1. Київ: 890         │                │
│  │ Events: 34%          │  │ 2. Харків: 456       │                │
│  │ Tasks: 23%           │  │ 3. Львів: 389        │                │
│  │ Challenges: 45%      │  │ 4. Одеса: 312        │                │
│  └──────────────────────┘  │ 5. Дніпро: 287       │                │
│                            └──────────────────────┘                │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ REFERRAL NETWORK                                             │   │
│  │ [Tree visualization or network graph]                        │   │
│  │                                                              │   │
│  │ Avg referrals/member: 2.3                                    │   │
│  │ Top referrer: Олександр П. (156 total)                      │   │
│  │ Viral coefficient: 1.4                                       │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ FINANCIAL OVERVIEW                                           │   │
│  │                                                              │   │
│  │ MRR: ₴125,000  │  Donations: ₴45,000  │  Total: ₴170,000   │   │
│  │                                                              │   │
│  │ [Bar chart: monthly revenue]                                 │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

Key Analytics Features:
- Real-time member counter
- Growth projections
- Cohort analysis
- Funnel analysis (registration → verification → payment → active)
- Retention curves
- Geographic heatmap
- Referral network visualization
- Revenue tracking
- Custom report builder
- Scheduled reports (email)
- Export to CSV/PDF

### 9.7 Settings

- Organization profile
- Payment configuration
- Email templates
- Notification settings
- Feature flags
- API keys management
- Webhook configuration
- Audit logs
- Backup & restore

---

## 10. Mobile Application

### 10.1 Overview

Native mobile apps for iOS and Android built with React Native + Expo, sharing core logic with web application.

### 10.2 Mobile-Specific Features

#### 10.2.1 Core Features (MVP)
- [ ] Authentication (Clerk)
- [ ] Dashboard overview
- [ ] News feed
- [ ] Events list + RSVP
- [ ] Push notifications
- [ ] Referral link sharing (native share sheet)
- [ ] Profile management
- [ ] Voting participation

#### 10.2.2 Enhanced Features (Post-MVP)
- [ ] Offline mode (cached content)
- [ ] QR code for referrals
- [ ] Event check-in via QR
- [ ] Camera for task proof submission
- [ ] Location-based regional features
- [ ] Biometric authentication
- [ ] Widget (member counter)
- [ ] Apple Watch / WearOS companion

### 10.3 Mobile Navigation

```
┌─────────────────────────────────────────┐
│                                         │
│         [Main Content Area]             │
│                                         │
│                                         │
│                                         │
│                                         │
│                                         │
│                                         │
│                                         │
├─────────────────────────────────────────┤
│  🏠      📰      📅      🗳️      👤    │
│  Home   News   Events  Vote   Profile  │
└─────────────────────────────────────────┘
```

### 10.4 Push Notification Types

| Type | Trigger | Priority |
|------|---------|----------|
| New vote available | Vote created | High |
| Vote ending soon | 24h before deadline | High |
| Event reminder | 24h & 1h before | Medium |
| New referral joined | Referral completes signup | Medium |
| Challenge update | Progress/leaderboard change | Low |
| News article | Admin publishes | Low |
| Task assigned | Task created for user | Medium |
| Task due soon | 24h before deadline | Medium |
| Achievement unlocked | User earns badge | Low |
| Weekly summary | Every Sunday | Low |

### 10.5 Mobile-Specific UX

- Swipe gestures for navigation
- Pull-to-refresh
- Haptic feedback
- Dark mode support
- Dynamic type support
- Accessibility (VoiceOver/TalkBack)
- Deep linking
- Universal links

---

## 11. Security & Compliance

### 11.1 Authentication & Authorization

- **Clerk** handles authentication
- MFA support (SMS, Authenticator)
- Session management
- Role-based access control (RBAC)
- API key authentication for integrations

### 11.2 Data Protection

- All data encrypted in transit (TLS 1.3)
- Sensitive data encrypted at rest
- PII handling compliance
- GDPR-style data rights:
  - Right to access
  - Right to deletion
  - Data portability
- Regular security audits

### 11.3 Vote Integrity

- One person, one vote (enforced by identity verification)
- Votes are immutable once cast
- Real-time result calculation
- Audit trail for all votes
- No admin can see individual votes (only aggregates)

### 11.4 Identity Verification

- BankID integration (Ukrainian banks)
- Дія integration (government ID)
- Manual verification option (ID upload + review)
- Fraud detection (duplicate accounts)

### 11.5 Compliance

- Ukrainian data residency requirements
- NGO transparency requirements
- Financial reporting standards
- GDPR principles (for EU members)

---

## 12. Integrations

### 12.1 Required Integrations

| Integration | Purpose | Priority |
|-------------|---------|----------|
| **Clerk** | Authentication | P0 |
| **LiqPay** | Payments | P0 |
| **Monobank** | Payments | P1 |
| **BankID** | Identity verification | P1 |
| **Дія** | Identity verification | P2 |
| **OneSignal** | Push notifications | P1 |
| **Resend/SendGrid** | Email | P0 |
| **Twilio** | SMS | P1 |
| **Google Calendar** | Calendar sync | P2 |
| **YouTube API** | Video embed | P1 |
| **PostHog** | Analytics | P1 |
| **Sentry** | Error monitoring | P0 |

### 12.2 Social Sharing

- Telegram sharing
- Facebook sharing
- Viber sharing
- Twitter/X sharing
- Copy link
- QR code generation

### 12.3 Future Integrations (Phase 4+)

- **Telegram Bot** — Notifications, commands, group integration
- **Дія** sign-in — Government ID authentication
- Nova Poshta (for physical mailings)
- CRM (HubSpot/Salesforce)
- Accounting software integration

---

## 13. Roadmap & Phases

### Phase 1: Foundation (8 weeks)
**Goal:** Launch MVP with core member functionality

- [ ] Project setup (Next.js, Convex, PostgreSQL, Clerk)
- [ ] Public website redesign
- [ ] User registration & authentication
- [ ] Basic member profile
- [ ] Referral system
- [ ] Live member counter
- [ ] News section (public)
- [ ] Payment integration (LiqPay)
- [ ] Basic member dashboard
- [ ] Admin: member management

**Deliverables:**
- Production website
- Member registration flow
- Payment processing
- Admin panel v1

### Phase 2: Engagement (6 weeks)
**Goal:** Add engagement features to drive activity

- [ ] Events system + RSVP
- [ ] Voting system (basic)
- [ ] Tasks system
- [ ] Challenges & leaderboards
- [ ] Points & levels
- [ ] Push notifications
- [ ] Regional structure (oblasts)
- [ ] Admin: content management
- [ ] Admin: analytics v1

**Deliverables:**
- Full engagement platform
- Regional organization
- Analytics dashboard

### Phase 3: Mobile & Scale (8 weeks)
**Goal:** Mobile app MVP & advanced features

- [ ] React Native app (iOS)
- [ ] React Native app (Android)
- [ ] Offline mode
- [ ] Advanced voting (ranked, approval)
- [ ] Group leader features
- [ ] Calendar integration
- [ ] Advanced analytics
- [ ] Performance optimization

**Deliverables:**
- iOS app on App Store
- Android app on Play Store
- Full analytics suite

### Phase 4: Advanced Features (Ongoing)
**Goal:** Primaries, advanced coordination

- [ ] Primaries system
- [ ] Discussion forums
- [ ] Document library
- [ ] Advanced regional features
- [ ] API for third-party integrations
- [ ] Дія integration
- [ ] Advanced fraud detection
- [ ] Multi-language support

---

## 14. Appendix

### 14.1 Glossary

| Term | Ukrainian | Definition |
|------|-----------|------------|
| Member | Член | Registered paying user of the platform |
| Full Member | Повноправний член | Verified, paid member with full voting rights |
| Silent Member | Тихий член | Member with limited participation |
| Free Viewer | Безкоштовний глядач | View-only user, no participation rights |
| Oblast | Область | Ukrainian administrative region (24 + Kyiv) |
| Oseredok | Осередок | Local cell/chapter |
| Referral | Реферал | New member recruited by existing member |
| Challenge | Челендж | Time-limited competition |
| Primaries | Праймеріз | Internal candidate selection process |
| Anonymous Vote | Анонімне голосування | Vote where individual choices are hidden |
| Public Vote | Публічне голосування | Vote where individual choices are visible |
| Базовий | Basic | 49 UAH/month membership tier |
| Підтримка | Supporter | 100 UAH/month membership tier |
| Меценат | Patron | 500 UAH/month membership tier |

### 14.2 User Stories

**Registration:**
- As a visitor, I want to register quickly so I can join the movement
- As a prospect, I want to verify my identity so I can become a full member
- As a new member, I want to be onboarded so I understand how to participate

**Engagement:**
- As a member, I want to see my referral stats so I can track my impact
- As a member, I want to vote on decisions so I can influence the organization
- As a member, I want to RSVP to events so I can participate in activities

**Leadership:**
- As a group leader, I want to manage my local group so we can organize effectively
- As a regional leader, I want to see my region's stats so I can drive growth
- As an admin, I want comprehensive analytics so I can make informed decisions

### 14.3 Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| **Performance** | Page load < 2s, API response < 200ms |
| **Availability** | 99.9% uptime |
| **Scalability** | Support 1M+ users |
| **Security** | SOC 2 Type II compliance target |
| **Accessibility** | WCAG 2.1 AA |
| **Localization** | Ukrainian (primary), English |
| **Browser Support** | Chrome, Firefox, Safari, Edge (latest 2 versions) |
| **Mobile Support** | iOS 14+, Android 10+ |

### 14.4 Resolved Questions

| Question | Decision |
|----------|----------|
| **Voting transparency** | Two types supported: (1) Completely anonymous votes, (2) Public/transparent votes. Configurable per vote by admin. |
| **Membership fee structure** | Base: 49 UAH/month. Optional higher tiers: 100, 200, 500 UAH/month (voluntary contribution). |
| **Free tier** | Yes. Free users can view content (news, events) but cannot participate in voting, tasks, challenges, or have referral tracking. View-only access. |
| **Diaspora/abroad members** | Treated as regular members. Same rights and responsibilities regardless of location. |
| **Telegram integration** | Planned for later stages (Phase 4+). Not in initial MVP. |
| **Primaries system** | Yes, will be implemented. Separate PRD to be created. |

### 14.5 References

- [Маніфест Мережі Вільних Людей](https://freepeople.org.ua/manifest)
- [Статут ГО](https://freepeople.org.ua/about)
- [NRA Political Victory Fund](https://www.nrapvf.org/)
- [Clerk Documentation](https://clerk.com/docs)
- [Convex Documentation](https://docs.convex.dev/)

---

**Document Control**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Dec 2024 | Product Team | Initial draft |

---

*"ГУРТУЄМОСЬ, ЩОБ ВПЛИВАТИ!"*
