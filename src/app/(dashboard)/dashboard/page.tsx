import { createClient } from '@/lib/supabase/server';
import { StatsCard } from '@/components/dashboard/stats-card';
import Link from 'next/link';
import { Vote, Calendar, CheckSquare, Users } from 'lucide-react';

// Map membership tier to Ukrainian display name
const TIER_NAMES: Record<string, string> = {
  free: 'Безкоштовний',
  basic_49: 'Базовий (49 грн)',
  supporter_100: 'Прихильник (100 грн)',
  supporter_200: 'Прихильник (200 грн)',
  patron_500: 'Патрон (500 грн)',
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch user profile from database
  const { data: profile } = await supabase
    .from('users')
    .select('*, oblast:oblasts(name)')
    .eq('clerk_id', user?.id)
    .single();

  // Fetch upcoming events count
  const { count: upcomingEventsCount } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true })
    .gte('start_date', new Date().toISOString())
    .eq('status', 'published');

  // Fetch active votes count
  const { count: activeVotesCount } = await supabase
    .from('votes')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')
    .gte('end_date', new Date().toISOString());

  // Fetch recent activity
  interface ActivityItem {
    type: 'vote' | 'event' | 'task' | 'referral';
    title: string;
    description: string;
    timestamp: string;
  }

  const activities: ActivityItem[] = [];

  if (profile?.id) {
    // Recent votes
    const { data: recentVotes } = await supabase
      .from('user_votes')
      .select('casted_at, vote:votes(title)')
      .eq('user_id', profile.id)
      .order('casted_at', { ascending: false })
      .limit(3);

    if (recentVotes) {
      recentVotes.forEach((v) => {
        const voteData = v.vote as { title: string } | { title: string }[] | null;
        const vote = Array.isArray(voteData) ? voteData[0] : voteData;
        if (vote?.title) {
          activities.push({
            type: 'vote',
            title: 'Голосування',
            description: vote.title,
            timestamp: v.casted_at,
          });
        }
      });
    }

    // Recent RSVPs
    const { data: recentRsvps } = await supabase
      .from('event_rsvps')
      .select('created_at, status, event:events(title)')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(3);

    if (recentRsvps) {
      const statusLabels: Record<string, string> = {
        going: 'Буду',
        maybe: 'Можливо буду',
        not_going: 'Не буду',
      };
      recentRsvps.forEach((r) => {
        const eventData = r.event as { title: string } | { title: string }[] | null;
        const event = Array.isArray(eventData) ? eventData[0] : eventData;
        if (event?.title) {
          activities.push({
            type: 'event',
            title: statusLabels[r.status] || 'Реєстрація на подію',
            description: event.title,
            timestamp: r.created_at,
          });
        }
      });
    }

    // Recent completed tasks
    const { data: recentTasks } = await supabase
      .from('tasks')
      .select('title, completed_at')
      .eq('assignee_id', profile.id)
      .eq('status', 'completed')
      .not('completed_at', 'is', null)
      .order('completed_at', { ascending: false })
      .limit(3);

    if (recentTasks) {
      recentTasks.forEach((t) => {
        activities.push({
          type: 'task',
          title: 'Завдання виконано',
          description: t.title,
          timestamp: t.completed_at,
        });
      });
    }

    // Recent referrals
    const { data: recentReferrals } = await supabase
      .from('users')
      .select('first_name, created_at')
      .eq('referred_by', profile.id)
      .order('created_at', { ascending: false })
      .limit(3);

    if (recentReferrals) {
      recentReferrals.forEach((r) => {
        activities.push({
          type: 'referral',
          title: 'Новий реферал',
          description: `${r.first_name} приєднався до Мережі`,
          timestamp: r.created_at,
        });
      });
    }
  }

  // Sort all activities by timestamp
  activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  const recentActivities = activities.slice(0, 5);

  const firstName = profile?.first_name || user?.user_metadata?.first_name || 'Члене';
  const points = profile?.points || 0;
  const referralCount = profile?.referral_count || 0;
  const membershipTier = profile?.membership_tier || 'free';

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <p className="label mb-2">ОСОБИСТИЙ КАБІНЕТ</p>
        <h1 className="font-syne text-3xl lg:text-4xl font-bold">
          Вітаємо, {firstName}!
        </h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          label="МОЇ БАЛИ"
          value={points}
          change={points > 0 ? `Рівень ${profile?.level || 1}` : 'Почніть заробляти'}
          changeType={points > 0 ? 'positive' : 'neutral'}
        />
        <StatsCard
          label="ЗАПРОШЕНО"
          value={referralCount}
          change={referralCount > 0 ? `${referralCount} в Мережі` : 'Запросіть друзів'}
          changeType={referralCount > 0 ? 'positive' : 'neutral'}
        />
        <StatsCard
          label="ПОДІЇ"
          value={upcomingEventsCount || 0}
          change={upcomingEventsCount ? `${upcomingEventsCount} найближчих` : 'Немає подій'}
          changeType={upcomingEventsCount ? 'neutral' : 'neutral'}
        />
        <StatsCard
          label="ГОЛОСУВАНЬ"
          value={activeVotesCount || 0}
          change={activeVotesCount ? `${activeVotesCount} активних` : 'Немає голосувань'}
          changeType={activeVotesCount ? 'positive' : 'neutral'}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Referral Card */}
        <div className="bg-timber-dark text-canvas p-6 relative">
          <div className="joint" style={{ top: '-6px', left: '-6px' }} />
          <div className="joint" style={{ top: '-6px', right: '-6px' }} />
          <div className="joint" style={{ bottom: '-6px', left: '-6px' }} />
          <div className="joint" style={{ bottom: '-6px', right: '-6px' }} />

          <p className="label text-accent mb-4">ЗАПРОШУЙ ДРУЗІВ</p>
          <h2 className="font-syne text-2xl font-bold mb-4">
            Розширюй Мережу!
          </h2>
          <p className="text-sm opacity-80 mb-6">
            Запрошуй друзів та отримуй бали за кожного нового члена. Разом ми сильніші!
          </p>
          <Link
            href="/dashboard/referrals"
            className="inline-flex items-center gap-2 bg-accent text-canvas px-6 py-3 font-bold text-sm hover:bg-accent/90 transition-colors"
          >
            ОТРИМАТИ ПОСИЛАННЯ →
          </Link>
        </div>

        {/* Membership Status */}
        <div className="bg-canvas border-2 border-timber-dark p-6 relative">
          <div className="joint" style={{ top: '-6px', left: '-6px' }} />
          <div className="joint" style={{ top: '-6px', right: '-6px' }} />
          <div className="joint" style={{ bottom: '-6px', left: '-6px' }} />
          <div className="joint" style={{ bottom: '-6px', right: '-6px' }} />

          <p className="label text-accent mb-4">СТАТУС ЧЛЕНСТВА</p>
          <h2 className="font-syne text-2xl font-bold mb-4">
            {TIER_NAMES[membershipTier] || 'Безкоштовний'}
          </h2>
          <p className="text-sm text-timber-beam mb-6">
            {membershipTier === 'free'
              ? 'Оновіть членство для отримання додаткових можливостей та впливу в Мережі.'
              : 'Дякуємо за вашу підтримку Мережі!'}
          </p>
          <Link
            href="/dashboard/settings"
            className="inline-flex items-center gap-2 bg-timber-dark text-canvas px-6 py-3 font-bold text-sm hover:bg-timber-dark/90 transition-colors"
          >
            {membershipTier === 'free' ? 'ОНОВИТИ ЧЛЕНСТВО →' : 'НАЛАШТУВАННЯ →'}
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-canvas border-2 border-timber-dark p-6 relative">
        <div className="joint" style={{ top: '-6px', left: '-6px' }} />
        <div className="joint" style={{ top: '-6px', right: '-6px' }} />

        <p className="label text-accent mb-4">ОСТАННЯ АКТИВНІСТЬ</p>

        {recentActivities.length > 0 ? (
          <div className="space-y-4">
            {recentActivities.map((activity, index) => {
              const iconMap = {
                vote: Vote,
                event: Calendar,
                task: CheckSquare,
                referral: Users,
              };
              const Icon = iconMap[activity.type];
              const colorMap = {
                vote: 'text-blue-500 bg-blue-500/10',
                event: 'text-green-500 bg-green-500/10',
                task: 'text-purple-500 bg-purple-500/10',
                referral: 'text-orange-500 bg-orange-500/10',
              };

              return (
                <div key={index} className="flex items-start gap-4">
                  <div className={`w-10 h-10 flex items-center justify-center flex-shrink-0 ${colorMap[activity.type]}`}>
                    <Icon size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm">{activity.title}</p>
                    <p className="text-sm text-timber-beam truncate">
                      {activity.description}
                    </p>
                  </div>
                  <span className="text-xs text-timber-beam flex-shrink-0">
                    {new Date(activity.timestamp).toLocaleDateString('uk-UA', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-timber-beam">
            <p className="text-sm">Поки що немає активності</p>
            <p className="text-xs mt-2 opacity-60">
              Ваша активність у Мережі буде відображатися тут
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
