'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, AlertTriangle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface VoteEditPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function VoteEditPage({ params }: VoteEditPageProps) {
  const router = useRouter();
  const [voteId, setVoteId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [voteStatus, setVoteStatus] = useState<string>('draft');

  const [formData, setFormData] = useState({
    question: '',
    description: '',
    vote_type: 'simple_majority',
    transparency: 'anonymous',
    scope: 'national',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    quorum_percentage: '',
    requires_quorum: false,
    allow_change_vote: false,
    status: 'draft',
  });

  useEffect(() => {
    const initParams = async () => {
      const resolvedParams = await params;
      setVoteId(resolvedParams.id);
    };
    initParams();
  }, [params]);

  useEffect(() => {
    if (voteId) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voteId]);

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

      // Get vote data
      const { data: vote, error: voteError } = await supabase
        .from('votes')
        .select('*')
        .eq('id', voteId)
        .single();

      if (voteError || !vote) {
        setError('Не вдалося завантажити дані голосування');
        setLoading(false);
        return;
      }

      setVoteStatus(vote.status);

      // Only allow editing draft votes
      if (vote.status !== 'draft') {
        setError('Можна редагувати лише чернетки голосувань');
        setLoading(false);
        return;
      }

      // Check permissions
      const hasEditPermission =
        adminProfile.role === 'super_admin' ||
        adminProfile.role === 'admin';

      if (!hasEditPermission) {
        router.push('/admin/votes');
        return;
      }

      // Parse dates
      const startDate = new Date(vote.start_date);
      const endDate = new Date(vote.end_date);

      setFormData({
        question: vote.question || '',
        description: vote.description || '',
        vote_type: vote.vote_type || 'simple_majority',
        transparency: vote.transparency || 'anonymous',
        scope: vote.scope || 'national',
        startDate: startDate.toISOString().split('T')[0],
        startTime: startDate.toTimeString().slice(0, 5),
        endDate: endDate.toISOString().split('T')[0],
        endTime: endDate.toTimeString().slice(0, 5),
        quorum_percentage: vote.quorum_percentage ? String(vote.quorum_percentage) : '',
        requires_quorum: vote.requires_quorum || false,
        allow_change_vote: vote.allow_change_vote || false,
        status: vote.status || 'draft',
      });

      setLoading(false);
    } catch (err) {
      console.error('Error loading vote:', err);
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

      const updateData: Record<string, unknown> = {
        question: formData.question,
        description: formData.description,
        vote_type: formData.vote_type,
        transparency: formData.transparency,
        scope: formData.scope,
        start_date: startDateTime.toISOString(),
        end_date: endDateTime.toISOString(),
        requires_quorum: formData.requires_quorum,
        quorum_percentage: formData.requires_quorum && formData.quorum_percentage
          ? parseInt(formData.quorum_percentage)
          : null,
        allow_change_vote: formData.allow_change_vote,
        status: formData.status,
      };

      const { error: updateError } = await supabase
        .from('votes')
        .update(updateData)
        .eq('id', voteId);

      if (updateError) {
        throw updateError;
      }

      router.push(`/admin/votes/${voteId}`);
    } catch (err) {
      console.error('Error updating vote:', err);
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

  if (error) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-canvas border-2 border-timber-dark p-8 text-center">
          <p className="text-red-600 font-bold mb-4">{error}</p>
          <Link href="/admin/votes" className="btn">
            НАЗАД ДО СПИСКУ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back button */}
      <div className="mb-6">
        <Link
          href={`/admin/votes/${voteId}`}
          className="inline-flex items-center gap-2 text-sm font-bold text-timber-beam hover:text-accent transition-colors"
        >
          <ArrowLeft size={16} />
          НАЗАД ДО ГОЛОСУВАННЯ
        </Link>
      </div>

      {/* Header */}
      <div className="mb-6">
        <p className="label text-accent mb-2">РЕДАГУВАННЯ ГОЛОСУВАННЯ</p>
        <h1 className="font-syne text-3xl lg:text-4xl font-bold">{formData.question}</h1>
      </div>

      {voteStatus !== 'draft' && (
        <div className="bg-yellow-100 border-2 border-yellow-600 p-4 mb-6 flex items-start gap-2">
          <AlertTriangle size={18} className="text-yellow-600 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-yellow-800">Голосування не в статусі чернетки</p>
            <p className="text-xs text-yellow-700">Можна редагувати лише чернетки голосувань</p>
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
              <label className="label block mb-2">ПИТАННЯ ГОЛОСУВАННЯ *</label>
              <input
                type="text"
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
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
                placeholder="Додаткова інформація про голосування..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label block mb-2">ТИП ГОЛОСУВАННЯ</label>
                <select
                  value={formData.vote_type}
                  onChange={(e) => setFormData({ ...formData, vote_type: e.target.value })}
                  className="w-full px-4 py-3 bg-canvas border-2 border-timber-dark font-mono text-sm"
                >
                  <option value="simple_majority">Проста більшість</option>
                  <option value="qualified_majority">Кваліфікована більшість</option>
                  <option value="unanimous">Одностайне</option>
                  <option value="ranking">Рейтингове</option>
                </select>
              </div>

              <div>
                <label className="label block mb-2">ПРОЗОРІСТЬ</label>
                <select
                  value={formData.transparency}
                  onChange={(e) => setFormData({ ...formData, transparency: e.target.value })}
                  className="w-full px-4 py-3 bg-canvas border-2 border-timber-dark font-mono text-sm"
                >
                  <option value="public">Публічне</option>
                  <option value="anonymous">Анонімне</option>
                  <option value="hidden">Приховане</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Date & Time */}
        <div className="bg-canvas border-2 border-timber-dark p-6 relative">
          <div className="joint joint-tl" />
          <div className="joint joint-tr" />
          <div className="joint joint-bl" />
          <div className="joint joint-br" />

          <h2 className="font-syne text-xl font-bold mb-6">Період голосування</h2>

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
          <div className="joint joint-tl" />
          <div className="joint joint-tr" />
          <div className="joint joint-bl" />
          <div className="joint joint-br" />

          <h2 className="font-syne text-xl font-bold mb-6">Налаштування</h2>

          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.requires_quorum}
                onChange={(e) => setFormData({ ...formData, requires_quorum: e.target.checked })}
                className="w-5 h-5"
              />
              <span className="font-bold">Вимагати кворум</span>
            </label>

            {formData.requires_quorum && (
              <div>
                <label className="label block mb-2">ВІДСОТОК КВОРУМУ</label>
                <input
                  type="number"
                  value={formData.quorum_percentage}
                  onChange={(e) => setFormData({ ...formData, quorum_percentage: e.target.value })}
                  className="w-full px-4 py-3 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none"
                  placeholder="50"
                  min="1"
                  max="100"
                />
              </div>
            )}

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.allow_change_vote}
                onChange={(e) => setFormData({ ...formData, allow_change_vote: e.target.checked })}
                className="w-5 h-5"
              />
              <span className="font-bold">Дозволити змінювати голос</span>
            </label>

            <div>
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

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          <Link href={`/admin/votes/${voteId}`} className="btn btn-outline text-center">
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
