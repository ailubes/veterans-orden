-- ============================================================
-- Bot RLS fix: grant anon SELECT + SECURITY DEFINER write RPCs
-- ============================================================

-- 1. SELECT policies for anon role (bot uses anon key)
CREATE POLICY users_anon_read
  ON public.users FOR SELECT TO anon USING (true);

CREATE POLICY votes_anon_read
  ON public.votes FOR SELECT TO anon USING (true);

CREATE POLICY vote_options_anon_read
  ON public.vote_options FOR SELECT TO anon USING (true);

CREATE POLICY user_votes_anon_read
  ON public.user_votes FOR SELECT TO anon USING (true);

CREATE POLICY points_anon_read
  ON public.points_transactions FOR SELECT TO anon USING (true);

-- telegram_invitations: enable RLS + policy (table may not have RLS yet)
ALTER TABLE public.telegram_invitations ENABLE ROW LEVEL SECURITY;
CREATE POLICY tg_invitations_anon_read
  ON public.telegram_invitations FOR SELECT TO anon USING (true);

-- ============================================================
-- 2. SECURITY DEFINER write RPCs (validate bot secret)
-- ============================================================

-- 2a. Link Telegram account to existing user
CREATE OR REPLACE FUNCTION public.bot_link_telegram(
  p_secret              TEXT,
  p_user_id             UUID,
  p_telegram_id         BIGINT,
  p_telegram_username   TEXT DEFAULT NULL,
  p_telegram_first_name TEXT DEFAULT NULL
) RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF p_secret != 'tg_bot_secret_7e3a9f2d1c8b4e5a6d0f3c7b2e9a4d1f' THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;

  UPDATE public.users SET
    telegram_id                    = p_telegram_id,
    telegram_username              = p_telegram_username,
    telegram_first_name            = p_telegram_first_name,
    telegram_linked_at             = NOW(),
    telegram_notifications_enabled = true,
    updated_at                     = NOW()
  WHERE id = p_user_id;

  RETURN FOUND;
END;
$$;
GRANT EXECUTE ON FUNCTION public.bot_link_telegram TO anon, authenticated;

-- 2b. Update telegram notifications setting
CREATE OR REPLACE FUNCTION public.bot_set_notifications(
  p_secret    TEXT,
  p_user_id   UUID,
  p_enabled   BOOLEAN
) RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF p_secret != 'tg_bot_secret_7e3a9f2d1c8b4e5a6d0f3c7b2e9a4d1f' THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;

  UPDATE public.users
    SET telegram_notifications_enabled = p_enabled, updated_at = NOW()
  WHERE id = p_user_id;

  RETURN FOUND;
END;
$$;
GRANT EXECUTE ON FUNCTION public.bot_set_notifications TO anon, authenticated;

-- Disable by telegram_id (for when we only have telegram_id, not user_id)
CREATE OR REPLACE FUNCTION public.bot_disable_notifications_by_tgid(
  p_secret      TEXT,
  p_telegram_id BIGINT
) RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF p_secret != 'tg_bot_secret_7e3a9f2d1c8b4e5a6d0f3c7b2e9a4d1f' THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;

  UPDATE public.users
    SET telegram_notifications_enabled = false, updated_at = NOW()
  WHERE telegram_id = p_telegram_id;

  RETURN FOUND;
END;
$$;
GRANT EXECUTE ON FUNCTION public.bot_disable_notifications_by_tgid TO anon, authenticated;

-- 2c. Cast vote + award 5 points
CREATE OR REPLACE FUNCTION public.bot_cast_vote(
  p_secret    TEXT,
  p_user_id   UUID,
  p_vote_id   UUID,
  p_option_id UUID
) RETURNS TEXT  -- 'ok' | 'already_voted' | 'error'
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_balance    INT;
BEGIN
  IF p_secret != 'tg_bot_secret_7e3a9f2d1c8b4e5a6d0f3c7b2e9a4d1f' THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.user_votes
    WHERE user_id = p_user_id AND vote_id = p_vote_id
  ) THEN
    RETURN 'already_voted';
  END IF;

  INSERT INTO public.user_votes (user_id, vote_id, option_id, casted_at)
  VALUES (p_user_id, p_vote_id, p_option_id, NOW());

  -- Award 5 points
  SELECT COALESCE(
    (SELECT balance_after FROM public.points_transactions
     WHERE user_id = p_user_id ORDER BY created_at DESC LIMIT 1),
    0
  ) INTO v_balance;

  INSERT INTO public.points_transactions (user_id, amount, balance_after, type, description)
  VALUES (p_user_id, 5, v_balance + 5, 'earn_vote', 'Голосування через Telegram бот');

  RETURN 'ok';
EXCEPTION WHEN OTHERS THEN
  RETURN 'error';
END;
$$;
GRANT EXECUTE ON FUNCTION public.bot_cast_vote TO anon, authenticated;

-- 2d. Award referral points
CREATE OR REPLACE FUNCTION public.bot_award_referral_points(
  p_secret         TEXT,
  p_referrer_id    UUID,
  p_new_user_id    UUID
) RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_balance INT;
BEGIN
  IF p_secret != 'tg_bot_secret_7e3a9f2d1c8b4e5a6d0f3c7b2e9a4d1f' THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;

  SELECT COALESCE(
    (SELECT balance_after FROM public.points_transactions
     WHERE user_id = p_referrer_id ORDER BY created_at DESC LIMIT 1),
    0
  ) INTO v_balance;

  INSERT INTO public.points_transactions (user_id, amount, balance_after, type, description, metadata)
  VALUES (
    p_referrer_id, 25, v_balance + 25,
    'earn_referral', 'Реєстрація реферала через Telegram бот',
    jsonb_build_object('referred_user_id', p_new_user_id)
  );

  RETURN true;
END;
$$;
GRANT EXECUTE ON FUNCTION public.bot_award_referral_points TO anon, authenticated;

-- 2e. Save telegram invitation
CREATE OR REPLACE FUNCTION public.bot_save_invitation(
  p_secret               TEXT,
  p_inviter_id           UUID,
  p_telegram_id          BIGINT,
  p_telegram_username    TEXT DEFAULT NULL,
  p_telegram_first_name  TEXT DEFAULT NULL
) RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF p_secret != 'tg_bot_secret_7e3a9f2d1c8b4e5a6d0f3c7b2e9a4d1f' THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;

  INSERT INTO public.telegram_invitations
    (inviter_id, telegram_id, telegram_username, telegram_first_name, invited_at)
  VALUES
    (p_inviter_id, p_telegram_id, p_telegram_username, p_telegram_first_name, NOW())
  ON CONFLICT (telegram_id) DO UPDATE SET
    inviter_id           = EXCLUDED.inviter_id,
    telegram_username    = EXCLUDED.telegram_username,
    telegram_first_name  = EXCLUDED.telegram_first_name,
    invited_at           = EXCLUDED.invited_at;

  RETURN true;
END;
$$;
GRANT EXECUTE ON FUNCTION public.bot_save_invitation TO anon, authenticated;
