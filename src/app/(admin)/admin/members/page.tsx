import { createClient } from '@/lib/supabase/server';
import {
  getAdminProfile,
  getRegionalLeaderFilter,
  canSuspendMembers,
  isStaffAdmin,
  isStaffSuperAdmin,
} from '@/lib/permissions';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus, Download, Upload } from 'lucide-react';
import { MembersTable } from '@/components/admin/members-table';

interface MembersPageProps {
  searchParams: Promise<{
    search?: string;
    role?: string;
    status?: string;
    tier?: string;
    page?: string;
  }>;
}

export default async function AdminMembersPage({ searchParams }: MembersPageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  // Check admin access
  const adminProfile = await getAdminProfile();
  if (!adminProfile) {
    redirect('/dashboard');
  }

  // Get filters from search params
  const search = params.search || '';
  const roleFilter = params.role || '';
  const statusFilter = params.status || '';
  const tierFilter = params.tier || '';
  const page = parseInt(params.page || '1', 10);
  const limit = 20;
  const offset = (page - 1) * limit;

  // Get regional leader filter if applicable
  const leaderFilter = await getRegionalLeaderFilter(adminProfile);

  // Build query
  let query = supabase
    .from('users')
    .select('*, oblast:oblasts(name)', { count: 'exact' });

  // Apply regional leader scoping
  if (leaderFilter.filterType === 'referral_tree' && leaderFilter.userIds) {
    query = query.in('id', leaderFilter.userIds);
  }

  // Apply search
  if (search) {
    query = query.or(
      `first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`
    );
  }

  // Apply filters
  if (roleFilter) {
    query = query.eq('role', roleFilter);
  }
  if (statusFilter) {
    query = query.eq('status', statusFilter);
  }
  if (tierFilter) {
    query = query.eq('membership_tier', tierFilter);
  }

  // Get total count for stats
  const { count: totalCount } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true });

  const { count: activeCount } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');

  const { count: pendingCount } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  const { count: suspendedCount } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'suspended');

  // Execute main query with pagination
  const { data: members, count: filteredCount } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  const totalPages = Math.ceil((filteredCount || 0) / limit);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <p className="label text-accent mb-2">АДМІНІСТРУВАННЯ</p>
          <h1 className="font-syne text-3xl lg:text-4xl font-bold">
            Члени Мережі
          </h1>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/members/export"
            className="btn btn-outline flex items-center gap-2"
          >
            <Download size={18} />
            ЕКСПОРТ
          </Link>
          {isStaffAdmin(adminProfile.staff_role) && (
            <Link
              href="/admin/members/import"
              className="btn btn-outline flex items-center gap-2"
            >
              <Upload size={18} />
              ІМПОРТ
            </Link>
          )}
          <Link href="/admin/members/new" className="btn flex items-center gap-2">
            <Plus size={18} />
            ДОДАТИ
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        <div className="bg-canvas border-2 border-timber-dark p-4">
          <p className="label mb-1">ВСЬОГО</p>
          <p className="font-syne text-3xl font-bold">{totalCount || 0}</p>
        </div>
        <div className="bg-canvas border-2 border-timber-dark p-4">
          <p className="label mb-1">АКТИВНИХ</p>
          <p className="font-syne text-3xl font-bold text-green-600">
            {activeCount || 0}
          </p>
        </div>
        <div className="bg-canvas border-2 border-timber-dark p-4">
          <p className="label mb-1">НА ПЕРЕВІРЦІ</p>
          <p className="font-syne text-3xl font-bold text-yellow-600">
            {pendingCount || 0}
          </p>
        </div>
        <div className="bg-canvas border-2 border-timber-dark p-4">
          <p className="label mb-1">ПРИЗУПИНЕНО</p>
          <p className="font-syne text-3xl font-bold text-red-600">
            {suspendedCount || 0}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-canvas border-2 border-timber-dark p-4 mb-6 relative">
        <div className="joint joint-tl" />
        <div className="joint joint-tr" />

        <form method="GET" className="flex flex-wrap gap-2 sm:gap-4">
          <div className="w-full sm:flex-1 sm:min-w-[200px]">
            <input
              type="text"
              name="search"
              defaultValue={search}
              placeholder="Пошук за ім'ям або email..."
              className="w-full px-3 py-2 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none"
            />
          </div>
          <select
            name="role"
            defaultValue={roleFilter}
            className="flex-1 min-w-[130px] px-3 py-2 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none"
          >
            <option value="">Всі ролі</option>
            <option value="free_viewer">Спостерігач</option>
            <option value="prospect">Потенційний</option>
            <option value="silent_member">Мовчазний</option>
            <option value="full_member">Повноцінний</option>
            <option value="group_leader">Лідер групи</option>
            <option value="regional_leader">Регіональний лідер</option>
            <option value="admin">Адмін</option>
            <option value="super_admin">Супер-адмін</option>
          </select>
          <select
            name="status"
            defaultValue={statusFilter}
            className="flex-1 min-w-[130px] px-3 py-2 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none"
          >
            <option value="">Всі статуси</option>
            <option value="pending">На перевірці</option>
            <option value="active">Активний</option>
            <option value="suspended">Призупинено</option>
            <option value="churned">Відійшов</option>
          </select>
          <select
            name="tier"
            defaultValue={tierFilter}
            className="flex-1 min-w-[130px] px-3 py-2 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none"
          >
            <option value="">Всі плани</option>
            <option value="free">Безкоштовний</option>
            <option value="basic_49">Базовий (49 грн)</option>
            <option value="supporter_100">Прихильник (100 грн)</option>
            <option value="supporter_200">Прихильник (200 грн)</option>
            <option value="patron_500">Патрон (500 грн)</option>
          </select>
          <div className="flex gap-2 w-full sm:w-auto">
            <button type="submit" className="btn btn-sm flex-1 sm:flex-none">
              ФІЛЬТР
            </button>
            {(search || roleFilter || statusFilter || tierFilter) && (
              <Link href="/admin/members" className="btn btn-outline btn-sm flex-1 sm:flex-none">
                СКИНУТИ
              </Link>
            )}
          </div>
        </form>
      </div>

      {/* Members Table */}
      <MembersTable
        members={members || []}
        canSuspend={canSuspendMembers(adminProfile.staff_role)}
        canDelete={isStaffSuperAdmin(adminProfile.staff_role)}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
          <p className="text-sm text-timber-beam text-center sm:text-left">
            Показано {offset + 1}-{Math.min(offset + limit, filteredCount || 0)}{' '}
            з {filteredCount || 0} записів
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={`/admin/members?page=${page - 1}${
                  search ? `&search=${search}` : ''
                }${roleFilter ? `&role=${roleFilter}` : ''}${
                  statusFilter ? `&status=${statusFilter}` : ''
                }${tierFilter ? `&tier=${tierFilter}` : ''}`}
                className="px-4 py-2 border-2 border-timber-dark text-sm font-bold hover:bg-timber-dark hover:text-canvas"
              >
                ← НАЗАД
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`/admin/members?page=${page + 1}${
                  search ? `&search=${search}` : ''
                }${roleFilter ? `&role=${roleFilter}` : ''}${
                  statusFilter ? `&status=${statusFilter}` : ''
                }${tierFilter ? `&tier=${tierFilter}` : ''}`}
                className="px-4 py-2 border-2 border-timber-dark text-sm font-bold hover:bg-timber-dark hover:text-canvas"
              >
                ДАЛІ →
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
