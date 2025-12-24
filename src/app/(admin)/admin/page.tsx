import { StatsCard } from '@/components/dashboard/stats-card';
import Link from 'next/link';

export default function AdminDashboardPage() {
  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <p className="label text-accent mb-2">АДМІНІСТРУВАННЯ</p>
        <h1 className="font-syne text-3xl lg:text-4xl font-bold">
          Панель керування
        </h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          label="ВСЬОГО ЧЛЕНІВ"
          value={0}
          change="+0 цього тижня"
          changeType="neutral"
        />
        <StatsCard
          label="АКТИВНИХ"
          value={0}
          change="0% від загальної"
          changeType="neutral"
        />
        <StatsCard
          label="ПЛАТНИХ"
          value={0}
          change="0 ₴ доходу"
          changeType="neutral"
        />
        <StatsCard
          label="ПОДІЙ"
          value={0}
          change="0 активних"
          changeType="neutral"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Members Overview */}
        <div className="bg-canvas border-2 border-timber-dark p-6 relative">
          <div className="joint" style={{ top: '-6px', left: '-6px' }} />
          <div className="joint" style={{ top: '-6px', right: '-6px' }} />
          <div className="joint" style={{ bottom: '-6px', left: '-6px' }} />
          <div className="joint" style={{ bottom: '-6px', right: '-6px' }} />

          <div className="flex items-center justify-between mb-4">
            <p className="label text-accent">НОВІ ЧЛЕНИ</p>
            <Link
              href="/admin/members"
              className="text-xs text-accent hover:underline"
            >
              ДИВИТИСЬ ВСІ →
            </Link>
          </div>

          <div className="text-center py-8 text-timber-beam">
            <p className="text-sm">Поки що немає членів</p>
            <p className="text-xs mt-2 opacity-60">
              Нові реєстрації з&apos;являться тут
            </p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-canvas border-2 border-timber-dark p-6 relative">
          <div className="joint" style={{ top: '-6px', left: '-6px' }} />
          <div className="joint" style={{ top: '-6px', right: '-6px' }} />
          <div className="joint" style={{ bottom: '-6px', left: '-6px' }} />
          <div className="joint" style={{ bottom: '-6px', right: '-6px' }} />

          <p className="label text-accent mb-4">ОСТАННЯ АКТИВНІСТЬ</p>

          <div className="text-center py-8 text-timber-beam">
            <p className="text-sm">Поки що немає активності</p>
            <p className="text-xs mt-2 opacity-60">
              Дії користувачів відображатимуться тут
            </p>
          </div>
        </div>
      </div>

      {/* Growth Chart Placeholder */}
      <div className="bg-canvas border-2 border-timber-dark p-6 relative">
        <div className="joint" style={{ top: '-6px', left: '-6px' }} />
        <div className="joint" style={{ top: '-6px', right: '-6px' }} />

        <p className="label text-accent mb-4">ЗРОСТАННЯ МЕРЕЖІ</p>

        <div className="h-64 flex items-center justify-center text-timber-beam border-2 border-dashed border-timber-dark/20">
          <div className="text-center">
            <p className="text-sm">Графік зростання</p>
            <p className="text-xs mt-2 opacity-60">
              Підключіть базу даних для відображення статистики
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
