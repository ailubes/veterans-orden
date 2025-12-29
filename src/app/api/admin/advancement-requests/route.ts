import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import {
  getPendingAdvancementRequests,
  processAdvancementRequest,
  getRecentAdvancements,
} from '@/lib/services/role-progression';

/**
 * GET /api/admin/advancement-requests
 * Get pending advancement requests (admin access required)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const dbUser = await db
      .select({
        id: users.id,
        staffRole: users.staffRole,
      })
      .from(users)
      .where(eq(users.clerkId, authUser.id))
      .limit(1);

    if (!dbUser || dbUser.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const staffRole = dbUser[0].staffRole;
    if (!['admin', 'super_admin'].includes(staffRole || '')) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const includeRecent = searchParams.get('includeRecent') === 'true';

    const pendingRequests = await getPendingAdvancementRequests();

    const response: {
      pendingRequests: typeof pendingRequests;
      recentAdvancements?: Awaited<ReturnType<typeof getRecentAdvancements>>;
    } = { pendingRequests };

    if (includeRecent) {
      response.recentAdvancements = await getRecentAdvancements(20);
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error getting advancement requests:', error);
    return NextResponse.json(
      { error: 'Failed to get advancement requests' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/advancement-requests
 * Process (approve/reject) an advancement request
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const dbUser = await db
      .select({
        id: users.id,
        staffRole: users.staffRole,
      })
      .from(users)
      .where(eq(users.clerkId, authUser.id))
      .limit(1);

    if (!dbUser || dbUser.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const staffRole = dbUser[0].staffRole;
    if (!['admin', 'super_admin'].includes(staffRole || '')) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { requestId, approved, rejectionReason } = body;

    if (!requestId || typeof approved !== 'boolean') {
      return NextResponse.json(
        { error: 'requestId and approved are required' },
        { status: 400 }
      );
    }

    const result = await processAdvancementRequest(
      requestId,
      dbUser[0].id,
      approved,
      rejectionReason
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to process request' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: approved
        ? 'Запит схвалено, користувача підвищено'
        : 'Запит відхилено',
    });
  } catch (error) {
    console.error('Error processing advancement request:', error);
    return NextResponse.json(
      { error: 'Failed to process advancement request' },
      { status: 500 }
    );
  }
}
