'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, AlertTriangle, MapPin, ChevronRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { KatottgSelector, type KatottgDetails } from '@/components/ui/katottg-selector';

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
  // KATOTTG location
  katottg_code: string | null;
  settlement_name: string | null;
  hromada_name: string | null;
  raion_name: string | null;
  oblast_name_katottg: string | null;
  location_last_changed_at: string | null;
  // Legacy location
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

  // KATOTTG location
  const [katottgCode, setKatottgCode] = useState<string | null>(null);
  const [katottgDetails, setKatottgDetails] = useState<KatottgDetails | null>(null);
  const [originalKatottgCode, setOriginalKatottgCode] = useState<string | null>(null);

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
        .eq('auth_id', user.id)
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

      // Initialize KATOTTG state
      setKatottgCode(memberData.katottg_code || null);
      setOriginalKatottgCode(memberData.katottg_code || null);
      if (memberData.katottg_code) {
        setKatottgDetails({
          code: memberData.katottg_code,
          name: memberData.settlement_name || '',
          category: '',
          level: 4,
          oblastCode: null,
          raionCode: null,
          hromadaCode: null,
          oblastName: memberData.oblast_name_katottg || null,
          raionName: memberData.raion_name || null,
          hromadaName: memberData.hromada_name || null,
          fullPath: '',
        });
      }

      // Get oblasts (legacy)
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

      // Get admin user ID for logging
      const { data: { user: authUser } } = await supabase.auth.getUser();
      const { data: adminData } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', authUser?.id)
        .single();

      // Check if location is being changed
      const locationChanged = katottgCode !== originalKatottgCode;

      // Log location change by admin (admin override)
      if (locationChanged && adminData) {
        const { error: logError } = await supabase
          .from('user_location_changes')
          .insert({
            user_id: member.id,
            previous_katottg_code: originalKatottgCode,
            previous_settlement_name: member.settlement_name,
            previous_hromada_name: member.hromada_name,
            previous_raion_name: member.raion_name,
            previous_oblast_name: member.oblast_name_katottg,
            new_katottg_code: katottgCode,
            new_settlement_name: katottgDetails?.name || null,
            new_hromada_name: katottgDetails?.hromadaName || null,
            new_raion_name: katottgDetails?.raionName || null,
            new_oblast_name: katottgDetails?.oblastName || null,
            change_reason: 'admin_override',
            changed_by: adminData.id,
          });

        if (logError) {
          console.error('Failed to log location change:', logError);
        }
      }

      // Prepare update data
      const updateData: Record<string, unknown> = {
        first_name: member.first_name,
        last_name: member.last_name,
        patronymic: member.patronymic,
        email: member.email,
        phone: member.phone,
        date_of_birth: member.date_of_birth,
        // KATOTTG location (admin can always update)
        katottg_code: katottgCode,
        settlement_name: katottgDetails?.name || null,
        hromada_name: katottgDetails?.hromadaName || null,
        raion_name: katottgDetails?.raionName || null,
        oblast_name_katottg: katottgDetails?.oblastName || null,
        // Legacy location
        oblast_id: member.oblast_id,
        city: member.city,
        status: member.status,
        is_email_verified: member.is_email_verified,
        is_phone_verified: member.is_phone_verified,
        is_identity_verified: member.is_identity_verified,
        membership_tier: member.membership_tier,
        membership_paid_until: member.membership_paid_until,
      };

      // Update location_last_changed_at if location was changed
      if (locationChanged) {
        updateData.location_last_changed_at = new Date().toISOString();
      }

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
        <div className="bg-panel-900 border border-line p-8 text-center rounded-lg">
          <p className="text-muted-500">Завантаження...</p>
        </div>
      </div>
    );
  }

  if (error && !member) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-panel-900 border border-line p-8 text-center rounded-lg">
          <p className="text-red-400 font-bold mb-4">{error}</p>
          <Link href="/admin/members" className="px-4 py-2 bg-bronze text-bg-950 text-sm font-bold hover:bg-bronze/90 transition-colors rounded">
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
          className="inline-flex items-center gap-2 text-sm font-bold text-muted-500 hover:text-bronze transition-colors"
        >
          <ArrowLeft size={16} />
          НАЗАД ДО ПРОФІЛЮ
        </Link>
      </div>

      {/* Header */}
      <div className="mb-6">
        <p className="mono text-bronze text-xs tracking-widest mb-2">РЕДАГУВАННЯ ЧЛЕНА</p>
        <h1 className="font-syne text-3xl lg:text-4xl font-bold text-text-100">
          {member.first_name} {member.last_name}
        </h1>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500 p-4 mb-6 rounded-lg">
          <p className="text-red-400 font-bold">{error}</p>
        </div>
      )}

      {/* Edit Form */}
      <form onSubmit={handleSubmit}>
        {/* Personal Info */}
        <div className="bg-panel-900 border border-line p-6 mb-6 rounded-lg">
          <p className="mono text-bronze text-xs tracking-widest mb-4">ОСОБИСТА ІНФОРМАЦІЯ</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-text-100 mb-2">
                Ім&apos;я <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={member.first_name}
                onChange={(e) => setMember({ ...member, first_name: e.target.value })}
                required
                className="w-full px-4 py-2 bg-panel-850 border border-line text-text-100 font-mono text-sm focus:border-bronze focus:outline-none rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-text-100 mb-2">
                Прізвище <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={member.last_name}
                onChange={(e) => setMember({ ...member, last_name: e.target.value })}
                required
                className="w-full px-4 py-2 bg-panel-850 border border-line text-text-100 font-mono text-sm focus:border-bronze focus:outline-none rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-text-100 mb-2">По-батькові</label>
              <input
                type="text"
                value={member.patronymic || ''}
                onChange={(e) => setMember({ ...member, patronymic: e.target.value })}
                className="w-full px-4 py-2 bg-panel-850 border border-line text-text-100 font-mono text-sm focus:border-bronze focus:outline-none rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-text-100 mb-2">
                Email <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                value={member.email}
                onChange={(e) => setMember({ ...member, email: e.target.value })}
                required
                className="w-full px-4 py-2 bg-panel-850 border border-line text-text-100 font-mono text-sm focus:border-bronze focus:outline-none rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-text-100 mb-2">Телефон</label>
              <input
                type="tel"
                value={member.phone || ''}
                onChange={(e) => setMember({ ...member, phone: e.target.value })}
                className="w-full px-4 py-2 bg-panel-850 border border-line text-text-100 font-mono text-sm focus:border-bronze focus:outline-none rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-text-100 mb-2">Дата народження</label>
              <input
                type="date"
                value={member.date_of_birth || ''}
                onChange={(e) => setMember({ ...member, date_of_birth: e.target.value })}
                className="w-full px-4 py-2 bg-panel-850 border border-line text-text-100 font-mono text-sm focus:border-bronze focus:outline-none rounded"
              />
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="bg-panel-900 border border-line p-6 mb-6 rounded-lg">
          <p className="mono text-bronze text-xs tracking-widest mb-4 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            МІСЦЕЗНАХОДЖЕННЯ (KATOTTG)
          </p>

          {/* Admin can always change location */}
          <div className="bg-blue-500/10 border border-blue-500 p-3 mb-4 rounded text-sm text-blue-400">
            <p className="font-medium">Адміністративна зміна локації</p>
            <p className="text-xs mt-1 opacity-80">
              Зміни локації, здійснені адміністратором, логуються як &quot;admin_override&quot;.
            </p>
          </div>

          {/* Current location display */}
          {katottgDetails && (
            <div className="mb-4 p-3 bg-panel-850 rounded">
              <div className="text-sm font-medium text-text-100">{katottgDetails.name}</div>
              <div className="text-xs text-muted-500 flex flex-wrap items-center gap-1 mt-1">
                {katottgDetails.oblastName && (
                  <span>{katottgDetails.oblastName}</span>
                )}
                {katottgDetails.raionName && (
                  <>
                    <ChevronRight className="w-3 h-3" />
                    <span>{katottgDetails.raionName}</span>
                  </>
                )}
                {katottgDetails.hromadaName && (
                  <>
                    <ChevronRight className="w-3 h-3" />
                    <span>{katottgDetails.hromadaName}</span>
                  </>
                )}
              </div>
            </div>
          )}

          <KatottgSelector
            value={katottgCode}
            onChange={(code, details) => {
              setKatottgCode(code);
              setKatottgDetails(details);
            }}
            label="НАСЕЛЕНИЙ ПУНКТ"
          />

          {/* Legacy location fields (hidden, kept for backwards compatibility) */}
          <details className="mt-4">
            <summary className="text-xs text-muted-500 cursor-pointer hover:text-text-100">
              Застарілі поля локації (для сумісності)
            </summary>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 pt-3 border-t border-line">
              <div>
                <label className="block text-xs font-bold mb-2 text-muted-500">Область (застаріле)</label>
                <select
                  value={member.oblast_id || ''}
                  onChange={(e) => setMember({ ...member, oblast_id: e.target.value })}
                  className="w-full px-4 py-2 bg-panel-850 border border-line text-text-100 font-mono text-sm focus:border-bronze focus:outline-none rounded"
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
                <label className="block text-xs font-bold mb-2 text-muted-500">Місто (застаріле)</label>
                <input
                  type="text"
                  value={member.city || ''}
                  onChange={(e) => setMember({ ...member, city: e.target.value })}
                  className="w-full px-4 py-2 bg-panel-850 border border-line text-text-100 font-mono text-sm focus:border-bronze focus:outline-none rounded"
                />
              </div>
            </div>
          </details>
        </div>

        {/* Role & Status */}
        <div className="bg-panel-900 border border-line p-6 mb-6 rounded-lg">
          <p className="mono text-bronze text-xs tracking-widest mb-4">РОЛЬ ТА СТАТУС</p>

          {!canEditRole && (
            <div className="bg-yellow-500/10 border border-yellow-500 p-3 mb-4 flex items-start gap-2 rounded">
              <AlertTriangle size={18} className="text-yellow-400 mt-0.5" />
              <p className="text-xs text-yellow-400">
                У вас немає прав для зміни ролі цього користувача
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-text-100 mb-2">Роль</label>
              <select
                value={member.role}
                onChange={(e) => setMember({ ...member, role: e.target.value })}
                disabled={!canEditRole}
                className="w-full px-4 py-2 bg-panel-850 border border-line text-text-100 font-mono text-sm focus:border-bronze focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed rounded"
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
                <p className="text-xs text-muted-500 mt-1">
                  Зміна ролі впливає на права доступу
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-text-100 mb-2">Статус</label>
              <select
                value={member.status}
                onChange={(e) => setMember({ ...member, status: e.target.value })}
                disabled={isRegionalLeader}
                className="w-full px-4 py-2 bg-panel-850 border border-line text-text-100 font-mono text-sm focus:border-bronze focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed rounded"
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
        <div className="bg-panel-900 border border-line p-6 mb-6 rounded-lg">
          <p className="mono text-bronze text-xs tracking-widest mb-4">ВЕРИФІКАЦІЯ</p>

          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={member.is_email_verified}
                onChange={(e) => setMember({ ...member, is_email_verified: e.target.checked })}
                className="w-5 h-5 border border-line bg-panel-850 accent-bronze rounded"
              />
              <span className="text-sm font-bold text-text-100">Email підтверджено</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={member.is_phone_verified}
                onChange={(e) => setMember({ ...member, is_phone_verified: e.target.checked })}
                className="w-5 h-5 border border-line bg-panel-850 accent-bronze rounded"
              />
              <span className="text-sm font-bold text-text-100">Телефон підтверджено</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={member.is_identity_verified}
                onChange={(e) => setMember({ ...member, is_identity_verified: e.target.checked })}
                className="w-5 h-5 border border-line bg-panel-850 accent-bronze rounded"
                disabled={isRegionalLeader}
              />
              <span className="text-sm font-bold text-text-100">
                Особу підтверджено
                {isRegionalLeader && <span className="text-muted-500 ml-2">(лише для адмінів)</span>}
              </span>
            </label>
          </div>
        </div>

        {/* Membership */}
        <div className="bg-panel-900 border border-line p-6 mb-6 rounded-lg">
          <p className="mono text-bronze text-xs tracking-widest mb-4">ЧЛЕНСТВО</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-text-100 mb-2">План членства</label>
              <select
                value={member.membership_tier}
                onChange={(e) => setMember({ ...member, membership_tier: e.target.value })}
                className="w-full px-4 py-2 bg-panel-850 border border-line text-text-100 font-mono text-sm focus:border-bronze focus:outline-none rounded"
              >
                <option value="free">Безкоштовний</option>
                <option value="basic_49">Базовий (49 грн)</option>
                <option value="supporter_100">Прихильник (100 грн)</option>
                <option value="supporter_200">Прихильник (200 грн)</option>
                <option value="patron_500">Патрон (500 грн)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-text-100 mb-2">Оплачено до</label>
              <input
                type="date"
                value={member.membership_paid_until || ''}
                onChange={(e) => setMember({ ...member, membership_paid_until: e.target.value })}
                className="w-full px-4 py-2 bg-panel-850 border border-line text-text-100 font-mono text-sm focus:border-bronze focus:outline-none rounded"
              />
            </div>
          </div>
        </div>

        {/* Points Adjustment */}
        {!isRegionalLeader && (
          <div className="bg-panel-900 border border-line p-6 mb-6 rounded-lg">
            <p className="mono text-bronze text-xs tracking-widest mb-4">КОРИГУВАННЯ БАЛІВ</p>

            <div className="bg-yellow-500/10 border border-yellow-500 p-3 mb-4 rounded">
              <p className="text-xs text-yellow-400">
                Поточні бали: <strong>{member.points || 0}</strong>
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-text-100 mb-2">
                  Зміна балів (±)
                </label>
                <input
                  type="number"
                  value={pointsAdjustment || ''}
                  onChange={(e) => setPointsAdjustment(e.target.value === '' ? 0 : parseInt(e.target.value, 10))}
                  onBlur={(e) => { if (e.target.value === '') setPointsAdjustment(0); }}
                  placeholder="0"
                  className="w-full px-4 py-2 bg-panel-850 border border-line text-text-100 font-mono text-sm focus:border-bronze focus:outline-none rounded"
                />
                <p className="text-xs text-muted-500 mt-1">
                  Нові бали: {(member.points || 0) + pointsAdjustment}
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-text-100 mb-2">
                  Причина коригування
                </label>
                <textarea
                  value={pointsReason}
                  onChange={(e) => setPointsReason(e.target.value)}
                  placeholder="Обов'язкова причина, якщо змінюєте бали"
                  rows={3}
                  className="w-full px-4 py-2 bg-panel-850 border border-line text-text-100 font-mono text-sm focus:border-bronze focus:outline-none resize-none rounded"
                />
              </div>
            </div>

            {pointsAdjustment !== 0 && !pointsReason.trim() && (
              <p className="text-xs text-red-400 mt-2">
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
            className="px-4 py-2 bg-bronze text-bg-950 text-sm font-bold hover:bg-bronze/90 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed rounded"
          >
            <Save size={18} />
            {saving ? 'ЗБЕРЕЖЕННЯ...' : 'ЗБЕРЕГТИ ЗМІНИ'}
          </button>

          <Link
            href={`/admin/members/${member.id}`}
            className="px-4 py-2 border border-line text-text-100 text-sm font-bold hover:bg-panel-850 transition-colors rounded"
          >
            СКАСУВАТИ
          </Link>
        </div>
      </form>
    </div>
  );
}
