import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

/**
 * Billing cron.
 *
 * As of 2026-06-13, payments no longer gate membership role advancement.
 * The role 'candidate' is reached via referral activity, not via payment,
 * so this cron no longer auto-charges users and no longer suspends users
 * for failing to renew a paid support tier.
 *
 * The cron is kept (and called by the same external schedule that previously
 * hit it) for two reasons:
 *   1. Backwards compatibility with operators that have the route pinned.
 *   2. A safety-net pass over process_pending_advancements() — the
 *      real-time trigger chain in 20260613000002_* usually advances the
 *      referrer immediately, but this guarantees no user is ever stuck
 *      if a trigger is bypassed (e.g. data backfill, manual SQL).
 *
 * It still requires CRON_SECRET authorization.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // ── Step 1: Disabled — auto-charge for paid support tiers ───────────────
  // Previously this loop created a recurring HUTKO charge for users whose
  // membership_paid_until was within 5 days. The loop is intentionally
  // removed: support-tier subscriptions are now voluntary and do not suspend
  // a user when they lapse. Membership roles are driven entirely by referral
  // activity (see supabase/migrations/20260613000001_* and 20260613000002_*).
  //
  // If a user with a voluntary support subscription wants to renew, they
  // can do so from the dashboard or /support page on their own initiative.

  // ── Step 2: Safety-net batch pass for pending advancements ──────────────
  // The new trigger trg_evaluate_referrer_advancement_* handles advancement
  // in real time, but process_pending_advancements() also handles edge
  // cases (e.g. users whose stats are stale due to data backfill).
  let advancedCount = 0;
  try {
    const result = await db.execute<{ user_id: string; from_role: string; to_role: string; advanced: boolean }>(
      sql`SELECT * FROM process_pending_advancements()`
    );
    advancedCount = Array.isArray(result) ? result.length : 0;
  } catch (error) {
    console.error('Billing cron: process_pending_advancements failed', error);
    // Don't fail the whole cron — the real-time triggers are the primary path.
  }

  return NextResponse.json({
    ok: true,
    auto_charge: 'disabled (membership no longer tied to payments)',
    suspension: 'disabled (membership no longer tied to payments)',
    advanced_in_batch: advancedCount,
  });
}
