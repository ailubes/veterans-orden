import { NextResponse } from 'next/server';
import { verifyMobile2FA } from '@/lib/supabase/mobile-auth';
import { validateBody } from '@/lib/validation/validate';
import { verify2FASchema } from '@/lib/validation/schemas';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    // Validate request body
    const { data: validatedData, error: validationError } = await validateBody(
      request,
      verify2FASchema
    );

    if (validationError) {
      return validationError;
    }

    if (!validatedData) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const { factor_id, code, challenge_id } = validatedData as any;

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
