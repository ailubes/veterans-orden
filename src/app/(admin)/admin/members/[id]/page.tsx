import { createClient } from '@/lib/supabase/server';
import { getAdminProfile, checkReferralTreeAccess } from '@/lib/permissions';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import {
  Edit,
  UserX,
  UserCheck,
  Shield,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  TrendingUp,
  Users,
  Activity,
  ChevronRight,
} from 'lucide-react';
import { formatNumber, formatDate } from '@/lib/utils';
import { MemberActivityTimeline } from '@/components/admin/member-activity-timeline';
import RoleBadge from '@/components/ui/role-badge';
import { MEMBERSHIP_ROLES } from '@/lib/constants';

type MembershipRole = keyof typeof MEMBERSHIP_ROLES;

interface MemberDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function MemberDetailPage({ params }: MemberDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Check admin access
  const adminProfile = await getAdminProfile();
  if (!adminProfile) {
    redirect('/dashboard');
  }

  // Get member data with KATOTTG location
  const { data: member, error } = await supabase
    .from('users')
    .select('*, oblast:oblasts(name), katottg_code, settlement_name, hromada_name, raion_name, oblast_name_katottg')
    .eq('id', id)
    .single();

  if (error || !member) {
    notFound();
  }

  // Check regional leader access
  if (adminProfile.role === 'regional_leader') {
    const hasAccess = await checkReferralTreeAccess(adminProfile.id, member.id);
    if (!hasAccess) {
      redirect('/admin/members');
    }
  }

  // Get referral count (members referred by this member)
  const { count: directReferralCount } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('referred_by_id', member.id);

  // Get referral tree (first level only for visualization)
  const { data: directReferrals } = await supabase
    .from('users')
    .select('id, first_name, last_name, email, status, role, points')
    .eq('referred_by_id', member.id)
    .order('created_at', { ascending: false })
    .limit(10);

  // Get membership status info
  const membershipActive = member.membership_paid_until
    ? new Date(member.membership_paid_until) > new Date()
    : false;

  // Role labels
  const roleLabels: Record<string, string> = {
    super_admin: 'Супер-адмін',
    admin: 'Адмін',
    regional_leader: 'Регіональний лідер',
    group_leader: 'Лідер групи',
    full_member: 'Повноцінний член',
    silent_member: 'Мовчазний член',
    prospect: 'Потенційний член',
    free_viewer: 'Спостерігач',
  };

  // Status labels
  const statusLabels: Record<string, string> = {
    active: 'Активний',
    pending: 'На перевірці',
    suspended: 'Призупинено',
    churned: 'Відійшов',
  };

  // Tier labels
  const tierLabels: Record<string, string> = {
    free: 'Безкоштовний',
    basic_49: 'Базовий (49 грн)',
    supporter_100: 'Прихильник (100 грн)',
    supporter_200: 'Прихильник (200 грн)',
    patron_500: 'Патрон (500 грн)',
  };

  // Permission checks for actions
  const canEdit = true; // All admins can edit
  const canSuspend =
    adminProfile.role === 'super_admin' || adminProfile.role === 'admin';
  const canImpersonate = adminProfile.role === 'super_admin';

  return (
    <div className="max-w-6xl mx-auto">
      {/* Back button */}
      <div className="mb-6">
        <Link
          href="/admin/members"
          className="inline-flex items-center gap-2 text-sm font-bold text-muted-500 hover:text-bronze transition-colors"
        >
          <ArrowLeft size={16} />
          НАЗАД ДО СПИСКУ
        </Link>
      </div>

      {/* Header Card */}
      <div className="bg-bronze text-bg-950 p-6 mb-6 rounded-lg">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          {/* Member info */}
          <div className="flex items-start gap-4">
            {/* Avatar placeholder */}
            <div className="w-20 h-20 bg-bg-950 text-bronze flex items-center justify-center font-syne text-3xl font-bold rounded-lg">
              {member.first_name[0]}
              {member.last_name[0]}
            </div>

            <div>
              <h1 className="font-syne text-3xl font-bold mb-2">
                {member.first_name} {member.last_name}
              </h1>
              <div className="flex flex-wrap gap-2 mb-3">
                {/* New Membership Role Badge */}
                {member.membership_role && (
                  <RoleBadge
                    membershipRole={member.membership_role as MembershipRole}
                    staffRole={member.staff_role || 'none'}
                    size="sm"
                  />
                )}
                {/* Legacy role badge (if no new membership_role) */}
                {!member.membership_role && (
                  <span className="px-3 py-1 bg-bg-950 text-bronze text-xs font-bold rounded">
                    {roleLabels[member.role] || member.role}
                  </span>
                )}
                <span
                  className={`px-3 py-1 text-xs font-bold rounded ${
                    member.status === 'active'
                      ? 'bg-green-500 text-white'
                      : member.status === 'pending'
                      ? 'bg-yellow-500 text-white'
                      : member.status === 'suspended'
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-500 text-white'
                  }`}
                >
                  {statusLabels[member.status] || member.status}
                </span>
                {member.is_email_verified && (
                  <span className="px-3 py-1 bg-blue-500 text-white text-xs font-bold rounded">
                    EMAIL ✓
                  </span>
                )}
                {member.is_phone_verified && (
                  <span className="px-3 py-1 bg-blue-500 text-white text-xs font-bold rounded">
                    ТЕЛЕФОН ✓
                  </span>
                )}
                {member.is_identity_verified && (
                  <span className="px-3 py-1 bg-green-600 text-white text-xs font-bold rounded">
                    ОСОБА ✓
                  </span>
                )}
              </div>
              <p className="text-sm opacity-80">
                Зареєстровано: {formatDate(member.created_at)}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2">
            {canEdit && (
              <Link
                href={`/admin/members/${member.id}/edit`}
                className="px-4 py-2 bg-bg-950 text-bronze text-sm font-bold hover:bg-bg-950/80 transition-colors flex items-center gap-2 rounded"
              >
                <Edit size={16} />
                РЕДАГУВАТИ
              </Link>
            )}
            {canSuspend && member.status !== 'suspended' && (
              <button className="px-4 py-2 border border-red-500 text-red-500 text-sm font-bold hover:bg-red-500 hover:text-white transition-colors flex items-center gap-2 rounded">
                <UserX size={16} />
                ПРИЗУПИНИТИ
              </button>
            )}
            {canSuspend && member.status === 'suspended' && (
              <button className="px-4 py-2 border border-green-500 text-green-500 text-sm font-bold hover:bg-green-500 hover:text-white transition-colors flex items-center gap-2 rounded">
                <UserCheck size={16} />
                ВІДНОВИТИ
              </button>
            )}
            {canImpersonate && (
              <button className="px-4 py-2 border border-bg-950 text-bg-950 text-sm font-bold hover:bg-bg-950 hover:text-bronze transition-colors flex items-center gap-2 rounded">
                <Shield size={16} />
                ІМІТУВАТИ
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Profile Info */}
        <div className="lg:col-span-2">
          <div className="bg-panel-900 border border-line p-6 rounded-lg">
            <p className="mono text-bronze text-xs tracking-widest mb-4">ОСОБИСТА ІНФОРМАЦІЯ</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 text-muted-500 text-sm mb-1">
                  <Mail size={14} />
                  <span className="font-bold">Email</span>
                </div>
                <p className="text-sm font-mono text-text-100">{member.email}</p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-muted-500 text-sm mb-1">
                  <Phone size={14} />
                  <span className="font-bold">Телефон</span>
                </div>
                <p className="text-sm font-mono text-text-100">{member.phone || '—'}</p>
              </div>

              <div className="md:col-span-2">
                <div className="flex items-center gap-2 text-muted-500 text-sm mb-1">
                  <MapPin size={14} />
                  <span className="font-bold">Місцезнаходження</span>
                </div>
                {member.settlement_name ? (
                  <div>
                    <p className="text-sm font-medium text-text-100">{member.settlement_name}</p>
                    <div className="flex flex-wrap items-center gap-1 text-xs text-muted-500 mt-1">
                      {member.oblast_name_katottg && (
                        <span>{member.oblast_name_katottg}</span>
                      )}
                      {member.raion_name && (
                        <>
                          <ChevronRight size={12} />
                          <span>{member.raion_name}</span>
                        </>
                      )}
                      {member.hromada_name && (
                        <>
                          <ChevronRight size={12} />
                          <span>{member.hromada_name}</span>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-text-100">
                    {member.oblast?.name || '—'}
                    {member.city && `, ${member.city}`}
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 text-muted-500 text-sm mb-1">
                  <Calendar size={14} />
                  <span className="font-bold">Дата народження</span>
                </div>
                <p className="text-sm text-text-100">{formatDate(member.date_of_birth)}</p>
              </div>

              <div className="md:col-span-2">
                <div className="text-muted-500 text-sm mb-1 font-bold">
                  По-батькові
                </div>
                <p className="text-sm text-text-100">{member.patronymic || '—'}</p>
              </div>

              <div className="md:col-span-2 pt-4 border-t border-line">
                <div className="text-muted-500 text-sm mb-1 font-bold">
                  Членство
                </div>
                <p className="text-sm text-text-100 mb-2">
                  {tierLabels[member.membership_tier] || member.membership_tier}
                </p>
                {member.membership_paid_until && (
                  <p className="text-xs text-muted-500">
                    Оплачено до: {formatDate(member.membership_paid_until)}
                    {membershipActive ? (
                      <span className="text-green-400 ml-2">● Активно</span>
                    ) : (
                      <span className="text-red-400 ml-2">● Прострочено</span>
                    )}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Card */}
        <div className="lg:col-span-1">
          <div className="bg-panel-900 border border-line p-6 rounded-lg">
            <p className="mono text-bronze text-xs tracking-widest mb-4">СТАТИСТИКА</p>

            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 text-muted-500 text-sm mb-1">
                  <TrendingUp size={14} />
                  <span className="font-bold">Бали</span>
                </div>
                <p className="font-syne text-3xl font-bold text-bronze">
                  {formatNumber(member.points || 0)}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-muted-500 text-sm mb-1">
                  <Activity size={14} />
                  <span className="font-bold">Рівень</span>
                </div>
                <p className="font-syne text-2xl font-bold text-text-100">
                  {member.level || 1}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-muted-500 text-sm mb-1">
                  <Users size={14} />
                  <span className="font-bold">Запрошено</span>
                </div>
                <p className="font-syne text-2xl font-bold text-text-100">
                  {directReferralCount || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Referral Tree */}
      {directReferrals && directReferrals.length > 0 && (
        <div className="bg-panel-900 border border-line p-6 mb-6 rounded-lg">
          <p className="mono text-bronze text-xs tracking-widest mb-4">ПРЯМІ ЗАПРОШЕННЯ</p>

          <div className="space-y-2">
            {directReferrals.map((referral) => (
              <Link
                key={referral.id}
                href={`/admin/members/${referral.id}`}
                className="block p-4 border border-line rounded hover:bg-panel-850 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-sm text-text-100">
                      {referral.first_name} {referral.last_name}
                    </p>
                    <p className="text-xs text-muted-500">{referral.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-bronze">
                      {referral.points || 0} балів
                    </p>
                    <p className="text-xs text-muted-500">
                      {roleLabels[referral.role] || referral.role}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {directReferralCount && directReferralCount > 10 && (
            <p className="text-center text-sm text-muted-500 mt-4">
              Показано 10 з {directReferralCount} запрошень
            </p>
          )}
        </div>
      )}

      {/* Activity Timeline */}
      <MemberActivityTimeline memberId={member.id} />
    </div>
  );
}
