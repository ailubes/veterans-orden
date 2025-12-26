import { createClient } from '@/lib/supabase/server';
import { Users, TrendingUp, Calendar, Vote, CheckSquare, DollarSign } from 'lucide-react';
import { GrowthChart } from '@/components/admin/analytics/growth-chart';
import { EngagementChart } from '@/components/admin/analytics/engagement-chart';
import { TaskAnalytics } from '@/components/admin/analytics/task-analytics';

export default async function AdminAnalyticsPage() {
  const supabase = await createClient();

  // Get date ranges
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Fetch total members
  const { count: totalMembers } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true });

  // Fetch active members
  const { count: activeMembers } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');

  // Fetch new members this week
  const { count: newMembersWeek } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', oneWeekAgo.toISOString());

  // Fetch new members this month
  const { count: newMembersMonth } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', oneMonthAgo.toISOString());

  // Fetch events stats
  const { count: totalEvents } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true });

  const { count: upcomingEvents } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'published')
    .gte('start_date', now.toISOString());

  // Fetch votes stats
  const { count: totalVotes } = await supabase
    .from('votes')
    .select('*', { count: 'exact', head: true });

  const { count: activeVotes } = await supabase
    .from('votes')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');

  // Fetch tasks stats
  const { count: totalTasks } = await supabase
    .from('tasks')
    .select('*', { count: 'exact', head: true });

  const { count: completedTasks } = await supabase
    .from('tasks')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'completed');

  // Fetch regional distribution
  const { data: regionalData } = await supabase
    .from('oblasts')
    .select('name, member_count')
    .order('member_count', { ascending: false })
    .limit(10);

  // Fetch membership tier distribution
  const { data: membersByTier } = await supabase
    .from('users')
    .select('membership_tier');

  const tierCounts = (membersByTier || []).reduce((acc, user) => {
    const tier = user.membership_tier || 'free';
    acc[tier] = (acc[tier] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const tierLabels: Record<string, string> = {
    free: 'Безкоштовний',
    basic_49: 'Базовий (49 грн)',
    supporter_100: 'Прихильник (100 грн)',
    supporter_200: 'Прихильник (200 грн)',
    patron_500: 'Патрон (500 грн)',
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <p className="label mb-2">АДМІНІСТРУВАННЯ</p>
        <h1 className="font-syne text-3xl font-bold">Аналітика</h1>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div className="bg-timber-dark text-canvas p-6 relative">
          <div className="joint" style={{ top: '-6px', left: '-6px' }} />
          <div className="flex items-start justify-between">
            <div>
              <p className="label text-accent mb-2">ВСЬОГО ЧЛЕНІВ</p>
              <p className="font-syne text-4xl font-bold">{totalMembers || 0}</p>
              <p className="text-sm opacity-60 mt-2">
                {activeMembers || 0} активних
              </p>
            </div>
            <Users className="text-accent" size={32} />
          </div>
        </div>

        <div className="bg-canvas border-2 border-timber-dark p-6 relative">
          <div className="joint" style={{ top: '-6px', left: '-6px' }} />
          <div className="flex items-start justify-between">
            <div>
              <p className="label mb-2">НОВИХ ЗА ТИЖДЕНЬ</p>
              <p className="font-syne text-4xl font-bold text-green-600">
                +{newMembersWeek || 0}
              </p>
              <p className="text-sm text-timber-beam mt-2">
                +{newMembersMonth || 0} за місяць
              </p>
            </div>
            <TrendingUp className="text-green-600" size={32} />
          </div>
        </div>

        <div className="bg-canvas border-2 border-timber-dark p-6 relative">
          <div className="joint" style={{ top: '-6px', left: '-6px' }} />
          <div className="flex items-start justify-between">
            <div>
              <p className="label mb-2">ПОДІЇ</p>
              <p className="font-syne text-4xl font-bold">{totalEvents || 0}</p>
              <p className="text-sm text-timber-beam mt-2">
                {upcomingEvents || 0} найближчих
              </p>
            </div>
            <Calendar className="text-accent" size={32} />
          </div>
        </div>

        <div className="bg-canvas border-2 border-timber-dark p-6 relative">
          <div className="joint" style={{ top: '-6px', left: '-6px' }} />
          <div className="flex items-start justify-between">
            <div>
              <p className="label mb-2">ГОЛОСУВАННЯ</p>
              <p className="font-syne text-4xl font-bold">{totalVotes || 0}</p>
              <p className="text-sm text-timber-beam mt-2">
                {activeVotes || 0} активних
              </p>
            </div>
            <Vote className="text-accent" size={32} />
          </div>
        </div>

        <div className="bg-canvas border-2 border-timber-dark p-6 relative">
          <div className="joint" style={{ top: '-6px', left: '-6px' }} />
          <div className="flex items-start justify-between">
            <div>
              <p className="label mb-2">ЗАВДАННЯ</p>
              <p className="font-syne text-4xl font-bold">{totalTasks || 0}</p>
              <p className="text-sm text-timber-beam mt-2">
                {completedTasks || 0} виконано
              </p>
            </div>
            <CheckSquare className="text-accent" size={32} />
          </div>
        </div>

        <div className="bg-canvas border-2 border-timber-dark p-6 relative">
          <div className="joint" style={{ top: '-6px', left: '-6px' }} />
          <div className="flex items-start justify-between">
            <div>
              <p className="label mb-2">КОНВЕРСІЯ</p>
              <p className="font-syne text-4xl font-bold">
                {totalMembers && totalMembers > 0
                  ? Math.round(((tierCounts['basic_49'] || 0) + (tierCounts['supporter_100'] || 0) + (tierCounts['supporter_200'] || 0) + (tierCounts['patron_500'] || 0)) / totalMembers * 100)
                  : 0}%
              </p>
              <p className="text-sm text-timber-beam mt-2">платних членів</p>
            </div>
            <DollarSign className="text-accent" size={32} />
          </div>
        </div>
      </div>

      {/* Interactive Charts */}
      <div className="grid grid-cols-1 gap-6 mb-8">
        <GrowthChart />
        <EngagementChart />
      </div>

      {/* Task Analytics Section */}
      <div className="mb-8">
        <h2 className="font-syne text-2xl font-bold mb-6">Аналітика завдань</h2>
        <TaskAnalytics />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Regional Distribution */}
        <div className="bg-canvas border-2 border-timber-dark p-6 relative">
          <div className="joint" style={{ top: '-6px', left: '-6px' }} />
          <div className="joint" style={{ top: '-6px', right: '-6px' }} />

          <h2 className="font-syne text-xl font-bold mb-6">Топ-10 регіонів</h2>

          {regionalData && regionalData.length > 0 ? (
            <div className="space-y-3">
              {regionalData.map((oblast, index) => (
                <div key={oblast.name} className="flex items-center gap-3">
                  <span className="w-6 text-center font-bold text-timber-beam">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm">{oblast.name}</span>
                      <span className="font-mono text-sm">
                        {oblast.member_count || 0}
                      </span>
                    </div>
                    <div className="h-2 bg-timber-dark/10">
                      <div
                        className="h-full bg-accent"
                        style={{
                          width: `${Math.min(
                            ((oblast.member_count || 0) /
                              (regionalData[0]?.member_count || 1)) *
                              100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-timber-beam text-center py-8">
              Немає даних про регіони
            </p>
          )}
        </div>

        {/* Membership Tiers */}
        <div className="bg-canvas border-2 border-timber-dark p-6 relative">
          <div className="joint" style={{ top: '-6px', left: '-6px' }} />
          <div className="joint" style={{ top: '-6px', right: '-6px' }} />

          <h2 className="font-syne text-xl font-bold mb-6">Рівні членства</h2>

          <div className="space-y-4">
            {Object.entries(tierLabels).map(([tier, label]) => {
              const count = tierCounts[tier] || 0;
              const percentage = totalMembers ? (count / totalMembers) * 100 : 0;
              return (
                <div key={tier}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">{label}</span>
                    <span className="font-mono text-sm font-bold">
                      {count} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="h-3 bg-timber-dark/10">
                    <div
                      className={`h-full ${
                        tier === 'free' ? 'bg-gray-400' : 'bg-accent'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Goal Progress */}
      <div className="bg-timber-dark text-canvas p-6 relative">
        <div className="joint" style={{ top: '-6px', left: '-6px' }} />
        <div className="joint" style={{ top: '-6px', right: '-6px' }} />
        <div className="joint" style={{ bottom: '-6px', left: '-6px' }} />
        <div className="joint" style={{ bottom: '-6px', right: '-6px' }} />

        <h2 className="font-syne text-xl font-bold mb-6 text-accent">
          Прогрес до мети: 1,000,000 членів
        </h2>

        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span>0</span>
            <span>100K</span>
            <span>500K</span>
            <span>1M</span>
          </div>
          <div className="h-6 bg-canvas/10 relative">
            <div
              className="absolute left-0 top-0 bottom-0 bg-accent transition-all"
              style={{ width: `${Math.min(((totalMembers || 0) / 1000000) * 100, 100)}%` }}
            />
            {/* Milestones */}
            <div className="absolute left-[10%] top-0 bottom-0 w-0.5 bg-canvas/30" />
            <div className="absolute left-[50%] top-0 bottom-0 w-0.5 bg-canvas/30" />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-syne text-3xl font-bold">
              {((totalMembers || 0) / 1000000 * 100).toFixed(3)}%
            </p>
            <p className="text-sm opacity-60">до мети</p>
          </div>
          <div className="text-right">
            <p className="font-syne text-3xl font-bold">
              {(1000000 - (totalMembers || 0)).toLocaleString('uk-UA')}
            </p>
            <p className="text-sm opacity-60">залишилось</p>
          </div>
        </div>
      </div>
    </div>
  );
}
