import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { checkAndAdvanceRole, getUserRoleProgress, recalculateUserStats } from '@/lib/services/role-progression';

/**
 * POST /api/user/check-advancement
 * Check if current user is eligible for advancement and advance if possible
 */
export async function POST() {
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
      })
      .from(users)
      .where(eq(users.authId, authUser.id))
      .limit(1);

    if (!dbUser || dbUser.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = dbUser[0];

    // First recalculate stats to ensure they're up to date
    await recalculateUserStats(user.id);

    // Check and attempt advancement
    const result = await checkAndAdvanceRole(user.id);

    if (result.error === 'approval_required') {
      return NextResponse.json({
        advanced: false,
        message: 'Запит на підвищення подано на розгляд адміністратора',
        approvalRequired: true,
      });
    }

    if (result.advanced && result.newRole) {
      // Get updated progress
      const progress = await getUserRoleProgress(user.id);

      return NextResponse.json({
        advanced: true,
        previousRole: user.membershipRole,
        newRole: result.newRole,
        progress,
        message: 'Вітаємо! Ваш рівень підвищено!',
      });
    }

    // Get current progress for response
    const progress = await getUserRoleProgress(user.id);

    return NextResponse.json({
      advanced: false,
      currentRole: user.membershipRole,
      progress,
      message: progress?.isEligible
        ? 'Ви маєте право на підвищення, але сталася помилка'
        : 'Ви ще не виконали всі вимоги для наступного рівня',
    });
  } catch (error) {
    console.error('Error checking advancement:', error);
    return NextResponse.json(
      { error: 'Failed to check advancement' },
      { status: 500 }
    );
  }
}
