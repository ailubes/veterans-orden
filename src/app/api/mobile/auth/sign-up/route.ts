import { NextResponse } from 'next/server';
import { createMobileAccount } from '@/lib/supabase/mobile-auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, first_name, last_name } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

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
