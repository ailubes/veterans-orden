import { createClient } from '@/lib/supabase/server';
import { getAdminProfile, isRegionalLeader } from '@/lib/permissions';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Download, Filter } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface AuditLogPageProps {
  searchParams: Promise<{
    user?: string;
    action?: string;
    entity_type?: string;
    page?: string;
  }>;
}

export default async function AuditLogPage({ searchParams }: AuditLogPageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  // Check admin access
  const adminProfile = await getAdminProfile();
  if (!adminProfile) {
    redirect('/dashboard');
  }

  // Get filters from search params
  const userFilter = params.user || '';
  const actionFilter = params.action || '';
  const entityTypeFilter = params.entity_type || '';
  const page = parseInt(params.page || '1', 10);
  const limit = 50;
  const offset = (page - 1) * limit;

  // Build query
  let query = supabase
    .from('audit_log')
    .select('*, user:users!audit_log_user_id_fkey(first_name, last_name, email)', {
      count: 'exact',
    })
    .order('created_at', { ascending: false });

  // Regional leaders see only their own actions
  if (isRegionalLeader(adminProfile.role)) {
    query = query.eq('user_id', adminProfile.id);
  } else {
    // Apply filters for admin/super_admin
    if (userFilter) {
      query = query.eq('user_id', userFilter);
    }
  }

  if (actionFilter) {
    query = query.eq('action', actionFilter);
  }
  if (entityTypeFilter) {
    query = query.eq('entity_type', entityTypeFilter);
  }

  // Execute query with pagination
  const { data: logs, count: totalCount } = await query.range(offset, offset + limit - 1);

  const totalPages = Math.ceil((totalCount || 0) / limit);

  // Get unique actions and entity types for filters
  const { data: allLogs } = await supabase
    .from('audit_log')
    .select('action, entity_type')
    .limit(1000);

  const uniqueActions = [...new Set(allLogs?.map((log) => log.action) || [])];
  const uniqueEntityTypes = [...new Set(allLogs?.map((log) => log.entity_type) || [])];

  // Get all admins for user filter
  const { data: admins } = await supabase
    .from('users')
    .select('id, first_name, last_name, email')
    .in('role', ['admin', 'super_admin', 'regional_leader'])
    .order('first_name', { ascending: true });

  function formatAction(action: string): string {
    const actionLabels: Record<string, string> = {
      update_member_role: 'Зміна ролі члена',
      suspend_member: 'Призупинення члена',
      unsuspend_member: 'Відновлення члена',
      verify_member: 'Верифікація члена',
      adjust_points: 'Коригування балів',
      delete_member: 'Видалення члена',
      impersonate_start: 'Початок імперсонації',
      impersonate_end: 'Кінець імперсонації',
      update_organization_settings: 'Оновлення налаштувань організації',
      update_system_config: 'Оновлення системної конфігурації',
      update_user_role: 'Оновлення ролі користувача',
      create_event: 'Створення події',
      update_event: 'Оновлення події',
      delete_event: 'Видалення події',
      create_vote: 'Створення голосування',
      update_vote: 'Оновлення голосування',
      delete_vote: 'Видалення голосування',
      create_task: 'Створення завдання',
      update_task: 'Оновлення завдання',
      delete_task: 'Видалення завдання',
      create_news: 'Створення новини',
      update_news: 'Оновлення новини',
      delete_news: 'Видалення новини',
    };
    return actionLabels[action] || action;
  }

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('uk-UA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/settings"
          className="inline-flex items-center gap-2 text-sm text-timber-beam hover:text-accent mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Назад до налаштувань
        </Link>
        <p className="label text-accent mb-2">АУДИТ</p>
        <h1 className="font-syne text-3xl lg:text-4xl font-bold">Журнал аудиту</h1>
        <p className="text-timber-beam mt-2">
          Історія дій адміністраторів у системі
        </p>
      </div>

      {/* Filters */}
      {!isRegionalLeader(adminProfile.role) && (
        <div className="border-2 border-timber-dark p-4 sm:p-6 bg-canvas card-with-joints mb-6">
          <div className="joint joint-tl" />
          <div className="joint joint-tr" />
          <div className="joint joint-bl" />
          <div className="joint joint-br" />

          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-accent" />
            <h2 className="font-syne text-lg font-bold">Фільтри</h2>
          </div>

          <form className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="label mb-1 block">Користувач</label>
              <select
                name="user"
                defaultValue={userFilter}
                className="w-full border-2 border-timber-dark px-3 py-2 bg-canvas"
              >
                <option value="">Всі користувачі</option>
                {admins?.map((admin) => (
                  <option key={admin.id} value={admin.id}>
                    {admin.first_name} {admin.last_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label mb-1 block">Дія</label>
              <select
                name="action"
                defaultValue={actionFilter}
                className="w-full border-2 border-timber-dark px-3 py-2 bg-canvas"
              >
                <option value="">Всі дії</option>
                {uniqueActions.map((action) => (
                  <option key={action} value={action}>
                    {formatAction(action)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label mb-1 block">Тип сутності</label>
              <select
                name="entity_type"
                defaultValue={entityTypeFilter}
                className="w-full border-2 border-timber-dark px-3 py-2 bg-canvas"
              >
                <option value="">Всі типи</option>
                {uniqueEntityTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2 md:col-span-3 flex flex-wrap gap-2">
              <button type="submit" className="btn text-sm">
                Застосувати
              </button>
              <Link href="/admin/settings/audit-log" className="btn btn-outline text-sm">
                Скинути
              </Link>
            </div>
          </form>
        </div>
      )}

      {/* Audit Log Table */}
      <div className="border-2 border-timber-dark bg-canvas card-with-joints">
        <div className="joint joint-tl" />
        <div className="joint joint-tr" />
        <div className="joint joint-bl" />
        <div className="joint joint-br" />

        <div className="p-4 sm:p-6 border-b-2 border-timber-dark flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h2 className="font-syne text-lg sm:text-xl font-bold">
            Записи ({totalCount || 0})
          </h2>
          <button className="btn btn-outline inline-flex items-center gap-2 text-sm">
            <Download className="w-4 h-4" />
            Експорт CSV
          </button>
        </div>

        <div className="overflow-x-auto">
          <Table className="min-w-[600px]">
            <TableHeader>
              <TableRow className="border-b-2 border-timber-dark hover:bg-transparent">
                <TableHead className="font-syne font-bold">Дата/Час</TableHead>
                <TableHead className="font-syne font-bold">Користувач</TableHead>
                <TableHead className="font-syne font-bold">Дія</TableHead>
                <TableHead className="font-syne font-bold">Тип</TableHead>
                <TableHead className="font-syne font-bold">ID сутності</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs && logs.length > 0 ? (
                logs.map((log) => (
                  <TableRow key={log.id} className="border-b border-timber-beam/30">
                    <TableCell className="font-mono text-xs">
                      {formatDate(log.created_at)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {log.user?.first_name} {log.user?.last_name}
                      <br />
                      <span className="text-xs text-timber-beam">{log.user?.email}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium">{formatAction(log.action)}</span>
                    </TableCell>
                    <TableCell className="text-sm text-timber-beam">{log.entity_type}</TableCell>
                    <TableCell className="font-mono text-xs text-timber-beam">
                      {log.entity_id}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-timber-beam py-12">
                    Немає записів для відображення
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 sm:p-6 border-t-2 border-timber-dark flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-sm text-timber-beam">
              Сторінка {page} з {totalPages}
            </p>
            <div className="flex gap-2">
              {page > 1 && (
                <Link
                  href={`/admin/settings/audit-log?page=${page - 1}${userFilter ? `&user=${userFilter}` : ''}${actionFilter ? `&action=${actionFilter}` : ''}${entityTypeFilter ? `&entity_type=${entityTypeFilter}` : ''}`}
                  className="btn btn-outline text-sm"
                >
                  Попередня
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`/admin/settings/audit-log?page=${page + 1}${userFilter ? `&user=${userFilter}` : ''}${actionFilter ? `&action=${actionFilter}` : ''}${entityTypeFilter ? `&entity_type=${entityTypeFilter}` : ''}`}
                  className="btn text-sm"
                >
                  Наступна
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
