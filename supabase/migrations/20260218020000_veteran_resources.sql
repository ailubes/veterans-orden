-- Create veteran resources table for civil-life support directory

CREATE TABLE IF NOT EXISTS veteran_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL CHECK (category IN ('jobs', 'legal', 'support', 'healthcare')),
  title TEXT NOT NULL,
  description TEXT,
  contact TEXT,
  address TEXT,
  region TEXT DEFAULT 'national',
  is_free BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast category queries
CREATE INDEX IF NOT EXISTS idx_veteran_resources_category ON veteran_resources(category);
CREATE INDEX IF NOT EXISTS idx_veteran_resources_active ON veteran_resources(is_active);

-- Enable Row Level Security
ALTER TABLE veteran_resources ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read active resources
CREATE POLICY "Authenticated users can read active resources"
  ON veteran_resources FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Only admins can manage resources (via service role or admin check)
CREATE POLICY "Service role can manage resources"
  ON veteran_resources FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Seed some initial resources
INSERT INTO veteran_resources (category, title, description, contact, region, is_free) VALUES
  -- Jobs
  ('jobs', 'Ветеранська платформа зайнятості «ВетеранАктив»', 'Портал для пошуку роботи для ветеранів та роботодавців, які активно залучають ветеранів.', 'https://veteranactiv.org.ua', 'national', true),
  ('jobs', 'Центр зайнятості для ветеранів (Київ)', 'Центр надає безоплатні послуги з профорієнтації, навчання та працевлаштування ветеранів.', '+38 044 000 0000', 'Київ', true),
  ('jobs', 'Програма «Ветеран у бізнесі» — UAWB', 'Навчання підприємництву та підтримка у запуску бізнесу для ветеранів.', 'https://uawb.org.ua', 'national', true),

  -- Legal
  ('legal', 'Безоплатна правова допомога — БВПП', 'Центри безоплатної вторинної правової допомоги для ветеранів у кожному регіоні.', '0 800 213 103', 'national', true),
  ('legal', 'Юридична клініка «Право ветерана»', 'Безоплатні юридичні консультації з питань пільг, статусу, пенсій та соціального захисту.', 'pravovetera@gmail.com', 'national', true),
  ('legal', 'Асоціація правників України — ветеранський відділ', 'Консультації щодо правового статусу учасника бойових дій та оскарження відмов.', 'https://uba.ua', 'national', true),

  -- Support
  ('support', 'Телефон довіри для ветеранів — 1565', 'Цілодобова психологічна підтримка для ветеранів та їхніх сімей. Анонімно.', '1565', 'national', true),
  ('support', 'Центр психологічної підтримки «Лелека»', 'Індивідуальна та групова терапія для ветеранів. Фокус на ПТСР та адаптації.', '+38 067 000 0000', 'Київ', true),
  ('support', 'Програма ментального здоров'я «Поруч»', 'Онлайн-сесії з психологами та психотерапевтами, спеціалізованими на роботі з ветеранами.', 'https://poryuch.com.ua', 'national', true),

  -- Healthcare
  ('healthcare', 'Центр реабілітації ветеранів — МОЗ', 'Мережа центрів медичної та фізичної реабілітації для ветеранів по всій Україні.', '0 800 60 2019', 'national', true),
  ('healthcare', 'Програма протезування — НССУ', 'Безоплатне протезування кінцівок та ортезування для ветеранів.', '0 800 505 012', 'national', true),
  ('healthcare', 'Санаторій «Конча-Заспа» — ветеранська програма', 'Відновлення та реабілітація у санаторних умовах за пільговими програмами.', '+38 044 000 0001', 'Київ', true)

ON CONFLICT DO NOTHING;
