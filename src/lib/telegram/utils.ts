// Phone normalization: accepts +380XXXXXXXXX or 0XXXXXXXXX → returns +380XXXXXXXXX
export function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 10 && digits.startsWith('0')) {
    return '+38' + digits;
  }
  if (digits.length === 12 && digits.startsWith('380')) {
    return '+' + digits;
  }
  if (digits.length === 11 && digits.startsWith('80')) {
    return '+3' + digits;
  }
  return null;
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function generateCode(length = 6): string {
  return Math.floor(Math.random() * 10 ** length)
    .toString()
    .padStart(length, '0');
}

// In-memory verification codes (email OTP): Map<email, { code, expiresAt }>
const verificationCodes = new Map<string, { code: string; expiresAt: number }>();

export function storeVerificationCode(email: string, code: string) {
  verificationCodes.set(email.toLowerCase(), {
    code,
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 min
  });
}

export function verifyCode(email: string, code: string): boolean {
  const entry = verificationCodes.get(email.toLowerCase());
  if (!entry) return false;
  if (Date.now() > entry.expiresAt) {
    verificationCodes.delete(email.toLowerCase());
    return false;
  }
  if (entry.code !== code.trim()) return false;
  verificationCodes.delete(email.toLowerCase());
  return true;
}

// In-memory link codes (account linking): Map<code, { userId, expiresAt }>
const linkCodes = new Map<string, { userId: string; expiresAt: number }>();

export function storeLinkCode(code: string, userId: string) {
  linkCodes.set(code, {
    userId,
    expiresAt: Date.now() + 15 * 60 * 1000, // 15 min
  });
}

export function verifyLinkCode(code: string): string | null {
  const entry = linkCodes.get(code.trim());
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    linkCodes.delete(code.trim());
    return null;
  }
  const { userId } = entry;
  linkCodes.delete(code.trim());
  return userId;
}

// Send email verification code (stub — uses console in dev, extend with Resend/etc. later)
export async function sendEmailVerificationCode(email: string, code: string) {
  console.log(`[TG Email OTP] To: ${email}, Code: ${code}`);
  // TODO: integrate email provider (Resend, SendGrid, etc.)
  // For now we just log — the bot will show the code in fallback message
}
