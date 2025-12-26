'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, AlertTriangle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface TaskEditPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function TaskEditPage({ params }: TaskEditPageProps) {
  const router = useRouter();
  const [taskId, setTaskId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canEdit, setCanEdit] = useState(false);
  const [members, setMembers] = useState<Array<{ id: string; first_name: string; last_name: string; email: string }>>([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    status: 'pending',
    priority: 'medium',
    assigned_to: '',
    due_date: '',
    points_reward: '',
    requires_proof: false,
    created_by_id: '',
  });

  useEffect(() => {
    const initParams = async () => {
      const resolvedParams = await params;
      setTaskId(resolvedParams.id);
    };
    initParams();
  }, [params]);

  useEffect(() => {
    if (taskId) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId]);

  const loadData = async () => {
    try {
      const supabase = createClient();

      // Get current admin profile
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/sign-in');
        return;
      }

      const { data: adminProfile } = await supabase
        .from('users')
        .select('role, id')
        .eq('clerk_id', user.id)
        .single();

      if (!adminProfile || !['admin', 'super_admin'].includes(adminProfile.role)) {
        router.push('/dashboard');
        return;
      }

      // Get task data
      const { data: task, error: taskError } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .single();

      if (taskError || !task) {
        setError('Не вдалося завантажити дані завдання');
        setLoading(false);
        return;
      }

      // Check if user can edit
      const hasEditPermission =
        adminProfile.role === 'super_admin' ||
        adminProfile.role === 'admin';

      if (!hasEditPermission) {
        router.push('/admin/tasks');
        return;
      }

      setCanEdit(hasEditPermission);

      // Load members for assignment dropdown
      const { data: membersData } = await supabase
        .from('users')
        .select('id, first_name, last_name, email')
        .eq('status', 'active')
        .order('first_name');

      setMembers(membersData || []);

      // Format due_date for input
      const dueDate = task.due_date
        ? new Date(task.due_date).toISOString().split('T')[0]
        : '';

      setFormData({
        title: task.title || '',
        description: task.description || '',
        requirements: task.requirements || '',
        status: task.status || 'pending',
        priority: task.priority || 'medium',
        assigned_to: task.assignee_id || '',
        due_date: dueDate,
        points_reward: task.points?.toString() || '',
        requires_proof: task.requires_proof || false,
        created_by_id: task.created_by_id || '',
      });

      setLoading(false);
    } catch (err) {
      console.error('Load error:', err);
      setError(err instanceof Error ? err.message : 'Помилка завантаження');
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          requirements: formData.requirements || null,
          status: formData.status,
          priority: formData.priority,
          assigned_to: formData.assigned_to || null,
          due_date: formData.due_date || null,
          points_reward: formData.points_reward ? parseInt(formData.points_reward) : 0,
          requires_proof: formData.requires_proof,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Помилка збереження');
      }

      router.push(`/admin/tasks/${taskId}`);
    } catch (err) {
      console.error('Save error:', err);
      setError(err instanceof Error ? err.message : 'Помилка збереження');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-canvas border-2 border-timber-dark p-8 text-center">
          <p className="text-timber-beam">Завантаження...</p>
        </div>
      </div>
    );
  }

  if (error && !canEdit) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 border-2 border-red-500 p-6">
          <div className="flex items-center gap-3 text-red-700">
            <AlertTriangle size={24} />
            <p className="font-bold">{error || 'Помилка доступу'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back button */}
      <div className="mb-6">
        <Link
          href={`/admin/tasks/${taskId}`}
          className="inline-flex items-center gap-2 text-sm font-bold text-timber-beam hover:text-accent transition-colors"
        >
          <ArrowLeft size={16} />
          НАЗАД
        </Link>
      </div>

      {/* Header */}
      <div className="mb-8">
        <p className="label text-accent mb-2">РЕДАГУВАННЯ ЗАВДАННЯ</p>
        <h1 className="font-syne text-3xl lg:text-4xl font-bold">
          Редагувати завдання
        </h1>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border-2 border-red-500 p-4 mb-6">
          <div className="flex items-center gap-2 text-red-700">
            <AlertTriangle size={20} />
            <p className="font-bold">{error}</p>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="bg-canvas border-2 border-timber-dark p-6 relative mb-6">
          <div className="joint" style={{ top: '-6px', left: '-6px' }} />
          <div className="joint" style={{ top: '-6px', right: '-6px' }} />
          <div className="joint" style={{ bottom: '-6px', left: '-6px' }} />
          <div className="joint" style={{ bottom: '-6px', right: '-6px' }} />

          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="label mb-2 block">НАЗВА ЗАВДАННЯ *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="label mb-2 block">ОПИС *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none min-h-[120px]"
                required
              />
            </div>

            {/* Requirements */}
            <div>
              <label className="label mb-2 block">ВИМОГИ</label>
              <textarea
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                className="w-full px-4 py-3 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none min-h-[100px]"
                placeholder="Критерії прийняття, додаткові вимоги..."
              />
            </div>

            {/* Row: Priority + Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label mb-2 block">ПРІОРИТЕТ *</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-4 py-3 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none"
                  required
                >
                  <option value="low">Низький</option>
                  <option value="medium">Середній</option>
                  <option value="high">Високий</option>
                  <option value="urgent">Терміново</option>
                </select>
              </div>

              <div>
                <label className="label mb-2 block">СТАТУС *</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-3 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none"
                  required
                >
                  <option value="pending">Очікує</option>
                  <option value="in_progress">В роботі</option>
                  <option value="completed">Завершено</option>
                  <option value="verified">Підтверджено</option>
                  <option value="rejected">Відхилено</option>
                </select>
              </div>
            </div>

            {/* Row: Assigned To + Due Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label mb-2 block">ПРИЗНАЧЕНО</label>
                <select
                  value={formData.assigned_to}
                  onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                  className="w-full px-4 py-3 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none"
                >
                  <option value="">Не призначено</option>
                  {members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.first_name} {member.last_name} ({member.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label mb-2 block">ТЕРМІН ВИКОНАННЯ</label>
                <input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  className="w-full px-4 py-3 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none"
                />
              </div>
            </div>

            {/* Row: Points Reward + Requires Proof */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label mb-2 block">ВИНАГОРОДА (БАЛИ)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.points_reward}
                  onChange={(e) => setFormData({ ...formData, points_reward: e.target.value })}
                  className="w-full px-4 py-3 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none"
                />
              </div>

              <div>
                <label className="label mb-2 block">ВИМОГИ</label>
                <div className="flex items-center gap-3 h-full">
                  <input
                    type="checkbox"
                    id="requires_proof"
                    checked={formData.requires_proof}
                    onChange={(e) =>
                      setFormData({ ...formData, requires_proof: e.target.checked })
                    }
                    className="w-5 h-5 border-2 border-timber-dark focus:ring-accent"
                  />
                  <label htmlFor="requires_proof" className="text-sm font-bold">
                    Вимагає доказів виконання
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-4">
          <button
            type="submit"
            disabled={saving}
            className="btn flex items-center gap-2 disabled:opacity-50"
          >
            <Save size={18} />
            {saving ? 'ЗБЕРЕЖЕННЯ...' : 'ЗБЕРЕГТИ ЗМІНИ'}
          </button>
          <Link href={`/admin/tasks/${taskId}`} className="btn btn-outline">
            СКАСУВАТИ
          </Link>
        </div>
      </form>
    </div>
  );
}
