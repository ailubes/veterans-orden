import { createClient } from '@/lib/supabase/server';
import { Vote, Clock, Users, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';

export default async function VotesPage() {
  const supabase = await createClient();

  // Fetch active votes
  const { data: activeVotes } = await supabase
    .from('votes')
    .select('*')
    .eq('status', 'active')
    .gte('end_date', new Date().toISOString())
    .order('end_date', { ascending: true });

  // Fetch closed votes
  const { data: closedVotes } = await supabase
    .from('votes')
    .select('*')
    .eq('status', 'closed')
    .order('end_date', { ascending: false })
    .limit(5);

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
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <p className="label mb-2">ГОЛОСУВАННЯ</p>
        <h1 className="font-syne text-3xl lg:text-4xl font-bold">
          Прийняття рішень
        </h1>
      </div>

      {/* Active Votes */}
      <div className="mb-12">
        <h2 className="font-syne text-xl font-bold mb-4 flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Активні голосування
        </h2>

        {activeVotes && activeVotes.length > 0 ? (
          <div className="space-y-4">
            {activeVotes.map((vote) => (
              <div
                key={vote.id}
                className="bg-canvas border-2 border-timber-dark p-6 relative hover:border-accent transition-colors"
              >
                <div className="joint joint-tl" />
                <div className="joint joint-tr" />

                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-accent/10 text-accent text-xs font-bold">
                        {vote.scope === 'national' ? 'НАЦІОНАЛЬНЕ' :
                         vote.scope === 'regional' ? 'РЕГІОНАЛЬНЕ' : 'ГРУПОВЕ'}
                      </span>
                      <span className="px-2 py-1 bg-timber-dark/10 text-xs">
                        {vote.type === 'binary' ? 'Так/Ні' :
                         vote.type === 'multiple_choice' ? 'Вибір' :
                         vote.type === 'ranked' ? 'Рейтинговий' : 'Схвалення'}
                      </span>
                    </div>

                    <h3 className="font-syne text-xl font-bold mb-2">
                      {vote.title}
                    </h3>
                    <p className="text-sm text-timber-beam mb-4 line-clamp-2">
                      {vote.description}
                    </p>

                    <div className="flex flex-wrap gap-4 text-xs text-timber-beam">
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
                    <Link href={`/dashboard/votes/${vote.id}`} className="btn text-sm">
                      ГОЛОСУВАТИ →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-canvas border-2 border-timber-dark p-8 relative text-center">
            <div className="joint joint-tl" />

            <Vote className="w-10 h-10 mx-auto mb-3 text-timber-beam" />
            <p className="text-sm text-timber-beam">
              Наразі немає активних голосувань
            </p>
          </div>
        )}
      </div>

      {/* Closed Votes */}
      <div>
        <h2 className="font-syne text-xl font-bold mb-4 flex items-center gap-2">
          <CheckCircle size={18} className="text-timber-beam" />
          Завершені голосування
        </h2>

        {closedVotes && closedVotes.length > 0 ? (
          <div className="space-y-3">
            {closedVotes.map((vote) => (
              <div
                key={vote.id}
                className="bg-canvas border-2 border-timber-dark/50 p-4 relative opacity-75 hover:opacity-100 transition-opacity"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold">{vote.title}</h3>
                    <p className="text-xs text-timber-beam">
                      Завершено {formatDate(vote.end_date)} •{' '}
                      {vote.total_votes || 0} голосів
                    </p>
                  </div>
                  <Link href={`/dashboard/votes/${vote.id}`} className="text-xs text-accent hover:underline">
                    Результати →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-canvas border-2 border-timber-dark/50 p-6 text-center">
            <p className="text-sm text-timber-beam">
              Історія голосувань порожня
            </p>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="mt-8 bg-timber-dark/5 border-2 border-timber-dark/20 p-4">
        <p className="text-xs text-timber-beam">
          <strong>Примітка:</strong> Для участі в голосуванні потрібен статус
          &quot;Повноправний член&quot;. Оновіть членство в налаштуваннях.
        </p>
      </div>
    </div>
  );
}
