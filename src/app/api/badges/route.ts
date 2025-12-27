import { NextRequest, NextResponse } from 'next/server';
import { listBadges } from '@/lib/challenges/badge-service';
import type { BadgeCategory } from '@/lib/challenges';

export const dynamic = 'force-dynamic';

/**
 * GET /api/badges
 *
 * Returns list of all badges
 *
 * Query params:
 * - category: 'challenge' | 'achievement' | 'special' (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') as BadgeCategory | null;

    const badges = await listBadges(category || undefined);

    // Group by category
    const byCategory: Record<string, typeof badges> = {};
    badges.forEach(badge => {
      const cat = badge.category || 'other';
      if (!byCategory[cat]) {
        byCategory[cat] = [];
      }
      byCategory[cat].push(badge);
    });

    return NextResponse.json({
      badges,
      byCategory,
      total: badges.length,
    });
  } catch (error) {
    console.error('[Badges API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
