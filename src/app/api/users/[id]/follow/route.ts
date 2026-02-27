import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/get-user';

// POST /api/users/[id]/follow - Follow a specific user
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { user, supabase } = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const following_id = id;

    if (following_id === user.id) {
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

    // Insert follow
    const { error } = await supabase
      .from('follows')
      .upsert({
        follower_id: user.id,
        following_id,
        status: 'active',
      }, {
        onConflict: 'follower_id,following_id',
      });

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
    console.error('Error in POST /api/users/[id]/follow:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/users/[id]/follow - Unfollow a specific user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { user, supabase } = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const following_id = id;

    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', user.id)
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
    console.error('Error in DELETE /api/users/[id]/follow:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
