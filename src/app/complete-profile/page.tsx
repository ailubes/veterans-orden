'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { checkProfileCompletion, getFieldLabel, type UserProfile } from '@/lib/profile-completion';

interface Oblast {
  id: string;
  name: string;
}

export default function CompleteProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [oblasts, setOblasts] = useState<Oblast[]>([]);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    patronymic: '',
    phone: '',
    dateOfBirth: '',
    oblastId: '',
    city: '',
  });

  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [completionPercentage, setCompletionPercentage] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/sign-in');
        return;
      }

      // Load user profile
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('clerk_id', user.id)
        .single();

      if (profile) {
        // Check if profile is already complete
        const status = checkProfileCompletion(profile as unknown as UserProfile);

        if (status.isComplete) {
          // Profile is complete, redirect to dashboard
          router.push('/dashboard');
          return;
        }

        setMissingFields(status.missingFields);
        setCompletionPercentage(status.completionPercentage);

        // Pre-fill form with existing data
        setFormData({
          firstName: profile.first_name || '',
          lastName: profile.last_name || '',
          patronymic: profile.patronymic || '',
          phone: profile.phone || '',
          dateOfBirth: profile.date_of_birth
            ? new Date(profile.date_of_birth).toISOString().split('T')[0]
            : '',
          oblastId: profile.oblast_id || '',
          city: profile.city || '',
        });
      }

      // Load oblasts
      const { data: oblastsData } = await supabase
        .from('oblasts')
        .select('id, name')
        .order('name');

      if (oblastsData) {
        setOblasts(oblastsData);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error loading profile:', err);
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
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError('Не авторизовано');
        return;
      }

      // Update profile in database
      const { error: updateError } = await supabase
        .from('users')
        .update({
          first_name: formData.firstName.trim(),
          last_name: formData.lastName.trim(),
          patronymic: formData.patronymic.trim() || null,
          phone: formData.phone.trim(),
          date_of_birth: formData.dateOfBirth,
          oblast_id: formData.oblastId,
          city: formData.city.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('clerk_id', user.id);

      if (updateError) {
        throw updateError;
      }

      setSuccess(true);

      // Redirect to dashboard after 1 second
      setTimeout(() => {
        router.push('/dashboard');
        router.refresh();
      }, 1000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Помилка збереження даних. Спробуйте ще раз.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center py-12">
          <p className="text-timber-beam">Завантаження...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <p className="label mb-2">НАЛАШТУВАННЯ ПРОФІЛЮ</p>
        <h1 className="font-syne text-3xl lg:text-4xl font-bold">
          Заповніть ваш профіль
        </h1>
        <p className="text-timber-beam mt-4">
          Для продовження роботи з платформою, будь ласка, заповніть всю необхідну інформацію.
        </p>
      </div>

      {/* Completion Progress */}
      <div className="bg-canvas border-2 border-timber-dark p-6 mb-6 relative">
        <div className="joint" style={{ top: '-6px', left: '-6px' }} />
        <div className="joint" style={{ top: '-6px', right: '-6px' }} />
        <div className="joint" style={{ bottom: '-6px', left: '-6px' }} />
        <div className="joint" style={{ bottom: '-6px', right: '-6px' }} />

        <p className="label text-accent mb-4">ПРОГРЕС ЗАПОВНЕННЯ</p>

        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="h-3 bg-timber-beam/20 relative">
              <div
                className="h-full bg-accent transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
          <span className="font-syne text-2xl font-bold">{completionPercentage}%</span>
        </div>

        {missingFields.length > 0 && (
          <div className="mt-4 text-sm text-timber-beam">
            <p className="font-bold mb-2">Необхідно заповнити:</p>
            <ul className="list-disc list-inside space-y-1">
              {missingFields.map((field) => (
                <li key={field}>{getFieldLabel(field)}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSubmit}>
        <div className="bg-canvas border-2 border-timber-dark p-6 lg:p-8 relative mb-6">
          <div className="joint" style={{ top: '-6px', left: '-6px' }} />
          <div className="joint" style={{ top: '-6px', right: '-6px' }} />
          <div className="joint" style={{ bottom: '-6px', left: '-6px' }} />
          <div className="joint" style={{ bottom: '-6px', right: '-6px' }} />

          <p className="label text-accent mb-6">ОСОБИСТІ ДАНІ</p>

          <div className="space-y-4">
            {/* First Name */}
            <div>
              <label className="label block mb-2">
                ІМ&apos;Я <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-4 py-3 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none"
                required
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="label block mb-2">
                ПРІЗВИЩЕ <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-4 py-3 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none"
                required
              />
            </div>

            {/* Patronymic */}
            <div>
              <label className="label block mb-2">ПО БАТЬКОВІ</label>
              <input
                type="text"
                value={formData.patronymic}
                onChange={(e) => setFormData({ ...formData, patronymic: e.target.value })}
                className="w-full px-4 py-3 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="label block mb-2">
                ТЕЛЕФОН <span className="text-red-600">*</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+380XXXXXXXXX"
                className="w-full px-4 py-3 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none"
                required
              />
            </div>

            {/* Date of Birth */}
            <div>
              <label className="label block mb-2">
                ДАТА НАРОДЖЕННЯ <span className="text-red-600">*</span>
              </label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="w-full px-4 py-3 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none"
                required
              />
            </div>

            {/* Oblast */}
            <div>
              <label className="label block mb-2">
                ОБЛАСТЬ <span className="text-red-600">*</span>
              </label>
              <select
                value={formData.oblastId}
                onChange={(e) => setFormData({ ...formData, oblastId: e.target.value })}
                className="w-full px-4 py-3 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none"
                required
              >
                <option value="">Оберіть область...</option>
                {oblasts.map((oblast) => (
                  <option key={oblast.id} value={oblast.id}>
                    {oblast.name}
                  </option>
                ))}
              </select>
            </div>

            {/* City */}
            <div>
              <label className="label block mb-2">
                МІСТО <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Київ"
                className="w-full px-4 py-3 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none"
                required
              />
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="bg-green-50 border-2 border-green-200 p-4 mb-6 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-green-800 font-bold">Профіль успішно заповнено!</p>
              <p className="text-green-700 text-sm">Перенаправлення на панель управління...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-2 border-red-200 p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={saving || success}
          className="btn w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'ЗБЕРЕЖЕННЯ...' : 'ЗБЕРЕГТИ ТА ПРОДОВЖИТИ →'}
        </button>
      </form>
    </div>
  );
}
