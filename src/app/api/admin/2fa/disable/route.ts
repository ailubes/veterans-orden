import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAdminProfile } from '@/lib/permissions';
import { verify2FACode } from '@/lib/two-factor';

export const dynamic = 'force-dynamic';

/**
 * Disable 2FA after verifying current code
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const adminProfile = await getAdminProfile();

    if (!adminProfile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { code } = await request.json();

    if (!code) {
      return NextResponse.json({ error: 'Code required' }, { status: 400 });
    }

    // Get user's secret
    const { data: user } = await supabase
      .from('users')
      .select('two_factor_secret, two_factor_enabled')
      .eq('id', adminProfile.id)
      .single();

    if (!user || !user.two_factor_enabled) {
      return NextResponse.json(
        { error: '2FA is not enabled' },
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

    // Disable 2FA and clear secret
    const { error: updateError } = await supabase
      .from('users')
      .update({
        two_factor_enabled: false,
        two_factor_secret: null,
        two_factor_backup_codes: null,
      })
      .eq('id', adminProfile.id);

    if (updateError) {
      console.error('Error disabling 2FA:', updateError);
      return NextResponse.json(
        { error: 'Failed to disable 2FA' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '2FA disabled successfully',
    });
  } catch (error) {
    console.error('2FA disable error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
