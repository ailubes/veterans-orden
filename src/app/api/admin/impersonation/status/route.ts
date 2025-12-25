import { getAdminProfileFromRequest } from '@/lib/permissions';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// GET - Check if there's an active impersonation session
export async function GET(request: NextRequest) {
  try {
    const { profile: adminProfile, auth } = await getAdminProfileFromRequest(request);
    const supabase = auth.supabase;

    const cookieStore = await cookies();
    const sessionId = cookieStore.get('impersonation_session_id')?.value;

    if (!sessionId) {
      return NextResponse.json({ session: null });
    }

    // Get session details
    const { data: session, error } = await supabase
      .from('impersonation_sessions')
      .select(
        `
        id,
        admin_id,
        target_user_id,
        started_at,
        is_active,
        target_user:users!impersonation_sessions_target_user_id_fkey(
          id,
          first_name,
          last_name,
          email
        )
      `
      )
      .eq('id', sessionId)
      .eq('admin_id', adminProfile.id)
      .eq('is_active', true)
      .single();

    if (error || !session) {
      // Clear invalid cookie
      cookieStore.delete('impersonation_session_id');
      cookieStore.delete('impersonation_target_user_id');
      return NextResponse.json({ session: null });
    }

    // Check if session has expired (1 hour)
    const startedAt = new Date(session.started_at).getTime();
    const now = Date.now();
    const elapsed = (now - startedAt) / 1000 / 60; // minutes

    if (elapsed > 60) {
      // Session expired, end it
      await supabase
        .from('impersonation_sessions')
        .update({
          ended_at: new Date().toISOString(),
          is_active: false,
        })
        .eq('id', sessionId);

      cookieStore.delete('impersonation_session_id');
      cookieStore.delete('impersonation_target_user_id');

      return NextResponse.json({ session: null, expired: true });
    }

    // Format response
    const targetUser = Array.isArray(session.target_user)
      ? session.target_user[0]
      : session.target_user;

    return NextResponse.json({
      session: {
        id: session.id,
        target_user: {
          id: targetUser.id,
          name: `${targetUser.first_name} ${targetUser.last_name}`,
          email: targetUser.email,
        },
        started_at: session.started_at,
      },
    });
  } catch (error) {
    console.error('[Impersonation Status Error]', error);
    return NextResponse.json({ session: null }, { status: 500 });
  }
}
