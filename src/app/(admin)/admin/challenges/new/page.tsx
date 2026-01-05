'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Bell, Trophy, Loader2 } from 'lucide-react';
import {
  CHALLENGE_TYPE_LABELS,
  CHALLENGE_GOAL_TYPE_LABELS,
  CHALLENGE_REWARDS,
  getDefaultDurationDays,
  getDefaultPointsForType,
} from '@/lib/challenges';
import type { ChallengeType, ChallengeGoalType } from '@/lib/challenges';

export default function NewChallengePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const today = new Date();
  const defaultStartDate = today.toISOString().split('T')[0];
  const defaultEndDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'weekly' as ChallengeType,
    goalType: 'tasks' as ChallengeGoalType,
    goalTarget: 10,
    points: CHALLENGE_REWARDS.WEEKLY_POINTS as number,
    startDate: defaultStartDate,
    endDate: defaultEndDate,
    isCompetitive: false,
    maxWinners: 3,
    notifyMembers: false,
  });

  const handleTypeChange = (type: ChallengeType) => {
    const durationDays = getDefaultDurationDays(type);
    const endDate = new Date(new Date(formData.startDate).getTime() + durationDays * 24 * 60 * 60 * 1000);

    setFormData({
      ...formData,
      type,
      points: getDefaultPointsForType(type),
      endDate: endDate.toISOString().split('T')[0],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/challenges', {
        method: 'POST',
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
        throw new Error(data.error || 'Помилка створення');
      }

      const { challenge } = await res.json();

      // Send notification if enabled
      if (formData.notifyMembers && challenge) {
        try {
          await fetch('/api/admin/notifications/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: `Новий челендж: ${formData.title}`,
              message: formData.description
                ? formData.description.slice(0, 200) + (formData.description.length > 200 ? '...' : '')
                : `Приймай участь та отримай ${formData.points} балів!`,
              type: 'info',
              scope: 'all',
            }),
          });
        } catch (notifyError) {
          console.error('Failed to send notification:', notifyError);
        }
      }

      router.push('/admin/challenges');
      router.refresh();
    } catch (err) {
      console.error('Challenge creation error:', err);
      setError(err instanceof Error ? err.message : 'Помилка створення челенджу');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/challenges"
          className="inline-flex items-center gap-2 text-sm text-muted-500 hover:text-bronze mb-4"
        >
          <ArrowLeft size={16} />
          Назад до челенджів
        </Link>
        <h1 className="font-syne text-3xl font-bold">Новий челендж</h1>
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
                  onChange={(e) => handleTypeChange(e.target.value as ChallengeType)}
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
                <p className="text-xs text-muted-500 mt-1">
                  Скільки {CHALLENGE_GOAL_TYPE_LABELS[formData.goalType].uk.toLowerCase()} потрібно
                </p>
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
              <p className="text-xs text-muted-500 mt-2 ml-8">
                Переможці визначаються за найкращим результатом. Топ-N учасників отримують бонусні бали.
              </p>

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
                <span className="font-bold">Сповістити всіх членів</span>
              </label>
              <p className="text-xs text-muted-500 mt-2 ml-8">
                Всі активні члени отримають сповіщення про новий челендж
              </p>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-timber-dark text-canvas p-4 relative">
          <div className="joint joint-tl" />
          <p className="label text-bronze mb-2">ПІДСУМОК</p>
          <p className="text-sm">
            {CHALLENGE_TYPE_LABELS[formData.type].uk} челендж: {formData.goalTarget}{' '}
            {CHALLENGE_GOAL_TYPE_LABELS[formData.goalType].uk.toLowerCase()} за{' '}
            {formData.points} балів
            {formData.isCompetitive && ` (топ-${formData.maxWinners} переможців)`}
          </p>
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
            className="btn disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                СТВОРЕННЯ...
              </>
            ) : (
              'СТВОРИТИ ЧЕЛЕНДЖ →'
            )}
          </button>
          <Link href="/admin/challenges" className="text-sm text-muted-500 hover:text-bronze">
            Скасувати
          </Link>
        </div>
      </form>
    </div>
  );
}
