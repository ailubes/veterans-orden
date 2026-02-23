-- Migration: Create order_applications table
-- Purpose: Store expressions of interest from users who want to join the Order (ФОРМАТ 2)
-- These are reviewed manually by admins before any invitation is extended.

CREATE TABLE IF NOT EXISTS order_applications (
  id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  name             TEXT         NOT NULL,
  contact          TEXT         NOT NULL,
  applicant_status TEXT         NOT NULL,  -- 'veteran' | 'family' | 'patriot'
  motivation       TEXT,
  submitted_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  reviewed_at      TIMESTAMPTZ,
  admin_notes      TEXT,
  review_status    TEXT         NOT NULL DEFAULT 'pending'  -- 'pending' | 'accepted' | 'rejected'
);

-- Allow anyone to INSERT (public form, no auth required)
ALTER TABLE order_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit an order application"
  ON order_applications
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only service_role (admins) can read/update/delete
CREATE POLICY "Service role has full access"
  ON order_applications
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
