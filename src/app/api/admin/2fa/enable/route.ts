import { NextResponse } from 'next/server';
import { getAdminProfileFromRequest } from '@/lib/permissions';
import { verify2FACode } from '@/lib/two-factor';

export const dynamic = 'force-dynamic';

/**
 * Enable 2FA after verifying the initial code
 */
export async function POST(request: Request) {
  try {
    const { profile: adminProfile, auth } = await getAdminProfileFromRequest(request);
    const supabase = auth.supabase;

    const { code } = await request.json();

    if (!code) {
      return NextResponse.json({ error: 'Code required' }, { status: 400 });
    }

    // Get user's secret
    const { data: user } = await supabase
      .from('users')
      .select('two_factor_secret')
      .eq('id', adminProfile.id)
      .single();

    if (!user || !user.two_factor_secret) {
      return NextResponse.json(
        { error: '2FA not initialized. Call /setup first.' },
        { status: 400 }
      );
    }

    // Verify the code
    const isValid = verify2FACode(user.two_factor_secret, code);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      );
    }

    // Enable 2FA
    const { error: updateError } = await supabase
      .from('users')
      .update({ two_factor_enabled: true })
      .eq('id', adminProfile.id);

    if (updateError) {
      console.error('Error enabling 2FA:', updateError);
      return NextResponse.json(
        { error: 'Failed to enable 2FA' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '2FA enabled successfully',
    });
  } catch (error) {
    console.error('2FA enable error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
