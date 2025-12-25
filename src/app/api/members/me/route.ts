import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/get-user';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { user, supabase, error: authError } = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json({ error: authError || 'Unauthorized' }, { status: 401 });
    }

    // Get user profile from database
    const { data: member, error: dbError } = await supabase
      .from('users')
      .select(
        `
        *,
        oblast:oblasts(id, name, code)
      `
      )
      .eq('clerk_id', user.id)
      .single();

    if (dbError && dbError.code !== 'PGRST116') {
      // PGRST116 = no rows returned
      console.error('Error fetching member:', dbError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    // If no member found, return basic info from auth
    if (!member) {
      return NextResponse.json({
        id: user.id,
        email: user.email,
        firstName: user.user_metadata?.first_name,
        lastName: user.user_metadata?.last_name,
        isOnboarded: false,
      });
    }

    return NextResponse.json({
      ...member,
      isOnboarded: true,
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { user, supabase, error: authError } = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json({ error: authError || 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { firstName, lastName, city, oblastId } = body;

    // Update user profile
    const { data, error: dbError } = await supabase
      .from('users')
      .update({
        first_name: firstName,
        last_name: lastName,
        city,
        oblast_id: oblastId,
        updated_at: new Date().toISOString(),
      })
      .eq('clerk_id', user.id)
      .select()
      .single();

    if (dbError) {
      console.error('Error updating member:', dbError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
