import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { Clock, Users, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { VoteForm } from './vote-form';

export default async function VoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/sign-in');
  }

  // Get user's database profile
  const { data: profile } = await supabase
    .from('users')
    .select('id, role')
    .eq('clerk_id', user.id)
    .single();

  // Fetch vote with options
  const { data: vote } = await supabase
    .from('votes')
    .select('*, options:vote_options(*)')
    .eq('id', id)
    .single();

  if (!vote) {
    notFound();
  }

  // Check if user has already voted
  let hasVoted = false;
  let userVote = null;
  if (profile) {
    const { data: existingVote } = await supabase
      .from('user_votes')
      .select('option_id')
      .eq('vote_id', id)
      .eq('user_id', profile.id)
      .single();

    if (existingVote) {
      hasVoted = true;
      userVote = existingVote.option_id;
    }
  }

  // Check eligibility
  const eligibleRoles = (vote.eligible_roles as string[]) || ['full_member'];
  const isEligible = profile && eligibleRoles.includes(profile.role);

  const isActive = vote.status === 'active' && new Date(vote.end_date) > new Date();

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

  // Sort options by order
  const sortedOptions = [...(vote.options || [])].sort((a, b) => a.order - b.order);

  // Calculate percentages for results
  const totalVotes = vote.total_votes || 0;
  const optionsWithPercentage = sortedOptions.map((option) => ({
    ...option,
    percentage: totalVotes > 0 ? ((option.vote_count || 0) / totalVotes) * 100 : 0,
  }));

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back Link */}
      <Link
        href="/dashboard/votes"
        className="text-sm text-timber-beam hover:text-accent flex items-center gap-2 mb-6"
      >
        <ArrowLeft size={16} />
        Назад до голосувань
      </Link>

      {/* Vote Header */}
      <div className="bg-canvas border-2 border-timber-dark p-6 relative mb-6">
        <div className="joint joint-tl" />
        <div className="joint joint-tr" />

        <div className="flex items-center gap-2 mb-4">
          <span className="px-2 py-1 bg-accent/10 text-accent text-xs font-bold">
            {vote.scope === 'national'
              ? 'НАЦІОНАЛЬНЕ'
              : vote.scope === 'regional'
              ? 'РЕГІОНАЛЬНЕ'
              : 'ГРУПОВЕ'}
          </span>
          <span className="px-2 py-1 bg-timber-dark/10 text-xs">
            {vote.type === 'binary'
              ? 'Так/Ні'
              : vote.type === 'multiple_choice'
              ? 'Вибір'
              : vote.type === 'ranked'
              ? 'Рейтинговий'
              : 'Схвалення'}
          </span>
          {isActive ? (
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold">
              АКТИВНЕ
            </span>
          ) : (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-bold">
              ЗАВЕРШЕНО
            </span>
          )}
        </div>

        <h1 className="font-syne text-2xl lg:text-3xl font-bold mb-4">
          {vote.title}
        </h1>

        {vote.description && (
          <p className="text-timber-beam mb-6">{vote.description}</p>
        )}

        <div className="flex flex-wrap gap-6 text-sm text-timber-beam">
          <span className="flex items-center gap-2">
            <Clock size={16} />
            {isActive
              ? `Залишилось: ${formatTimeLeft(vote.end_date)}`
              : `Завершено ${formatDate(vote.end_date)}`}
          </span>
          <span className="flex items-center gap-2">
            <Users size={16} />
            {totalVotes} голосів
          </span>
        </div>
      </div>

      {/* Voting Section */}
      <div className="bg-canvas border-2 border-timber-dark p-6 relative">
        <div className="joint joint-tl" />
        <div className="joint joint-tr" />
        <div className="joint joint-bl" />
        <div className="joint joint-br" />

        {/* Not eligible warning */}
        {!isEligible && isActive && (
          <div className="bg-yellow-50 border border-yellow-200 p-4 mb-6 text-sm">
            <strong>Увага:</strong> Для участі в голосуванні потрібен статус
            &quot;Повноправний член&quot;.{' '}
            <Link href="/dashboard/settings" className="text-accent underline">
              Оновити членство
            </Link>
          </div>
        )}

        {/* Already voted */}
        {hasVoted && (
          <div className="bg-green-50 border border-green-200 p-4 mb-6 text-sm text-green-700">
            Ви вже проголосували! Дякуємо за участь.
          </div>
        )}

        {/* Active Vote Form */}
        {isActive && isEligible && !hasVoted && (
          <VoteForm voteId={vote.id} options={sortedOptions} />
        )}

        {/* Results (shown after voting or when vote is closed) */}
        {(hasVoted || !isActive) && (
          <div className="space-y-4">
            <h2 className="font-syne text-xl font-bold mb-4">
              {isActive ? 'Поточні результати' : 'Результати'}
            </h2>

            {optionsWithPercentage.map((option) => (
              <div key={option.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span
                    className={`font-bold ${
                      userVote === option.id ? 'text-accent' : ''
                    }`}
                  >
                    {option.text}
                    {userVote === option.id && ' (ваш голос)'}
                  </span>
                  <span className="font-mono text-sm">
                    {option.vote_count || 0} ({option.percentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="h-3 bg-timber-dark/10 relative">
                  <div
                    className={`absolute left-0 top-0 bottom-0 transition-all ${
                      userVote === option.id ? 'bg-accent' : 'bg-timber-dark'
                    }`}
                    style={{ width: `${option.percentage}%` }}
                  />
                </div>
              </div>
            ))}

            <div className="pt-4 border-t border-timber-dark/20 text-sm text-timber-beam">
              Всього голосів: {totalVotes}
              {vote.quorum_required && (
                <span>
                  {' '}
                  • Кворум: {totalVotes >= vote.quorum_required ? '✓' : '✗'}{' '}
                  {vote.quorum_required}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
