import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * POST /api/telegram/send
 * Internal endpoint for admin-triggered direct message sends.
 * Requires x-bot-secret header.
 */
export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-bot-secret');
  const expectedSecret = process.env.TELEGRAM_BOT_SECRET;

  if (!expectedSecret || secret !== expectedSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { telegram_id: number; text: string; parse_mode?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { telegram_id, text, parse_mode = 'HTML' } = body;
  if (!telegram_id || !text) {
    return NextResponse.json({ error: 'telegram_id and text are required' }, { status: 400 });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return NextResponse.json({ error: 'Bot not configured' }, { status: 500 });
  }

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: telegram_id, text, parse_mode }),
  });

  const data = await res.json();
  if (!res.ok) {
    return NextResponse.json({ error: 'Telegram API error', details: data }, { status: 502 });
  }

  return NextResponse.json({ ok: true, result: data });
}
