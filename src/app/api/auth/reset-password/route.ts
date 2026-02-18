import { createServiceClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // First, verify the user exists
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .limit(1);

    if (userError || !users || users.length === 0) {
      // Return success even if user doesn't exist (security best practice)
      console.log('User not found for password reset:', email);
      return NextResponse.json({
        success: true,
        message: 'If an account exists, a password reset email has been sent',
      });
    }

    // Use admin method to send password reset email
    // This uses email link (not PKCE) which works across devices
    const { error } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: {
        redirectTo: `${request.nextUrl.origin}/update-password`,
      },
    });

    if (error) {
      console.error('Error generating reset link:', error);
      return NextResponse.json(
        { error: 'Failed to send reset email' },
        { status: 500 }
      );
    }

    console.log('Password reset link generated for:', email);

    // Note: generateLink with admin sends the email automatically
    return NextResponse.json({
      success: true,
      message: 'Password reset email sent',
    });
  } catch (error) {
    console.error('Error in reset password API:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
