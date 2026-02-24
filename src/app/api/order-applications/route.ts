import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

/*
 * Ensure the order_applications table exists in Supabase:
 *
 * CREATE TABLE IF NOT EXISTS order_applications (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   name TEXT NOT NULL,
 *   contact TEXT NOT NULL,
 *   applicant_status TEXT NOT NULL,
 *   motivation TEXT,
 *   submitted_at TIMESTAMPTZ DEFAULT NOW(),
 *   reviewed_at TIMESTAMPTZ,
 *   admin_notes TEXT,
 *   review_status TEXT DEFAULT 'pending'
 * );
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, contact, applicant_status, motivation } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "Введіть ім'я та прізвище" }, { status: 400 });
    }
    if (!contact?.trim()) {
      return NextResponse.json({ error: 'Введіть контактні дані' }, { status: 400 });
    }
    if (!applicant_status) {
      return NextResponse.json({ error: 'Оберіть ваш статус' }, { status: 400 });
    }

    // Use anon key — RLS policy permits anonymous inserts to order_applications
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false } }
    );

    const { error } = await supabase.from('order_applications').insert({
      name: name.trim(),
      contact: contact.trim(),
      applicant_status,
      motivation: motivation?.trim() || null,
    });

    if (error) {
      console.error('order_applications insert error:', error);
      return NextResponse.json({ error: 'Помилка збереження заявки' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('order-applications route error:', err);
    return NextResponse.json({ error: 'Внутрішня помилка сервера' }, { status: 500 });
  }
}
