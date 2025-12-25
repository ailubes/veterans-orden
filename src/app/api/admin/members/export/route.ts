import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAdminProfile, getRegionalLeaderFilter } from '@/lib/permissions';

/**
 * GET /api/admin/members/export
 * Export members to CSV
 * Query params: search, role, status, tier (same as members list page)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check admin access
    const adminProfile = await getAdminProfile();
    if (!adminProfile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get filters from search params
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const roleFilter = searchParams.get('role') || '';
    const statusFilter = searchParams.get('status') || '';
    const tierFilter = searchParams.get('tier') || '';

    // Get regional leader filter if applicable
    const leaderFilter = await getRegionalLeaderFilter(adminProfile);

    // Build query
    let query = supabase
      .from('users')
      .select('*, oblast:oblasts(name)')
      .order('created_at', { ascending: false });

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

    // Fetch all matching members (no pagination for export)
    const { data: members, error } = await query;

    if (error) {
      console.error('[GET /api/admin/members/export] Query error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch members' },
        { status: 500 }
      );
    }

    if (!members || members.length === 0) {
      return NextResponse.json(
        { error: 'No members found to export' },
        { status: 404 }
      );
    }

    // Generate CSV
    const csvHeaders = [
      'ID',
      "Ім'я",
      'Прізвище',
      'По-батькові',
      'Email',
      'Телефон',
      'Дата народження',
      'Область',
      'Місто',
      'Роль',
      'Статус',
      'План членства',
      'Оплачено до',
      'Бали',
      'Рівень',
      'Email підтверджено',
      'Телефон підтверджено',
      'Особу підтверджено',
      'Дата реєстрації',
    ];

    const csvRows = members.map((member) => [
      member.id,
      member.first_name || '',
      member.last_name || '',
      member.patronymic || '',
      member.email || '',
      member.phone || '',
      member.date_of_birth || '',
      member.oblast?.name || '',
      member.city || '',
      member.role || '',
      member.status || '',
      member.membership_tier || '',
      member.paid_until || '',
      member.points || 0,
      member.level || 1,
      member.email_verified ? 'Так' : 'Ні',
      member.phone_verified ? 'Так' : 'Ні',
      member.identity_verified ? 'Так' : 'Ні',
      member.created_at || '',
    ]);

    // Create CSV content
    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map((row) =>
        row
          .map((cell) => {
            // Escape commas and quotes
            const cellStr = String(cell);
            if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
              return `"${cellStr.replace(/"/g, '""')}"`;
            }
            return cellStr;
          })
          .join(',')
      ),
    ].join('\n');

    // Add BOM for proper UTF-8 encoding in Excel
    const bom = '\uFEFF';
    const csvWithBom = bom + csvContent;

    // Create response with CSV file
    const filename = `members_export_${new Date().toISOString().split('T')[0]}.csv`;

    return new NextResponse(csvWithBom, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('[GET /api/admin/members/export]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
