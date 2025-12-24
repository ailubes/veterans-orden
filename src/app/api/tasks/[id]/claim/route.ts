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
      .select('id')
      .eq('clerk_id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Check if task exists and is available
    const { data: task } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .single();

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    if (task.status !== 'open') {
      return NextResponse.json({ error: 'Task is not available' }, { status: 400 });
    }

    if (task.assignee_id) {
      return NextResponse.json({ error: 'Task already claimed' }, { status: 400 });
    }

    // Claim the task
    const { error: updateError } = await supabase
      .from('tasks')
      .update({
        assignee_id: profile.id,
        status: 'in_progress',
        updated_at: new Date().toISOString(),
      })
      .eq('id', taskId);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Task claim error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
