import { createClient } from '@/lib/supabase/server';
import { getAdminProfile } from '@/lib/permissions';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import {
  Edit,
  ArrowLeft,
  Calendar,
  Users,
  CheckCircle,
  XCircle,
  Download,
} from 'lucide-react';

interface VoteDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function VoteDetailPage({ params }: VoteDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Check admin access
  const adminProfile = await getAdminProfile();
  if (!adminProfile) {
    redirect('/dashboard');
  }

  // Get vote data with options
  const { data: vote, error } = await supabase
    .from('votes')
    .select('*, created_by:users(first_name, last_name, email)')
    .eq('id', id)
    .single();

  if (error || !vote) {
    notFound();
  }

  // Get vote ballots (responses)
  const { data: ballots } = await supabase
    .from('vote_ballots')
    .select('*, voter:users(first_name, last_name, email)')
    .eq('vote_id', id)
    .order('created_at', { ascending: false });

  // Calculate results
  const totalVotes = ballots?.length || 0;
  const options = vote.options as { id: string; text: string }[];
  const voteCounts: Record<string, number> = {};

  options.forEach((option) => {
    voteCounts[option.id] = 0;
  });

  ballots?.forEach((ballot) => {
    if (ballot.selected_option) {
      voteCounts[ballot.selected_option] = (voteCounts[ballot.selected_option] || 0) + 1;
    }
  });

  // Get eligible voters count (all active members)
  const { count: eligibleVoters } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');

  const participationRate = eligibleVoters ? (totalVotes / eligibleVoters) * 100 : 0;
  const quorumMet = vote.requires_quorum
    ? participationRate >= (vote.quorum_percentage || 50)
    : true;

  // Check edit permissions
  const canEdit =
    adminProfile.role === 'super_admin' ||
    adminProfile.role === 'admin' ||
    (adminProfile.role === 'regional_leader' && vote.created_by_id === adminProfile.id);

  // Can only edit draft votes
  const canEditContent = vote.status === 'draft' && canEdit;

  // Format dates
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('uk-UA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Status labels
  const statusLabels: Record<string, string> = {
    draft: 'Чернетка',
    active: 'Активне',
    closed: 'Закрите',
  };

  // Vote type labels
  const typeLabels: Record<string, string> = {
    simple_majority: 'Проста більшість',
    qualified_majority: 'Кваліфікована більшість',
    unanimous: 'Одностайне',
    ranking: 'Рейтингове',
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Back button */}
      <div className="mb-6">
        <Link
          href="/admin/votes"
          className="inline-flex items-center gap-2 text-sm font-bold text-muted-500 hover:text-bronze transition-colors"
        >
          <ArrowLeft size={16} />
          НАЗАД ДО СПИСКУ
        </Link>
      </div>

      {/* Header Card */}
      <div className="bg-panel-850 text-canvas border border-line rounded-lg p-6 mb-6 relative">
        <div className="joint joint-tl" />
        <div className="joint joint-tr" />
        <div className="joint joint-bl" />
        <div className="joint joint-br" />

        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          {/* Vote info */}
          <div className="flex-1">
            <h1 className="font-syne text-3xl font-bold mb-3">{vote.question}</h1>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-3 py-1 bg-panel-900 text-text-100 text-xs font-bold">
                {typeLabels[vote.vote_type] || vote.vote_type}
              </span>
              <span
                className={`px-3 py-1 text-xs font-bold ${
                  vote.status === 'active'
                    ? 'bg-green-500 text-white'
                    : vote.status === 'closed'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-500 text-white'
                }`}
              >
                {statusLabels[vote.status] || vote.status}
              </span>
              {vote.requires_quorum && (
                <span className={`px-3 py-1 text-xs font-bold ${
                  quorumMet ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                }`}>
                  КВОРУМ: {participationRate.toFixed(1)}% / {vote.quorum_percentage}%
                </span>
              )}
            </div>

            <div className="space-y-2 text-sm text-canvas/90">
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <span>Початок: {formatDate(vote.start_date)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <span>Завершення: {formatDate(vote.end_date)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users size={16} />
                <span>Проголосувало: {totalVotes} з {eligibleVoters || 0}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          {canEdit && (
            <div className="flex flex-wrap gap-2">
              {canEditContent && (
                <Link
                  href={`/admin/votes/${vote.id}/edit`}
                  className="btn btn-sm flex items-center gap-2"
                >
                  <Edit size={16} />
                  РЕДАГУВАТИ
                </Link>
              )}
              {vote.status === 'active' && (
                <button className="btn btn-outline btn-sm flex items-center gap-2 border-bronze text-bronze hover:bg-bronze hover:text-canvas">
                  <XCircle size={16} />
                  ЗАКРИТИ ДОСТРОКОВО
                </button>
              )}
              <button className="btn btn-outline-light btn-sm flex items-center gap-2">
                <Download size={16} />
                ЕКСПОРТ
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Results */}
        <div className="lg:col-span-2">
          <div className="bg-panel-900 border border-line rounded-lg p-6 relative">
            <div className="joint joint-tl" />
            <div className="joint joint-tr" />
            <div className="joint joint-bl" />
            <div className="joint joint-br" />

            <p className="label text-bronze mb-4">РЕЗУЛЬТАТИ ГОЛОСУВАННЯ</p>

            {vote.description && (
              <div className="mb-6 pb-6 border-b border-line/20">
                <p className="text-sm whitespace-pre-wrap text-muted-500">
                  {vote.description}
                </p>
              </div>
            )}

            <div className="space-y-4">
              {options.map((option, index) => {
                const count = voteCounts[option.id] || 0;
                const percentage = totalVotes > 0 ? (count / totalVotes) * 100 : 0;

                return (
                  <div key={option.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm">{option.text}</span>
                      <div className="text-right">
                        <span className="font-syne text-2xl font-bold text-bronze">
                          {count}
                        </span>
                        <span className="text-xs text-muted-500 ml-2">
                          ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-panel-850/10 h-3">
                      <div
                        className={`h-3 ${
                          index === 0
                            ? 'bg-bronze'
                            : index === 1
                            ? 'bg-green-500'
                            : index === 2
                            ? 'bg-blue-500'
                            : 'bg-purple-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {vote.requires_quorum && (
              <div className="mt-6 pt-6 border-t border-line/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-sm">Статус кворуму</p>
                    <p className="text-xs text-muted-500">
                      Необхідно {vote.quorum_percentage}% участі
                    </p>
                  </div>
                  {quorumMet ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle size={20} />
                      <span className="font-bold text-sm">ДОСЯГНУТО</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-600">
                      <XCircle size={20} />
                      <span className="font-bold text-sm">НЕ ДОСЯГНУТО</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Vote Info */}
        <div className="lg:col-span-1">
          <div className="bg-panel-900 border border-line rounded-lg p-6 relative mb-6">
            <div className="joint joint-tl" />
            <div className="joint joint-tr" />
            <div className="joint joint-bl" />
            <div className="joint joint-br" />

            <p className="label text-bronze mb-4">НАЛАШТУВАННЯ</p>

            <div className="space-y-3 text-sm">
              <div>
                <p className="text-muted-500 mb-1">Тип голосування</p>
                <p className="font-bold">{typeLabels[vote.vote_type] || vote.vote_type}</p>
              </div>

              <div>
                <p className="text-muted-500 mb-1">Прозорість</p>
                <p className="font-bold capitalize">
                  {vote.transparency === 'public' ? 'Публічне' : vote.transparency === 'anonymous' ? 'Анонімне' : 'Приховане'}
                </p>
              </div>

              <div>
                <p className="text-muted-500 mb-1">Зміна голосу</p>
                <p className="font-bold">
                  {vote.allow_change_vote ? 'Дозволено' : 'Заборонено'}
                </p>
              </div>

              {vote.requires_quorum && (
                <div>
                  <p className="text-muted-500 mb-1">Вимога кворуму</p>
                  <p className="font-bold">{vote.quorum_percentage}%</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-panel-900 border border-line rounded-lg p-4 relative">
            <div className="joint joint-tl" />
            <div className="joint joint-tr" />
            <div className="joint joint-bl" />
            <div className="joint joint-br" />

            <p className="label text-bronze mb-2">ОРГАНІЗАТОР</p>
            <p className="text-sm font-bold">
              {vote.created_by?.first_name} {vote.created_by?.last_name}
            </p>
            <p className="text-xs text-muted-500">{vote.created_by?.email}</p>
            <p className="text-xs text-muted-500 mt-2">
              Створено: {formatDate(vote.created_at)}
            </p>
          </div>
        </div>
      </div>

      {/* Voters List (if public) */}
      {vote.transparency === 'public' && ballots && ballots.length > 0 && (
        <div className="bg-panel-900 border border-line rounded-lg relative">
          <div className="joint joint-tl" />
          <div className="joint joint-tr" />
          <div className="joint joint-bl" />
          <div className="joint joint-br" />

          <div className="p-6">
            <p className="label text-bronze mb-4">СПИСОК ГОЛОСІВ</p>

            <div className="space-y-2">
              {ballots.map((ballot) => {
                const selectedOption = options.find((opt) => opt.id === ballot.selected_option);

                return (
                  <div
                    key={ballot.id}
                    className="flex items-center justify-between p-3 border border-line/20"
                  >
                    <div>
                      <p className="font-bold text-sm">
                        {ballot.voter?.first_name} {ballot.voter?.last_name}
                      </p>
                      <p className="text-xs text-muted-500">{ballot.voter?.email}</p>
                    </div>
                    <div className="text-right">
                      {selectedOption && (
                        <p className="text-sm font-bold text-bronze">
                          {selectedOption.text}
                        </p>
                      )}
                      <p className="text-xs text-muted-500">
                        {formatDate(ballot.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {vote.transparency !== 'public' && totalVotes > 0 && (
        <div className="bg-yellow-100 border-2 border-yellow-600 p-4 text-center">
          <p className="text-sm text-yellow-800">
            Список голосів прихований через налаштування прозорості голосування
          </p>
        </div>
      )}
    </div>
  );
}
