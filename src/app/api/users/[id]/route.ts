import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserWithProfile } from '@/lib/auth/get-user';

// GET /api/users/[id] - Get public profile for a user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { user, profile: currentProfile, supabase } = await getAuthenticatedUserWithProfile(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const dbUserId = currentProfile?.id || user.id;

    // Get user profile
    const { data: profile, error } = await supabase
      .from('users')
      .select(`
        id,
        first_name,
        last_name,
        avatar_url,
        military_unit,
        position,
        member_identity,
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
      .eq('follower_id', dbUserId)
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
        display_name:
          `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Користувач',
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
