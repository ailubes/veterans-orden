'use client';

import { useEffect, useState } from 'react';
import { Coins, TrendingUp, Clock, History, ChevronRight } from 'lucide-react';
import { getUserLevel, getPointsToNextLevel, TRANSACTION_TYPE_LABELS, pointsToUAH } from '@/lib/points/constants';

interface PointsBalance {
  total: number;
  currentYear: number;
  expiringSoon: number;
  expirationDate: string | null;
}

interface PointsTransaction {
  id: string;
  type: string;
  amount: number;
  balanceAfter: number;
  description: string;
  createdAt: string;
  earnedYear?: number;
  expiresAt?: string;
}

interface PointsData {
  balance: PointsBalance;
  history: {
    transactions: PointsTransaction[];
    pagination: {
      limit: number;
      offset: number;
      hasMore: boolean;
    };
  };
}

export default function PointsPage() {
  const [pointsData, setPointsData] = useState<PointsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPoints() {
      try {
        const response = await fetch('/api/me/points');
        if (!response.ok) {
          throw new Error('Failed to fetch points');
        }
        const data = await response.json();
        setPointsData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchPoints();
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <p className="label mb-2">БАЛИ</p>
          <h1 className="font-syne text-3xl lg:text-4xl font-bold">Мої бали</h1>
        </div>
        <div className="text-center py-12 text-muted-500">Завантаження...</div>
      </div>
    );
  }

  if (error || !pointsData) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <p className="label mb-2">БАЛИ</p>
          <h1 className="font-syne text-3xl lg:text-4xl font-bold">Мої бали</h1>
        </div>
        <div className="text-center py-12 text-red-600">
          {error || 'Не вдалося завантажити дані'}
        </div>
      </div>
    );
  }

  const { balance, history } = pointsData;
  const currentLevel = getUserLevel(balance.total);
  const pointsToNext = getPointsToNextLevel(balance.total);
  const uahValue = pointsToUAH(balance.total);

  // Calculate progress to next level
  const nextLevelIndex = [0, 100, 500, 1000, 5000].findIndex((min) => balance.total < min);
  const currentLevelMin = nextLevelIndex > 0 ? [0, 100, 500, 1000, 5000][nextLevelIndex - 1] : 0;
  const nextLevelMin = nextLevelIndex >= 0 ? [0, 100, 500, 1000, 5000][nextLevelIndex] : 5000;
  const progress = nextLevelIndex >= 0
    ? ((balance.total - currentLevelMin) / (nextLevelMin - currentLevelMin)) * 100
    : 100;

  // Check if points are expiring soon
  const isExpiringSoon = balance.expiringSoon > 0;
  const daysUntilExpiration = balance.expirationDate
    ? Math.ceil((new Date(balance.expirationDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <p className="label mb-2">БАЛИ</p>
        <h1 className="font-syne text-3xl lg:text-4xl font-bold">Мої бали</h1>
      </div>

      {/* Balance Card */}
      <div className="bg-panel-850 text-canvas p-6 relative mb-8">
        <div className="joint joint-tl" />
        <div className="joint joint-tr" />
        <div className="joint joint-bl" />
        <div className="joint joint-br" />

        <div className="flex items-center gap-2 mb-6">
          <Coins className="text-bronze" size={24} />
          <p className="label text-bronze">ЗАГАЛЬНИЙ БАЛАНС</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <p className="text-xs sm:text-sm opacity-60 mb-1">ВСЬОГО</p>
            <p className="font-syne text-3xl sm:text-4xl font-bold">{balance.total}</p>
            <p className="text-xs opacity-60 mt-1">≈ {uahValue.toFixed(2)} грн</p>
          </div>
          <div>
            <p className="text-xs sm:text-sm opacity-60 mb-1">ЗА ЦЕЙ РІК</p>
            <p className="font-syne text-2xl sm:text-3xl font-bold text-bronze">
              {balance.currentYear}
            </p>
          </div>
          <div>
            <p className="text-xs sm:text-sm opacity-60 mb-1">РІВЕНЬ</p>
            <p className="font-syne text-2xl sm:text-3xl font-bold">{currentLevel.level}</p>
            <p className="text-xs opacity-60 mt-1">{currentLevel.name}</p>
          </div>
          <div>
            <p className="text-xs sm:text-sm opacity-60 mb-1">ДО НАСТУПНОГО</p>
            <p className="font-syne text-2xl sm:text-3xl font-bold">
              {pointsToNext !== null ? pointsToNext : '—'}
            </p>
          </div>
        </div>
      </div>

      {/* Expiration Warning */}
      {isExpiringSoon && daysUntilExpiration !== null && (
        <div className="bg-bronze/10 border-2 border-bronze p-4 mb-8 relative">
          <div className="joint border-bronze" style={{ top: '-3px', left: '-3px' }} />
          <div className="joint border-bronze" style={{ top: '-3px', right: '-3px' }} />
          <div className="flex items-start gap-3">
            <Clock className="text-bronze flex-shrink-0" size={20} />
            <div>
              <p className="font-bold text-bronze mb-1">Увага! Бали згорають</p>
              <p className="text-sm">
                {balance.expiringSoon} балів згорять через {daysUntilExpiration} днів
                (31 грудня). Використайте їх в магазині або на оплату подій!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Level Progress */}
      {pointsToNext !== null && (
        <div className="bg-panel-900 border border-line rounded-lg p-6 mb-8 relative">
          <div className="joint joint-tl" />
          <div className="joint joint-tr" />

          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="text-bronze" size={20} />
              <p className="font-syne font-bold">Прогрес до рівня {currentLevel.level + 1}</p>
            </div>
            <p className="text-sm text-muted-500">
              {balance.total} / {nextLevelMin}
            </p>
          </div>

          <div className="h-3 bg-panel-850/20 relative overflow-hidden">
            <div
              className="h-full bg-bronze transition-all duration-500"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>

          <p className="text-xs text-muted-500 mt-2">
            Ще {pointsToNext} балів до наступного рівня
          </p>
        </div>
      )}

      {/* Transaction History */}
      <div className="bg-panel-900 border border-line rounded-lg p-6 relative">
        <div className="joint joint-tl" />
        <div className="joint joint-tr" />

        <div className="flex items-center gap-2 mb-6">
          <History className="text-bronze" size={20} />
          <h2 className="font-syne text-xl font-bold">Історія транзакцій</h2>
        </div>

        {history.transactions.length > 0 ? (
          <div className="space-y-2">
            {history.transactions.map((transaction) => {
              const isPositive = transaction.amount > 0;
              const typeLabel = TRANSACTION_TYPE_LABELS[transaction.type]?.uk || transaction.type;

              return (
                <div
                  key={transaction.id}
                  className="flex items-center gap-3 p-3 bg-panel-850/5 hover:bg-panel-850/10 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm mb-1">{typeLabel}</p>
                    <p className="text-xs text-muted-500 truncate">
                      {transaction.description}
                    </p>
                    <p className="text-xs text-muted-500 mt-1">
                      {new Date(transaction.createdAt).toLocaleDateString('uk-UA', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p
                      className={`font-syne font-bold text-lg ${
                        isPositive ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {isPositive ? '+' : ''}
                      {transaction.amount}
                    </p>
                    <p className="text-xs text-muted-500">
                      Баланс: {transaction.balanceAfter}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-500 text-center py-8">
            Поки що немає транзакцій
          </p>
        )}

        {history.pagination.hasMore && (
          <button className="w-full mt-4 py-3 bg-panel-850/5 hover:bg-panel-850/10 transition-colors font-bold text-sm flex items-center justify-center gap-2">
            Завантажити більше
            <ChevronRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
