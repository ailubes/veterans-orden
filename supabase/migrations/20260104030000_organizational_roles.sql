-- Migration: Organizational Roles
-- Description: Special roles within the Order of Veterans organization

-- Organizational role types
CREATE TYPE "public"."org_role_type" AS ENUM(
  'honor_court_judge',      -- Суддя Суду Честі
  'honor_court_head',       -- Голова Суду Честі
  'komandant',              -- Комендант комендатури
  'council_thinker',        -- Член Колегії Мислителів
  'president',              -- Президент
  'vice_president',         -- Віце-президент
  'business_mentor',        -- Бізнес-ментор
  'news_editor',            -- Редактор новин
  'mental_support_coord',   -- Координатор псих. підтримки
  'members_admin',          -- Адміністратор членства
  'legal_advisor',          -- Юридичний консультант
  'events_coordinator',     -- Координатор заходів
  'regional_coordinator',   -- Регіональний координатор
  'treasurer',              -- Скарбник
  'secretary'               -- Секретар
);

-- Role scope enum
CREATE TYPE "public"."org_role_scope" AS ENUM(
  'national',    -- Національний рівень
  'regional',    -- Регіональний (комендатура)
  'local'        -- Місцевий (осередок)
);

-- User organizational roles (junction table)
CREATE TABLE user_org_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_type org_role_type NOT NULL,

  -- Scope
  scope org_role_scope DEFAULT 'national',
  commandery_id uuid REFERENCES commanderies(id),  -- NULL for national roles
  group_id uuid REFERENCES groups(id),             -- For local roles

  -- Appointment
  appointed_by uuid REFERENCES users(id),
  appointed_at timestamp DEFAULT now(),
  appointment_notes text,

  -- Term
  term_start timestamp NOT NULL DEFAULT now(),
  term_end timestamp,  -- NULL for indefinite appointments

  -- Status
  is_active boolean DEFAULT true,
  deactivated_at timestamp,
  deactivation_reason text,

  created_at timestamp DEFAULT now() NOT NULL,

  -- Ensure one active role per type per scope
  CONSTRAINT unique_active_org_role
    UNIQUE NULLS NOT DISTINCT (user_id, role_type, commandery_id, group_id, is_active)
);

-- Indexes
CREATE INDEX user_org_roles_user_idx ON user_org_roles(user_id);
CREATE INDEX user_org_roles_type_idx ON user_org_roles(role_type);
CREATE INDEX user_org_roles_scope_idx ON user_org_roles(scope);
CREATE INDEX user_org_roles_commandery_idx ON user_org_roles(commandery_id);
CREATE INDEX user_org_roles_active_idx ON user_org_roles(is_active) WHERE is_active = true;
CREATE INDEX user_org_roles_term_idx ON user_org_roles(term_start, term_end);

-- RLS policies
ALTER TABLE user_org_roles ENABLE ROW LEVEL SECURITY;

-- Anyone can view active organizational roles (public info)
CREATE POLICY "Anyone can view active org roles"
  ON user_org_roles FOR SELECT
  USING (is_active = true);

-- Role labels table (for UI)
CREATE TABLE org_role_labels (
  role_type org_role_type PRIMARY KEY,
  name_uk varchar(100) NOT NULL,
  name_en varchar(100) NOT NULL,
  description_uk text,
  description_en text,
  icon varchar(50),  -- Lucide icon name
  display_order integer DEFAULT 0
);

-- Seed role labels
INSERT INTO org_role_labels (role_type, name_uk, name_en, description_uk, display_order) VALUES
  ('president', 'Президент', 'President', 'Голова Ордену Ветеранів, керує організацією', 1),
  ('vice_president', 'Віце-президент', 'Vice President', 'Заступник Президента, координує напрями роботи', 2),
  ('council_thinker', 'Член Колегії Мислителів', 'Council of Thinkers Member', 'Стратегічне планування та розвиток організації', 3),
  ('honor_court_head', 'Голова Суду Честі', 'Honor Court Head', 'Керує роботою Суду Честі', 4),
  ('honor_court_judge', 'Суддя Суду Честі', 'Honor Court Judge', 'Розглядає справи та виносить рішення', 5),
  ('komandant', 'Комендант', 'Komandant', 'Керівник регіональної комендатури', 6),
  ('regional_coordinator', 'Регіональний координатор', 'Regional Coordinator', 'Координує роботу в регіоні', 7),
  ('business_mentor', 'Бізнес-ментор', 'Business Mentor', 'Допомагає ветеранам розвивати бізнес', 8),
  ('mental_support_coord', 'Координатор псих. підтримки', 'Mental Support Coordinator', 'Координує психологічну допомогу', 9),
  ('legal_advisor', 'Юридичний консультант', 'Legal Advisor', 'Надає правову допомогу', 10),
  ('news_editor', 'Редактор новин', 'News Editor', 'Управляє контентом та комунікаціями', 11),
  ('members_admin', 'Адміністратор членства', 'Members Admin', 'Управляє членством в організації', 12),
  ('events_coordinator', 'Координатор заходів', 'Events Coordinator', 'Організовує події та зустрічі', 13),
  ('treasurer', 'Скарбник', 'Treasurer', 'Управляє фінансами організації', 14),
  ('secretary', 'Секретар', 'Secretary', 'Веде документацію та протоколи', 15);

-- Comments
COMMENT ON TABLE user_org_roles IS 'Organizational roles assigned to users';
COMMENT ON TABLE org_role_labels IS 'UI labels and descriptions for organizational roles';
COMMENT ON COLUMN user_org_roles.term_end IS 'NULL means indefinite appointment';
