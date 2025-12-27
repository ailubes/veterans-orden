'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function NewVotePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'binary',
    transparency: 'anonymous',
    scope: 'national',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    quorumRequired: '',
    majorityRequired: '50',
    status: 'draft',
  });

  const [options, setOptions] = useState([
    { text: 'Так', description: '' },
    { text: 'Ні', description: '' },
  ]);

  const addOption = () => {
    setOptions([...options, { text: '', description: '' }]);
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, field: 'text' | 'description', value: string) => {
    const newOptions = [...options];
    newOptions[index][field] = value;
    setOptions(newOptions);
  };

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
        .eq('clerk_id', user.id)
        .single();

      if (!profile) {
        setError('Профіль не знайдено');
        return;
      }

      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
      const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);

      // Create vote
      const { data: vote, error: insertError } = await supabase
        .from('votes')
        .insert({
          title: formData.title,
          description: formData.description,
          type: formData.type,
          transparency: formData.transparency,
          scope: formData.scope,
          start_date: startDateTime.toISOString(),
          end_date: endDateTime.toISOString(),
          quorum_required: formData.quorumRequired ? parseInt(formData.quorumRequired) : null,
          majority_required: parseInt(formData.majorityRequired),
          eligible_roles: ['full_member', 'group_leader', 'regional_leader', 'admin', 'super_admin'],
          status: formData.status,
          created_by_id: profile.id,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Create options
      const optionsToInsert = options
        .filter((o) => o.text.trim())
        .map((o, index) => ({
          vote_id: vote.id,
          text: o.text,
          description: o.description || null,
          order: index,
        }));

      const { error: optionsError } = await supabase
        .from('vote_options')
        .insert(optionsToInsert);

      if (optionsError) throw optionsError;

      router.push('/admin/votes');
    } catch (err) {
      console.error('Error creating vote:', err);
      setError('Помилка створення голосування');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/votes"
          className="text-sm text-timber-beam hover:text-accent flex items-center gap-2 mb-4"
        >
          <ArrowLeft size={16} />
          Назад до голосувань
        </Link>
        <h1 className="font-syne text-3xl font-bold">Нове голосування</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-canvas border-2 border-timber-dark p-6 relative">
          <div className="joint" style={{ top: '-3px', left: '-3px' }} />
          <div className="joint" style={{ top: '-3px', right: '-3px' }} />

          <h2 className="font-syne text-xl font-bold mb-6">Основна інформація</h2>

          <div className="space-y-4">
            <div>
              <label className="label block mb-2">ПИТАННЯ / НАЗВА *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none"
                placeholder="Наприклад: Чи підтримуєте ви...?"
                required
              />
            </div>

            <div>
              <label className="label block mb-2">ОПИС</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none resize-none"
                placeholder="Детальний опис питання..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label block mb-2">ТИП</label>
                <select
                  value={formData.type}
                  onChange={(e) => {
                    setFormData({ ...formData, type: e.target.value });
                    if (e.target.value === 'binary') {
                      setOptions([
                        { text: 'Так', description: '' },
                        { text: 'Ні', description: '' },
                      ]);
                    }
                  }}
                  className="w-full px-4 py-3 bg-canvas border-2 border-timber-dark font-mono text-sm"
                >
                  <option value="binary">Так / Ні</option>
                  <option value="multiple_choice">Вибір з варіантів</option>
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
                  <option value="group">Групове</option>
                </select>
              </div>
            </div>

            <div>
              <label className="label block mb-2">ПРОЗОРІСТЬ</label>
              <select
                value={formData.transparency}
                onChange={(e) => setFormData({ ...formData, transparency: e.target.value })}
                className="w-full px-4 py-3 bg-canvas border-2 border-timber-dark font-mono text-sm"
              >
                <option value="anonymous">Анонімне</option>
                <option value="public">Публічне (голоси видимі)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Options */}
        <div className="bg-canvas border-2 border-timber-dark p-6 relative">
          <div className="joint" style={{ top: '-3px', left: '-3px' }} />

          <h2 className="font-syne text-xl font-bold mb-6">Варіанти відповіді</h2>

          <div className="space-y-4">
            {options.map((option, index) => (
              <div key={index} className="flex gap-3">
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    value={option.text}
                    onChange={(e) => updateOption(index, 'text', e.target.value)}
                    className="w-full px-4 py-3 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none"
                    placeholder={`Варіант ${index + 1}`}
                    required
                  />
                  <input
                    type="text"
                    value={option.description}
                    onChange={(e) => updateOption(index, 'description', e.target.value)}
                    className="w-full px-3 py-2 bg-canvas border border-timber-dark/30 font-mono text-xs focus:border-accent focus:outline-none"
                    placeholder="Опис (необов'язково)"
                  />
                </div>
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className="p-3 text-red-500 hover:bg-red-50"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}

            {formData.type !== 'binary' && (
              <button
                type="button"
                onClick={addOption}
                className="flex items-center gap-2 text-sm text-accent hover:underline"
              >
                <Plus size={16} />
                Додати варіант
              </button>
            )}
          </div>
        </div>

        {/* Timing */}
        <div className="bg-canvas border-2 border-timber-dark p-6 relative">
          <div className="joint" style={{ top: '-3px', left: '-3px' }} />

          <h2 className="font-syne text-xl font-bold mb-6">Час проведення</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label block mb-2">ДАТА ПОЧАТКУ *</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-3 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="label block mb-2">ЧАС ПОЧАТКУ *</label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-4 py-3 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="label block mb-2">ДАТА ЗАВЕРШЕННЯ *</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-4 py-3 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="label block mb-2">ЧАС ЗАВЕРШЕННЯ *</label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-4 py-3 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none"
                required
              />
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="bg-canvas border-2 border-timber-dark p-6 relative">
          <div className="joint" style={{ top: '-3px', left: '-3px' }} />

          <h2 className="font-syne text-xl font-bold mb-6">Налаштування</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label block mb-2">КВОРУМ (мін. голосів)</label>
              <input
                type="number"
                value={formData.quorumRequired}
                onChange={(e) => setFormData({ ...formData, quorumRequired: e.target.value })}
                className="w-full px-4 py-3 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none"
                placeholder="Без обмежень"
                min="1"
              />
            </div>
            <div>
              <label className="label block mb-2">БІЛЬШІСТЬ (%)</label>
              <input
                type="number"
                value={formData.majorityRequired}
                onChange={(e) => setFormData({ ...formData, majorityRequired: e.target.value })}
                className="w-full px-4 py-3 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none"
                min="50"
                max="100"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="label block mb-2">СТАТУС</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-3 bg-canvas border-2 border-timber-dark font-mono text-sm"
              >
                <option value="draft">Чернетка</option>
                <option value="active">Активне</option>
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 p-4 text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 sm:gap-4">
          <Link href="/admin/votes" className="btn btn-outline text-center">
            СКАСУВАТИ
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="btn disabled:opacity-50"
          >
            {loading ? 'ЗБЕРЕЖЕННЯ...' : 'СТВОРИТИ ГОЛОСУВАННЯ →'}
          </button>
        </div>
      </form>
    </div>
  );
}
