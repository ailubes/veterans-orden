'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, AlertTriangle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface MemberEditPageProps {
  params: Promise<{
    id: string;
  }>;
}

interface Oblast {
  id: string;
  name: string;
}

interface Member {
  id: string;
  first_name: string;
  last_name: string;
  patronymic: string | null;
  email: string;
  phone: string | null;
  date_of_birth: string | null;
  oblast_id: string | null;
  city: string | null;
  role: string;
  status: string;
  is_email_verified: boolean;
  is_phone_verified: boolean;
  is_identity_verified: boolean;
  membership_tier: string;
  membership_paid_until: string | null;
  points: number;
}

export default function MemberEditPage({ params }: MemberEditPageProps) {
  const router = useRouter();
  const [member, setMember] = useState<Member | null>(null);
  const [oblasts, setOblasts] = useState<Oblast[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adminRole, setAdminRole] = useState<string>('');
  const [memberId, setMemberId] = useState<string>('');

  // Points adjustment
  const [pointsAdjustment, setPointsAdjustment] = useState<number>(0);
  const [pointsReason, setPointsReason] = useState<string>('');

  useEffect(() => {
    const initParams = async () => {
      const resolvedParams = await params;
      setMemberId(resolvedParams.id);
    };
    initParams();
  }, [params]);

  useEffect(() => {
    if (memberId) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memberId]);

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

      setAdminRole(adminProfile.role);

      // Check regional leader access
      if (adminProfile.role === 'regional_leader') {
        const { data: treeData } = await supabase.rpc('get_referral_tree', {
          root_user_id: adminProfile.id,
        });

        const hasAccess = treeData?.some((m: { id: string }) => m.id === memberId);
        if (!hasAccess) {
          router.push('/admin/members');
          return;
        }
      }

      // Get member data
      const { data: memberData, error: memberError } = await supabase
        .from('users')
        .select('*')
        .eq('id', memberId)
        .single();

      if (memberError || !memberData) {
        setError('Не вдалося завантажити дані члена');
        setLoading(false);
        return;
      }

      setMember(memberData);

      // Get oblasts
      const { data: oblastsData } = await supabase
        .from('oblasts')
        .select('id, name')
        .order('name');

      if (oblastsData) {
        setOblasts(oblastsData);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Помилка завантаження даних');
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!member) return;

    setSaving(true);
    setError(null);

    try {
      const supabase = createClient();

      // Prepare update data
      const updateData: Record<string, unknown> = {
        first_name: member.first_name,
        last_name: member.last_name,
        patronymic: member.patronymic,
        email: member.email,
        phone: member.phone,
        date_of_birth: member.date_of_birth,
        oblast_id: member.oblast_id,
        city: member.city,
        status: member.status,
        is_email_verified: member.is_email_verified,
        is_phone_verified: member.is_phone_verified,
        is_identity_verified: member.is_identity_verified,
        membership_tier: member.membership_tier,
        membership_paid_until: member.membership_paid_until,
      };

      // Only admins can change role
      if (adminRole === 'super_admin' || (adminRole === 'admin' && member.role !== 'super_admin')) {
        updateData.role = member.role;
      }

      // Update member
      const { error: updateError } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', member.id);

      if (updateError) {
        throw updateError;
      }

      // Handle points adjustment if needed
      if (pointsAdjustment !== 0 && pointsReason.trim()) {
        const newPoints = (member.points || 0) + pointsAdjustment;

        const { error: pointsError } = await supabase
          .from('users')
          .update({ points: newPoints })
          .eq('id', member.id);

        if (pointsError) {
          throw pointsError;
        }

        // Log points adjustment in activity_log
        await supabase.from('activity_log').insert({
          user_id: member.id,
          action_type: 'points_adjustment',
          description: `Адмін змінив бали: ${pointsAdjustment > 0 ? '+' : ''}${pointsAdjustment}. Причина: ${pointsReason}`,
          points_earned: pointsAdjustment,
          created_at: new Date().toISOString(),
        });
      }

      // Redirect to detail page
      router.push(`/admin/members/${member.id}`);
    } catch (err) {
      console.error('Error updating member:', err);
      setError('Помилка збереження змін');
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

  if (error && !member) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-canvas border-2 border-timber-dark p-8 text-center">
          <p className="text-red-600 font-bold mb-4">{error}</p>
          <Link href="/admin/members" className="btn">
            НАЗАД ДО СПИСКУ
          </Link>
        </div>
      </div>
    );
  }

  if (!member) return null;

  const canEditRole = adminRole === 'super_admin' || (adminRole === 'admin' && member.role !== 'super_admin');
  const isRegionalLeader = adminRole === 'regional_leader';

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back button */}
      <div className="mb-6">
        <Link
          href={`/admin/members/${member.id}`}
          className="inline-flex items-center gap-2 text-sm font-bold text-timber-beam hover:text-accent transition-colors"
        >
          <ArrowLeft size={16} />
          НАЗАД ДО ПРОФІЛЮ
        </Link>
      </div>

      {/* Header */}
      <div className="mb-6">
        <p className="label text-accent mb-2">РЕДАГУВАННЯ ЧЛЕНА</p>
        <h1 className="font-syne text-3xl lg:text-4xl font-bold">
          {member.first_name} {member.last_name}
        </h1>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-100 border-2 border-red-600 p-4 mb-6">
          <p className="text-red-600 font-bold">{error}</p>
        </div>
      )}

      {/* Edit Form */}
      <form onSubmit={handleSubmit}>
        {/* Personal Info */}
        <div className="bg-canvas border-2 border-timber-dark p-6 mb-6 relative">
          <div className="joint" style={{ top: '-3px', left: '-3px' }} />
          <div className="joint" style={{ top: '-3px', right: '-3px' }} />
          <div className="joint" style={{ bottom: '-3px', left: '-3px' }} />
          <div className="joint" style={{ bottom: '-3px', right: '-3px' }} />

          <p className="label text-accent mb-4">ОСОБИСТА ІНФОРМАЦІЯ</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2">
                Ім&apos;я <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={member.first_name}
                onChange={(e) => setMember({ ...member, first_name: e.target.value })}
                required
                className="w-full px-4 py-2 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">
                Прізвище <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={member.last_name}
                onChange={(e) => setMember({ ...member, last_name: e.target.value })}
                required
                className="w-full px-4 py-2 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">По-батькові</label>
              <input
                type="text"
                value={member.patronymic || ''}
                onChange={(e) => setMember({ ...member, patronymic: e.target.value })}
                className="w-full px-4 py-2 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">
                Email <span className="text-red-600">*</span>
              </label>
              <input
                type="email"
                value={member.email}
                onChange={(e) => setMember({ ...member, email: e.target.value })}
                required
                className="w-full px-4 py-2 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Телефон</label>
              <input
                type="tel"
                value={member.phone || ''}
                onChange={(e) => setMember({ ...member, phone: e.target.value })}
                className="w-full px-4 py-2 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Дата народження</label>
              <input
                type="date"
                value={member.date_of_birth || ''}
                onChange={(e) => setMember({ ...member, date_of_birth: e.target.value })}
                className="w-full px-4 py-2 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="bg-canvas border-2 border-timber-dark p-6 mb-6 relative">
          <div className="joint" style={{ top: '-3px', left: '-3px' }} />
          <div className="joint" style={{ top: '-3px', right: '-3px' }} />
          <div className="joint" style={{ bottom: '-3px', left: '-3px' }} />
          <div className="joint" style={{ bottom: '-3px', right: '-3px' }} />

          <p className="label text-accent mb-4">МІСЦЕЗНАХОДЖЕННЯ</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2">Область</label>
              <select
                value={member.oblast_id || ''}
                onChange={(e) => setMember({ ...member, oblast_id: e.target.value })}
                className="w-full px-4 py-2 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none"
              >
                <option value="">Оберіть область</option>
                {oblasts.map((oblast) => (
                  <option key={oblast.id} value={oblast.id}>
                    {oblast.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Місто</label>
              <input
                type="text"
                value={member.city || ''}
                onChange={(e) => setMember({ ...member, city: e.target.value })}
                className="w-full px-4 py-2 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Role & Status */}
        <div className="bg-canvas border-2 border-timber-dark p-6 mb-6 relative">
          <div className="joint" style={{ top: '-3px', left: '-3px' }} />
          <div className="joint" style={{ top: '-3px', right: '-3px' }} />
          <div className="joint" style={{ bottom: '-3px', left: '-3px' }} />
          <div className="joint" style={{ bottom: '-3px', right: '-3px' }} />

          <p className="label text-accent mb-4">РОЛЬ ТА СТАТУС</p>

          {!canEditRole && (
            <div className="bg-yellow-100 border-2 border-yellow-600 p-3 mb-4 flex items-start gap-2">
              <AlertTriangle size={18} className="text-yellow-600 mt-0.5" />
              <p className="text-xs text-yellow-800">
                У вас немає прав для зміни ролі цього користувача
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2">Роль</label>
              <select
                value={member.role}
                onChange={(e) => setMember({ ...member, role: e.target.value })}
                disabled={!canEditRole}
                className="w-full px-4 py-2 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="free_viewer">Спостерігач</option>
                <option value="prospect">Потенційний член</option>
                <option value="silent_member">Мовчазний член</option>
                <option value="full_member">Повноцінний член</option>
                <option value="group_leader">Лідер групи</option>
                <option value="regional_leader">Регіональний лідер</option>
                <option value="admin">Адмін</option>
                {adminRole === 'super_admin' && (
                  <option value="super_admin">Супер-адмін</option>
                )}
              </select>
              {canEditRole && (
                <p className="text-xs text-timber-beam mt-1">
                  Зміна ролі впливає на права доступу
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Статус</label>
              <select
                value={member.status}
                onChange={(e) => setMember({ ...member, status: e.target.value })}
                disabled={isRegionalLeader}
                className="w-full px-4 py-2 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="pending">На перевірці</option>
                <option value="active">Активний</option>
                <option value="suspended">Призупинено</option>
                <option value="churned">Відійшов</option>
              </select>
            </div>
          </div>
        </div>

        {/* Verification */}
        <div className="bg-canvas border-2 border-timber-dark p-6 mb-6 relative">
          <div className="joint" style={{ top: '-3px', left: '-3px' }} />
          <div className="joint" style={{ top: '-3px', right: '-3px' }} />
          <div className="joint" style={{ bottom: '-3px', left: '-3px' }} />
          <div className="joint" style={{ bottom: '-3px', right: '-3px' }} />

          <p className="label text-accent mb-4">ВЕРИФІКАЦІЯ</p>

          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={member.is_email_verified}
                onChange={(e) => setMember({ ...member, is_email_verified: e.target.checked })}
                className="w-5 h-5 border-2 border-timber-dark focus:ring-accent"
              />
              <span className="text-sm font-bold">Email підтверджено</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={member.is_phone_verified}
                onChange={(e) => setMember({ ...member, is_phone_verified: e.target.checked })}
                className="w-5 h-5 border-2 border-timber-dark focus:ring-accent"
              />
              <span className="text-sm font-bold">Телефон підтверджено</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={member.is_identity_verified}
                onChange={(e) => setMember({ ...member, is_identity_verified: e.target.checked })}
                className="w-5 h-5 border-2 border-timber-dark focus:ring-accent"
                disabled={isRegionalLeader}
              />
              <span className="text-sm font-bold">
                Особу підтверджено
                {isRegionalLeader && <span className="text-timber-beam ml-2">(лише для адмінів)</span>}
              </span>
            </label>
          </div>
        </div>

        {/* Membership */}
        <div className="bg-canvas border-2 border-timber-dark p-6 mb-6 relative">
          <div className="joint" style={{ top: '-3px', left: '-3px' }} />
          <div className="joint" style={{ top: '-3px', right: '-3px' }} />
          <div className="joint" style={{ bottom: '-3px', left: '-3px' }} />
          <div className="joint" style={{ bottom: '-3px', right: '-3px' }} />

          <p className="label text-accent mb-4">ЧЛЕНСТВО</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2">План членства</label>
              <select
                value={member.membership_tier}
                onChange={(e) => setMember({ ...member, membership_tier: e.target.value })}
                className="w-full px-4 py-2 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none"
              >
                <option value="free">Безкоштовний</option>
                <option value="basic_49">Базовий (49 грн)</option>
                <option value="supporter_100">Прихильник (100 грн)</option>
                <option value="supporter_200">Прихильник (200 грн)</option>
                <option value="patron_500">Патрон (500 грн)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Оплачено до</label>
              <input
                type="date"
                value={member.membership_paid_until || ''}
                onChange={(e) => setMember({ ...member, membership_paid_until: e.target.value })}
                className="w-full px-4 py-2 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Points Adjustment */}
        {!isRegionalLeader && (
          <div className="bg-canvas border-2 border-timber-dark p-6 mb-6 relative">
            <div className="joint" style={{ top: '-3px', left: '-3px' }} />
            <div className="joint" style={{ top: '-3px', right: '-3px' }} />
            <div className="joint" style={{ bottom: '-3px', left: '-3px' }} />
            <div className="joint" style={{ bottom: '-3px', right: '-3px' }} />

            <p className="label text-accent mb-4">КОРИГУВАННЯ БАЛІВ</p>

            <div className="bg-yellow-50 border-2 border-yellow-600 p-3 mb-4">
              <p className="text-xs text-yellow-800">
                Поточні бали: <strong>{member.points || 0}</strong>
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-2">
                  Зміна балів (±)
                </label>
                <input
                  type="number"
                  value={pointsAdjustment || ''}
                  onChange={(e) => setPointsAdjustment(e.target.value === '' ? 0 : parseInt(e.target.value, 10))}
                  onBlur={(e) => { if (e.target.value === '') setPointsAdjustment(0); }}
                  placeholder="0"
                  className="w-full px-4 py-2 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none"
                />
                <p className="text-xs text-timber-beam mt-1">
                  Нові бали: {(member.points || 0) + pointsAdjustment}
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">
                  Причина коригування
                </label>
                <textarea
                  value={pointsReason}
                  onChange={(e) => setPointsReason(e.target.value)}
                  placeholder="Обов'язкова причина, якщо змінюєте бали"
                  rows={3}
                  className="w-full px-4 py-2 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none resize-none"
                />
              </div>
            </div>

            {pointsAdjustment !== 0 && !pointsReason.trim() && (
              <p className="text-xs text-red-600 mt-2">
                Причина коригування обов&apos;язкова при зміні балів
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving || (pointsAdjustment !== 0 && !pointsReason.trim())}
            className="btn flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={18} />
            {saving ? 'ЗБЕРЕЖЕННЯ...' : 'ЗБЕРЕГТИ ЗМІНИ'}
          </button>

          <Link
            href={`/admin/members/${member.id}`}
            className="btn btn-outline"
          >
            СКАСУВАТИ
          </Link>
        </div>
      </form>
    </div>
  );
}
