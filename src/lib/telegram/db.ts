import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Admin client that bypasses RLS — used for bot operations
export function createBotAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createSupabaseClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

const supabase = createBotAdminClient();

export async function getUserByTelegramId(telegramId: number) {
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('telegram_id', telegramId)
    .single();
  return data;
}

export async function getUserByEmail(email: string) {
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('email', email.toLowerCase().trim())
    .single();
  return data;
}

export async function getUserByPhone(phone: string) {
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('phone', phone)
    .single();
  return data;
}

export async function linkTelegramToUser(
  userId: string,
  telegramId: number,
  telegramUsername?: string,
  telegramFirstName?: string
) {
  const { error } = await supabase
    .from('users')
    .update({
      telegram_id: telegramId,
      telegram_username: telegramUsername || null,
      telegram_first_name: telegramFirstName || null,
      telegram_linked_at: new Date().toISOString(),
      telegram_notifications_enabled: true,
    })
    .eq('id', userId);
  return !error;
}

export async function createUserFromTelegram(params: {
  telegramId: number;
  telegramUsername?: string;
  telegramFirstName?: string;
  phone: string;
  email: string;
  firstName: string;
  lastName: string;
  oblastId?: string;
  referrerId?: string;
  authId?: string;
}) {
  const { data, error } = await supabase
    .from('users')
    .insert({
      auth_id: params.authId || null,
      telegram_id: params.telegramId,
      telegram_username: params.telegramUsername || null,
      telegram_first_name: params.telegramFirstName || null,
      telegram_linked_at: new Date().toISOString(),
      telegram_notifications_enabled: true,
      phone: params.phone,
      email: params.email.toLowerCase().trim(),
      first_name: params.firstName,
      last_name: params.lastName,
      oblast_id: params.oblastId || null,
      referrer_id: params.referrerId || null,
      status: 'pending',
      role: 'prospect',
      membership_tier: 'free',
    })
    .select()
    .single();

  if (error) {
    console.error('[TG DB] createUserFromTelegram error:', error);
    return null;
  }
  return data;
}

export async function getUserStats(userId: string) {
  const { data: user } = await supabase
    .from('users')
    .select('id, first_name, last_name, role, membership_tier, status, created_at')
    .eq('id', userId)
    .single();

  const { count: referralCount } = await supabase
    .from('users')
    .select('id', { count: 'exact', head: true })
    .eq('referrer_id', userId);

  const { data: points } = await supabase
    .from('points_transactions')
    .select('amount')
    .eq('user_id', userId);

  const totalPoints = (points || []).reduce((sum, t) => sum + (t.amount || 0), 0);

  return { user, referralCount: referralCount || 0, totalPoints };
}

export async function getReferrals(userId: string) {
  const { data } = await supabase
    .from('users')
    .select('id, first_name, last_name, status, created_at')
    .eq('referrer_id', userId)
    .order('created_at', { ascending: false })
    .limit(10);
  return data || [];
}

export async function getActiveVotes(oblastId?: string) {
  let query = supabase
    .from('votes')
    .select('id, title, description, ends_at, type, scope, options:vote_options(id, text)')
    .eq('status', 'active')
    .gt('ends_at', new Date().toISOString())
    .order('ends_at', { ascending: true })
    .limit(5);

  if (oblastId) {
    query = query.or(`scope.eq.national,and(scope.eq.regional,oblast_id.eq.${oblastId})`);
  } else {
    query = query.eq('scope', 'national');
  }

  const { data } = await query;
  return data || [];
}

export async function castVote(userId: string, voteId: string, optionId: string) {
  // Check if user already voted
  const { data: existing } = await supabase
    .from('vote_responses')
    .select('id')
    .eq('user_id', userId)
    .eq('vote_id', voteId)
    .single();

  if (existing) return { success: false, reason: 'already_voted' };

  const { error } = await supabase.from('vote_responses').insert({
    user_id: userId,
    vote_id: voteId,
    option_id: optionId,
    voted_at: new Date().toISOString(),
  });

  if (error) return { success: false, reason: 'error' };

  // Award points for voting
  await supabase.from('points_transactions').insert({
    user_id: userId,
    amount: 5,
    type: 'earn_vote',
    description: 'Голосування через Telegram бот',
  });

  return { success: true };
}

export async function saveTelegramInvitation(params: {
  inviterId: string;
  telegramId: number;
  telegramUsername?: string;
  telegramFirstName?: string;
}) {
  await supabase.from('telegram_invitations').upsert({
    inviter_id: params.inviterId,
    telegram_id: params.telegramId,
    telegram_username: params.telegramUsername || null,
    telegram_first_name: params.telegramFirstName || null,
    invited_at: new Date().toISOString(),
  }, { onConflict: 'telegram_id' });
}

export async function awardReferralPoints(referrerId: string, newUserId: string) {
  await supabase.from('points_transactions').insert({
    user_id: referrerId,
    amount: 25,
    type: 'earn_referral',
    description: `Реєстрація реферала через Telegram бот`,
    metadata: { referred_user_id: newUserId },
  });
}

export async function getOblasts() {
  const { data } = await supabase
    .from('oblasts')
    .select('id, name_uk')
    .order('name_uk', { ascending: true });
  return data || [];
}

export async function disableTelegramNotifications(telegramId: number) {
  await supabase
    .from('users')
    .update({ telegram_notifications_enabled: false })
    .eq('telegram_id', telegramId);
}
