import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: taskId } = await params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's database ID
    const { data: profile } = await supabase
      .from('users')
      .select('id, points')
      .eq('clerk_id', user.id)
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

    // Get proof URL if provided
    const body = await request.json().catch(() => ({}));
    const { proofUrl } = body;

    if (task.requires_proof && !proofUrl) {
      return NextResponse.json({ error: 'Proof required' }, { status: 400 });
    }

    // Complete the task
    const { error: updateError } = await supabase
      .from('tasks')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        proof_url: proofUrl || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', taskId);

    if (updateError) throw updateError;

    // Award points to user
    const taskPoints = task.points || 0;
    if (taskPoints > 0) {
      await supabase
        .from('users')
        .update({
          points: (profile.points || 0) + taskPoints,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id);
    }

    return NextResponse.json({ success: true, pointsEarned: taskPoints });
  } catch (error) {
    console.error('Task complete error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
