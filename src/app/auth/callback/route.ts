import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const next = requestUrl.searchParams.get('next');
  const type = requestUrl.searchParams.get('type');
  const token_hash = requestUrl.searchParams.get('token_hash');
  const error = requestUrl.searchParams.get('error');
  const error_description = requestUrl.searchParams.get('error_description');

  console.log('Auth callback:', {
    url: requestUrl.href,
    type,
    token_hash: token_hash ? 'present' : null,
    error,
    error_description,
  });

  // Handle auth errors from Supabase
  if (error) {
    console.error('Auth callback error:', error, error_description);
    return NextResponse.redirect(
      new URL(`/sign-in?error=${error}`, requestUrl.origin)
    );
  }

  // Handle token_hash flow (from admin.generateLink)
  if (token_hash && type) {
    console.log('Token hash flow detected, verifying OTP');
    const supabase = await createClient();

    const { error: verifyError } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as any,
    });

    if (verifyError) {
      console.error('Error verifying OTP:', verifyError);
      return NextResponse.redirect(
        new URL('/sign-in?error=verification_error', requestUrl.origin)
      );
    }

    // For recovery flow, redirect to update password
    if (type === 'recovery') {
      console.log('Recovery verified, redirecting to /update-password');
      return NextResponse.redirect(new URL('/update-password', requestUrl.origin));
    }

    // Other flows redirect to dashboard
    return NextResponse.redirect(new URL('/dashboard', requestUrl.origin));
  }

  // Handle PKCE flow — exchange code for session
  const code = requestUrl.searchParams.get('code');
  const supabase = await createClient();

  if (code) {
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (exchangeError) {
      console.error('Code exchange error:', exchangeError);
      return NextResponse.redirect(
        new URL('/sign-in?error=auth_callback_error', requestUrl.origin)
      );
    }
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    console.error('No user found after callback');
    return NextResponse.redirect(
      new URL('/sign-in?error=auth_callback_error', requestUrl.origin)
    );
  }

  console.log('User authenticated via PKCE flow');

  // Check if this is a password recovery flow
  if (type === 'recovery') {
    console.log('Password recovery flow detected, redirecting to /update-password');
    return NextResponse.redirect(new URL('/update-password', requestUrl.origin));
  }

  // Regular sign-in - redirect to dashboard or specified next URL
  const redirectUrl = next || '/dashboard';
  return NextResponse.redirect(new URL(redirectUrl, requestUrl.origin));
}
