import { NextRequest, NextResponse } from 'next/server';
import { getAdminProfileFromRequest, checkReferralTreeAccess } from '@/lib/permissions';
import { isRegionalLeader } from '@/lib/permissions-utils';
import { createAuditLog, AUDIT_ACTIONS, AUDIT_ENTITY_TYPES } from '@/lib/audit';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { profile: adminProfile, auth } = await getAdminProfileFromRequest(request);
    const supabase = auth.supabase;

    if (!adminProfile) {
      return NextResponse.json(
        { error: 'Unauthorized - admin access required' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { action, feedback } = body;

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "approve" or "reject"' },
        { status: 400 }
      );
    }

    // Get submission with task and user details
    const { data: submission, error: fetchError } = await supabase
      .from('task_submissions')
      .select(`
        *,
        task:tasks!task_submissions_task_id_fkey(id, title, points),
        user:users!task_submissions_user_id_fkey(id, first_name, last_name, points)
      `)
      .eq('id', id)
      .single();

    if (fetchError || !submission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      );
    }

    // Check if submission is already reviewed
    if (submission.status !== 'pending') {
      return NextResponse.json(
        { error: 'Submission already reviewed' },
        { status: 400 }
      );
    }

    // Regional leaders can only review submissions from their referral tree
    if (isRegionalLeader(adminProfile.role)) {
      const hasAccess = await checkReferralTreeAccess(
        adminProfile.id,
        submission.user_id,
        supabase
      );
      if (!hasAccess) {
        return NextResponse.json(
          { error: 'You can only review submissions from members in your referral tree' },
          { status: 403 }
        );
      }
    }

    const taskPoints = submission.task?.points || 0;
    const newStatus = action === 'approve' ? 'approved' : 'rejected';

    // Update submission
    const { error: updateError } = await supabase
      .from('task_submissions')
      .update({
        status: newStatus,
        reviewed_by: adminProfile.id,
        reviewed_at: new Date().toISOString(),
        feedback: feedback || null,
        points_awarded: action === 'approve' ? taskPoints : 0,
      })
      .eq('id', id);

    if (updateError) {
      console.error('Submission update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update submission' },
        { status: 500 }
      );
    }

    // Update task status
    const newTaskStatus = action === 'approve' ? 'completed' : 'in_progress';
    const { error: taskUpdateError } = await supabase
      .from('tasks')
      .update({
        status: newTaskStatus,
        completed_at: action === 'approve' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', submission.task_id);

    if (taskUpdateError) {
      console.error('Task update error:', taskUpdateError);
    }

    // Award points if approved
    if (action === 'approve' && taskPoints > 0) {
      const currentPoints = submission.user?.points || 0;
      const { error: pointsError } = await supabase
        .from('users')
        .update({
          points: currentPoints + taskPoints,
          updated_at: new Date().toISOString(),
        })
        .eq('id', submission.user_id);

      if (pointsError) {
        console.error('Points update error:', pointsError);
      }
    }

    // Create notification for user
    const notificationTitle = action === 'approve'
      ? 'Завдання підтверджено!'
      : 'Завдання потребує доопрацювання';

    const notificationMessage = action === 'approve'
      ? `Ваше виконання завдання "${submission.task?.title}" підтверджено. Вам нараховано +${taskPoints} балів!`
      : `Ваше виконання завдання "${submission.task?.title}" відхилено.${feedback ? ` Коментар: ${feedback}` : ''}`;

    // Create notification
    const { data: notification, error: notifError } = await supabase
      .from('notifications')
      .insert({
        title: notificationTitle,
        message: notificationMessage,
        type: action === 'approve' ? 'success' : 'warning',
        sender_id: adminProfile.id,
      })
      .select('id')
      .single();

    if (!notifError && notification) {
      await supabase.from('notification_recipients').insert({
        notification_id: notification.id,
        user_id: submission.user_id,
      });
    }

    // Create audit log
    await createAuditLog({
      userId: adminProfile.id,
      action: action === 'approve' ? AUDIT_ACTIONS.APPROVE_SUBMISSION : AUDIT_ACTIONS.REJECT_SUBMISSION,
      entityType: AUDIT_ENTITY_TYPES.TASK,
      entityId: submission.task_id,
      oldData: { status: 'pending' },
      newData: { status: newStatus, feedback, points_awarded: action === 'approve' ? taskPoints : 0 },
      ipAddress: request.headers.get('x-forwarded-for'),
      userAgent: request.headers.get('user-agent'),
    });

    return NextResponse.json({
      success: true,
      message: action === 'approve'
        ? `Завдання підтверджено, нараховано ${taskPoints} балів`
        : 'Завдання відхилено',
      pointsAwarded: action === 'approve' ? taskPoints : 0,
    });
  } catch (error) {
    console.error('Submission review error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
