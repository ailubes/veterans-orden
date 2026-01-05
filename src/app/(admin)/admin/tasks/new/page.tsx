'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { ArrowLeft, Bell } from 'lucide-react';

export default function NewTaskPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'recruitment',
    priority: 'medium',
    points: 10,
    due_date: '',
    requires_proof: false,
    notifyMembers: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError('Не авторизовано');
        return;
      }

      // Get user's database ID
      const { data: profile } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .single();

      if (!profile) {
        setError('Профіль не знайдено');
        return;
      }

      const { data: newTask, error: insertError } = await supabase
        .from('tasks')
        .insert({
          title: formData.title,
          description: formData.description,
          type: formData.type,
          priority: formData.priority,
          points: formData.points,
          due_date: formData.due_date || null,
          requires_proof: formData.requires_proof,
          status: 'open',
          created_by_id: profile.id,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Send notification if enabled
      if (formData.notifyMembers && newTask) {
        try {
          await fetch('/api/admin/notifications/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: `Нове завдання: ${formData.title}`,
              message: formData.description
                ? formData.description.slice(0, 200) + (formData.description.length > 200 ? '...' : '')
                : `Нове завдання на ${formData.points} балів`,
              type: 'info',
              scope: 'all',
            }),
          });
        } catch (notifyError) {
          console.error('Failed to send notification:', notifyError);
        }
      }

      router.push('/admin/tasks');
      router.refresh();
    } catch (err) {
      console.error('Task creation error:', err);
      setError('Помилка створення завдання');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/tasks"
          className="inline-flex items-center gap-2 text-sm text-muted-500 hover:text-bronze mb-4"
        >
          <ArrowLeft size={16} />
          Назад до завдань
        </Link>
        <h1 className="font-syne text-3xl font-bold">Нове завдання</h1>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-panel-900 border border-line rounded-lg p-6 relative">
          <div className="joint joint-tl" />
          <div className="joint joint-tr" />

          <div className="space-y-4">
            <div>
              <label className="label block mb-2">НАЗВА *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-4 py-3 bg-panel-900 border border-line rounded-lg font-mono text-sm focus:border-bronze focus:outline-none"
                placeholder="Назва завдання"
                required
              />
            </div>

            <div>
              <label className="label block mb-2">ОПИС</label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-4 py-3 bg-panel-900 border border-line rounded-lg font-mono text-sm focus:border-bronze focus:outline-none min-h-[120px]"
                placeholder="Детальний опис завдання..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label block mb-2">ТИП *</label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-panel-900 border border-line rounded-lg font-mono text-sm focus:border-bronze focus:outline-none"
                  required
                >
                  <option value="recruitment">Рекрутинг</option>
                  <option value="outreach">Охоплення</option>
                  <option value="event_support">Підтримка подій</option>
                  <option value="content">Контент</option>
                  <option value="administrative">Адміністративне</option>
                  <option value="other">Інше</option>
                </select>
              </div>

              <div>
                <label className="label block mb-2">ПРІОРИТЕТ *</label>
                <select
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({ ...formData, priority: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-panel-900 border border-line rounded-lg font-mono text-sm focus:border-bronze focus:outline-none"
                  required
                >
                  <option value="low">Низький</option>
                  <option value="medium">Середній</option>
                  <option value="high">Високий</option>
                  <option value="urgent">Терміново</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label block mb-2">БАЛИ *</label>
                <input
                  type="number"
                  value={formData.points}
                  onChange={(e) =>
                    setFormData({ ...formData, points: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-4 py-3 bg-panel-900 border border-line rounded-lg font-mono text-sm focus:border-bronze focus:outline-none"
                  min="0"
                  max="1000"
                  required
                />
              </div>

              <div>
                <label className="label block mb-2">ДЕДЛАЙН</label>
                <input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) =>
                    setFormData({ ...formData, due_date: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-panel-900 border border-line rounded-lg font-mono text-sm focus:border-bronze focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="requires_proof"
                checked={formData.requires_proof}
                onChange={(e) =>
                  setFormData({ ...formData, requires_proof: e.target.checked })
                }
                className="w-5 h-5 border border-line rounded-lg"
              />
              <label htmlFor="requires_proof" className="text-sm">
                Потребує підтвердження виконання (посилання/скріншот)
              </label>
            </div>

            {/* Notification Option */}
            <div className="border-t border-line/20 pt-4 mt-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.notifyMembers}
                  onChange={(e) => setFormData({ ...formData, notifyMembers: e.target.checked })}
                  className="w-5 h-5"
                />
                <Bell className="w-5 h-5 text-bronze" />
                <span className="font-bold">Сповістити всіх членів про завдання</span>
              </label>
              <p className="text-xs text-muted-500 mt-2 ml-8">
                Всі активні члени отримають сповіщення про нове завдання
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 p-4 text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={loading}
            className="btn disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'СТВОРЕННЯ...' : 'СТВОРИТИ ЗАВДАННЯ →'}
          </button>
          <Link
            href="/admin/tasks"
            className="text-sm text-muted-500 hover:text-bronze"
          >
            Скасувати
          </Link>
        </div>
      </form>
    </div>
  );
}
