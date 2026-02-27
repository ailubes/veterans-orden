-- Update create_telegram_user to accept full KATOTTG location fields
-- so bot registration stores proper katottg_code, hromada_name, raion_name, oblast_name_katottg

CREATE OR REPLACE FUNCTION public.create_telegram_user(
  p_secret              TEXT,
  p_email               TEXT,
  p_first_name          TEXT,
  p_last_name           TEXT,
  p_phone               TEXT,
  p_telegram_id         BIGINT,
  p_telegram_username   TEXT    DEFAULT NULL,
  p_telegram_first_name TEXT    DEFAULT NULL,
  p_oblast_id           UUID    DEFAULT NULL,
  p_settlement_name     TEXT    DEFAULT NULL,
  p_referred_by_id      UUID    DEFAULT NULL,
  p_referral_code       TEXT    DEFAULT NULL,
  p_katottg_code        TEXT    DEFAULT NULL,
  p_hromada_name        TEXT    DEFAULT NULL,
  p_raion_name          TEXT    DEFAULT NULL,
  p_oblast_name_katottg TEXT    DEFAULT NULL
)
RETURNS TABLE(id uuid, first_name text, last_name text, status text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'auth', 'extensions'
AS $function$
DECLARE
  v_auth_id   UUID;
  v_user_id   UUID;
BEGIN
  IF p_secret != 'tg_bot_secret_7e3a9f2d1c8b4e5a6d0f3c7b2e9a4d1f' THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;

  INSERT INTO auth.users (
    id, instance_id, aud, role, email,
    encrypted_password, email_confirmed_at,
    confirmation_token, recovery_token,
    email_change_token_new, email_change,
    is_sso_user, is_anonymous,
    raw_user_meta_data, created_at, updated_at
  ) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    p_email,
    'telegram_' || encode(gen_random_bytes(16), 'hex'),
    NOW(),
    '', '', '', '',
    false, false,
    jsonb_build_object(
      'first_name', p_first_name,
      'last_name',  p_last_name,
      'source',     'telegram_bot'
    ),
    NOW(), NOW()
  ) RETURNING auth.users.id INTO v_auth_id;

  UPDATE public.users SET
    first_name                     = p_first_name,
    last_name                      = p_last_name,
    phone                          = p_phone,
    telegram_id                    = p_telegram_id,
    telegram_username              = p_telegram_username,
    telegram_first_name            = p_telegram_first_name,
    telegram_linked_at             = NOW(),
    telegram_notifications_enabled = true,
    oblast_id                      = p_oblast_id,
    settlement_name                = p_settlement_name,
    katottg_code                   = p_katottg_code,
    hromada_name                   = p_hromada_name,
    raion_name                     = p_raion_name,
    oblast_name_katottg            = p_oblast_name_katottg,
    referred_by_id                 = p_referred_by_id,
    referral_code                  = COALESCE(p_referral_code, referral_code),
    member_since                   = NOW(),
    updated_at                     = NOW()
  WHERE auth_id = v_auth_id
  RETURNING public.users.id INTO v_user_id;

  RETURN QUERY
    SELECT u.id, u.first_name, u.last_name, u.status
    FROM public.users u
    WHERE u.id = v_user_id;
END;
$function$;
