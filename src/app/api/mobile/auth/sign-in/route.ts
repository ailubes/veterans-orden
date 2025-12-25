import { NextResponse } from 'next/server';
import { createMobileSession } from '@/lib/supabase/mobile-auth';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const { data, error } = await createMobileSession(email, password);

    if (error || !data) {
      return NextResponse.json(
        { error: error || 'Authentication failed' },
        { status: 401 }
      );
    }

    // Get user profile to include role in response
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${data.access_token}`,
        },
      },
    });

    const { data: profile } = await supabase
      .from('users')
      .select('id, role, first_name, last_name, status, membership_tier')
      .eq('clerk_id', data.user.id)
      .single();

    // Check if user has 2FA enabled
    const { data: mfaData } = await supabase.auth.mfa.listFactors();
    const has2FA = mfaData?.totp && mfaData.totp.length > 0;

    return NextResponse.json({
      ...data,
      user: {
        ...data.user,
        role: profile?.role || 'free_viewer',
        first_name: profile?.first_name,
        last_name: profile?.last_name,
        status: profile?.status,
        membership_tier: profile?.membership_tier,
        is_onboarded: !!profile,
      },
      requires_2fa: has2FA,
    });
  } catch (error) {
    console.error('Mobile sign-in error:', error);
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
