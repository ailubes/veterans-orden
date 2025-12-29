-- Migration: 0027_add_membership_role_system.sql
-- Description: Add new membership role progression system with 8 tiers
-- Date: 2025-12-29

-- =====================================================
-- PART 1: Create New Enums
-- =====================================================

-- Membership role enum (progression-based, 8 levels)
CREATE TYPE membership_role AS ENUM (
  'supporter',        -- Level 0: Registered, no contribution
  'candidate',        -- Level 1: Made 49+ UAH contribution, primary voting
  'member',           -- Level 2: 2 recruited candidates, full voting
  'honorary_member',  -- Level 3: 2 recruits became members, loyalty program
  'network_leader',   -- Level 4: 8 personal + 49 total referrals, nomination rights
  'regional_leader',  -- Level 5: 6 helped to leader + 400 total, mayor priority
  'national_leader',  -- Level 6: 4 helped to regional + 4000 total, MP priority
  'network_guide'     -- Level 7: 2 helped to national + 25000 total, budget control
);

-- Staff role enum (administrative, separate from membership)
CREATE TYPE staff_role AS ENUM (
  'none',
  'news_editor',
  'admin',
  'super_admin'
);

-- Advancement trigger type enum
CREATE TYPE advancement_trigger AS ENUM (
  'contribution',      -- Made required contribution
  'referral_count',    -- Met direct referral requirement
  'tree_count',        -- Met total referral tree requirement
  'helped_advance',    -- Enough referrals advanced to required role
  'manual'             -- Admin manually advanced
);

-- Advancement mode enum (for organization settings)
CREATE TYPE advancement_mode AS ENUM (
  'automatic',         -- Roles upgrade instantly when requirements met
  'approval_required'  -- User requests advancement, admin approves
);

-- =====================================================
-- PART 2: Add New Columns to Users Table
-- =====================================================

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS membership_role membership_role DEFAULT 'supporter',
  ADD COLUMN IF NOT EXISTS staff_role staff_role DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS role_advanced_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS total_referral_count INTEGER DEFAULT 0;

-- Create indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_users_membership_role ON users(membership_role);
CREATE INDEX IF NOT EXISTS idx_users_staff_role ON users(staff_role);

-- =====================================================
-- PART 3: Create Role Advancements Tracking Table
-- =====================================================

CREATE TABLE IF NOT EXISTS role_advancements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  from_role membership_role NOT NULL,
  to_role membership_role NOT NULL,
  advanced_at TIMESTAMPTZ DEFAULT NOW(),
  advanced_by UUID REFERENCES users(id) ON DELETE SET NULL, -- The referrer who helped
  trigger_type advancement_trigger NOT NULL,
  trigger_data JSONB DEFAULT '{}',
  approved_by UUID REFERENCES users(id) ON DELETE SET NULL, -- Admin who approved (if approval_required mode)
  approved_at TIMESTAMPTZ,

  -- Ensure advancement is always upward (can't go backwards)
  CONSTRAINT valid_advancement CHECK (from_role < to_role)
);

CREATE INDEX idx_role_advancements_user ON role_advancements(user_id);
CREATE INDEX idx_role_advancements_advanced_by ON role_advancements(advanced_by);
CREATE INDEX idx_role_advancements_to_role ON role_advancements(to_role);
CREATE INDEX idx_role_advancements_advanced_at ON role_advancements(advanced_at DESC);

-- =====================================================
-- PART 4: Create Role Requirements Configuration Table
-- =====================================================

CREATE TABLE IF NOT EXISTS role_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role membership_role NOT NULL UNIQUE,
  role_level INTEGER NOT NULL,
  display_name_uk VARCHAR(100) NOT NULL,
  description_uk TEXT,

  -- Contribution requirement (for candidate level)
  requires_contribution BOOLEAN DEFAULT FALSE,
  min_contribution_amount INTEGER DEFAULT 0, -- in kopecks (4900 = 49 UAH)

  -- Direct referral requirements
  min_direct_referrals INTEGER DEFAULT 0,
  min_direct_referrals_at_role membership_role, -- referrals must be at least this role

  -- Total tree requirements (all descendants)
  min_total_referrals INTEGER DEFAULT 0,

  -- "Helped advance" requirements
  min_helped_advance INTEGER DEFAULT 0,
  helped_advance_from_role membership_role,
  helped_advance_to_role membership_role,

  -- Privileges (stored as JSONB array for flexibility)
  privileges JSONB DEFAULT '[]',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PART 5: Seed Role Requirements
-- =====================================================

INSERT INTO role_requirements (
  role, role_level, display_name_uk, description_uk,
  requires_contribution, min_contribution_amount,
  min_direct_referrals, min_direct_referrals_at_role,
  min_total_referrals,
  min_helped_advance, helped_advance_from_role, helped_advance_to_role,
  privileges
) VALUES
-- Level 0: Supporter
('supporter', 0, 'Прихильник', 'Зареєстрований користувач без внеску. Отримує розсилку новин.',
 FALSE, NULL, 0, NULL, 0, 0, NULL, NULL,
 '["newsletter"]'),

-- Level 1: Candidate
('candidate', 1, 'Кандидат в члени', 'Зробив внесок від 49 грн. Може голосувати на праймеріз.',
 TRUE, 4900, 0, NULL, 0, 0, NULL, NULL,
 '["newsletter", "primary_voting"]'),

-- Level 2: Member
('member', 2, 'Член Мережі', 'Залучив 2 кандидатів. Повні права голосування.',
 FALSE, NULL, 2, 'candidate', 0, 0, NULL, NULL,
 '["newsletter", "primary_voting", "full_voting", "events", "tasks"]'),

-- Level 3: Honorary Member
('honorary_member', 3, 'Почесний Член', '2 залучених стали Членами. Доступ до програми лояльності.',
 FALSE, NULL, 0, NULL, 0, 2, 'candidate', 'member',
 '["newsletter", "primary_voting", "full_voting", "events", "tasks", "loyalty_program"]'),

-- Level 4: Network Leader
('network_leader', 4, 'Лідер Мережі', '8 особистих рефералів + 49 в дереві. Право на номінацію, доступ до Ради Лідерів.',
 FALSE, NULL, 8, 'candidate', 49, 0, NULL, NULL,
 '["newsletter", "primary_voting", "full_voting", "events", "tasks", "loyalty_program", "nomination", "leaders_council"]'),

-- Level 5: Regional Leader
('regional_leader', 5, 'Регіональний лідер', 'Допоміг 6 Почесним Членам стати Лідерами + 400 загальних. Пріоритет на номінацію мера.',
 FALSE, NULL, 0, NULL, 400, 6, 'honorary_member', 'network_leader',
 '["newsletter", "primary_voting", "full_voting", "events", "tasks", "loyalty_program", "nomination", "leaders_council", "mayor_priority"]'),

-- Level 6: National Leader
('national_leader', 6, 'Національний лідер', 'Допоміг 4 Лідерам стати Регіональними + 4000 загальних. Пріоритет на депутата/президента.',
 FALSE, NULL, 0, NULL, 4000, 4, 'network_leader', 'regional_leader',
 '["newsletter", "primary_voting", "full_voting", "events", "tasks", "loyalty_program", "nomination", "leaders_council", "mayor_priority", "mp_priority", "president_priority"]'),

-- Level 7: Network Guide
('network_guide', 7, 'Провідник Мережі', 'Допоміг 2 Регіональним стати Національними + 25000 загальних. Контроль 70% бюджету.',
 FALSE, NULL, 0, NULL, 25000, 2, 'regional_leader', 'national_leader',
 '["newsletter", "primary_voting", "full_voting", "events", "tasks", "loyalty_program", "nomination", "leaders_council", "mayor_priority", "mp_priority", "president_priority", "budget_control"]');

-- =====================================================
-- PART 6: Create User Referral Stats Cache Table
-- =====================================================

CREATE TABLE IF NOT EXISTS user_referral_stats (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,

  -- Direct referrals count by their current role
  direct_supporters INTEGER DEFAULT 0,
  direct_candidates INTEGER DEFAULT 0,
  direct_members INTEGER DEFAULT 0,
  direct_honorary_members INTEGER DEFAULT 0,
  direct_network_leaders INTEGER DEFAULT 0,
  direct_regional_leaders INTEGER DEFAULT 0,
  direct_national_leaders INTEGER DEFAULT 0,
  direct_network_guides INTEGER DEFAULT 0,

  -- Total tree count (all descendants at any depth)
  total_tree_count INTEGER DEFAULT 0,

  -- "Helped advance" counts (direct referrals who advanced from X to Y)
  helped_to_candidate INTEGER DEFAULT 0,
  helped_to_member INTEGER DEFAULT 0,
  helped_to_honorary INTEGER DEFAULT 0,
  helped_to_leader INTEGER DEFAULT 0,
  helped_to_regional INTEGER DEFAULT 0,
  helped_to_national INTEGER DEFAULT 0,
  helped_to_guide INTEGER DEFAULT 0,

  -- Metadata
  last_calculated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PART 7: Add Advancement Mode to Organization Settings
-- =====================================================

-- Add advancement_mode setting if organization_settings table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'organization_settings') THEN
    INSERT INTO organization_settings (key, value, description)
    VALUES ('role_advancement_mode', '"automatic"', 'Mode for role advancement: "automatic" or "approval_required"')
    ON CONFLICT (key) DO NOTHING;
  END IF;
END $$;

-- =====================================================
-- PART 8: Add Pending Advancement Requests Table
-- =====================================================

CREATE TABLE IF NOT EXISTS advancement_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  requested_role membership_role NOT NULL,
  current_role membership_role NOT NULL,
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,

  -- Only one pending request per user
  CONSTRAINT unique_pending_request UNIQUE (user_id, status)
    DEFERRABLE INITIALLY DEFERRED
);

CREATE INDEX idx_advancement_requests_user ON advancement_requests(user_id);
CREATE INDEX idx_advancement_requests_status ON advancement_requests(status);
CREATE INDEX idx_advancement_requests_requested_at ON advancement_requests(requested_at DESC);

COMMENT ON TABLE role_advancements IS 'Tracks all role advancement events for audit and "helped advance" calculations';
COMMENT ON TABLE role_requirements IS 'Configurable requirements for each membership role level';
COMMENT ON TABLE user_referral_stats IS 'Cached referral statistics for performance (recalculated periodically)';
COMMENT ON TABLE advancement_requests IS 'Pending role advancement requests when approval_required mode is enabled';
