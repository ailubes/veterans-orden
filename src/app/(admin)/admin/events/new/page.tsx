'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Bell } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

interface Oblast {
  id: string;
  name: string;
}

export default function NewEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [oblasts, setOblasts] = useState<Oblast[]>([]);

  useEffect(() => {
    const fetchOblasts = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('oblasts')
        .select('id, name')
        .order('name');
      if (data) setOblasts(data);
    };
    fetchOblasts();
  }, []);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'meeting',
    scope: 'national',
    isOnline: false,
    onlineUrl: '',
    location: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    maxAttendees: '',
    status: 'draft',
    notifyMembers: false,
    notifyScope: 'all' as 'all' | 'oblast',
    oblastId: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

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

      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
      const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);

      const { data: newEvent, error: insertError } = await supabase
        .from('events')
        .insert({
          title: formData.title,
          description: formData.description,
          type: formData.type,
          scope: formData.scope,
          is_online: formData.isOnline,
          online_url: formData.isOnline ? formData.onlineUrl : null,
          location: formData.isOnline ? null : { address: formData.location },
          start_date: startDateTime.toISOString(),
          end_date: endDateTime.toISOString(),
          max_attendees: formData.maxAttendees ? parseInt(formData.maxAttendees) : null,
          status: formData.status,
          organizer_id: profile.id,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Send notification if enabled and event is published
      if (formData.notifyMembers && formData.status === 'published' && newEvent) {
        try {
          await fetch('/api/admin/notifications/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: `Нова подія: ${formData.title}`,
              message: formData.description
                ? formData.description.slice(0, 200) + (formData.description.length > 200 ? '...' : '')
                : 'Нова подія в Мережі',
              type: 'info',
              scope: formData.notifyScope === 'oblast' ? 'oblast' : 'all',
              scopeValue: formData.notifyScope === 'oblast' ? formData.oblastId : null,
            }),
          });
        } catch (notifyError) {
          console.error('Failed to send notification:', notifyError);
          // Don't fail the whole operation if notification fails
        }
      }

      router.push('/admin/events');
    } catch (err) {
      console.error('Error creating event:', err);
      setError('Помилка створення події');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/events"
          className="text-sm text-muted-500 hover:text-bronze flex items-center gap-2 mb-4"
        >
          <ArrowLeft size={16} />
          Назад до подій
        </Link>
        <h1 className="font-syne text-3xl font-bold">Нова подія</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-panel-900 border border-line rounded-lg p-6 relative">
          <div className="joint joint-tl" />
          <div className="joint joint-tr" />

          <h2 className="font-syne text-xl font-bold mb-6">Основна інформація</h2>

          <div className="space-y-4">
            <div>
              <label className="label block mb-2">НАЗВА ПОДІЇ *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 bg-panel-900 border border-line rounded-lg font-mono text-sm focus:border-bronze focus:outline-none"
                placeholder="Наприклад: Загальні збори Мережі"
                required
              />
            </div>

            <div>
              <label className="label block mb-2">ОПИС</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 bg-panel-900 border border-line rounded-lg font-mono text-sm focus:border-bronze focus:outline-none resize-none"
                placeholder="Детальний опис події..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label block mb-2">ТИП ПОДІЇ</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-3 bg-panel-900 border border-line rounded-lg font-mono text-sm"
                >
                  <option value="meeting">Зустріч</option>
                  <option value="rally">Мітинг</option>
                  <option value="training">Тренінг</option>
                  <option value="social">Соціальна</option>
                  <option value="online">Онлайн</option>
                  <option value="other">Інше</option>
                </select>
              </div>
              <div>
                <label className="label block mb-2">МАСШТАБ</label>
                <select
                  value={formData.scope}
                  onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
                  className="w-full px-4 py-3 bg-panel-900 border border-line rounded-lg font-mono text-sm"
                >
                  <option value="national">Національний</option>
                  <option value="regional">Регіональний</option>
                  <option value="local">Локальний</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="bg-panel-900 border border-line rounded-lg p-6 relative">
          <div className="joint joint-tl" />

          <h2 className="font-syne text-xl font-bold mb-6">Місце проведення</h2>

          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isOnline}
                onChange={(e) => setFormData({ ...formData, isOnline: e.target.checked })}
                className="w-5 h-5"
              />
              <span className="font-bold">Онлайн подія</span>
            </label>

            {formData.isOnline ? (
              <div>
                <label className="label block mb-2">ПОСИЛАННЯ НА ПОДІЮ</label>
                <input
                  type="url"
                  value={formData.onlineUrl}
                  onChange={(e) => setFormData({ ...formData, onlineUrl: e.target.value })}
                  className="w-full px-4 py-3 bg-panel-900 border border-line rounded-lg font-mono text-sm focus:border-bronze focus:outline-none"
                  placeholder="https://zoom.us/j/..."
                />
              </div>
            ) : (
              <div>
                <label className="label block mb-2">АДРЕСА</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-3 bg-panel-900 border border-line rounded-lg font-mono text-sm focus:border-bronze focus:outline-none"
                  placeholder="вул. Хрещатик 1, Київ"
                />
              </div>
            )}
          </div>
        </div>

        {/* Date & Time */}
        <div className="bg-panel-900 border border-line rounded-lg p-6 relative">
          <div className="joint joint-tl" />

          <h2 className="font-syne text-xl font-bold mb-6">Дата та час</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label block mb-2">ДАТА ПОЧАТКУ *</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-3 bg-panel-900 border border-line rounded-lg font-mono text-sm focus:border-bronze focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="label block mb-2">ЧАС ПОЧАТКУ *</label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-4 py-3 bg-panel-900 border border-line rounded-lg font-mono text-sm focus:border-bronze focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="label block mb-2">ДАТА ЗАВЕРШЕННЯ *</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-4 py-3 bg-panel-900 border border-line rounded-lg font-mono text-sm focus:border-bronze focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="label block mb-2">ЧАС ЗАВЕРШЕННЯ *</label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-4 py-3 bg-panel-900 border border-line rounded-lg font-mono text-sm focus:border-bronze focus:outline-none"
                required
              />
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="bg-panel-900 border border-line rounded-lg p-6 relative">
          <div className="joint joint-tl" />

          <h2 className="font-syne text-xl font-bold mb-6">Налаштування</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="label block mb-2">МАКСИМУМ УЧАСНИКІВ</label>
              <input
                type="number"
                value={formData.maxAttendees}
                onChange={(e) => setFormData({ ...formData, maxAttendees: e.target.value })}
                className="w-full px-4 py-3 bg-panel-900 border border-line rounded-lg font-mono text-sm focus:border-bronze focus:outline-none"
                placeholder="Без обмежень"
                min="1"
              />
            </div>
            <div>
              <label className="label block mb-2">СТАТУС</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-3 bg-panel-900 border border-line rounded-lg font-mono text-sm"
              >
                <option value="draft">Чернетка</option>
                <option value="published">Опублікувати</option>
              </select>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="border-t border-line/20 pt-6">
            <label className="flex items-center gap-3 cursor-pointer mb-4">
              <input
                type="checkbox"
                checked={formData.notifyMembers}
                onChange={(e) => setFormData({ ...formData, notifyMembers: e.target.checked })}
                className="w-5 h-5"
              />
              <Bell className="w-5 h-5 text-bronze" />
              <span className="font-bold">Сповістити членів про подію</span>
            </label>

            {formData.notifyMembers && (
              <div className="ml-8 space-y-4">
                <div>
                  <label className="label block mb-2">КОГО СПОВІСТИТИ</label>
                  <select
                    value={formData.notifyScope}
                    onChange={(e) => setFormData({ ...formData, notifyScope: e.target.value as 'all' | 'oblast' })}
                    className="w-full px-4 py-3 bg-panel-900 border border-line rounded-lg font-mono text-sm"
                  >
                    <option value="all">Всіх активних членів</option>
                    <option value="oblast">Тільки певну область</option>
                  </select>
                </div>

                {formData.notifyScope === 'oblast' && (
                  <div>
                    <label className="label block mb-2">ОБЕРІТЬ ОБЛАСТЬ</label>
                    <select
                      value={formData.oblastId}
                      onChange={(e) => setFormData({ ...formData, oblastId: e.target.value })}
                      className="w-full px-4 py-3 bg-panel-900 border border-line rounded-lg font-mono text-sm"
                      required={formData.notifyScope === 'oblast'}
                    >
                      <option value="">Оберіть область...</option>
                      {oblasts.map((oblast) => (
                        <option key={oblast.id} value={oblast.id}>
                          {oblast.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <p className="text-xs text-muted-500">
                  Сповіщення буде надіслано тільки якщо статус події &quot;Опублікувати&quot;
                </p>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 p-4 text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 sm:gap-4">
          <Link
            href="/admin/events"
            className="btn btn-outline text-center"
          >
            СКАСУВАТИ
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="btn disabled:opacity-50"
          >
            {loading ? 'ЗБЕРЕЖЕННЯ...' : 'СТВОРИТИ ПОДІЮ →'}
          </button>
        </div>
      </form>
    </div>
  );
}
