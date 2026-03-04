import { NextRequest, NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/auth/get-user';

export const dynamic = 'force-dynamic';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { isAdmin, supabase, error: authError } = await requireAdminUser(request);
    if (!isAdmin) {
      return NextResponse.json({ error: authError || 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { category, title, description, contact, address, region, is_free, is_active } = body;

    const { data, error } = await supabase
      .from('veteran_resources')
      .update({
        category,
        title,
        description,
        contact,
        address,
        region,
        is_free,
        is_active,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ resource: data });
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }
    console.error('Admin resources PUT error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { isAdmin, supabase, error: authError } = await requireAdminUser(request);
    if (!isAdmin) {
      return NextResponse.json({ error: authError || 'Forbidden' }, { status: 403 });
    }

    const { error } = await supabase
      .from('veteran_resources')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }
    console.error('Admin resources DELETE error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
