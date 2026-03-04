import { NextRequest, NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/auth/get-user';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { isAdmin, supabase, error: authError } = await requireAdminUser(request);
    if (!isAdmin) {
      return NextResponse.json({ error: authError || 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { category, title, description, contact, address, region, is_free, is_active } = body;

    if (!category || !title) {
      return NextResponse.json({ error: 'category and title are required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('veteran_resources')
      .insert({ category, title, description, contact, address, region, is_free, is_active })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ resource: data }, { status: 201 });
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }
    console.error('Admin resources POST error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
