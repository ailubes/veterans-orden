'use client';

import { useEffect, useState } from 'react';
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
    isElection: false,
    positionType: 'regional_coordinator',
    commanderyScope: '',
    maxWinners: '1',
  });

  const [commanderies, setCommanderies] = useState<Array<{ id: string; name: string; code: string }>>([]);
  const [commanderyMembers, setCommanderyMembers] = useState<Array<{ id: string; first_name: string | null; last_name: string | null; membership_role: string | null }>>([]);

  const [options, setOptions] = useState([
    { text: 'Так', description: '' },
    { text: 'Ні', description: '' },
  ]);

  const [candidateOptions, setCandidateOptions] = useState<Array<{ candidateUserId: string; text: string; description: string }>>([]);

  useEffect(() => {
    const loadCommanderies = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('commanderies')
        .select('id, name, code')
        .order('name', { ascending: true });

      setCommanderies(data || []);
    };

    void loadCommanderies();
  }, []);

  useEffect(() => {
    const loadMembers = async () => {
      if (!formData.isElection || !formData.commanderyScope) {
        setCommanderyMembers([]);
        setCandidateOptions([]);
        return;
      }

      const supabase = createClient();
      const { data } = await supabase
        .from('users')
        .select('id, first_name, last_name, membership_role')
        .eq('commandery_id', formData.commanderyScope)
        .eq('status', 'active')
        .order('last_name', { ascending: true });

      setCommanderyMembers(data || []);
      setCandidateOptions([]);
    };

    void loadMembers();
  }, [formData.commanderyScope, formData.isElection]);

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

  const addCandidateOption = () => {
    setCandidateOptions((prev) => [...prev, { candidateUserId: '', text: '', description: '' }]);
  };

  const removeCandidateOption = (index: number) => {
    setCandidateOptions((prev) => prev.filter((_, idx) => idx !== index));
  };

  const updateCandidateOption = (
    index: number,
    field: 'candidateUserId' | 'text' | 'description',
    value: string
  ) => {
    setCandidateOptions((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };

      if (field === 'candidateUserId') {
        const selected = commanderyMembers.find((member) => member.id === value);
        const fullName = selected
          ? `${selected.first_name || ''} ${selected.last_name || ''}`.trim()
          : '';
        next[index].text = fullName || next[index].text;
      }

      return next;
    });
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
        .eq('auth_id', user.id)
        .single();

      if (!profile) {
        setError('Профіль не знайдено');
        return;
      }

      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
      const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);

      if (formData.isElection) {
        if (!formData.commanderyScope) {
          setError('Для праймеріз потрібно вибрати командерію');
          setLoading(false);
          return;
        }

        const validCandidates = candidateOptions.filter((option) => option.candidateUserId);
        if (validCandidates.length < 2) {
          setError('Для праймеріз потрібно додати щонайменше 2 кандидатів');
          setLoading(false);
          return;
        }

        const maxWinners = parseInt(formData.maxWinners, 10);
        if (Number.isNaN(maxWinners) || maxWinners < 1 || maxWinners > 2) {
          setError('Кількість переможців має бути від 1 до 2');
          setLoading(false);
          return;
        }
      }

      // Create vote
      const { data: vote, error: insertError } = await supabase
        .from('votes')
        .insert({
          title: formData.title,
          description: formData.description,
          type: formData.isElection ? 'multiple_choice' : formData.type,
          transparency: formData.transparency,
          scope: formData.isElection ? 'regional' : formData.scope,
          start_date: startDateTime.toISOString(),
          end_date: endDateTime.toISOString(),
          quorum_required: formData.quorumRequired ? parseInt(formData.quorumRequired) : null,
          majority_required: parseInt(formData.majorityRequired),
          eligible_roles: formData.isElection
            ? ['member', 'honorary_member', 'network_leader', 'regional_leader', 'national_leader', 'network_guide']
            : ['full_member', 'group_leader', 'regional_leader', 'admin', 'super_admin'],
          is_election: formData.isElection,
          position_type: formData.isElection ? formData.positionType : null,
          commandery_scope: formData.isElection ? formData.commanderyScope : null,
          max_winners: formData.isElection ? parseInt(formData.maxWinners, 10) : 1,
          status: formData.status,
          created_by_id: profile.id,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Create options
      const optionsToInsert = formData.isElection
        ? candidateOptions
          .filter((option) => option.candidateUserId)
          .map((option, index) => ({
            vote_id: vote.id,
            text: option.text || `Кандидат ${index + 1}`,
            description: option.description || null,
            candidate_user_id: option.candidateUserId,
            order: index,
          }))
        : options
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
          className="text-sm text-muted-500 hover:text-bronze flex items-center gap-2 mb-4"
        >
          <ArrowLeft size={16} />
          Назад до голосувань
        </Link>
        <h1 className="font-syne text-3xl font-bold">Нове голосування</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-panel-900 border border-line rounded-lg p-6 relative">
          <div className="joint joint-tl" />
          <div className="joint joint-tr" />

          <h2 className="font-syne text-xl font-bold mb-6">Основна інформація</h2>

          <div className="space-y-4">
            <div>
              <label className="label block mb-2">ПИТАННЯ / НАЗВА *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 bg-panel-900 border border-line rounded-lg font-mono text-sm focus:border-bronze focus:outline-none"
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
                className="w-full px-4 py-3 bg-panel-900 border border-line rounded-lg font-mono text-sm focus:border-bronze focus:outline-none resize-none"
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
                  className="w-full px-4 py-3 bg-panel-900 border border-line rounded-lg font-mono text-sm"
                  disabled={formData.isElection}
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
                  className="w-full px-4 py-3 bg-panel-900 border border-line rounded-lg font-mono text-sm"
                  disabled={formData.isElection}
                >
                  <option value="national">Національний</option>
                  <option value="regional">Регіональний</option>
                  <option value="group">Групове</option>
                </select>
              </div>
            </div>

            <div className="border border-line rounded-lg p-4 space-y-3">
              <label className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={formData.isElection}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      isElection: e.target.checked,
                      scope: e.target.checked ? 'regional' : formData.scope,
                      type: e.target.checked ? 'multiple_choice' : formData.type,
                    })
                  }
                />
                Це праймеріз для обрання керівної ролі командерії
              </label>

              {formData.isElection && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label block mb-2">ПОСАДА</label>
                    <select
                      value={formData.positionType}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          positionType: e.target.value,
                          maxWinners: e.target.value === 'deputy_commander' ? '2' : '1',
                        }))
                      }
                      className="w-full px-4 py-3 bg-panel-900 border border-line rounded-lg font-mono text-sm"
                    >
                      <option value="regional_coordinator">Регіональний лідер (координатор)</option>
                      <option value="deputy_commander">Заступник керівника командерії</option>
                    </select>
                  </div>

                  <div>
                    <label className="label block mb-2">КОМАНДЕРІЯ (РЕГІОН)</label>
                    <select
                      value={formData.commanderyScope}
                      onChange={(e) => setFormData({ ...formData, commanderyScope: e.target.value })}
                      className="w-full px-4 py-3 bg-panel-900 border border-line rounded-lg font-mono text-sm"
                      required={formData.isElection}
                    >
                      <option value="">Оберіть командерію</option>
                      {commanderies.map((commandery) => (
                        <option key={commandery.id} value={commandery.id}>
                          {commandery.name} ({commandery.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  {formData.positionType === 'deputy_commander' && (
                    <div>
                      <label className="label block mb-2">КІЛЬКІСТЬ ПЕРЕМОЖЦІВ</label>
                      <select
                        value={formData.maxWinners}
                        onChange={(e) => setFormData({ ...formData, maxWinners: e.target.value })}
                        className="w-full px-4 py-3 bg-panel-900 border border-line rounded-lg font-mono text-sm"
                      >
                        <option value="1">1 заступник</option>
                        <option value="2">2 заступники</option>
                      </select>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="label block mb-2">ПРОЗОРІСТЬ</label>
              <select
                value={formData.transparency}
                onChange={(e) => setFormData({ ...formData, transparency: e.target.value })}
                className="w-full px-4 py-3 bg-panel-900 border border-line rounded-lg font-mono text-sm"
              >
                <option value="anonymous">Анонімне</option>
                <option value="public">Публічне (голоси видимі)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Options */}
        <div className="bg-panel-900 border border-line rounded-lg p-6 relative">
          <div className="joint joint-tl" />

          <h2 className="font-syne text-xl font-bold mb-6">
            {formData.isElection ? 'Кандидати на праймеріз' : 'Варіанти відповіді'}
          </h2>

          {formData.isElection ? (
            <div className="space-y-4">
              {candidateOptions.map((candidate, index) => (
                <div key={index} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3 items-start">
                  <select
                    value={candidate.candidateUserId}
                    onChange={(e) => updateCandidateOption(index, 'candidateUserId', e.target.value)}
                    className="w-full px-4 py-3 bg-panel-900 border border-line rounded-lg font-mono text-sm"
                    required
                  >
                    <option value="">Оберіть кандидата</option>
                    {commanderyMembers.map((member) => {
                      const fullName = `${member.first_name || ''} ${member.last_name || ''}`.trim() || 'Без імені';
                      return (
                        <option key={member.id} value={member.id}>
                          {fullName} ({member.membership_role || 'роль не вказано'})
                        </option>
                      );
                    })}
                  </select>
                  <input
                    type="text"
                    value={candidate.description}
                    onChange={(e) => updateCandidateOption(index, 'description', e.target.value)}
                    className="w-full px-4 py-3 bg-panel-900 border border-line rounded-lg font-mono text-sm"
                    placeholder="Коротка програма кандидата (необов'язково)"
                  />
                  <button
                    type="button"
                    onClick={() => removeCandidateOption(index)}
                    className="p-3 text-red-500 hover:bg-red-50"
                    aria-label="Видалити кандидата"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={addCandidateOption}
                className="flex items-center gap-2 text-sm text-bronze hover:underline"
              >
                <Plus size={16} />
                Додати кандидата
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {options.map((option, index) => (
                <div key={index} className="flex gap-3">
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={option.text}
                      onChange={(e) => updateOption(index, 'text', e.target.value)}
                      className="w-full px-4 py-3 bg-panel-900 border border-line rounded-lg font-mono text-sm focus:border-bronze focus:outline-none"
                      placeholder={`Варіант ${index + 1}`}
                      required
                    />
                    <input
                      type="text"
                      value={option.description}
                      onChange={(e) => updateOption(index, 'description', e.target.value)}
                      className="w-full px-3 py-2 bg-panel-900 border border-line/30 font-mono text-xs focus:border-bronze focus:outline-none"
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
                  className="flex items-center gap-2 text-sm text-bronze hover:underline"
                >
                  <Plus size={16} />
                  Додати варіант
                </button>
              )}
            </div>
          )}
        </div>

        {/* Timing */}
        <div className="bg-panel-900 border border-line rounded-lg p-6 relative">
          <div className="joint joint-tl" />

          <h2 className="font-syne text-xl font-bold mb-6">Час проведення</h2>

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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label block mb-2">КВОРУМ (мін. голосів)</label>
              <input
                type="number"
                value={formData.quorumRequired}
                onChange={(e) => setFormData({ ...formData, quorumRequired: e.target.value })}
                className="w-full px-4 py-3 bg-panel-900 border border-line rounded-lg font-mono text-sm focus:border-bronze focus:outline-none"
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
                className="w-full px-4 py-3 bg-panel-900 border border-line rounded-lg font-mono text-sm focus:border-bronze focus:outline-none"
                min="50"
                max="100"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="label block mb-2">СТАТУС</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-3 bg-panel-900 border border-line rounded-lg font-mono text-sm"
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
