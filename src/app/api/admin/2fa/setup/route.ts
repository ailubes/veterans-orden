import { NextResponse } from 'next/server';
import { getAdminProfileFromRequest } from '@/lib/permissions';
import { generate2FASecret, generateBackupCodes } from '@/lib/two-factor';

export const dynamic = 'force-dynamic';

/**
 * Initialize 2FA setup - generates secret and QR code
 */
export async function POST(request: Request) {
  try {
    const { profile: adminProfile, auth } = await getAdminProfileFromRequest(request);
    const supabase = auth.supabase;

    // Generate new 2FA secret
    const { secret, uri } = generate2FASecret(adminProfile.email);

    // Generate backup codes
    const backupCodes = generateBackupCodes(10);

    // Store secret temporarily (not enabled yet)
    // Note: In production, encrypt the secret before storing
    const { error: updateError } = await supabase
      .from('users')
      .update({
        two_factor_secret: secret,
        two_factor_backup_codes: backupCodes,
      })
      .eq('id', adminProfile.id);

    if (updateError) {
      console.error('Error storing 2FA secret:', updateError);
      return NextResponse.json(
        { error: 'Failed to initialize 2FA' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      secret,
      qrcodeUri: uri,
      backupCodes,
    });
  } catch (error) {
    console.error('2FA setup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
