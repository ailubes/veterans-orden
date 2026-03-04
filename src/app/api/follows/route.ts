import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserWithProfile } from '@/lib/auth/get-user';

// POST /api/follows - Follow a user
export async function POST(request: NextRequest) {
  try {
    const { user, profile, supabase } = await getAuthenticatedUserWithProfile(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const dbUserId = profile?.id || user.id;

    const body = await request.json();
    const { following_id } = body;

    if (!following_id) {
      return NextResponse.json({ error: 'following_id is required' }, { status: 400 });
    }

    if (following_id === dbUserId) {
      return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 });
    }

    // Check if user exists
    const { data: targetUser } = await supabase
      .from('users')
      .select('id')
      .eq('id', following_id)
      .single();

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Insert follow (upsert to handle re-follows)
    const { data: follow, error } = await supabase
      .from('follows')
      .upsert({
        follower_id: dbUserId,
        following_id,
        status: 'active',
      }, {
        onConflict: 'follower_id,following_id',
      })
      .select()
      .single();

    if (error) {
      console.error('Error following user:', error);
      return NextResponse.json({ error: 'Failed to follow user' }, { status: 500 });
    }

    // Get updated counts
    const { data: followerCount } = await supabase
      .from('follows')
      .select('id', { count: 'exact' })
      .eq('following_id', following_id)
      .eq('status', 'active');

    return NextResponse.json({
      following: true,
      followers_count: followerCount?.length || 0,
    });
  } catch (error) {
    console.error('Error in POST /api/follows:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/follows - Unfollow a user
export async function DELETE(request: NextRequest) {
  try {
    const { user, profile, supabase } = await getAuthenticatedUserWithProfile(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const dbUserId = profile?.id || user.id;

    const { searchParams } = new URL(request.url);
    const following_id = searchParams.get('following_id');

    if (!following_id) {
      return NextResponse.json({ error: 'following_id is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', dbUserId)
      .eq('following_id', following_id);

    if (error) {
      console.error('Error unfollowing user:', error);
      return NextResponse.json({ error: 'Failed to unfollow user' }, { status: 500 });
    }

    // Get updated counts
    const { data: followerCount } = await supabase
      .from('follows')
      .select('id', { count: 'exact' })
      .eq('following_id', following_id)
      .eq('status', 'active');

    return NextResponse.json({
      following: false,
      followers_count: followerCount?.length || 0,
    });
  } catch (error) {
    console.error('Error in DELETE /api/follows:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
