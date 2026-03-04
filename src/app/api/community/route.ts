import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserWithProfile } from '@/lib/auth/get-user';

// GET /api/community - Get member directory with search/filter
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const unit = searchParams.get('unit');
    const city = searchParams.get('city');
    const profession = searchParams.get('profession');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const { user, profile, supabase } = await getAuthenticatedUserWithProfile(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const dbUserId = profile?.id || user.id;

    let query = supabase
      .from('users')
      .select('id, display_name, avatar_url, military_unit, position, city, profession, bio, created_at', { count: 'exact' })
      .eq('status', 'active')
      .order('display_name', { ascending: true })
      .range((page - 1) * limit, page * limit - 1);

    // Apply search filter
    if (search) {
      query = query.or(`display_name.ilike.%${search}%,bio.ilike.%${search}%,military_unit.ilike.%${search}%`);
    }

    // Apply filters
    if (unit) {
      query = query.ilike('military_unit', `%${unit}%`);
    }
    if (city) {
      query = query.ilike('city', `%${city}%`);
    }
    if (profession) {
      query = query.ilike('profession', `%${profession}%`);
    }

    const { data: members, error, count } = await query;

    if (error) {
      console.error('Error fetching community:', error);
      return NextResponse.json({ error: 'Failed to fetch community' }, { status: 500 });
    }

    // Get follow status for each member
    const memberIds = members?.map(m => m.id) || [];
    const { data: follows } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', dbUserId)
      .in('following_id', memberIds)
      .eq('status', 'active');

    const followedIds = new Set(follows?.map(f => f.following_id) || []);

    // Format members with follow status
    const formattedMembers = members?.map(member => ({
      ...member,
      is_following: followedIds.has(member.id),
    })) || [];

    return NextResponse.json({
      members: formattedMembers,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Error in GET /api/community:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
