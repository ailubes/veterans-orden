import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserWithProfile } from '@/lib/auth/get-user';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/challenges/tasks
 * List tasks for linking to task-based challenges.
 */
export async function GET(request: NextRequest) {
  const { user, profile, error } = await getAuthenticatedUserWithProfile(request);

  if (!user || error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const effectiveAdminRole =
    profile?.staff_role && profile.staff_role !== 'none'
      ? profile.staff_role
      : profile?.role;

  const adminRoles = ['admin', 'super_admin'];
  if (!effectiveAdminRole || !adminRoles.includes(effectiveAdminRole)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.trim() || '';
    const limit = Math.min(parseInt(searchParams.get('limit') || '200', 10), 500);

    const supabase = await createClient();

    let query = supabase
      .from('tasks')
      .select('id, title, status, points, requires_proof, due_date, type, priority, created_at')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (q.length > 0) {
      query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
    }

    const { data: tasks, error: tasksError } = await query;

    if (tasksError) {
      return NextResponse.json({ error: tasksError.message }, { status: 500 });
    }

    return NextResponse.json({ tasks: tasks || [] });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}
