import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUserBadges, getUserBadgeCount } from '@/lib/challenges';

export const dynamic = 'force-dynamic';

/**
 * GET /api/badges/my
 *
 * Returns badges earned by the current user
 */
export async function GET() {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { data: profile } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    const badges = await getUserBadges(profile.id);
    const counts = await getUserBadgeCount(profile.id);

    return NextResponse.json({
      badges,
      counts,
    });
  } catch (error) {
    console.error('[My Badges API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
