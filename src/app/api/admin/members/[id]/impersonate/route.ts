import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAdminProfile } from '@/lib/permissions';
import { createAuditLog, AUDIT_ACTIONS, AUDIT_ENTITY_TYPES } from '@/lib/audit';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

/**
 * POST /api/admin/members/[id]/impersonate
 * Start impersonating a member (super_admin only)
 * Body: { reason: string }
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();

    // Check admin access (only super_admin can impersonate)
    const adminProfile = await getAdminProfile();
    if (!adminProfile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (adminProfile.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Only super admins can impersonate users' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { reason } = body;

    if (!reason || typeof reason !== 'string' || reason.trim().length === 0) {
      return NextResponse.json(
        { error: 'Reason is required for impersonation' },
        { status: 400 }
      );
    }

    // Get target member data
    const { data: targetMember, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !targetMember) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    // Prevent impersonating other admins
    const adminRoles = ['admin', 'super_admin', 'regional_leader'];
    if (adminRoles.includes(targetMember.role)) {
      return NextResponse.json(
        { error: 'Cannot impersonate admin users' },
        { status: 403 }
      );
    }

    // Create impersonation session record
    const { data: impersonationSession, error: sessionError } = await supabase
      .from('impersonation_sessions')
      .insert({
        admin_id: adminProfile.id,
        target_user_id: id,
        reason: reason.trim(),
        started_at: new Date().toISOString(),
        is_active: true,
      })
      .select()
      .single();

    if (sessionError) {
      console.error('[POST /api/admin/members/[id]/impersonate] Session error:', sessionError);
      return NextResponse.json(
        { error: 'Failed to create impersonation session' },
        { status: 500 }
      );
    }

    // Create audit log
    await createAuditLog({
      userId: adminProfile.id,
      action: AUDIT_ACTIONS.IMPERSONATE_START,
      entityType: AUDIT_ENTITY_TYPES.USER,
      entityId: id,
      metadata: {
        reason,
        session_id: impersonationSession.id,
        target_user: {
          id: targetMember.id,
          name: `${targetMember.first_name} ${targetMember.last_name}`,
          email: targetMember.email,
        },
      },
      ipAddress: request.headers.get('x-forwarded-for'),
      userAgent: request.headers.get('user-agent'),
    });

    return NextResponse.json(
      {
        data: {
          session: impersonationSession,
          targetMember: {
            id: targetMember.id,
            first_name: targetMember.first_name,
            last_name: targetMember.last_name,
            email: targetMember.email,
            role: targetMember.role,
          },
        },
        message: 'Impersonation session created successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[POST /api/admin/members/[id]/impersonate]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/members/[id]/impersonate
 * End impersonation session
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();

    // Check admin access
    const adminProfile = await getAdminProfile();
    if (!adminProfile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find and end active impersonation session
    const { data: session, error: fetchError } = await supabase
      .from('impersonation_sessions')
      .select('*')
      .eq('admin_id', adminProfile.id)
      .eq('target_user_id', id)
      .eq('is_active', true)
      .single();

    if (fetchError || !session) {
      return NextResponse.json(
        { error: 'No active impersonation session found' },
        { status: 404 }
      );
    }

    // End session
    const { error: updateError } = await supabase
      .from('impersonation_sessions')
      .update({
        ended_at: new Date().toISOString(),
        is_active: false,
      })
      .eq('id', session.id);

    if (updateError) {
      console.error('[DELETE /api/admin/members/[id]/impersonate] Update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to end impersonation session' },
        { status: 500 }
      );
    }

    // Create audit log
    await createAuditLog({
      userId: adminProfile.id,
      action: AUDIT_ACTIONS.IMPERSONATE_END,
      entityType: AUDIT_ENTITY_TYPES.USER,
      entityId: id,
      metadata: {
        session_id: session.id,
        duration_minutes: Math.round(
          (new Date().getTime() - new Date(session.started_at).getTime()) / 1000 / 60
        ),
      },
      ipAddress: request.headers.get('x-forwarded-for'),
      userAgent: request.headers.get('user-agent'),
    });

    return NextResponse.json(
      {
        message: 'Impersonation session ended successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[DELETE /api/admin/members/[id]/impersonate]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
