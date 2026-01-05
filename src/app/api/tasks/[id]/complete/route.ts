import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/get-user';
import { awardPoints } from '@/lib/points';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: taskId } = await params;
    const { user, supabase, error: authError } = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json({ error: authError || 'Unauthorized' }, { status: 401 });
    }

    // Get user's database ID
    const { data: profile } = await supabase
      .from('users')
      .select('id, points')
      .eq('auth_id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Check if task exists and is assigned to this user
    const { data: task } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .single();

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    if (task.assignee_id !== profile.id) {
      return NextResponse.json({ error: 'Task not assigned to you' }, { status: 403 });
    }

    if (task.status === 'completed') {
      return NextResponse.json({ error: 'Task already completed' }, { status: 400 });
    }

    // Get proof data if provided
    const body = await request.json().catch(() => ({}));
    const { proofType, proofUrl, proofImageUrl } = body;

    // If task requires proof, create a submission and set to pending review
    if (task.requires_proof) {
      if (!proofUrl && !proofImageUrl) {
        return NextResponse.json({ error: 'Proof required' }, { status: 400 });
      }

      // Create task submission record
      const { error: submissionError } = await supabase
        .from('task_submissions')
        .insert({
          task_id: taskId,
          user_id: profile.id,
          proof_type: proofType || (proofImageUrl ? 'image' : 'url'),
          proof_url: proofUrl || null,
          proof_image_url: proofImageUrl || null,
          status: 'pending',
        });

      if (submissionError) {
        console.error('Submission creation error:', submissionError);
        // If it's a unique constraint violation, the user already submitted
        if (submissionError.code === '23505') {
          return NextResponse.json({ error: 'Ви вже надіслали підтвердження для цього завдання' }, { status: 400 });
        }
        throw submissionError;
      }

      // Update task status to pending review
      const { error: updateError } = await supabase
        .from('tasks')
        .update({
          status: 'pending_review',
          proof_url: proofUrl || proofImageUrl || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', taskId);

      if (updateError) throw updateError;

      return NextResponse.json({
        success: true,
        message: 'Підтвердження надіслано на перевірку',
        pendingReview: true,
      });
    }

    // No proof required - complete immediately
    const { error: updateError } = await supabase
      .from('tasks')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', taskId);

    if (updateError) throw updateError;

    // Award points to user using points service
    const taskPoints = task.points || 0;
    if (taskPoints > 0) {
      try {
        await awardPoints({
          userId: profile.id,
          amount: taskPoints,
          type: 'earn_task',
          referenceType: 'task',
          referenceId: taskId,
          description: `Виконання завдання: ${task.title}`,
        });
      } catch (pointsError) {
        console.error('Points award error:', pointsError);
        // Continue even if points fail - task is still completed
      }
    }

    return NextResponse.json({ success: true, pointsEarned: taskPoints });
  } catch (error) {
    console.error('Task complete error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
