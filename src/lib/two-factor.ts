import * as OTPAuth from 'otpauth';

/**
 * Generate a new 2FA secret for a user
 */
export function generate2FASecret(userEmail: string) {
  const secret = new OTPAuth.Secret({ size: 20 });

  const totp = new OTPAuth.TOTP({
    issuer: 'Мережа Вільних Людей',
    label: userEmail,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret,
  });

  return {
    secret: secret.base32,
    uri: totp.toString(),
    qrcode: totp.toString(), // This will be used to generate QR code
  };
}

/**
 * Verify a 2FA code
 */
export function verify2FACode(secret: string, token: string): boolean {
  try {
    const totp = new OTPAuth.TOTP({
      issuer: 'Мережа Вільних Людей',
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(secret),
    });

    // Validate token with a window of ±1 period (30 seconds before/after)
    const delta = totp.validate({ token, window: 1 });

    return delta !== null;
  } catch (error) {
    console.error('2FA verification error:', error);
    return false;
  }
}

/**
 * Generate backup codes for 2FA recovery
 */
export function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = [];

  for (let i = 0; i < count; i++) {
    // Generate 8-character alphanumeric code
    const code = Array.from({ length: 8 }, () =>
      '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 36)]
    ).join('');

    codes.push(code);
  }

  return codes;
}
