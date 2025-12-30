import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/get-user';

export const dynamic = 'force-dynamic';

/**
 * GET /api/user/search
 * Search users by name or email
 */
export async function GET(request: Request) {
  try {
    const { user, supabase, error: authError } = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json({ error: authError || 'Unauthorized' }, { status: 401 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')));

    if (query.trim().length < 2) {
      return NextResponse.json({ users: [] });
    }

    // Get current user's profile ID to exclude them
    const { data: currentProfile } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', user.id)
      .single();

    // Search users by name
    // Use OR conditions for first_name, last_name, and concatenated name
    const { data: users, error } = await supabase
      .from('users')
      .select('id, first_name, last_name, avatar_url, sex, membership_role')
      .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%`)
      .neq('id', currentProfile?.id || '')
      .limit(limit);

    if (error) {
      console.error('[User Search] Error:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    // Format response
    const formattedUsers = (users || []).map((u) => ({
      id: u.id,
      firstName: u.first_name,
      lastName: u.last_name,
      avatarUrl: u.avatar_url,
      sex: u.sex,
      membershipRole: u.membership_role,
    }));

    return NextResponse.json({ users: formattedUsers });
  } catch (error) {
    console.error('[User Search] Unexpected error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
