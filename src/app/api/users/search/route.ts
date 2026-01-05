import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/get-user';

/**
 * GET /api/users/search
 * Search for users by name
 * Used by the messaging system to find users to message
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthenticatedUser(request);

    if (!auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q')?.trim();

    if (!query || query.length < 2) {
      return NextResponse.json({ users: [] });
    }

    // Get current user's ID to exclude from results
    const { data: currentUser } = await auth.supabase
      .from('users')
      .select('id')
      .eq('auth_id', auth.user.id)
      .single();

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Search users by first name or last name
    // Using ilike for case-insensitive partial matching
    const { data: users, error } = await auth.supabase
      .from('users')
      .select('id, first_name, last_name, avatar_url, sex, membership_role')
      .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%`)
      .neq('id', currentUser.id)
      .eq('status', 'active')
      .order('first_name', { ascending: true })
      .limit(20);

    if (error) {
      console.error('Search error:', error);
      return NextResponse.json({ error: 'Search failed' }, { status: 500 });
    }

    // Transform to camelCase for frontend
    const transformedUsers = (users || []).map((user) => ({
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      avatarUrl: user.avatar_url,
      sex: user.sex,
      membershipRole: user.membership_role,
    }));

    return NextResponse.json({ users: transformedUsers });
  } catch (error) {
    console.error('Error searching users:', error);
    return NextResponse.json(
      { error: 'Failed to search users' },
      { status: 500 }
    );
  }
}
