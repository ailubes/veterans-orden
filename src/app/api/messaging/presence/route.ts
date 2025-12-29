import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/get-user';
import type { UserPresence } from '@/types/messaging';

export const dynamic = 'force-dynamic';

/**
 * GET /api/messaging/presence
 * Get online status of users the current user can see
 */
export async function GET(request: Request) {
  try {
    const { user, supabase, error: authError } = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json({ error: authError || 'Unauthorized' }, { status: 401 });
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Get user IDs from parameter (comma-separated)
    const { searchParams } = new URL(request.url);
    const userIdsParam = searchParams.get('userIds');

    if (!userIdsParam) {
      return NextResponse.json({ error: 'userIds parameter required' }, { status: 400 });
    }

    const userIds = userIdsParam.split(',').filter(Boolean);

    if (userIds.length === 0) {
      return NextResponse.json({ presence: [] });
    }

    // Limit to 100 users
    const limitedUserIds = userIds.slice(0, 100);

    // Get presence for these users
    const { data: presenceData, error } = await supabase
      .from('user_presence')
      .select('user_id, is_online, last_seen_at, current_conversation_id')
      .in('user_id', limitedUserIds);

    if (error) {
      console.error('[Messaging] Error fetching presence:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    // Create map of found presence data
    const presenceMap = new Map(
      (presenceData || []).map((p: Record<string, unknown>) => [p.user_id, p])
    );

    // Build response for all requested users (include offline for missing)
    const presence: UserPresence[] = limitedUserIds.map((userId) => {
      const p = presenceMap.get(userId);
      if (p) {
        return {
          userId: p.user_id as string,
          isOnline: p.is_online as boolean,
          lastSeenAt: p.last_seen_at as string,
          currentConversationId: p.current_conversation_id as string | null,
        };
      }
      return {
        userId,
        isOnline: false,
        lastSeenAt: new Date().toISOString(),
        currentConversationId: null,
      };
    });

    return NextResponse.json({ presence });
  } catch (error) {
    console.error('[Messaging] Unexpected error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/**
 * POST /api/messaging/presence
 * Update current user's presence
 */
export async function POST(request: Request) {
  try {
    const { user, supabase, error: authError } = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json({ error: authError || 'Unauthorized' }, { status: 401 });
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const body = await request.json();
    const { isOnline, currentConversationId } = body;

    // Upsert presence
    const { error: upsertError } = await supabase
      .from('user_presence')
      .upsert({
        user_id: profile.id,
        is_online: isOnline ?? true,
        last_seen_at: new Date().toISOString(),
        current_conversation_id: currentConversationId || null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

    if (upsertError) {
      console.error('[Messaging] Error updating presence:', upsertError);
      return NextResponse.json({ error: 'Failed to update presence' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Messaging] Unexpected error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
