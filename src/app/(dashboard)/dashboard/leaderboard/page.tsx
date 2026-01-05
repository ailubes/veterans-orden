import { createClient } from '@/lib/supabase/server';
import { Trophy, Medal, Star, TrendingUp } from 'lucide-react';

export default async function LeaderboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get current user's profile
  const { data: profile } = await supabase
    .from('users')
    .select('id, points, level, referral_count')
    .eq('auth_id', user?.id)
    .single();

  // Fetch top users by points
  const { data: topByPoints } = await supabase
    .from('users')
    .select('id, first_name, last_name, points, level, avatar_url')
    .eq('status', 'active')
    .order('points', { ascending: false })
    .limit(20);

  // Fetch top users by referrals
  const { data: topByReferrals } = await supabase
    .from('users')
    .select('id, first_name, last_name, referral_count, avatar_url')
    .eq('status', 'active')
    .order('referral_count', { ascending: false })
    .limit(10);

  // Find current user's rank
  const userRank = topByPoints?.findIndex((u) => u.id === profile?.id);

  const getMedalIcon = (index: number) => {
    if (index === 0) return <Trophy className="text-yellow-500" size={24} />;
    if (index === 1) return <Medal className="text-gray-400" size={24} />;
    if (index === 2) return <Medal className="text-amber-600" size={24} />;
    return <span className="w-6 h-6 flex items-center justify-center font-bold text-timber-beam">{index + 1}</span>;
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <p className="label mb-2">РЕЙТИНГ</p>
        <h1 className="font-syne text-3xl lg:text-4xl font-bold">
          Лідерборд
        </h1>
      </div>

      {/* User Stats */}
      {profile && (
        <div className="bg-timber-dark text-canvas p-6 relative mb-8">
          <div className="joint joint-tl" />
          <div className="joint joint-tr" />

          <p className="label text-accent mb-4">ВАШ СТАТУС</p>

          <div className="grid grid-cols-3 gap-3 sm:gap-6">
            <div>
              <p className="text-xs sm:text-sm opacity-60 mb-1">ПОЗИЦІЯ</p>
              <p className="font-syne text-2xl sm:text-3xl font-bold">
                #{userRank !== undefined && userRank >= 0 ? userRank + 1 : '—'}
              </p>
            </div>
            <div>
              <p className="text-xs sm:text-sm opacity-60 mb-1">БАЛИ</p>
              <p className="font-syne text-2xl sm:text-3xl font-bold">{profile.points || 0}</p>
            </div>
            <div>
              <p className="text-xs sm:text-sm opacity-60 mb-1">РІВЕНЬ</p>
              <p className="font-syne text-2xl sm:text-3xl font-bold">{profile.level || 1}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top by Points */}
        <div className="bg-canvas border-2 border-timber-dark p-6 relative">
          <div className="joint joint-tl" />
          <div className="joint joint-tr" />

          <div className="flex items-center gap-2 mb-6">
            <Star className="text-accent" size={20} />
            <h2 className="font-syne text-xl font-bold">Топ за балами</h2>
          </div>

          {topByPoints && topByPoints.length > 0 ? (
            <div className="space-y-3">
              {topByPoints.slice(0, 10).map((member, index) => (
                <div
                  key={member.id}
                  className={`flex items-center gap-3 p-3 ${
                    member.id === profile?.id
                      ? 'bg-accent/10 border border-accent'
                      : 'bg-timber-dark/5'
                  }`}
                >
                  {getMedalIcon(index)}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold truncate">
                      {member.first_name} {member.last_name?.charAt(0)}.
                      {member.id === profile?.id && ' (ви)'}
                    </p>
                    <p className="text-xs text-timber-beam">
                      Рівень {member.level || 1}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-syne font-bold text-accent">
                      {member.points || 0}
                    </p>
                    <p className="text-xs text-timber-beam">балів</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-timber-beam text-center py-8">
              Поки що немає даних
            </p>
          )}
        </div>

        {/* Top by Referrals */}
        <div className="bg-canvas border-2 border-timber-dark p-6 relative">
          <div className="joint joint-tl" />
          <div className="joint joint-tr" />

          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="text-accent" size={20} />
            <h2 className="font-syne text-xl font-bold">Топ рекрутерів</h2>
          </div>

          {topByReferrals && topByReferrals.length > 0 ? (
            <div className="space-y-3">
              {topByReferrals.map((member, index) => (
                <div
                  key={member.id}
                  className={`flex items-center gap-3 p-3 ${
                    member.id === profile?.id
                      ? 'bg-accent/10 border border-accent'
                      : 'bg-timber-dark/5'
                  }`}
                >
                  {getMedalIcon(index)}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold truncate">
                      {member.first_name} {member.last_name?.charAt(0)}.
                      {member.id === profile?.id && ' (ви)'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-syne font-bold text-accent">
                      {member.referral_count || 0}
                    </p>
                    <p className="text-xs text-timber-beam">запрошено</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-timber-beam text-center py-8">
              Поки що немає даних
            </p>
          )}
        </div>
      </div>

      {/* Levels Info */}
      <div className="mt-8 bg-canvas border-2 border-timber-dark p-6 relative">
        <div className="joint joint-tl" />

        <h2 className="font-syne text-xl font-bold mb-4">Система рівнів</h2>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { level: 1, name: 'Новачок', points: 0 },
            { level: 2, name: 'Активіст', points: 100 },
            { level: 3, name: 'Лідер', points: 500 },
            { level: 4, name: 'Експерт', points: 1000 },
            { level: 5, name: 'Легенда', points: 5000 },
          ].map((lvl) => (
            <div
              key={lvl.level}
              className={`p-3 text-center ${
                (profile?.level || 1) >= lvl.level
                  ? 'bg-accent/10 border border-accent'
                  : 'bg-timber-dark/5'
              }`}
            >
              <p className="font-syne text-2xl font-bold">{lvl.level}</p>
              <p className="text-sm font-bold">{lvl.name}</p>
              <p className="text-xs text-timber-beam">{lvl.points}+ балів</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
