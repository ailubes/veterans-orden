import { createClient } from '@/lib/supabase/server';
import { Plus, CheckSquare, Edit2, Trash2, Eye, FileCheck, ExternalLink } from 'lucide-react';
import Link from 'next/link';

/**
 * Extracts and shortens a URL from text for display
 */
function extractAndShortenUrl(text: string, maxLength: number = 30): { url: string; displayText: string } | null {
  const urlPattern = /(https?:\/\/[^\s<]+)/i;
  const match = text.match(urlPattern);

  if (!match) return null;

  const url = match[0];
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname.replace(/^www\./, '');
    const path = urlObj.pathname;

    let displayText = domain;
    if (path && path !== '/') {
      const remainingLength = maxLength - domain.length;
      if (remainingLength > 5) {
        displayText += path.slice(0, remainingLength - 3) + '...';
      }
    }

    if (displayText.length > maxLength) {
      displayText = displayText.slice(0, maxLength - 3) + '...';
    }

    return { url, displayText };
  } catch {
    return { url, displayText: url.slice(0, maxLength - 3) + '...' };
  }
}

export default async function AdminTasksPage() {
  const supabase = await createClient();

  // Fetch all tasks
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*, assignee:users!tasks_assignee_id_users_id_fk(first_name, last_name), creator:users!tasks_created_by_id_users_id_fk(first_name, last_name)')
    .order('created_at', { ascending: false })
    .limit(50);

  const statusColors: Record<string, string> = {
    open: 'bg-blue-100 text-blue-700',
    in_progress: 'bg-yellow-100 text-yellow-700',
    pending_review: 'bg-purple-100 text-purple-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-600',
  };

  const statusLabels: Record<string, string> = {
    open: 'Відкрито',
    in_progress: 'В роботі',
    pending_review: 'На перевірці',
    completed: 'Виконано',
    cancelled: 'Скасовано',
  };

  const priorityColors: Record<string, string> = {
    urgent: 'bg-red-500 text-white',
    high: 'bg-orange-500 text-white',
    medium: 'bg-yellow-500 text-white',
    low: 'bg-gray-400 text-white',
  };

  const priorityLabels: Record<string, string> = {
    urgent: 'Терміново',
    high: 'Високий',
    medium: 'Середній',
    low: 'Низький',
  };

  const typeLabels: Record<string, string> = {
    recruitment: 'Рекрутинг',
    outreach: 'Охоплення',
    event_support: 'Підтримка подій',
    content: 'Контент',
    administrative: 'Адміністративне',
    other: 'Інше',
  };

  const openCount = tasks?.filter((t) => t.status === 'open').length || 0;
  const inProgressCount = tasks?.filter((t) => t.status === 'in_progress').length || 0;
  const completedCount = tasks?.filter((t) => t.status === 'completed').length || 0;
  const pendingReviewCount = tasks?.filter((t) => t.status === 'pending_review').length || 0;

  // Fetch pending submissions count
  const { count: submissionsCount } = await supabase
    .from('task_submissions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <p className="label mb-2">АДМІНІСТРУВАННЯ</p>
          <h1 className="font-syne text-2xl sm:text-3xl font-bold">Завдання</h1>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <Link
            href="/admin/tasks/submissions"
            className="btn btn-outline flex items-center justify-center gap-2 relative"
          >
            <FileCheck size={18} />
            ПЕРЕВІРКИ
            {(submissionsCount || 0) > 0 && (
              <span className="absolute -top-2 -right-2 min-w-[20px] h-5 flex items-center justify-center text-xs font-bold text-white bg-orange-500 rounded-full px-1">
                {submissionsCount}
              </span>
            )}
          </Link>
          <Link
            href="/admin/tasks/new"
            className="btn flex items-center justify-center gap-2"
          >
            <Plus size={18} />
            СТВОРИТИ ЗАВДАННЯ
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        <div className="bg-canvas border-2 border-timber-dark p-4">
          <p className="label mb-1">ВСЬОГО</p>
          <p className="font-syne text-3xl font-bold">{tasks?.length || 0}</p>
        </div>
        <div className="bg-canvas border-2 border-timber-dark p-4">
          <p className="label mb-1">ВІДКРИТО</p>
          <p className="font-syne text-3xl font-bold text-blue-600">
            {openCount}
          </p>
        </div>
        <div className="bg-canvas border-2 border-timber-dark p-4">
          <p className="label mb-1">В РОБОТІ</p>
          <p className="font-syne text-3xl font-bold text-yellow-600">
            {inProgressCount}
          </p>
        </div>
        <div className="bg-canvas border-2 border-timber-dark p-4">
          <p className="label mb-1">ВИКОНАНО</p>
          <p className="font-syne text-3xl font-bold text-green-600">
            {completedCount}
          </p>
        </div>
      </div>

      {/* Tasks List */}
      {tasks && tasks.length > 0 ? (
        <>
          {/* Mobile Cards */}
          <div className="space-y-3 md:hidden">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="bg-canvas border-2 border-timber-dark p-4 relative"
              >
                <div className="joint" style={{ top: '-3px', left: '-3px' }} />
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm line-clamp-2">{task.title}</h3>
                    {(() => {
                      const urlInfo = task.description ? extractAndShortenUrl(task.description) : null;
                      if (urlInfo) {
                        return (
                          <a
                            href={urlInfo.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-accent hover:underline mt-1"
                          >
                            <ExternalLink size={12} />
                            {urlInfo.displayText}
                          </a>
                        );
                      }
                      return (
                        <p className="text-xs text-timber-beam mt-1 line-clamp-1 break-all">
                          {task.description}
                        </p>
                      );
                    })()}
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-bold flex-shrink-0 ${
                      statusColors[task.status as keyof typeof statusColors]
                    }`}
                  >
                    {statusLabels[task.status as keyof typeof statusLabels]}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs mb-3">
                  <span className="px-2 py-1 bg-timber-dark/10">
                    {typeLabels[task.type as keyof typeof typeLabels] || task.type}
                  </span>
                  <span
                    className={`px-2 py-1 font-bold ${
                      priorityColors[task.priority as keyof typeof priorityColors]
                    }`}
                  >
                    {priorityLabels[task.priority as keyof typeof priorityLabels]}
                  </span>
                  <span className="font-bold text-accent">+{task.points || 0} балів</span>
                </div>
                {task.assignee && (
                  <p className="text-xs text-timber-beam mb-3">
                    Виконавець: {task.assignee.first_name} {task.assignee.last_name?.charAt(0)}.
                  </p>
                )}
                <div className="flex items-center gap-2 pt-3 border-t border-timber-dark/10">
                  <Link
                    href={`/admin/tasks/${task.id}`}
                    className="flex-1 btn btn-sm text-center"
                  >
                    ПЕРЕГЛЯНУТИ
                  </Link>
                  <Link
                    href={`/admin/tasks/${task.id}/edit`}
                    className="p-2 border-2 border-timber-dark hover:bg-timber-dark/10"
                  >
                    <Edit2 size={16} />
                  </Link>
                  <button className="p-2 border-2 border-red-200 text-red-500 hover:bg-red-50">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block bg-canvas border-2 border-timber-dark relative">
            <div className="joint" style={{ top: '-3px', left: '-3px' }} />
            <div className="joint" style={{ top: '-3px', right: '-3px' }} />
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b-2 border-timber-dark">
                  <tr>
                    <th className="text-left p-4 font-bold text-xs">ЗАВДАННЯ</th>
                    <th className="text-left p-4 font-bold text-xs">ТИП</th>
                    <th className="text-left p-4 font-bold text-xs">ПРІОРИТЕТ</th>
                    <th className="text-left p-4 font-bold text-xs">СТАТУС</th>
                    <th className="text-left p-4 font-bold text-xs">ВИКОНАВЕЦЬ</th>
                    <th className="text-left p-4 font-bold text-xs">БАЛИ</th>
                    <th className="text-left p-4 font-bold text-xs">ДІЇ</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task) => (
                    <tr key={task.id} className="border-b border-timber-dark/20 hover:bg-timber-dark/5">
                      <td className="p-4 max-w-xs">
                        <div className="font-bold">{task.title}</div>
                        {(() => {
                          const urlInfo = task.description ? extractAndShortenUrl(task.description, 35) : null;
                          if (urlInfo) {
                            return (
                              <a
                                href={urlInfo.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-accent hover:underline"
                              >
                                <ExternalLink size={12} />
                                {urlInfo.displayText}
                              </a>
                            );
                          }
                          return (
                            <div className="text-xs text-timber-beam line-clamp-1 break-all">
                              {task.description}
                            </div>
                          );
                        })()}
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 bg-timber-dark/10 text-xs">
                          {typeLabels[task.type as keyof typeof typeLabels] || task.type}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 text-xs font-bold ${
                            priorityColors[task.priority as keyof typeof priorityColors]
                          }`}
                        >
                          {priorityLabels[task.priority as keyof typeof priorityLabels]}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 text-xs font-bold ${
                            statusColors[task.status as keyof typeof statusColors]
                          }`}
                        >
                          {statusLabels[task.status as keyof typeof statusLabels]}
                        </span>
                      </td>
                      <td className="p-4">
                        {task.assignee ? (
                          <span className="text-sm">
                            {task.assignee.first_name} {task.assignee.last_name?.charAt(0)}.
                          </span>
                        ) : (
                          <span className="text-sm text-timber-beam">—</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-accent">{task.points || 0}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/tasks/${task.id}`}
                            className="p-2 hover:bg-timber-dark/10 rounded"
                            title="Переглянути"
                          >
                            <Eye size={16} />
                          </Link>
                          <Link
                            href={`/admin/tasks/${task.id}/edit`}
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
          </div>
        </>
      ) : (
        <div className="bg-canvas border-2 border-timber-dark p-12 relative text-center">
          <div className="joint" style={{ top: '-3px', left: '-3px' }} />
          <div className="joint" style={{ top: '-3px', right: '-3px' }} />
          <CheckSquare className="w-12 h-12 mx-auto mb-4 text-timber-beam" />
          <h3 className="font-syne text-xl font-bold mb-2">Немає завдань</h3>
          <p className="text-sm text-timber-beam mb-6">
            Створіть перше завдання для членів Мережі
          </p>
          <Link href="/admin/tasks/new" className="btn">
            СТВОРИТИ ЗАВДАННЯ →
          </Link>
        </div>
      )}
    </div>
  );
}
