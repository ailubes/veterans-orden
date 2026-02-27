import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/get-user';

// GET /api/users/[id] - Get public profile for a user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { user, supabase } = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile
    const { data: profile, error } = await supabase
      .from('users')
      .select(`
        id,
        display_name,
        avatar_url,
        military_unit,
        position,
        city,
        profession,
        bio,
        created_at,
        membership_tier,
        role
      `)
      .eq('id', id)
      .eq('status', 'active')
      .single();

    if (error || !profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get follower/following counts
    const { data: followerCount } = await supabase
      .from('follows')
      .select('id', { count: 'exact' })
      .eq('following_id', id)
      .eq('status', 'active');

    const { data: followingCount } = await supabase
      .from('follows')
      .select('id', { count: 'exact' })
      .eq('follower_id', id)
      .eq('status', 'active');

    // Check if current user follows this user
    const { data: followStatus } = await supabase
      .from('follows')
      .select('status')
      .eq('follower_id', user.id)
      .eq('following_id', id)
      .eq('status', 'active')
      .single();

    // Get recent posts count
    const { data: postsCount } = await supabase
      .from('posts')
      .select('id', { count: 'exact' })
      .eq('author_id', id)
      .eq('visibility', 'public')
      .eq('is_hidden', false);

    return NextResponse.json({
      profile: {
        ...profile,
        followers_count: followerCount?.length || 0,
        following_count: followingCount?.length || 0,
        posts_count: postsCount?.length || 0,
        is_following: !!followStatus,
      },
    });
  } catch (error) {
    console.error('Error in GET /api/users/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
