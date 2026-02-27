import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/get-user';

export const dynamic = 'force-dynamic';

/**
 * GET /api/tasks
 *
 * Returns tasks assigned to the current user.
 *
 * Query params:
 * - status: comma-separated statuses (default: 'open,in_progress')
 * - limit: number (default: 20, max: 50)
 * - offset: number (default: 0)
 */
export async function GET(request: NextRequest) {
  try {
    const { user, supabase, error: authError } = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json({ error: authError || 'Unauthorized' }, { status: 401 });
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get('status') || 'open,in_progress';
    const statuses = statusParam.split(',').map((s) => s.trim());
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
    const offset = parseInt(searchParams.get('offset') || '0');

    const { data: rows, error: dbError } = await supabase
      .from('tasks')
      .select('id, title, description, priority, status, due_date, points, requires_proof')
      .eq('assignee_id', profile.id)
      .in('status', statuses)
      .order('due_date', { ascending: true })
      .range(offset, offset + limit - 1);

    if (dbError) {
      console.error('[Tasks API] Database error:', dbError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    // Rename `points` → `reward_points` to match mobile screen expectation
    const tasks = (rows || []).map(({ points, ...rest }) => ({
      ...rest,
      reward_points: points,
    }));

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('[Tasks API] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
