import { NextResponse } from 'next/server';
import { getMobileUser, signOutMobile } from '@/lib/supabase/mobile-auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    // Get user from Bearer token
    const { user, error: authError } = await getMobileUser(request);

    if (authError || !user) {
      return NextResponse.json(
        { error: authError || 'Unauthorized' },
        { status: 401 }
      );
    }

    // Sign out user (invalidate session)
    const { error } = await signOutMobile(user.id);

    if (error) {
      return NextResponse.json(
        { error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Signed out successfully',
    });
  } catch (error) {
    console.error('Mobile sign-out error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
