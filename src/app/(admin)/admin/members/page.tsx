import { createClient } from '@/lib/supabase/server';
import { getAdminProfile, getRegionalLeaderFilter } from '@/lib/permissions';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus, Download } from 'lucide-react';

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
          <Link href="/admin/members/new" className="btn flex items-center gap-2">
            <Plus size={18} />
            ДОДАТИ
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
        <div className="joint" style={{ top: '-6px', left: '-6px' }} />
        <div className="joint" style={{ top: '-6px', right: '-6px' }} />

        <form method="GET" className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              name="search"
              defaultValue={search}
              placeholder="Пошук за ім'ям або email..."
              className="w-full px-4 py-2 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none"
            />
          </div>
          <select
            name="role"
            defaultValue={roleFilter}
            className="px-4 py-2 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none"
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
            className="px-4 py-2 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none"
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
            className="px-4 py-2 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none"
          >
            <option value="">Всі плани</option>
            <option value="free">Безкоштовний</option>
            <option value="basic_49">Базовий (49 грн)</option>
            <option value="supporter_100">Прихильник (100 грн)</option>
            <option value="supporter_200">Прихильник (200 грн)</option>
            <option value="patron_500">Патрон (500 грн)</option>
          </select>
          <button type="submit" className="btn btn-sm">
            ФІЛЬТР
          </button>
          {(search || roleFilter || statusFilter || tierFilter) && (
            <Link href="/admin/members" className="btn btn-outline btn-sm">
              СКИНУТИ
            </Link>
          )}
        </form>
      </div>

      {/* Members Table */}
      <div className="bg-canvas border-2 border-timber-dark relative overflow-hidden">
        <div className="joint" style={{ top: '-6px', left: '-6px' }} />
        <div className="joint" style={{ top: '-6px', right: '-6px' }} />
        <div className="joint" style={{ bottom: '-6px', left: '-6px' }} />
        <div className="joint" style={{ bottom: '-6px', right: '-6px' }} />

        {members && members.length > 0 ? (
          <>
            {/* Table Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b-2 border-timber-dark bg-timber-dark/5">
              <div className="col-span-3 label">ЧЛЕН</div>
              <div className="col-span-2 label">РОЛЬ</div>
              <div className="col-span-2 label">СТАТУС</div>
              <div className="col-span-2 label">ПЛАН</div>
              <div className="col-span-1 label">БАЛИ</div>
              <div className="col-span-2 label text-right">ДІЇ</div>
            </div>

            {/* Table Rows */}
            {members.map((member) => (
              <div
                key={member.id}
                className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border-b border-timber-dark/20 hover:bg-timber-dark/5"
              >
                {/* Member info */}
                <div className="col-span-1 md:col-span-3">
                  <div className="font-bold">
                    {member.first_name} {member.last_name}
                  </div>
                  <div className="text-xs text-timber-beam">{member.email}</div>
                  {member.oblast && (
                    <div className="text-xs text-timber-beam mt-1">
                      {member.oblast.name}
                    </div>
                  )}
                </div>

                {/* Role */}
                <div className="col-span-1 md:col-span-2">
                  <span className="px-2 py-1 bg-timber-dark/10 text-xs font-bold">
                    {member.role === 'super_admin' && 'Супер-адмін'}
                    {member.role === 'admin' && 'Адмін'}
                    {member.role === 'regional_leader' && 'Рег. лідер'}
                    {member.role === 'group_leader' && 'Лідер групи'}
                    {member.role === 'full_member' && 'Повноцінний'}
                    {member.role === 'silent_member' && 'Мовчазний'}
                    {member.role === 'prospect' && 'Потенційний'}
                    {member.role === 'free_viewer' && 'Спостерігач'}
                  </span>
                </div>

                {/* Status */}
                <div className="col-span-1 md:col-span-2">
                  <span
                    className={`px-2 py-1 text-xs font-bold ${
                      member.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : member.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : member.status === 'suspended'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {member.status === 'active' && 'Активний'}
                    {member.status === 'pending' && 'На перевірці'}
                    {member.status === 'suspended' && 'Призупинено'}
                    {member.status === 'churned' && 'Відійшов'}
                  </span>
                </div>

                {/* Tier */}
                <div className="col-span-1 md:col-span-2">
                  <span className="text-sm">
                    {member.membership_tier === 'patron_500' && 'Патрон'}
                    {member.membership_tier === 'supporter_200' &&
                      'Прихильник 200'}
                    {member.membership_tier === 'supporter_100' &&
                      'Прихильник 100'}
                    {member.membership_tier === 'basic_49' && 'Базовий'}
                    {member.membership_tier === 'free' && 'Безкоштовний'}
                  </span>
                </div>

                {/* Points */}
                <div className="col-span-1 md:col-span-1">
                  <span className="font-bold text-accent">
                    {member.points || 0}
                  </span>
                </div>

                {/* Actions */}
                <div className="col-span-1 md:col-span-2 text-right">
                  <Link
                    href={`/admin/members/${member.id}`}
                    className="text-xs text-accent hover:underline font-bold"
                  >
                    ПЕРЕГЛЯНУТИ →
                  </Link>
                </div>
              </div>
            ))}
          </>
        ) : (
          <div className="text-center py-16 text-timber-beam">
            <p className="text-sm">
              {search || roleFilter || statusFilter || tierFilter
                ? 'Не знайдено членів за вказаними фільтрами'
                : 'Поки що немає членів'}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-timber-beam">
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
