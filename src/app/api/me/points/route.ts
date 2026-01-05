import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/get-user';
import { getUserBalance, getPointsHistory } from '@/lib/points';

/**
 * GET /api/me/points
 * Get authenticated user's points balance and transaction history
 * Query params:
 *  - limit: number (default: 50, max: 100)
 *  - offset: number (default: 0)
 *  - type: points transaction type filter (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const { user, supabase, error: authError } = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json({ error: authError || 'Unauthorized' }, { status: 401 });
    }

    // Get user's database ID
    const { data: profile } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const type = searchParams.get('type');

    // Get balance
    const balance = await getUserBalance(profile.id);

    // Get transaction history
    const history = await getPointsHistory(profile.id, {
      limit,
      offset,
      ...(type && { type: type as any }),
    });

    return NextResponse.json({
      balance: {
        total: balance.total,
        currentYear: balance.currentYear,
        expiringSoon: balance.expiringSoon,
        expirationDate: balance.expirationDate,
      },
      history: {
        transactions: history,
        pagination: {
          limit,
          offset,
          hasMore: history.length === limit,
        },
      },
    });
  } catch (error) {
    console.error('[GET /api/me/points]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
