import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserWithProfile } from '@/lib/auth/get-user';
import { generateCode, storeLinkCode } from '@/lib/telegram/utils';

export const dynamic = 'force-dynamic';

/**
 * POST /api/telegram/link
 * Generates a 6-digit link code for the authenticated user to type in the bot.
 * Code expires in 15 minutes.
 */
export async function POST(request: NextRequest) {
  const { user, profile } = await getAuthenticatedUserWithProfile(request);

  if (!user || !profile) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const code = generateCode(6);
  storeLinkCode(code, profile.id);

  return NextResponse.json({ code });
}
