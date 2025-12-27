'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, AlertTriangle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface EventEditPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EventEditPage({ params }: EventEditPageProps) {
  const router = useRouter();
  const [eventId, setEventId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canEdit, setCanEdit] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_type: 'meeting',
    scope: 'national',
    is_online: false,
    online_url: '',
    location: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    max_attendees: '',
    status: 'draft',
    requirements: '',
    created_by: '',
  });

  useEffect(() => {
    const initParams = async () => {
      const resolvedParams = await params;
      setEventId(resolvedParams.id);
    };
    initParams();
  }, [params]);

  useEffect(() => {
    if (eventId) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

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

      if (!adminProfile || !['admin', 'super_admin', 'regional_leader'].includes(adminProfile.role)) {
        router.push('/dashboard');
        return;
      }

      // Get event data
      const { data: event, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (eventError || !event) {
        setError('Не вдалося завантажити дані події');
        setLoading(false);
        return;
      }

      // Check if user can edit
      const hasEditPermission =
        adminProfile.role === 'super_admin' ||
        adminProfile.role === 'admin' ||
        (adminProfile.role === 'regional_leader' && event.created_by === adminProfile.id);

      if (!hasEditPermission) {
        router.push('/admin/events');
        return;
      }

      setCanEdit(true);

      // Parse dates
      const startDate = new Date(event.start_date);
      const endDate = new Date(event.end_date);

      setFormData({
        title: event.title || '',
        description: event.description || '',
        event_type: event.event_type || 'meeting',
        scope: event.scope || 'national',
        is_online: event.is_online || false,
        online_url: event.online_url || '',
        location: typeof event.location === 'string' ? event.location : (event.location?.address || ''),
        startDate: startDate.toISOString().split('T')[0],
        startTime: startDate.toTimeString().slice(0, 5),
        endDate: endDate.toISOString().split('T')[0],
        endTime: endDate.toTimeString().slice(0, 5),
        max_attendees: event.max_attendees ? String(event.max_attendees) : '',
        status: event.status || 'draft',
        requirements: event.requirements || '',
        created_by: event.created_by,
      });

      setLoading(false);
    } catch (err) {
      console.error('Error loading event:', err);
      setError('Помилка завантаження даних');
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const supabase = createClient();

      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
      const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);

      // Check if event has already started (can't change date if started)
      const now = new Date();
      const originalStartDate = new Date(formData.startDate);

      const updateData: Record<string, unknown> = {
        title: formData.title,
        description: formData.description,
        event_type: formData.event_type,
        scope: formData.scope,
        is_online: formData.is_online,
        online_url: formData.is_online ? formData.online_url : null,
        location: formData.is_online ? null : formData.location,
        max_attendees: formData.max_attendees ? parseInt(formData.max_attendees) : null,
        status: formData.status,
        requirements: formData.requirements,
      };

      // Only allow date changes if event hasn't started
      if (originalStartDate > now) {
        updateData.start_date = startDateTime.toISOString();
        updateData.end_date = endDateTime.toISOString();
      }

      const { error: updateError } = await supabase
        .from('events')
        .update(updateData)
        .eq('id', eventId);

      if (updateError) {
        throw updateError;
      }

      router.push(`/admin/events/${eventId}`);
    } catch (err) {
      console.error('Error updating event:', err);
      setError('Помилка збереження змін');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-canvas border-2 border-timber-dark p-8 text-center">
          <p className="text-timber-beam">Завантаження...</p>
        </div>
      </div>
    );
  }

  if (error && !canEdit) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-canvas border-2 border-timber-dark p-8 text-center">
          <p className="text-red-600 font-bold mb-4">{error}</p>
          <Link href="/admin/events" className="btn">
            НАЗАД ДО СПИСКУ
          </Link>
        </div>
      </div>
    );
  }

  const eventHasStarted = new Date(`${formData.startDate}T${formData.startTime}`) < new Date();

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back button */}
      <div className="mb-6">
        <Link
          href={`/admin/events/${eventId}`}
          className="inline-flex items-center gap-2 text-sm font-bold text-timber-beam hover:text-accent transition-colors"
        >
          <ArrowLeft size={16} />
          НАЗАД ДО ПОДІЇ
        </Link>
      </div>

      {/* Header */}
      <div className="mb-6">
        <p className="label text-accent mb-2">РЕДАГУВАННЯ ПОДІЇ</p>
        <h1 className="font-syne text-3xl lg:text-4xl font-bold">{formData.title}</h1>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-100 border-2 border-red-600 p-4 mb-6">
          <p className="text-red-600 font-bold">{error}</p>
        </div>
      )}

      {/* Warning if event has started */}
      {eventHasStarted && (
        <div className="bg-yellow-100 border-2 border-yellow-600 p-4 mb-6 flex items-start gap-2">
          <AlertTriangle size={18} className="text-yellow-600 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-yellow-800">Подія вже розпочалася</p>
            <p className="text-xs text-yellow-700">Дата та час події не можуть бути змінені</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-canvas border-2 border-timber-dark p-6 relative">
          <div className="joint joint-tl" />
          <div className="joint joint-tr" />
          <div className="joint joint-bl" />
          <div className="joint joint-br" />

          <h2 className="font-syne text-xl font-bold mb-6">Основна інформація</h2>

          <div className="space-y-4">
            <div>
              <label className="label block mb-2">НАЗВА ПОДІЇ *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="label block mb-2">ОПИС</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none resize-none"
              />
            </div>

            <div>
              <label className="label block mb-2">ВИМОГИ ДО УЧАСНИКІВ</label>
              <textarea
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none resize-none"
                placeholder="Наприклад: повнолітні члени мережі з підтвердженою особою"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label block mb-2">ТИП ПОДІЇ</label>
                <select
                  value={formData.event_type}
                  onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
                  className="w-full px-4 py-3 bg-canvas border-2 border-timber-dark font-mono text-sm"
                >
                  <option value="meeting">Збори</option>
                  <option value="protest">Протест</option>
                  <option value="workshop">Майстерня</option>
                  <option value="social">Соціальна подія</option>
                  <option value="other">Інше</option>
                </select>
              </div>
              <div>
                <label className="label block mb-2">МАСШТАБ</label>
                <select
                  value={formData.scope}
                  onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
                  className="w-full px-4 py-3 bg-canvas border-2 border-timber-dark font-mono text-sm"
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
        <div className="bg-canvas border-2 border-timber-dark p-6 relative">
          <div className="joint joint-tl" />
          <div className="joint joint-tr" />
          <div className="joint joint-bl" />
          <div className="joint joint-br" />

          <h2 className="font-syne text-xl font-bold mb-6">Місце проведення</h2>

          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_online}
                onChange={(e) => setFormData({ ...formData, is_online: e.target.checked })}
                className="w-5 h-5"
              />
              <span className="font-bold">Онлайн подія</span>
            </label>

            {formData.is_online ? (
              <div>
                <label className="label block mb-2">ПОСИЛАННЯ НА ПОДІЮ</label>
                <input
                  type="url"
                  value={formData.online_url}
                  onChange={(e) => setFormData({ ...formData, online_url: e.target.value })}
                  className="w-full px-4 py-3 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none"
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
                  className="w-full px-4 py-3 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none"
                  placeholder="вул. Хрещатик 1, Київ"
                />
              </div>
            )}
          </div>
        </div>

        {/* Date & Time */}
        <div className="bg-canvas border-2 border-timber-dark p-6 relative">
          <div className="joint joint-tl" />
          <div className="joint joint-tr" />
          <div className="joint joint-bl" />
          <div className="joint joint-br" />

          <h2 className="font-syne text-xl font-bold mb-6">Дата та час</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label block mb-2">ДАТА ПОЧАТКУ *</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-3 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none disabled:opacity-50"
                required
                disabled={eventHasStarted}
              />
            </div>
            <div>
              <label className="label block mb-2">ЧАС ПОЧАТКУ *</label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-4 py-3 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none disabled:opacity-50"
                required
                disabled={eventHasStarted}
              />
            </div>
            <div>
              <label className="label block mb-2">ДАТА ЗАВЕРШЕННЯ *</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-4 py-3 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none disabled:opacity-50"
                required
                disabled={eventHasStarted}
              />
            </div>
            <div>
              <label className="label block mb-2">ЧАС ЗАВЕРШЕННЯ *</label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-4 py-3 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none disabled:opacity-50"
                required
                disabled={eventHasStarted}
              />
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="bg-canvas border-2 border-timber-dark p-6 relative">
          <div className="joint joint-tl" />
          <div className="joint joint-tr" />
          <div className="joint joint-bl" />
          <div className="joint joint-br" />

          <h2 className="font-syne text-xl font-bold mb-6">Налаштування</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label block mb-2">МАКСИМУМ УЧАСНИКІВ</label>
              <input
                type="number"
                value={formData.max_attendees}
                onChange={(e) => setFormData({ ...formData, max_attendees: e.target.value })}
                className="w-full px-4 py-3 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none"
                placeholder="Без обмежень"
                min="1"
              />
            </div>
            <div>
              <label className="label block mb-2">СТАТУС</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-3 bg-canvas border-2 border-timber-dark font-mono text-sm"
              >
                <option value="draft">Чернетка</option>
                <option value="published">Опубліковано</option>
                <option value="cancelled">Скасовано</option>
                <option value="completed">Завершено</option>
              </select>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4">
          <Link href={`/admin/events/${eventId}`} className="btn btn-outline text-center">
            СКАСУВАТИ
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="btn flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={18} />
            {saving ? 'ЗБЕРЕЖЕННЯ...' : 'ЗБЕРЕГТИ ЗМІНИ'}
          </button>
        </div>
      </form>
    </div>
  );
}
