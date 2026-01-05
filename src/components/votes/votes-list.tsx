'use client';

import { Vote, Clock, Users, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import FeatureGate from '@/components/ui/feature-gate';

interface VotesListProps {
  activeVotes: any[] | null;
  closedVotes: any[] | null;
}

export default function VotesList({ activeVotes, closedVotes }: VotesListProps) {
  const formatTimeLeft = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days} дн. ${hours} год.`;
    if (hours > 0) return `${hours} год.`;
    return 'Завершується';
  };

  return (
    <>
      {/* Active Votes */}
      <div className="mb-12">
        <h2 className="font-syne text-xl font-bold text-text-100 mb-4 flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Активні голосування
        </h2>

        <FeatureGate featureKey="voting_full">
          {activeVotes && activeVotes.length > 0 ? (
            <div className="space-y-4">
              {activeVotes.map((vote) => (
                <div
                  key={vote.id}
                  className="bg-panel-900 border border-line p-6 rounded-lg hover:border-bronze/50 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 bg-bronze/10 text-bronze text-xs font-bold rounded">
                          {vote.scope === 'national' ? 'НАЦІОНАЛЬНЕ' :
                           vote.scope === 'regional' ? 'РЕГІОНАЛЬНЕ' : 'ГРУПОВЕ'}
                        </span>
                        <span className="px-2 py-1 bg-panel-850 text-muted-500 text-xs rounded">
                          {vote.type === 'binary' ? 'Так/Ні' :
                           vote.type === 'multiple_choice' ? 'Вибір' :
                           vote.type === 'ranked' ? 'Рейтинговий' : 'Схвалення'}
                        </span>
                      </div>

                      <h3 className="font-syne text-xl font-bold text-text-100 mb-2">
                        {vote.title}
                      </h3>
                      <p className="text-sm text-muted-500 mb-4 line-clamp-2">
                        {vote.description}
                      </p>

                      <div className="flex flex-wrap gap-4 text-xs text-muted-500">
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          Залишилось: {formatTimeLeft(vote.end_date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users size={14} />
                          {vote.total_votes || 0} голосів
                        </span>
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      <Link
                        href={`/dashboard/votes/${vote.id}`}
                        className="inline-flex items-center gap-2 bg-bronze text-bg-950 px-4 py-2 font-bold text-sm hover:bg-bronze/90 transition-colors rounded"
                      >
                        ГОЛОСУВАТИ →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-panel-900 border border-line p-8 rounded-lg text-center">
              <Vote className="w-10 h-10 mx-auto mb-3 text-muted-500" />
              <p className="text-sm text-muted-500">
                Наразі немає активних голосувань
              </p>
            </div>
          )}
        </FeatureGate>
      </div>

      {/* Closed Votes */}
      <div>
        <h2 className="font-syne text-xl font-bold text-text-100 mb-4 flex items-center gap-2">
          <CheckCircle size={18} className="text-muted-500" />
          Завершені голосування
        </h2>

        {closedVotes && closedVotes.length > 0 ? (
          <div className="space-y-3">
            {closedVotes.map((vote) => (
              <div
                key={vote.id}
                className="bg-panel-900 border border-line/50 p-4 rounded-lg opacity-75 hover:opacity-100 transition-opacity"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-text-100">{vote.title}</h3>
                    <p className="text-xs text-muted-500">
                      Завершено {formatDate(vote.end_date)} •{' '}
                      {vote.total_votes || 0} голосів
                    </p>
                  </div>
                  <Link href={`/dashboard/votes/${vote.id}`} className="text-xs text-bronze hover:underline">
                    Результати →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-panel-900 border border-line/50 p-6 rounded-lg text-center">
            <p className="text-sm text-muted-500">
              Історія голосувань порожня
            </p>
          </div>
        )}
      </div>
    </>
  );
}
