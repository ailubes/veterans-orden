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

function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

async function uniqueReferralCode(): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateReferralCode();
    const { data } = await supabase
      .from('users')
      .select('id')
      .eq('referral_code', code)
      .single();
    if (!data) return code;
  }
  // Fallback: timestamp-based
  return 'TG' + Date.now().toString(36).toUpperCase().slice(-6);
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
  settlementName?: string;
  referrerId?: string;
}) {
  const email = params.email.toLowerCase().trim();

  // 1. Create Supabase Auth user (required: auth_id is NOT NULL)
  const randomPassword = crypto.randomUUID() + crypto.randomUUID();
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password: randomPassword,
    email_confirm: true, // mark email as confirmed
    user_metadata: {
      first_name: params.firstName,
      last_name: params.lastName,
      source: 'telegram_bot',
    },
  });

  if (authError || !authData.user) {
    console.error('[TG DB] createUserFromTelegram auth error:', authError);
    return null;
  }

  // 2. Generate unique referral code
  const referralCode = await uniqueReferralCode();

  // 3. Insert into public.users
  const { data, error } = await supabase
    .from('users')
    .insert({
      auth_id: authData.user.id,
      telegram_id: params.telegramId,
      telegram_username: params.telegramUsername || null,
      telegram_first_name: params.telegramFirstName || null,
      telegram_linked_at: new Date().toISOString(),
      telegram_notifications_enabled: true,
      phone: params.phone,
      email,
      first_name: params.firstName,
      last_name: params.lastName,
      oblast_id: params.oblastId || null,
      settlement_name: params.settlementName || null,
      referred_by_id: params.referrerId || null,
      referral_code: referralCode,
      status: 'pending',
      role: 'prospect',
      membership_tier: 'free',
      member_since: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('[TG DB] createUserFromTelegram insert error:', error);
    // Clean up auth user to avoid orphan
    await supabase.auth.admin.deleteUser(authData.user.id);
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
    .eq('referred_by_id', userId);

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
    .eq('referred_by_id', userId)
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

async function getUserBalance(userId: string): Promise<number> {
  const { data } = await supabase
    .from('points_transactions')
    .select('balance_after')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  return (data as { balance_after: number } | null)?.balance_after ?? 0;
}

export async function castVote(userId: string, voteId: string, optionId: string) {
  // Check if user already voted
  const { data: existing } = await supabase
    .from('user_votes')
    .select('id')
    .eq('user_id', userId)
    .eq('vote_id', voteId)
    .single();

  if (existing) return { success: false, reason: 'already_voted' };

  const { error } = await supabase.from('user_votes').insert({
    user_id: userId,
    vote_id: voteId,
    option_id: optionId,
    casted_at: new Date().toISOString(),
  });

  if (error) return { success: false, reason: 'error' };

  // Award points for voting
  const currentBalance = await getUserBalance(userId);
  await supabase.from('points_transactions').insert({
    user_id: userId,
    amount: 5,
    balance_after: currentBalance + 5,
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
  const currentBalance = await getUserBalance(referrerId);
  await supabase.from('points_transactions').insert({
    user_id: referrerId,
    amount: 25,
    balance_after: currentBalance + 25,
    type: 'earn_referral',
    description: 'Реєстрація реферала через Telegram бот',
    metadata: { referred_user_id: newUserId },
  });
}

// Hardcoded fallback in case the DB query fails
const OBLASTS_FALLBACK = [
  { id: 'f01ab202-f80c-4219-9cf7-e8f4428b2f9e', name: 'Вінницька' },
  { id: '07b17900-469b-48e3-89e2-3fc403f6e745', name: 'Волинська' },
  { id: '50fd6ea2-de37-49d8-87f1-a4e09e0aad4a', name: 'Дніпропетровська' },
  { id: 'ea3a4beb-f1d4-4ba3-b4c8-89143b39fe17', name: 'Донецька' },
  { id: '5de05ba7-7693-4d2d-9b05-08709b9ab876', name: 'Житомирська' },
  { id: '5127a07d-4474-4511-a2fe-1b0d2128e5a9', name: 'Закарпатська' },
  { id: 'c85b4925-04b0-4bb2-b0ec-4cbf071653df', name: 'Запорізька' },
  { id: '1dbb8ab6-d0ac-440e-96a4-5d0107384ff7', name: 'Івано-Франківська' },
  { id: 'e44457ba-9103-4642-8c87-9304fd79bf5e', name: 'Київська' },
  { id: '078a898c-97eb-4ab3-9343-35120f07f5c2', name: 'Кіровоградська' },
  { id: 'd3d55d1a-c368-4f1a-a9fc-9bad763e3b9a', name: 'Луганська' },
  { id: '03b7a42c-4e41-4629-9a91-0285d5559cf5', name: 'Львівська' },
  { id: '34253a9f-a1ff-4bdb-ae90-0cc58d15baa9', name: 'м. Київ' },
  { id: '21965017-dddd-40cb-b116-91970f17cd60', name: 'Миколаївська' },
  { id: '591a3fbf-0d32-4486-b241-0766383b378f', name: 'Одеська' },
  { id: '74d8cc04-9eb5-4c1e-9e1b-e5711dd32544', name: 'Полтавська' },
  { id: 'd0ca37d1-3e96-4fe7-8ca4-3f8a708991c3', name: 'Рівненська' },
  { id: 'b15158b4-1ebd-43cb-bcbf-db970c80dd00', name: 'Сумська' },
  { id: 'a5a1ff34-aef3-4021-93dd-103cb8e65644', name: 'Тернопільська' },
  { id: 'a06fe9cf-33ab-4bca-9d4b-407eabcfb07e', name: 'Харківська' },
  { id: '0703b793-e330-4077-8f93-8037cbe2293f', name: 'Херсонська' },
  { id: '0a06040e-a996-4c67-a617-eedc0afa8ead', name: 'Хмельницька' },
  { id: '643aab17-1a66-419a-bed4-3a689729f48f', name: 'Черкаська' },
  { id: '97315dcc-19e6-4e71-ace7-92d8ead00f0e', name: 'Чернівецька' },
  { id: '12815e76-60f0-4248-a970-9cd3c1c6cfda', name: 'Чернігівська' },
];

export async function getOblasts() {
  const { data, error } = await supabase
    .from('oblasts')
    .select('id, name')
    .order('name', { ascending: true });
  if (error) console.error('[TG DB] getOblasts error:', error);
  return (data && data.length > 0) ? data : OBLASTS_FALLBACK;
}

export async function disableTelegramNotifications(telegramId: number) {
  await supabase
    .from('users')
    .update({ telegram_notifications_enabled: false })
    .eq('telegram_id', telegramId);
}
