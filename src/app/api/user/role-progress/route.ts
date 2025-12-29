import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getUserRoleProgress, getUserReferralStats } from '@/lib/services/role-progression';

/**
 * GET /api/user/role-progress
 * Get current user's role and progress toward next level
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database
    const dbUser = await db
      .select({
        id: users.id,
        membershipRole: users.membershipRole,
        staffRole: users.staffRole,
        roleAdvancedAt: users.roleAdvancedAt,
        referralCode: users.referralCode,
        totalReferralCount: users.totalReferralCount,
      })
      .from(users)
      .where(eq(users.clerkId, authUser.id))
      .limit(1);

    if (!dbUser || dbUser.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = dbUser[0];

    // Get role progress
    const progress = await getUserRoleProgress(user.id);

    // Get referral stats
    const stats = await getUserReferralStats(user.id);

    return NextResponse.json({
      user: {
        id: user.id,
        membershipRole: user.membershipRole,
        staffRole: user.staffRole,
        roleAdvancedAt: user.roleAdvancedAt,
        referralCode: user.referralCode,
        totalReferralCount: user.totalReferralCount,
      },
      progress,
      stats,
    });
  } catch (error) {
    console.error('Error getting role progress:', error);
    return NextResponse.json(
      { error: 'Failed to get role progress' },
      { status: 500 }
    );
  }
}
