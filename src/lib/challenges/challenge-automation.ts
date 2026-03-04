import { createClient } from '@/lib/supabase/server';
import { awardPoints } from '@/lib/points';
import { joinChallenge } from './challenge-service';

const STREAK_MILESTONES: Record<number, number> = {
  3: 15,
  7: 40,
  14: 100,
};

async function notifyUser(
  userId: string,
  title: string,
  message: string,
  referenceType?: string,
  referenceId?: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  const supabase = await createClient();

  const { data: notification } = await supabase
    .from('notifications')
    .insert({
      title,
      message,
      type: 'info',
      message_type: 'admin_to_member',
      scope: 'all',
      sender_id: userId,
      reference_type: referenceType || null,
      reference_id: referenceId || null,
      metadata: metadata || {},
    })
    .select('id')
    .single();

  if (!notification) return;

  await supabase.from('notification_recipients').insert({
    notification_id: notification.id,
    user_id: userId,
  });
}

async function recordAutomationEvent(params: {
  userId: string;
  challengeId?: string;
  eventType: string;
  eventDate?: string;
  metadata?: Record<string, unknown>;
}): Promise<boolean> {
  const supabase = await createClient();
  const payload = {
    user_id: params.userId,
    challenge_id: params.challengeId || null,
    event_type: params.eventType,
    event_date: params.eventDate || null,
    metadata: params.metadata || {},
  };

  const { error } = await supabase.from('challenge_automation_events').insert(payload);

  if (error) {
    if (error.code === '23505') {
      return false;
    }
    throw error;
  }

  return true;
}

export async function autoEnrollStarterChallenge(userId: string): Promise<string | null> {
  const supabase = await createClient();

  const { count: anyParticipation } = await supabase
    .from('challenge_participants')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  if ((anyParticipation || 0) > 0) {
    return null;
  }

  const { data: starterCandidates } = await supabase
    .from('challenges')
    .select('id')
    .eq('status', 'active')
    .eq('goal_type', 'tasks')
    .eq('is_competitive', false)
    .order('goal_target', { ascending: true })
    .limit(1);

  const starterChallengeId = starterCandidates?.[0]?.id;
  if (!starterChallengeId) {
    return null;
  }

  const joined = await joinChallenge(starterChallengeId, userId);
  if (!joined.success) {
    return null;
  }

  const inserted = await recordAutomationEvent({
    userId,
    challengeId: starterChallengeId,
    eventType: 'starter_auto_join',
  });

  if (inserted) {
    await notifyUser(
      userId,
      'Стартовий челендж активовано',
      'Ми автоматично долучили вас до стартового челенджу. Виконайте завдання, щоб отримати перші бали.',
      'challenge',
      starterChallengeId,
      { reason: 'starter_auto_join' }
    );
  }

  return starterChallengeId;
}

export async function sendDailyChallengeNudge(userId: string): Promise<boolean> {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data: participations } = await supabase
    .from('challenge_participants')
    .select(`
      challenge_id,
      progress,
      challenges:challenge_id (
        id,
        title,
        goal_target,
        status,
        end_date
      )
    `)
    .eq('user_id', userId)
    .is('completed_at', null);

  if (!participations || participations.length === 0) {
    return false;
  }

  const openChallenges = participations
    .map((p) => ({
      id: p.challenge_id,
      progress: p.progress || 0,
      challenge: p.challenges as unknown as { id: string; title: string; goal_target: number; status: string; end_date: string },
    }))
    .filter((p) => p.challenge && p.challenge.status === 'active' && p.progress < (p.challenge.goal_target || 0))
    .sort((a, b) => {
      const aRemaining = (a.challenge.goal_target || 0) - a.progress;
      const bRemaining = (b.challenge.goal_target || 0) - b.progress;
      if (aRemaining !== bRemaining) return aRemaining - bRemaining;
      return new Date(a.challenge.end_date).getTime() - new Date(b.challenge.end_date).getTime();
    });

  const target = openChallenges[0];
  if (!target) {
    return false;
  }

  const inserted = await recordAutomationEvent({
    userId,
    challengeId: target.id,
    eventType: 'daily_nudge',
    eventDate: today,
    metadata: {
      progress: target.progress,
      goalTarget: target.challenge.goal_target,
    },
  });

  if (!inserted) {
    return false;
  }

  const remaining = Math.max(0, (target.challenge.goal_target || 0) - target.progress);
  await notifyUser(
    userId,
    'Щоденний прогрес у челенджі',
    `До завершення "${target.challenge.title}" залишилось ${remaining}. Зробіть ще один крок сьогодні.`,
    'challenge',
    target.id,
    { reason: 'daily_nudge' }
  );

  return true;
}

export async function triggerAlmostDonePrompt(
  userId: string,
  challengeId: string,
  progress: number,
  goalTarget: number,
  challengeTitle: string
): Promise<boolean> {
  if (goalTarget <= 0 || progress >= goalTarget) {
    return false;
  }

  const percentage = Math.floor((progress / goalTarget) * 100);
  if (percentage < 80) {
    return false;
  }

  const inserted = await recordAutomationEvent({
    userId,
    challengeId,
    eventType: 'almost_done_prompt',
    metadata: { progress, goalTarget, percentage },
  });

  if (!inserted) {
    return false;
  }

  await notifyUser(
    userId,
    'Ви майже завершили челендж',
    `"${challengeTitle}" виконано на ${percentage}%. Завершіть останні кроки та заберіть нагороду.`,
    'challenge',
    challengeId,
    { reason: 'almost_done', percentage }
  );

  return true;
}

export async function registerChallengeTaskStreak(userId: string): Promise<{ streak: number; bonusAwarded: number }> {
  const supabase = await createClient();
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  const { data: existing } = await supabase
    .from('challenge_user_streaks')
    .select('current_streak, best_streak, last_activity_date')
    .eq('user_id', userId)
    .maybeSingle();

  if (existing?.last_activity_date === todayStr) {
    return { streak: existing.current_streak || 0, bonusAwarded: 0 };
  }

  const nextStreak = existing?.last_activity_date === yesterdayStr
    ? (existing?.current_streak || 0) + 1
    : 1;

  const bestStreak = Math.max(existing?.best_streak || 0, nextStreak);

  await supabase
    .from('challenge_user_streaks')
    .upsert({
      user_id: userId,
      current_streak: nextStreak,
      best_streak: bestStreak,
      last_activity_date: todayStr,
      updated_at: new Date().toISOString(),
    });

  const bonus = STREAK_MILESTONES[nextStreak] || 0;
  if (!bonus) {
    return { streak: nextStreak, bonusAwarded: 0 };
  }

  const eventType = `streak_bonus_${nextStreak}`;
  const inserted = await recordAutomationEvent({
    userId,
    eventType,
    metadata: { streak: nextStreak, bonus },
  });

  if (!inserted) {
    return { streak: nextStreak, bonusAwarded: 0 };
  }

  try {
    await awardPoints({
      userId,
      amount: bonus,
      type: 'earn_challenge',
      description: `Бонус за серію виконання челендж-завдань (${nextStreak} днів)`,
      metadata: { source: 'challenge_streak', streak: nextStreak },
    });
  } catch (error) {
    console.error('Failed to award streak bonus points:', error);
  }

  await notifyUser(
    userId,
    `Серія ${nextStreak} днів`,
    `Ви отримали бонус +${bonus} балів за безперервну участь у челенджах.`,
    'challenge',
    undefined,
    { reason: 'streak_bonus', streak: nextStreak, bonus }
  );

  return { streak: nextStreak, bonusAwarded: bonus };
}
