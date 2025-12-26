import { createClient } from '@/lib/supabase/server';
import { getAdminProfile } from '@/lib/permissions';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import {
  Edit,
  ArrowLeft,
  Calendar,
  User,
  CheckCircle,
  TrendingUp,
} from 'lucide-react';
import { LinkifyText } from '@/components/ui/linkify-text';
import { formatDate } from '@/lib/utils';

interface TaskDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function TaskDetailPage({ params }: TaskDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Check admin access
  const adminProfile = await getAdminProfile();
  if (!adminProfile) {
    redirect('/dashboard');
  }

  // Get task data
  const { data: task, error } = await supabase
    .from('tasks')
    .select('*, created_by_user:users!tasks_created_by_id_users_id_fk(first_name, last_name, email), assigned_to_user:users!tasks_assignee_id_users_id_fk(first_name, last_name, email)')
    .eq('id', id)
    .single();

  if (error || !task) {
    notFound();
  }

  // Check edit permissions
  const canEdit =
    adminProfile.role === 'super_admin' ||
    adminProfile.role === 'admin';

  // Status labels
  const statusLabels: Record<string, string> = {
    pending: 'Очікує',
    in_progress: 'В роботі',
    completed: 'Завершено',
    verified: 'Підтверджено',
    rejected: 'Відхилено',
  };

  // Priority labels
  const priorityLabels: Record<string, string> = {
    low: 'Низький',
    medium: 'Середній',
    high: 'Високий',
    urgent: 'Терміново',
  };

  // Check if overdue
  const dueDate = task.due_date ? new Date(task.due_date) : null;
  const isOverdue = dueDate && dueDate < new Date() && task.status !== 'completed' && task.status !== 'verified';

  return (
    <div className="max-w-6xl mx-auto">
      {/* Back button */}
      <div className="mb-6">
        <Link
          href="/admin/tasks"
          className="inline-flex items-center gap-2 text-sm font-bold text-timber-beam hover:text-accent transition-colors"
        >
          <ArrowLeft size={16} />
          НАЗАД ДО СПИСКУ
        </Link>
      </div>

      {/* Header Card */}
      <div className="bg-timber-dark text-canvas border-2 border-timber-dark p-6 mb-6 relative">
        <div className="joint" style={{ top: '-6px', left: '-6px' }} />
        <div className="joint" style={{ top: '-6px', right: '-6px' }} />
        <div className="joint" style={{ bottom: '-6px', left: '-6px' }} />
        <div className="joint" style={{ bottom: '-6px', right: '-6px' }} />

        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          {/* Task info */}
          <div className="flex-1">
            <h1 className="font-syne text-3xl font-bold mb-3">{task.title}</h1>
            <div className="flex flex-wrap gap-2 mb-4">
              <span
                className={`px-3 py-1 text-xs font-bold ${
                  task.priority === 'urgent'
                    ? 'bg-red-500 text-white'
                    : task.priority === 'high'
                    ? 'bg-orange-500 text-white'
                    : task.priority === 'medium'
                    ? 'bg-yellow-500 text-white'
                    : 'bg-gray-500 text-white'
                }`}
              >
                {priorityLabels[task.priority] || task.priority}
              </span>
              <span
                className={`px-3 py-1 text-xs font-bold ${
                  task.status === 'verified'
                    ? 'bg-green-500 text-white'
                    : task.status === 'completed'
                    ? 'bg-blue-500 text-white'
                    : task.status === 'in_progress'
                    ? 'bg-purple-500 text-white'
                    : task.status === 'rejected'
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-500 text-white'
                }`}
              >
                {statusLabels[task.status] || task.status}
              </span>
              {isOverdue && (
                <span className="px-3 py-1 bg-red-600 text-white text-xs font-bold">
                  ПРОСТРОЧЕНО
                </span>
              )}
            </div>

            <div className="space-y-2 text-sm text-canvas/90">
              {task.assigned_to_user && (
                <div className="flex items-center gap-2">
                  <User size={16} />
                  <span>
                    Виконавець: {task.assigned_to_user.first_name}{' '}
                    {task.assigned_to_user.last_name}
                  </span>
                </div>
              )}
              {task.due_date && (
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  <span>Термін: {formatDate(task.due_date)}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <TrendingUp size={16} />
                <span>Винагорода: {task.points_reward || 0} балів</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          {canEdit && (
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/admin/tasks/${task.id}/edit`}
                className="btn btn-sm flex items-center gap-2"
              >
                <Edit size={16} />
                РЕДАГУВАТИ
              </Link>
              {task.status === 'completed' && (
                <button className="btn btn-outline btn-sm flex items-center gap-2 border-green-500 text-green-500 hover:bg-green-500 hover:text-white">
                  <CheckCircle size={16} />
                  ПІДТВЕРДИТИ
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Task Details */}
        <div className="lg:col-span-2">
          <div className="bg-canvas border-2 border-timber-dark p-6 relative mb-6">
            <div className="joint" style={{ top: '-6px', left: '-6px' }} />
            <div className="joint" style={{ top: '-6px', right: '-6px' }} />
            <div className="joint" style={{ bottom: '-6px', left: '-6px' }} />
            <div className="joint" style={{ bottom: '-6px', right: '-6px' }} />

            <p className="label text-accent mb-4">ОПИС ЗАВДАННЯ</p>

            <div className="prose prose-sm max-w-none">
              <LinkifyText text={task.description || ''} />
            </div>

            {task.requirements && (
              <div className="mt-6 pt-6 border-t border-timber-dark/20">
                <p className="label text-accent mb-2">ВИМОГИ</p>
                <LinkifyText text={task.requirements} className="text-sm" />
              </div>
            )}
          </div>

          {/* Proof Submissions */}
          {task.requires_proof && (
            <div className="bg-canvas border-2 border-timber-dark p-6 relative">
              <div className="joint" style={{ top: '-6px', left: '-6px' }} />
              <div className="joint" style={{ top: '-6px', right: '-6px' }} />
              <div className="joint" style={{ bottom: '-6px', left: '-6px' }} />
              <div className="joint" style={{ bottom: '-6px', right: '-6px' }} />

              <p className="label text-accent mb-4">ДОКАЗИ ВИКОНАННЯ</p>

              {task.proof_url ? (
                <div className="space-y-3">
                  <div className="p-4 border border-timber-dark/20">
                    <p className="text-sm font-bold mb-2">Надано доказів</p>
                    <a
                      href={task.proof_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-accent hover:underline"
                    >
                      Переглянути докази →
                    </a>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-timber-beam">Докази ще не надано</p>
              )}
            </div>
          )}
        </div>

        {/* Task Info Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-canvas border-2 border-timber-dark p-6 relative mb-6">
            <div className="joint" style={{ top: '-6px', left: '-6px' }} />
            <div className="joint" style={{ top: '-6px', right: '-6px' }} />
            <div className="joint" style={{ bottom: '-6px', left: '-6px' }} />
            <div className="joint" style={{ bottom: '-6px', right: '-6px' }} />

            <p className="label text-accent mb-4">ІНФОРМАЦІЯ</p>

            <div className="space-y-3 text-sm">
              <div>
                <p className="text-timber-beam mb-1">Створено</p>
                <p className="font-bold">{formatDate(task.created_at)}</p>
              </div>

              {task.assigned_to_user && (
                <div>
                  <p className="text-timber-beam mb-1">Призначено</p>
                  <p className="font-bold">
                    {task.assigned_to_user.first_name}{' '}
                    {task.assigned_to_user.last_name}
                  </p>
                  <p className="text-xs text-timber-beam">
                    {task.assigned_to_user.email}
                  </p>
                </div>
              )}

              {task.due_date && (
                <div>
                  <p className="text-timber-beam mb-1">Термін виконання</p>
                  <p className={`font-bold ${isOverdue ? 'text-red-600' : ''}`}>
                    {formatDate(task.due_date)}
                  </p>
                </div>
              )}

              <div>
                <p className="text-timber-beam mb-1">Винагорода</p>
                <p className="font-syne text-2xl font-bold text-accent">
                  {task.points_reward || 0} балів
                </p>
              </div>

              <div>
                <p className="text-timber-beam mb-1">Вимагає доказів</p>
                <p className="font-bold">
                  {task.requires_proof ? 'Так' : 'Ні'}
                </p>
              </div>

              {task.completed_at && (
                <div>
                  <p className="text-timber-beam mb-1">Завершено</p>
                  <p className="font-bold">{formatDate(task.completed_at)}</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-canvas border-2 border-timber-dark p-4 relative">
            <div className="joint" style={{ top: '-6px', left: '-6px' }} />
            <div className="joint" style={{ top: '-6px', right: '-6px' }} />
            <div className="joint" style={{ bottom: '-6px', left: '-6px' }} />
            <div className="joint" style={{ bottom: '-6px', right: '-6px' }} />

            <p className="label text-accent mb-2">АВТОР</p>
            <p className="text-sm font-bold">
              {task.created_by_user?.first_name} {task.created_by_user?.last_name}
            </p>
            <p className="text-xs text-timber-beam">{task.created_by_user?.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
