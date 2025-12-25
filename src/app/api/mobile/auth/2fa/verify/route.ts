import { NextResponse } from 'next/server';
import { verifyMobile2FA } from '@/lib/supabase/mobile-auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { factor_id, code, challenge_id } = body;

    if (!factor_id || !code || !challenge_id) {
      return NextResponse.json(
        { error: 'factor_id, code, and challenge_id are required' },
        { status: 400 }
      );
    }

    // Validate code format (6 digits)
    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { error: 'Code must be 6 digits' },
        { status: 400 }
      );
    }

    const { data, error } = await verifyMobile2FA(factor_id, code, challenge_id);

    if (error || !data) {
      return NextResponse.json(
        { error: error || '2FA verification failed' },
        { status: 401 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Mobile 2FA verification error:', error);
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
