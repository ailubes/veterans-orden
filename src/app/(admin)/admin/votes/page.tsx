import { createClient } from '@/lib/supabase/server';
import { Plus, Vote, Edit2, Trash2, Eye, BarChart3 } from 'lucide-react';
import Link from 'next/link';

export default async function AdminVotesPage() {
  const supabase = await createClient();

  // Fetch all votes
  const { data: votes } = await supabase
    .from('votes')
    .select('*, created_by:users(first_name, last_name)')
    .order('created_at', { ascending: false })
    .limit(50);

  const statusColors = {
    draft: 'bg-gray-100 text-gray-600',
    active: 'bg-green-100 text-green-700',
    closed: 'bg-blue-100 text-blue-600',
    cancelled: 'bg-red-100 text-red-600',
  };

  const statusLabels = {
    draft: 'Чернетка',
    active: 'Активне',
    closed: 'Закрито',
    cancelled: 'Скасовано',
  };

  const typeLabels = {
    binary: 'Так/Ні',
    multiple_choice: 'Вибір',
    ranked: 'Рейтинговий',
    approval: 'Схвалення',
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="label mb-2">АДМІНІСТРУВАННЯ</p>
          <h1 className="font-syne text-3xl font-bold">Голосування</h1>
        </div>
        <Link href="/admin/votes/new" className="btn flex items-center gap-2">
          <Plus size={18} />
          СТВОРИТИ ГОЛОСУВАННЯ
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-canvas border-2 border-timber-dark p-4">
          <p className="label mb-1">ВСЬОГО</p>
          <p className="font-syne text-3xl font-bold">{votes?.length || 0}</p>
        </div>
        <div className="bg-canvas border-2 border-timber-dark p-4">
          <p className="label mb-1">АКТИВНИХ</p>
          <p className="font-syne text-3xl font-bold text-green-600">
            {votes?.filter((v) => v.status === 'active').length || 0}
          </p>
        </div>
        <div className="bg-canvas border-2 border-timber-dark p-4">
          <p className="label mb-1">ЗАВЕРШЕНИХ</p>
          <p className="font-syne text-3xl font-bold text-blue-600">
            {votes?.filter((v) => v.status === 'closed').length || 0}
          </p>
        </div>
        <div className="bg-canvas border-2 border-timber-dark p-4">
          <p className="label mb-1">УЧАСТЬ</p>
          <p className="font-syne text-3xl font-bold">
            {votes && votes.length > 0
              ? Math.round(
                  votes.reduce((sum, v) => sum + (v.total_votes || 0), 0) /
                    votes.length
                )
              : 0}
          </p>
        </div>
      </div>

      {/* Votes Table */}
      <div className="bg-canvas border-2 border-timber-dark relative">
        <div className="joint" style={{ top: '-6px', left: '-6px' }} />
        <div className="joint" style={{ top: '-6px', right: '-6px' }} />

        {votes && votes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b-2 border-timber-dark">
                <tr>
                  <th className="text-left p-4 font-bold text-xs">НАЗВА</th>
                  <th className="text-left p-4 font-bold text-xs">ТИП</th>
                  <th className="text-left p-4 font-bold text-xs">СТАТУС</th>
                  <th className="text-left p-4 font-bold text-xs">ГОЛОСІВ</th>
                  <th className="text-left p-4 font-bold text-xs">ДАТА</th>
                  <th className="text-left p-4 font-bold text-xs">ДІЇ</th>
                </tr>
              </thead>
              <tbody>
                {votes.map((vote) => (
                  <tr
                    key={vote.id}
                    className="border-b border-timber-dark/20 hover:bg-timber-dark/5"
                  >
                    <td className="p-4">
                      <div className="font-bold">{vote.title}</div>
                      <div className="text-xs text-timber-beam">
                        {vote.scope === 'national'
                          ? 'Національне'
                          : vote.scope === 'regional'
                          ? 'Регіональне'
                          : 'Групове'}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-timber-dark/10 text-xs">
                        {typeLabels[vote.type as keyof typeof typeLabels]}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 text-xs font-bold ${
                          statusColors[vote.status as keyof typeof statusColors]
                        }`}
                      >
                        {statusLabels[vote.status as keyof typeof statusLabels]}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="font-bold">{vote.total_votes || 0}</span>
                    </td>
                    <td className="p-4">
                      <div className="font-mono text-sm">
                        {new Date(vote.end_date).toLocaleDateString('uk-UA')}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/votes/${vote.id}`}
                          className="p-2 hover:bg-timber-dark/10 rounded"
                          title="Результати"
                        >
                          <BarChart3 size={16} />
                        </Link>
                        <Link
                          href={`/admin/votes/${vote.id}/edit`}
                          className="p-2 hover:bg-timber-dark/10 rounded"
                          title="Редагувати"
                        >
                          <Edit2 size={16} />
                        </Link>
                        <button
                          className="p-2 hover:bg-red-50 rounded text-red-500"
                          title="Видалити"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <Vote className="w-12 h-12 mx-auto mb-4 text-timber-beam" />
            <h3 className="font-syne text-xl font-bold mb-2">
              Немає голосувань
            </h3>
            <p className="text-sm text-timber-beam mb-6">
              Створіть перше голосування для членів Мережі
            </p>
            <Link href="/admin/votes/new" className="btn">
              СТВОРИТИ ГОЛОСУВАННЯ →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
