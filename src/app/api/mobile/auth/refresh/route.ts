import { NextResponse } from 'next/server';
import { refreshMobileToken } from '@/lib/supabase/mobile-auth';
import { validateBody } from '@/lib/validation/validate';
import { refreshTokenSchema } from '@/lib/validation/schemas';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    // Validate request body
    const { data: validatedData, error: validationError } = await validateBody(
      request,
      refreshTokenSchema
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

    const { refresh_token } = validatedData;

    const { data, error } = await refreshMobileToken(refresh_token);

    if (error || !data) {
      return NextResponse.json(
        { error: error || 'Failed to refresh token' },
        { status: 401 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Mobile refresh error:', error);
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
