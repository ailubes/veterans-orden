'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Trophy, Loader2 } from 'lucide-react';
import {
  CHALLENGE_TYPE_LABELS,
  CHALLENGE_GOAL_TYPE_LABELS,
  CHALLENGE_REWARDS,
} from '@/lib/challenges';
import type { Challenge, ChallengeType, ChallengeGoalType } from '@/lib/challenges';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditChallengePage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [challenge, setChallenge] = useState<Challenge | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'weekly' as ChallengeType,
    goalType: 'tasks' as ChallengeGoalType,
    goalTarget: 10,
    points: 50,
    startDate: '',
    endDate: '',
    isCompetitive: false,
    maxWinners: 3,
  });

  useEffect(() => {
    fetchChallenge();
  }, [id]);

  async function fetchChallenge() {
    try {
      const res = await fetch(`/api/admin/challenges/${id}`);
      if (!res.ok) {
        setError('Челендж не знайдено');
        return;
      }

      const data = await res.json();
      const c = data.challenge as Challenge;
      setChallenge(c);

      setFormData({
        title: c.title,
        description: c.description || '',
        type: c.type,
        goalType: c.goalType,
        goalTarget: c.goalTarget,
        points: c.points,
        startDate: c.startDate.split('T')[0],
        endDate: c.endDate.split('T')[0],
        isCompetitive: c.isCompetitive,
        maxWinners: c.maxWinners || 3,
      });
    } catch (err) {
      console.error('Failed to fetch challenge:', err);
      setError('Помилка завантаження');
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const res = await fetch(`/api/admin/challenges/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          type: formData.type,
          goalType: formData.goalType,
          goalTarget: formData.goalTarget,
          points: formData.points,
          startDate: formData.startDate,
          endDate: formData.endDate,
          isCompetitive: formData.isCompetitive,
          maxWinners: formData.isCompetitive ? formData.maxWinners : 1,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Помилка збереження');
      }

      router.push(`/admin/challenges/${id}`);
      router.refresh();
    } catch (err) {
      console.error('Challenge update error:', err);
      setError(err instanceof Error ? err.message : 'Помилка збереження');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="animate-spin text-bronze" size={48} />
      </div>
    );
  }

  if (error && !challenge) {
    return (
      <div className="max-w-2xl mx-auto">
        <Link
          href="/admin/challenges"
          className="inline-flex items-center gap-2 text-sm text-muted-500 hover:text-bronze mb-4"
        >
          <ArrowLeft size={16} />
          Назад до челенджів
        </Link>
        <div className="bg-panel-900 border border-line rounded-lg p-12 text-center">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (challenge?.status !== 'upcoming') {
    return (
      <div className="max-w-2xl mx-auto">
        <Link
          href={`/admin/challenges/${id}`}
          className="inline-flex items-center gap-2 text-sm text-muted-500 hover:text-bronze mb-4"
        >
          <ArrowLeft size={16} />
          Назад до челенджу
        </Link>
        <div className="bg-panel-900 border border-line rounded-lg p-12 text-center">
          <p className="font-syne text-xl font-bold mb-2">Редагування недоступне</p>
          <p className="text-muted-500">
            Можна редагувати тільки челенджі зі статусом &quot;Очікується&quot;
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/admin/challenges/${id}`}
          className="inline-flex items-center gap-2 text-sm text-muted-500 hover:text-bronze mb-4"
        >
          <ArrowLeft size={16} />
          Назад до челенджу
        </Link>
        <h1 className="font-syne text-3xl font-bold">Редагувати челендж</h1>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-panel-900 border border-line rounded-lg p-6 relative">
          <div className="joint joint-tl" />
          <div className="joint joint-tr" />

          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="label block mb-2">НАЗВА *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 bg-panel-900 border border-line rounded-lg font-mono text-sm focus:border-bronze focus:outline-none"
                placeholder="Назва челенджу"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="label block mb-2">ОПИС</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 bg-panel-900 border border-line rounded-lg font-mono text-sm focus:border-bronze focus:outline-none min-h-[100px]"
                placeholder="Детальний опис челенджу..."
              />
            </div>

            {/* Type and Goal */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label block mb-2">ТИП ЧЕЛЕНДЖУ *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as ChallengeType })}
                  className="w-full px-4 py-3 bg-panel-900 border border-line rounded-lg font-mono text-sm focus:border-bronze focus:outline-none"
                  required
                >
                  {(Object.keys(CHALLENGE_TYPE_LABELS) as ChallengeType[]).map((type) => (
                    <option key={type} value={type}>
                      {CHALLENGE_TYPE_LABELS[type].uk}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label block mb-2">ТИП ЦІЛІ *</label>
                <select
                  value={formData.goalType}
                  onChange={(e) => setFormData({ ...formData, goalType: e.target.value as ChallengeGoalType })}
                  className="w-full px-4 py-3 bg-panel-900 border border-line rounded-lg font-mono text-sm focus:border-bronze focus:outline-none"
                  required
                >
                  {(Object.keys(CHALLENGE_GOAL_TYPE_LABELS) as ChallengeGoalType[]).map((goalType) => (
                    <option key={goalType} value={goalType}>
                      {CHALLENGE_GOAL_TYPE_LABELS[goalType].uk}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Goal Target and Points */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label block mb-2">ЦІЛЬ (КІЛЬКІСТЬ) *</label>
                <input
                  type="number"
                  value={formData.goalTarget}
                  onChange={(e) => setFormData({ ...formData, goalTarget: parseInt(e.target.value) || 1 })}
                  className="w-full px-4 py-3 bg-panel-900 border border-line rounded-lg font-mono text-sm focus:border-bronze focus:outline-none"
                  min="1"
                  max="1000"
                  required
                />
              </div>

              <div>
                <label className="label block mb-2">НАГОРОДА (БАЛИ) *</label>
                <input
                  type="number"
                  value={formData.points}
                  onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 bg-panel-900 border border-line rounded-lg font-mono text-sm focus:border-bronze focus:outline-none"
                  min="1"
                  max="5000"
                  required
                />
              </div>
            </div>

            {/* Dates */}
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
                <label className="label block mb-2">ДАТА ЗАВЕРШЕННЯ *</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-4 py-3 bg-panel-900 border border-line rounded-lg font-mono text-sm focus:border-bronze focus:outline-none"
                  min={formData.startDate}
                  required
                />
              </div>
            </div>

            {/* Competitive Mode */}
            <div className="border-t border-line/20 pt-4 mt-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isCompetitive}
                  onChange={(e) => setFormData({ ...formData, isCompetitive: e.target.checked })}
                  className="w-5 h-5"
                />
                <Trophy className="w-5 h-5 text-orange-500" />
                <span className="font-bold">Конкурентний режим</span>
              </label>

              {formData.isCompetitive && (
                <div className="mt-3 ml-8">
                  <label className="label block mb-2">КІЛЬКІСТЬ ПЕРЕМОЖЦІВ</label>
                  <input
                    type="number"
                    value={formData.maxWinners}
                    onChange={(e) => setFormData({ ...formData, maxWinners: parseInt(e.target.value) || 1 })}
                    className="w-32 px-4 py-2 bg-panel-900 border border-line rounded-lg font-mono text-sm focus:border-bronze focus:outline-none"
                    min="1"
                    max="100"
                  />
                  <p className="text-xs text-muted-500 mt-1">
                    Перше місце отримає {Math.round(formData.points * CHALLENGE_REWARDS.COMPETITIVE_BONUS_MULTIPLIER)} балів
                  </p>
                </div>
              )}
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
            disabled={saving}
            className="btn disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                ЗБЕРЕЖЕННЯ...
              </>
            ) : (
              'ЗБЕРЕГТИ ЗМІНИ →'
            )}
          </button>
          <Link href={`/admin/challenges/${id}`} className="text-sm text-muted-500 hover:text-bronze">
            Скасувати
          </Link>
        </div>
      </form>
    </div>
  );
}
