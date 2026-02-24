-- SECURITY DEFINER function: creates auth + public user for Telegram bot registration
-- The on_auth_user_created trigger (handle_new_user) auto-creates the public user row,
-- so we INSERT into auth.users then UPDATE public.users with telegram-specific fields.
CREATE OR REPLACE FUNCTION public.create_telegram_user(
  p_secret          TEXT,
  p_email           TEXT,
  p_first_name      TEXT,
  p_last_name       TEXT,
  p_phone           TEXT,
  p_telegram_id     BIGINT,
  p_telegram_username TEXT DEFAULT NULL,
  p_telegram_first_name TEXT DEFAULT NULL,
  p_oblast_id       UUID DEFAULT NULL,
  p_settlement_name TEXT DEFAULT NULL,
  p_referred_by_id  UUID DEFAULT NULL,
  p_referral_code   TEXT DEFAULT NULL
) RETURNS TABLE(id UUID, first_name TEXT, last_name TEXT, status TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  v_auth_id   UUID;
  v_user_id   UUID;
BEGIN
  -- Validate bot secret
  IF p_secret != 'tg_bot_secret_7e3a9f2d1c8b4e5a6d0f3c7b2e9a4d1f' THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;

  -- Create auth user (the on_auth_user_created trigger will auto-create public.users row)
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
    -- Simple non-bcrypt placeholder; telegram users never log in with password
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

  -- The trigger created a basic public.users row; now update it with full telegram data
  UPDATE public.users SET
    first_name                    = p_first_name,
    last_name                     = p_last_name,
    phone                         = p_phone,
    telegram_id                   = p_telegram_id,
    telegram_username             = p_telegram_username,
    telegram_first_name           = p_telegram_first_name,
    telegram_linked_at            = NOW(),
    telegram_notifications_enabled = true,
    oblast_id                     = p_oblast_id,
    settlement_name               = p_settlement_name,
    referred_by_id                = p_referred_by_id,
    referral_code                 = COALESCE(p_referral_code, referral_code),
    member_since                  = NOW(),
    updated_at                    = NOW()
  WHERE auth_id = v_auth_id
  RETURNING public.users.id INTO v_user_id;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'public user not found after auth insert for auth_id=%', v_auth_id;
  END IF;

  RETURN QUERY SELECT v_user_id, p_first_name::TEXT, p_last_name::TEXT, 'pending'::TEXT;
END;
$$;

-- Allow anon and authenticated roles to call this function
GRANT EXECUTE ON FUNCTION public.create_telegram_user TO anon, authenticated;
