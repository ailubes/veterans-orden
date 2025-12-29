import { NextRequest, NextResponse } from 'next/server';
import { getAdminProfileFromRequest, canSuspendMembers } from '@/lib/permissions';
import { awardPoints } from '@/lib/points';
import { DEFAULT_POINTS } from '@/lib/points/constants';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/members/bulk-status
 * Bulk update member status (activate or suspend)
 */
export async function POST(request: NextRequest) {
  try {
    const { profile: adminProfile, auth } = await getAdminProfileFromRequest(request);
    const supabase = auth.supabase;

    const body = await request.json();
    const { memberIds, status } = body;

    if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
      return NextResponse.json(
        { error: 'Member IDs are required' },
        { status: 400 }
      );
    }

    if (!status || !['active', 'suspended'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be "active" or "suspended"' },
        { status: 400 }
      );
    }

    // Check permission for suspend
    if (status === 'suspended' && !canSuspendMembers(adminProfile.staff_role)) {
      return NextResponse.json(
        { error: 'You do not have permission to suspend members' },
        { status: 403 }
      );
    }

    // Get member data before update (to check previous status and referrers)
    const { data: membersBeforeUpdate } = await supabase
      .from('users')
      .select('id, status, referred_by_id, first_name, last_name')
      .in('id', memberIds);

    // Update member statuses
    const { error: updateError } = await supabase
      .from('users')
      .update({ status, updated_at: new Date().toISOString() })
      .in('id', memberIds);

    if (updateError) {
      console.error('Bulk status update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update member statuses' },
        { status: 500 }
      );
    }

    // Award referral points if activating users
    if (status === 'active' && membersBeforeUpdate) {
      for (const member of membersBeforeUpdate) {
        // Only award if user was not already active and has a referrer
        if (member.status !== 'active' && member.referred_by_id) {
          try {
            await awardPoints({
              userId: member.referred_by_id,
              amount: DEFAULT_POINTS.REFERRAL_SUCCESS,
              type: 'earn_referral',
              referenceType: 'user',
              referenceId: member.id,
              description: `Запрошення члена: ${member.first_name} ${member.last_name}`,
              createdById: adminProfile.id,
            });

            // Increment referral count
            const { data: referrer } = await supabase
              .from('users')
              .select('referral_count')
              .eq('id', member.referred_by_id)
              .single();

            if (referrer) {
              await supabase
                .from('users')
                .update({ referral_count: (referrer.referral_count || 0) + 1 })
                .eq('id', member.referred_by_id);
            }
          } catch (pointsError) {
            console.error('Referral points award error:', pointsError);
            // Continue even if points fail
          }
        }
      }
    }

    // Create audit log entry for each member
    const auditEntries = memberIds.map((memberId) => ({
      admin_id: adminProfile.id,
      action: `bulk_${status}`,
      entity_type: 'user',
      entity_id: memberId,
      metadata: { status },
    }));

    await supabase.from('audit_logs').insert(auditEntries);

    return NextResponse.json({
      success: true,
      message: `Successfully updated ${memberIds.length} members to ${status}`,
    });
  } catch (error) {
    console.error('[Bulk Status Update Error]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
