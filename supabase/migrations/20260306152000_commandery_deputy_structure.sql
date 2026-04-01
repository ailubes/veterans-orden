-- Commandery structure: leader + up to 2 elected deputies

-- 1) Add explicit org role type for commandery deputies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'org_role_type'
      AND e.enumlabel = 'deputy_commander'
  ) THEN
    ALTER TYPE org_role_type ADD VALUE 'deputy_commander';
  END IF;
END
$$;

-- 2) Add role label metadata
INSERT INTO org_role_labels (role_type, name_uk, name_en, description_uk, description_en, display_order)
VALUES (
  'deputy_commander',
  'Заступник керівника командерії',
  'Commandery Deputy',
  'Заступник лідера командерії, обраний членами командерії. Виконує обов''язки керівника за його відсутності.',
  'Deputy leader of commandery elected by commandery members. Acts as leader when the leader is absent.',
  8
)
ON CONFLICT (role_type) DO UPDATE SET
  name_uk = EXCLUDED.name_uk,
  name_en = EXCLUDED.name_en,
  description_uk = EXCLUDED.description_uk,
  description_en = EXCLUDED.description_en,
  display_order = EXCLUDED.display_order;

-- 3) DB safety: no more than 2 active deputies per commandery
CREATE OR REPLACE FUNCTION enforce_max_two_active_commandery_deputies()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  active_count integer;
BEGIN
  IF NEW.role_type <> 'deputy_commander'::org_role_type THEN
    RETURN NEW;
  END IF;

  IF COALESCE(NEW.is_active, true) = false THEN
    RETURN NEW;
  END IF;

  IF NEW.commandery_id IS NULL THEN
    RAISE EXCEPTION 'deputy_commander role requires commandery_id';
  END IF;

  SELECT COUNT(*) INTO active_count
  FROM user_org_roles uor
  WHERE uor.role_type = 'deputy_commander'::org_role_type
    AND uor.commandery_id = NEW.commandery_id
    AND COALESCE(uor.is_active, true) = true
    AND uor.id <> NEW.id;

  IF active_count >= 2 THEN
    RAISE EXCEPTION 'Only up to 2 active deputy commanders are allowed per commandery';
  END IF;

  RETURN NEW;
END
$$;

DROP TRIGGER IF EXISTS trg_enforce_max_two_active_commandery_deputies ON user_org_roles;
CREATE TRIGGER trg_enforce_max_two_active_commandery_deputies
BEFORE INSERT OR UPDATE ON user_org_roles
FOR EACH ROW
EXECUTE FUNCTION enforce_max_two_active_commandery_deputies();

-- 4) Allow commandery coordinators/deputies to submit/update MVP reports
DROP POLICY IF EXISTS "commandery_mvp_leader_insert" ON commandery_mvp_reports;
CREATE POLICY "commandery_mvp_leader_insert"
  ON commandery_mvp_reports
  FOR INSERT
  TO authenticated
  WITH CHECK (
    submitted_by_id = get_current_user_id()
    AND (
      is_admin()
      OR EXISTS (
        SELECT 1
        FROM commanderies c
        WHERE c.id = commandery_mvp_reports.commandery_id
          AND c.leader_id = get_current_user_id()
      )
      OR EXISTS (
        SELECT 1
        FROM user_org_roles uor
        WHERE uor.user_id = get_current_user_id()
          AND uor.commandery_id = commandery_mvp_reports.commandery_id
          AND uor.is_active = true
          AND uor.role_type IN ('regional_coordinator'::org_role_type, 'komandant'::org_role_type, 'deputy_commander'::org_role_type)
      )
    )
  );

DROP POLICY IF EXISTS "commandery_mvp_leader_update" ON commandery_mvp_reports;
CREATE POLICY "commandery_mvp_leader_update"
  ON commandery_mvp_reports
  FOR UPDATE
  TO authenticated
  USING (
    is_admin()
    OR EXISTS (
      SELECT 1
      FROM commanderies c
      WHERE c.id = commandery_mvp_reports.commandery_id
        AND c.leader_id = get_current_user_id()
    )
    OR EXISTS (
      SELECT 1
      FROM user_org_roles uor
      WHERE uor.user_id = get_current_user_id()
        AND uor.commandery_id = commandery_mvp_reports.commandery_id
        AND uor.is_active = true
        AND uor.role_type IN ('regional_coordinator'::org_role_type, 'komandant'::org_role_type, 'deputy_commander'::org_role_type)
    )
  )
  WITH CHECK (
    submitted_by_id = get_current_user_id()
    AND (
      is_admin()
      OR EXISTS (
        SELECT 1
        FROM commanderies c
        WHERE c.id = commandery_mvp_reports.commandery_id
          AND c.leader_id = get_current_user_id()
      )
      OR EXISTS (
        SELECT 1
        FROM user_org_roles uor
        WHERE uor.user_id = get_current_user_id()
          AND uor.commandery_id = commandery_mvp_reports.commandery_id
          AND uor.is_active = true
          AND uor.role_type IN ('regional_coordinator'::org_role_type, 'komandant'::org_role_type, 'deputy_commander'::org_role_type)
      )
    )
  );
