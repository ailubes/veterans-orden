import { NextRequest, NextResponse } from 'next/server';
import { bot } from '@/lib/telegram/bot';

export const dynamic = 'force-dynamic';

// Initialize the bot once per process (lazy, so no API call at import time)
let initialized = false;
async function ensureInitialized() {
  if (!initialized) {
    await bot.init();
    initialized = true;
  }
}

/**
 * POST /api/telegram/webhook
 * Receives updates from Telegram. Validates secret token header.
 */
export async function POST(request: NextRequest) {
  // Validate webhook secret
  const secret = request.headers.get('x-telegram-bot-api-secret-token');
  const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET;

  if (!expectedSecret || secret !== expectedSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let update: unknown;
  try {
    update = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // Ensure bot is initialized (fetches botInfo from Telegram once)
  await ensureInitialized();

  // Handle update asynchronously — return 200 immediately
  bot.handleUpdate(update as Parameters<typeof bot.handleUpdate>[0]).catch((err) => {
    console.error('[TG Webhook] handleUpdate error:', err);
  });

  return NextResponse.json({ ok: true });
}
