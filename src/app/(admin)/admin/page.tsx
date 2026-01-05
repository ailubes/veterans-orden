import { StatsCard } from '@/components/dashboard/stats-card';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // Fetch real stats from database
  const [
    { count: totalMembers },
    { count: activeMembers },
    { count: paidMembers },
    { count: upcomingEvents },
    { data: recentMembers },
  ] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('users').select('*', { count: 'exact', head: true }).neq('membership_tier', 'free'),
    supabase.from('events').select('*', { count: 'exact', head: true }).gte('start_date', new Date().toISOString()),
    supabase.from('users').select('id, first_name, last_name, created_at').order('created_at', { ascending: false }).limit(5),
  ]);

  // Calculate weekly growth (members created in last 7 days)
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const { count: weeklyNew } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', weekAgo.toISOString());

  const activePercentage = totalMembers ? Math.round((activeMembers || 0) / totalMembers * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <p className="mono text-bronze mb-2 text-xs tracking-widest">// АДМІНІСТРУВАННЯ</p>
        <h1 className="font-syne text-3xl lg:text-4xl font-bold text-text-100">
          Панель керування
        </h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        <StatsCard
          label="ВСЬОГО ЧЛЕНІВ"
          value={totalMembers || 0}
          change={`+${weeklyNew || 0} цього тижня`}
          changeType={weeklyNew && weeklyNew > 0 ? 'positive' : 'neutral'}
        />
        <StatsCard
          label="АКТИВНИХ"
          value={activeMembers || 0}
          change={`${activePercentage}% від загальної`}
          changeType={activePercentage >= 50 ? 'positive' : 'neutral'}
        />
        <StatsCard
          label="ПЛАТНИХ"
          value={paidMembers || 0}
          change="Платні підписки"
          changeType="neutral"
        />
        <StatsCard
          label="ПОДІЙ"
          value={upcomingEvents || 0}
          change="Майбутні"
          changeType="neutral"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Members Overview */}
        <div className="bg-panel-900 border border-line rounded-lg p-6 relative">
          <div className="flex items-center justify-between mb-4">
            <p className="mono text-bronze text-xs tracking-widest">// НОВІ ЧЛЕНИ</p>
            <Link
              href="/admin/members"
              className="text-xs text-bronze hover:text-text-100 transition-colors"
            >
              ДИВИТИСЬ ВСІ →
            </Link>
          </div>

          {recentMembers && recentMembers.length > 0 ? (
            <ul className="space-y-3">
              {recentMembers.map((member) => (
                <li key={member.id} className="flex items-center justify-between py-2 border-b border-line last:border-0">
                  <span className="text-sm text-text-100">{member.first_name} {member.last_name}</span>
                  <span className="text-xs text-muted-500">
                    {new Date(member.created_at).toLocaleDateString('uk-UA')}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8 text-muted-500">
              <p className="text-sm">Поки що немає членів</p>
              <p className="text-xs mt-2 opacity-60">
                Нові реєстрації з&apos;являться тут
              </p>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-panel-900 border border-line rounded-lg p-6 relative">
          <p className="mono text-bronze text-xs tracking-widest mb-4">// ОСТАННЯ АКТИВНІСТЬ</p>

          <div className="text-center py-8 text-muted-500">
            <p className="text-sm">Поки що немає активності</p>
            <p className="text-xs mt-2 opacity-60">
              Дії користувачів відображатимуться тут
            </p>
          </div>
        </div>
      </div>

      {/* Growth Chart Placeholder */}
      <div className="bg-panel-900 border border-line rounded-lg p-6 relative">
        <p className="mono text-bronze text-xs tracking-widest mb-4">// ЗРОСТАННЯ МЕРЕЖІ</p>

        <div className="h-64 flex items-center justify-center text-muted-500 border border-dashed border-line rounded">
          <div className="text-center">
            <p className="text-sm">Графік зростання</p>
            <p className="text-xs mt-2 opacity-60">
              {totalMembers && totalMembers > 0
                ? `${totalMembers} членів у мережі`
                : 'Запустіть npm run seed:test для тестових даних'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
