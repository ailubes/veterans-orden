-- Add optional profile fields for military/service context and member identity
-- Created: 2026-03-04

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS military_unit TEXT,
  ADD COLUMN IF NOT EXISTS position TEXT,
  ADD COLUMN IF NOT EXISTS member_identity TEXT,
  ADD COLUMN IF NOT EXISTS display_name TEXT;

UPDATE public.users
SET member_identity = 'supporter'
WHERE member_identity IS NULL;

UPDATE public.users
SET display_name = NULLIF(BTRIM(COALESCE(first_name, '') || ' ' || COALESCE(last_name, '')), '')
WHERE display_name IS NULL OR BTRIM(display_name) = '';

ALTER TABLE public.users
  ALTER COLUMN member_identity SET DEFAULT 'supporter',
  ALTER COLUMN member_identity SET NOT NULL;

CREATE OR REPLACE FUNCTION public.sync_users_display_name()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.display_name := NULLIF(BTRIM(COALESCE(NEW.first_name, '') || ' ' || COALESCE(NEW.last_name, '')), '');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_users_display_name ON public.users;
CREATE TRIGGER trg_sync_users_display_name
BEFORE INSERT OR UPDATE OF first_name, last_name
ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.sync_users_display_name();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'users_member_identity_check'
  ) THEN
    ALTER TABLE public.users
      ADD CONSTRAINT users_member_identity_check
      CHECK (member_identity IN ('veteran', 'volunteer', 'supporter'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_users_member_identity ON public.users (member_identity);
CREATE INDEX IF NOT EXISTS idx_users_display_name ON public.users (display_name);
