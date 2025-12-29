# Membership Role Progression System - Implementation Plan

## Overview

This plan outlines the implementation of a new 8-tier membership role progression system for Мережа Вільних Людей based on contributions, referral achievements, and helping others advance.

---

## Current State Analysis

### Existing Role System (to be replaced)
```
free_viewer (0) → prospect (1) → silent_member (2) → full_member (3) →
group_leader (4) → regional_leader (5) → [staff roles: news_editor, admin, super_admin]
```

### Existing Infrastructure (to leverage)
- ✅ `referredById` - Direct parent tracking
- ✅ `referralCode` - Unique referral codes
- ✅ `referralCount` - Direct referral counter
- ✅ `get_referral_tree()` - Recursive tree function (max 10 levels)
- ✅ `payments` table - Contribution tracking
- ✅ `pointsTransactions` - Activity ledger

---

## New Role Hierarchy

| Level | Role (UA) | Role Key | Requirements | Privileges |
|-------|-----------|----------|--------------|------------|
| 0 | Прихильник | `supporter` | Registered, no contribution | Newsletter only |
| 1 | Кандидат в члени | `candidate` | Made any contribution | Primary voting |
| 2 | Член Мережі | `member` | 2 recruited candidates | Full voting rights |
| 3 | Почесний Член | `honorary_member` | 2 recruits became Members | Loyalty program |
| 4 | Лідер Мережі | `network_leader` | 8 personal + 49 total referrals | Nomination rights, Leaders' Council |
| 5 | Регіональний лідер | `regional_leader` | Helped 6 Honorary→Leader + 400 total | Mayor nomination priority |
| 6 | Національний лідер | `national_leader` | Helped 4 Leaders→Regional + 4000 total | MP/President nomination |
| 7 | Провідник Мережі | `network_guide` | Helped 2 Regional→National + 25000 total | 70% budget control |

**Staff Roles (separate track):**
- `news_editor` - Content management
- `admin` - Platform administration
- `super_admin` - Full system access

---

## Database Schema Changes

### Phase 1: Core Schema Updates

#### 1.1 Update User Role Enum
```sql
-- Migration: update_membership_roles.sql

-- Create new role enum
CREATE TYPE membership_role AS ENUM (
  'supporter',        -- Level 0: Registered, no contribution
  'candidate',        -- Level 1: Made contribution
  'member',           -- Level 2: 2 recruited candidates
  'honorary_member',  -- Level 3: 2 recruits became members
  'network_leader',   -- Level 4: 8 personal + 49 total
  'regional_leader',  -- Level 5: 6 helped to leader + 400 total
  'national_leader',  -- Level 6: 4 helped to regional + 4000 total
  'network_guide'     -- Level 7: 2 helped to national + 25000 total
);

-- Staff roles remain separate
CREATE TYPE staff_role AS ENUM (
  'none',
  'news_editor',
  'admin',
  'super_admin'
);

-- Add new columns to users table
ALTER TABLE users
  ADD COLUMN membership_role membership_role DEFAULT 'supporter',
  ADD COLUMN staff_role staff_role DEFAULT 'none',
  ADD COLUMN role_advanced_at TIMESTAMPTZ,
  ADD COLUMN total_referral_count INTEGER DEFAULT 0;

-- Migrate existing roles
UPDATE users SET
  membership_role = CASE role
    WHEN 'free_viewer' THEN 'supporter'
    WHEN 'prospect' THEN 'candidate'
    WHEN 'silent_member' THEN 'member'
    WHEN 'full_member' THEN 'member'
    WHEN 'group_leader' THEN 'network_leader'
    WHEN 'regional_leader' THEN 'regional_leader'
    ELSE 'supporter'
  END,
  staff_role = CASE role
    WHEN 'news_editor' THEN 'news_editor'
    WHEN 'admin' THEN 'admin'
    WHEN 'super_admin' THEN 'super_admin'
    ELSE 'none'
  END;
```

#### 1.2 Role Advancement Events Table
```sql
-- Track when users advance in role (for "helped become" calculations)
CREATE TABLE role_advancements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  from_role membership_role NOT NULL,
  to_role membership_role NOT NULL,
  advanced_at TIMESTAMPTZ DEFAULT NOW(),
  advanced_by UUID REFERENCES users(id), -- Who helped (their referrer)
  trigger_type VARCHAR(50) NOT NULL, -- 'contribution', 'referral_count', 'tree_count', 'helped_advance', 'manual'
  trigger_data JSONB, -- Details about what triggered advancement

  CONSTRAINT valid_advancement CHECK (from_role < to_role)
);

CREATE INDEX idx_role_advancements_user ON role_advancements(user_id);
CREATE INDEX idx_role_advancements_advanced_by ON role_advancements(advanced_by);
CREATE INDEX idx_role_advancements_to_role ON role_advancements(to_role);
```

#### 1.3 Role Requirements Configuration Table
```sql
-- Configurable requirements for each role (admin can adjust)
CREATE TABLE role_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role membership_role NOT NULL UNIQUE,
  role_level INTEGER NOT NULL,
  display_name_uk VARCHAR(100) NOT NULL,
  description_uk TEXT,

  -- Contribution requirement (for candidate)
  requires_contribution BOOLEAN DEFAULT FALSE,
  min_contribution_amount INTEGER, -- in kopecks

  -- Direct referral requirements
  min_direct_referrals INTEGER DEFAULT 0,
  min_direct_referrals_at_role membership_role, -- referrals must be at this role

  -- Total tree requirements
  min_total_referrals INTEGER DEFAULT 0,

  -- "Helped advance" requirements
  min_helped_advance INTEGER DEFAULT 0,
  helped_advance_from_role membership_role,
  helped_advance_to_role membership_role,

  -- Privileges (stored as JSON for flexibility)
  privileges JSONB DEFAULT '[]',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed initial requirements
INSERT INTO role_requirements (role, role_level, display_name_uk, description_uk, requires_contribution, min_contribution_amount, min_direct_referrals, min_direct_referrals_at_role, min_total_referrals, min_helped_advance, helped_advance_from_role, helped_advance_to_role, privileges) VALUES
('supporter', 0, 'Прихильник', 'Зареєстрований користувач без внеску', FALSE, NULL, 0, NULL, 0, 0, NULL, NULL, '["newsletter"]'),
('candidate', 1, 'Кандидат в члени', 'Зробив перший внесок', TRUE, 100, 0, NULL, 0, 0, NULL, NULL, '["newsletter", "primary_voting"]'),
('member', 2, 'Член Мережі', 'Залучив 2 кандидатів', FALSE, NULL, 2, 'candidate', 0, 0, NULL, NULL, '["newsletter", "primary_voting", "full_voting", "events", "tasks"]'),
('honorary_member', 3, 'Почесний Член', '2 залучених стали Членами', FALSE, NULL, 0, NULL, 0, 2, 'candidate', 'member', '["newsletter", "primary_voting", "full_voting", "events", "tasks", "loyalty_program"]'),
('network_leader', 4, 'Лідер Мережі', '8 особистих + 49 загальних рефералів', FALSE, NULL, 8, 'candidate', 49, 0, NULL, NULL, '["newsletter", "primary_voting", "full_voting", "events", "tasks", "loyalty_program", "nomination", "leaders_council"]'),
('regional_leader', 5, 'Регіональний лідер', '6 допомогли стати Лідерами + 400 загальних', FALSE, NULL, 0, NULL, 400, 6, 'honorary_member', 'network_leader', '["newsletter", "primary_voting", "full_voting", "events", "tasks", "loyalty_program", "nomination", "leaders_council", "mayor_priority"]'),
('national_leader', 6, 'Національний лідер', '4 допомогли стати Регіональними + 4000 загальних', FALSE, NULL, 0, NULL, 4000, 4, 'network_leader', 'regional_leader', '["newsletter", "primary_voting", "full_voting", "events", "tasks", "loyalty_program", "nomination", "leaders_council", "mayor_priority", "mp_priority"]'),
('network_guide', 7, 'Провідник Мережі', '2 допомогли стати Національними + 25000 загальних', FALSE, NULL, 0, NULL, 25000, 2, 'regional_leader', 'national_leader', '["newsletter", "primary_voting", "full_voting", "events", "tasks", "loyalty_program", "nomination", "leaders_council", "mayor_priority", "mp_priority", "budget_control"]');
```

#### 1.4 Cached Referral Statistics Table
```sql
-- Cache referral stats for performance (updated via trigger/cron)
CREATE TABLE user_referral_stats (
  user_id UUID PRIMARY KEY REFERENCES users(id),

  -- Direct referrals by role
  direct_supporters INTEGER DEFAULT 0,
  direct_candidates INTEGER DEFAULT 0,
  direct_members INTEGER DEFAULT 0,
  direct_honorary_members INTEGER DEFAULT 0,
  direct_network_leaders INTEGER DEFAULT 0,
  direct_regional_leaders INTEGER DEFAULT 0,
  direct_national_leaders INTEGER DEFAULT 0,
  direct_network_guides INTEGER DEFAULT 0,

  -- Total tree count
  total_tree_count INTEGER DEFAULT 0,

  -- "Helped advance" counts
  helped_to_candidate INTEGER DEFAULT 0,
  helped_to_member INTEGER DEFAULT 0,
  helped_to_honorary INTEGER DEFAULT 0,
  helped_to_leader INTEGER DEFAULT 0,
  helped_to_regional INTEGER DEFAULT 0,
  helped_to_national INTEGER DEFAULT 0,
  helped_to_guide INTEGER DEFAULT 0,

  -- Metadata
  last_calculated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT pk_user_referral_stats PRIMARY KEY (user_id)
);
```

### Phase 2: PostgreSQL Functions

#### 2.1 Calculate Total Referral Tree Count
```sql
CREATE OR REPLACE FUNCTION calculate_total_referrals(target_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  total INTEGER;
BEGIN
  WITH RECURSIVE referral_tree AS (
    SELECT id, referred_by_id, 1 AS depth
    FROM users
    WHERE referred_by_id = target_user_id AND status = 'active'

    UNION ALL

    SELECT u.id, u.referred_by_id, rt.depth + 1
    FROM users u
    INNER JOIN referral_tree rt ON u.referred_by_id = rt.id
    WHERE u.status = 'active' AND rt.depth < 10
  )
  SELECT COUNT(*) INTO total FROM referral_tree;

  RETURN COALESCE(total, 0);
END;
$$ LANGUAGE plpgsql;
```

#### 2.2 Count Direct Referrals at Specific Role
```sql
CREATE OR REPLACE FUNCTION count_direct_referrals_at_role(
  target_user_id UUID,
  target_role membership_role
)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM users
    WHERE referred_by_id = target_user_id
      AND membership_role >= target_role
      AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql;
```

#### 2.3 Count "Helped Advance" Events
```sql
CREATE OR REPLACE FUNCTION count_helped_advance(
  referrer_id UUID,
  from_role membership_role,
  to_role membership_role
)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(DISTINCT ra.user_id)
    FROM role_advancements ra
    INNER JOIN users u ON ra.user_id = u.id
    WHERE u.referred_by_id = referrer_id
      AND ra.from_role = from_role
      AND ra.to_role = to_role
  );
END;
$$ LANGUAGE plpgsql;
```

#### 2.4 Check Role Eligibility
```sql
CREATE OR REPLACE FUNCTION check_role_eligibility(target_user_id UUID)
RETURNS TABLE (
  current_role membership_role,
  eligible_for membership_role,
  is_eligible BOOLEAN,
  missing_requirements JSONB
) AS $$
DECLARE
  user_record RECORD;
  req RECORD;
  direct_at_role INTEGER;
  total_refs INTEGER;
  helped_count INTEGER;
  has_contribution BOOLEAN;
  missing JSONB;
BEGIN
  -- Get user's current state
  SELECT membership_role, id INTO user_record FROM users WHERE id = target_user_id;

  -- Get stats
  SELECT * INTO req FROM user_referral_stats WHERE user_id = target_user_id;

  -- Check each higher role
  FOR req IN
    SELECT * FROM role_requirements
    WHERE role_level > (SELECT role_level FROM role_requirements WHERE role = user_record.membership_role)
    ORDER BY role_level
  LOOP
    missing := '[]'::JSONB;

    -- Check contribution requirement
    IF req.requires_contribution THEN
      SELECT EXISTS(
        SELECT 1 FROM payments
        WHERE user_id = target_user_id
        AND status = 'completed'
        AND amount >= COALESCE(req.min_contribution_amount, 0)
      ) INTO has_contribution;

      IF NOT has_contribution THEN
        missing := missing || jsonb_build_object('type', 'contribution', 'required', req.min_contribution_amount);
      END IF;
    END IF;

    -- Check direct referrals at role
    IF req.min_direct_referrals > 0 THEN
      direct_at_role := count_direct_referrals_at_role(target_user_id, req.min_direct_referrals_at_role);
      IF direct_at_role < req.min_direct_referrals THEN
        missing := missing || jsonb_build_object('type', 'direct_referrals', 'current', direct_at_role, 'required', req.min_direct_referrals, 'at_role', req.min_direct_referrals_at_role);
      END IF;
    END IF;

    -- Check total referrals
    IF req.min_total_referrals > 0 THEN
      total_refs := COALESCE((SELECT total_tree_count FROM user_referral_stats WHERE user_id = target_user_id), 0);
      IF total_refs < req.min_total_referrals THEN
        missing := missing || jsonb_build_object('type', 'total_referrals', 'current', total_refs, 'required', req.min_total_referrals);
      END IF;
    END IF;

    -- Check helped advance
    IF req.min_helped_advance > 0 THEN
      helped_count := count_helped_advance(target_user_id, req.helped_advance_from_role, req.helped_advance_to_role);
      IF helped_count < req.min_helped_advance THEN
        missing := missing || jsonb_build_object('type', 'helped_advance', 'current', helped_count, 'required', req.min_helped_advance, 'from', req.helped_advance_from_role, 'to', req.helped_advance_to_role);
      END IF;
    END IF;

    -- Return eligibility for this role
    RETURN QUERY SELECT
      user_record.membership_role,
      req.role,
      jsonb_array_length(missing) = 0,
      missing;

    -- If eligible, check next role; if not, stop here
    IF jsonb_array_length(missing) > 0 THEN
      RETURN;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;
```

### Phase 3: Triggers

#### 3.1 Auto-Update Referral Stats on User Change
```sql
CREATE OR REPLACE FUNCTION trigger_update_referral_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update referrer's stats when a user changes role or is created
  IF TG_OP = 'INSERT' AND NEW.referred_by_id IS NOT NULL THEN
    -- Recalculate referrer's stats
    PERFORM recalculate_user_referral_stats(NEW.referred_by_id);
  ELSIF TG_OP = 'UPDATE' AND OLD.membership_role != NEW.membership_role THEN
    -- Role changed, update referrer if exists
    IF NEW.referred_by_id IS NOT NULL THEN
      PERFORM recalculate_user_referral_stats(NEW.referred_by_id);
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_referral_stats
AFTER INSERT OR UPDATE OF membership_role ON users
FOR EACH ROW EXECUTE FUNCTION trigger_update_referral_stats();
```

#### 3.2 Record Role Advancement
```sql
CREATE OR REPLACE FUNCTION trigger_record_role_advancement()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.membership_role != NEW.membership_role THEN
    INSERT INTO role_advancements (
      user_id, from_role, to_role, advanced_by, trigger_type, trigger_data
    ) VALUES (
      NEW.id,
      OLD.membership_role,
      NEW.membership_role,
      NEW.referred_by_id,
      'automatic',
      jsonb_build_object('previous_role', OLD.membership_role, 'new_role', NEW.membership_role)
    );

    NEW.role_advanced_at := NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_record_role_advancement
BEFORE UPDATE OF membership_role ON users
FOR EACH ROW EXECUTE FUNCTION trigger_record_role_advancement();
```

---

## Service Layer Implementation

### File: `/src/lib/services/role-progression.ts`

```typescript
// Types
export type MembershipRole =
  | 'supporter'
  | 'candidate'
  | 'member'
  | 'honorary_member'
  | 'network_leader'
  | 'regional_leader'
  | 'national_leader'
  | 'network_guide';

export type StaffRole = 'none' | 'news_editor' | 'admin' | 'super_admin';

export interface RoleRequirement {
  role: MembershipRole;
  roleLevel: number;
  displayNameUk: string;
  descriptionUk: string;
  requiresContribution: boolean;
  minContributionAmount: number | null;
  minDirectReferrals: number;
  minDirectReferralsAtRole: MembershipRole | null;
  minTotalReferrals: number;
  minHelpedAdvance: number;
  helpedAdvanceFromRole: MembershipRole | null;
  helpedAdvanceToRole: MembershipRole | null;
  privileges: string[];
}

export interface RoleEligibility {
  currentRole: MembershipRole;
  eligibleFor: MembershipRole | null;
  progress: {
    contribution?: { current: boolean; required: boolean };
    directReferrals?: { current: number; required: number; atRole: MembershipRole };
    totalReferrals?: { current: number; required: number };
    helpedAdvance?: { current: number; required: number; from: MembershipRole; to: MembershipRole };
  };
  percentComplete: number;
}

// Service Functions
export async function getUserRoleEligibility(userId: string): Promise<RoleEligibility>;
export async function checkAndAdvanceRole(userId: string): Promise<MembershipRole | null>;
export async function getNextRoleRequirements(currentRole: MembershipRole): Promise<RoleRequirement | null>;
export async function recalculateUserStats(userId: string): Promise<void>;
export async function getReferralTreeStats(userId: string): Promise<ReferralStats>;
export async function advanceUserRole(userId: string, toRole: MembershipRole, adminId?: string): Promise<void>;
```

---

## API Routes

### New API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/user/role-progress` | Get current user's role and progress to next |
| GET | `/api/user/referral-stats` | Get user's referral tree statistics |
| POST | `/api/user/check-advancement` | Check if eligible and advance if so |
| GET | `/api/admin/role-requirements` | List all role requirements (admin) |
| PATCH | `/api/admin/role-requirements/[role]` | Update requirements (super_admin) |
| POST | `/api/admin/members/[id]/advance-role` | Manually advance member role |
| GET | `/api/admin/role-advancements` | List recent role advancements |

---

## UI Components

### 1. Role Progress Card (`RoleProgressCard.tsx`)
- Shows current role with icon/badge
- Progress bar to next role
- List of requirements with checkmarks
- "Перевірити підвищення" button

### 2. Referral Tree Visualization (`ReferralTreeView.tsx`)
- Interactive tree diagram
- Shows direct referrals and their roles
- Highlights who needs advancement
- Stats summary (total tree, by role level)

### 3. Role Badge Component (`RoleBadge.tsx`)
- Consistent role display across app
- Color-coded by level
- Tooltip with role description

### 4. Advancement Celebration Modal (`RoleAdvancementModal.tsx`)
- Confetti animation on role up
- New privileges unlocked list
- Share achievement option

### 5. Admin Role Management (`AdminRoleManager.tsx`)
- Table of role requirements (editable for super_admin)
- Recent advancements feed
- Manual role override with audit log

---

## Implementation Phases

### Phase 1: Database & Core (Week 1)
- [ ] Create migration for new enums and tables
- [ ] Migrate existing users to new role system
- [ ] Implement PostgreSQL functions
- [ ] Set up triggers for stats updates
- [ ] Seed role requirements

### Phase 2: Service Layer (Week 2)
- [ ] Implement `role-progression.ts` service
- [ ] Add role checking to payment callback
- [ ] Create scheduled job for stats recalculation
- [ ] Update permissions system for new roles

### Phase 3: API Routes (Week 3)
- [ ] User-facing role progress API
- [ ] Admin role management APIs
- [ ] Webhook for role changes (Convex real-time)
- [ ] Integration tests

### Phase 4: UI Components (Week 4)
- [ ] Role progress card for dashboard
- [ ] Referral tree visualization
- [ ] Role badges throughout app
- [ ] Advancement celebration modal
- [ ] Admin settings for role requirements

### Phase 5: Testing & Polish (Week 5)
- [ ] E2E tests for role advancement flows
- [ ] Performance testing for large referral trees
- [ ] Ukrainian translations review
- [ ] Documentation for users

---

## Migration Strategy

### Data Migration Steps
1. Add new columns without removing old `role` column
2. Populate `membership_role` based on mapping
3. Populate `staff_role` for admin users
4. Run initial stats calculation for all users
5. Verify data integrity
6. Update all code to use new columns
7. Remove old `role` column (separate migration)

### Role Mapping (Old → New)
| Old Role | New Membership Role | New Staff Role |
|----------|---------------------|----------------|
| free_viewer | supporter | none |
| prospect | candidate | none |
| silent_member | member | none |
| full_member | member | none |
| group_leader | network_leader | none |
| regional_leader | regional_leader | none |
| news_editor | member | news_editor |
| admin | member | admin |
| super_admin | member | super_admin |

---

## Constants Update

### File: `/src/lib/constants.ts`

```typescript
export const MEMBERSHIP_ROLES = {
  supporter: {
    level: 0,
    label: 'Прихильник',
    description: 'Зареєстрований користувач',
    color: 'gray',
    icon: 'UserPlus',
  },
  candidate: {
    level: 1,
    label: 'Кандидат в члени',
    description: 'Зробив перший внесок',
    color: 'blue',
    icon: 'UserCheck',
  },
  member: {
    level: 2,
    label: 'Член Мережі',
    description: 'Повноправний член',
    color: 'green',
    icon: 'Users',
  },
  honorary_member: {
    level: 3,
    label: 'Почесний Член',
    description: 'Допоміг іншим стати членами',
    color: 'purple',
    icon: 'Award',
  },
  network_leader: {
    level: 4,
    label: 'Лідер Мережі',
    description: 'Лідер з великою командою',
    color: 'orange',
    icon: 'Crown',
  },
  regional_leader: {
    level: 5,
    label: 'Регіональний лідер',
    description: 'Координатор регіону',
    color: 'red',
    icon: 'MapPin',
  },
  national_leader: {
    level: 6,
    label: 'Національний лідер',
    description: 'Національний координатор',
    color: 'gold',
    icon: 'Globe',
  },
  network_guide: {
    level: 7,
    label: 'Провідник Мережі',
    description: 'Найвищий рівень довіри',
    color: 'platinum',
    icon: 'Star',
  },
} as const;

export const STAFF_ROLES = {
  none: { label: 'Без ролі', level: 0 },
  news_editor: { label: 'Редактор новин', level: 1 },
  admin: { label: 'Адміністратор', level: 2 },
  super_admin: { label: 'Супер адміністратор', level: 3 },
} as const;
```

---

## Privileges Matrix

| Privilege | supporter | candidate | member | honorary | leader | regional | national | guide |
|-----------|:---------:|:---------:|:------:|:--------:|:------:|:--------:|:--------:|:-----:|
| Newsletter | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Primary Voting | | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Full Voting | | | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Events | | | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Tasks | | | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Loyalty Program | | | | ✓ | ✓ | ✓ | ✓ | ✓ |
| Nomination | | | | | ✓ | ✓ | ✓ | ✓ |
| Leaders' Council | | | | | ✓ | ✓ | ✓ | ✓ |
| Mayor Priority | | | | | | ✓ | ✓ | ✓ |
| MP/President Priority | | | | | | | ✓ | ✓ |
| Budget Control (70%) | | | | | | | | ✓ |

---

## Design Decisions (Confirmed)

1. **Contribution Amount**: Minimum 49 UAH (4900 kopecks) to become a Candidate - matches basic_49 tier

2. **Role Downgrade**: NO - once a role is achieved, it is permanent regardless of referral status

3. **Grace Period**: None required - advancement happens when requirements are met

4. **Manual Override**: Super admins can promote users; demotion not supported

5. **Legacy Users**: All existing users must re-qualify under the new system (fresh start)

6. **Voting Types**:
   - "Primary voting" = Internal voting for candidates in elections (кандидат level+)
   - "Full voting" = All organization votes and decisions (член level+)

7. **Advancement Mode**: Configurable in admin settings:
   - `automatic` - Roles upgrade instantly when requirements met
   - `approval_required` - User requests advancement, admin approves

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Performance issues with large trees | Medium | High | Caching layer, async calculation |
| Data migration errors | Low | Critical | Staged rollout, backup before migration |
| Users confused by new system | Medium | Medium | In-app education, gradual rollout |
| Requirements too hard to achieve | Medium | High | Configurable requirements, A/B testing |

---

## Success Metrics

1. **Adoption**: % of users who advance beyond supporter
2. **Engagement**: Increased referral activity post-launch
3. **Retention**: Higher retention for users with referral trees
4. **Satisfaction**: Survey scores on role system clarity

---

*Plan created: 2025-12-29*
*Author: Claude Code Orchestrator*
