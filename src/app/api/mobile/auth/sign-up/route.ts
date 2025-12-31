import { NextResponse } from 'next/server';
import { createMobileAccount } from '@/lib/supabase/mobile-auth';
import { validateBody } from '@/lib/validation/validate';
import { signUpSchema } from '@/lib/validation/schemas';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    // Validate request body
    const { data: validatedData, error: validationError } = await validateBody(
      request,
      signUpSchema
    );

    if (validationError) {
      return validationError;
    }

    const { email, password, first_name, last_name } = validatedData;

    const { data, error, needsConfirmation } = await createMobileAccount(
      email,
      password,
      { first_name, last_name }
    );

    if (needsConfirmation) {
      return NextResponse.json({
        message: 'Please check your email to confirm your account',
        needs_confirmation: true,
      });
    }

    if (error || !data) {
      return NextResponse.json(
        { error: error || 'Registration failed' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ...data,
      user: {
        ...data.user,
        is_onboarded: false,
      },
    });
  } catch (error) {
    console.error('Mobile sign-up error:', error);
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
