import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAdminProfile } from '@/lib/permissions';
import { createAuditLog, AUDIT_ACTIONS, AUDIT_ENTITY_TYPES } from '@/lib/audit';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Check admin access
    const adminProfile = await getAdminProfile();
    if (!adminProfile) {
      return NextResponse.json(
        { error: 'Unauthorized - admin access required' },
        { status: 401 }
      );
    }

    // Only super_admin and admin can edit tasks
    if (!['super_admin', 'admin'].includes(adminProfile.role)) {
      return NextResponse.json(
        { error: 'Forbidden - insufficient permissions' },
        { status: 403 }
      );
    }

    // Get existing task for audit log
    const { data: existingTask, error: fetchError } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Parse request body
    const body = await request.json();

    const {
      title,
      description,
      requirements,
      status,
      priority,
      assigned_to,
      due_date,
      points_reward,
      requires_proof,
    } = body;

    // Validate required fields
    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      );
    }

    // Build update object
    const updateData: any = {
      title,
      description,
      requirements,
      status,
      priority,
      assigned_to,
      due_date,
      points_reward: points_reward || 0,
      requires_proof: requires_proof || false,
      updated_at: new Date().toISOString(),
    };

    // Update task
    const { data: updatedTask, error: updateError } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Task update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update task' },
        { status: 500 }
      );
    }

    // Create audit log
    await createAuditLog({
      userId: adminProfile.id,
      action: AUDIT_ACTIONS.UPDATE_TASK,
      entityType: AUDIT_ENTITY_TYPES.TASK,
      entityId: id,
      oldData: existingTask,
      newData: updatedTask,
      ipAddress: request.headers.get('x-forwarded-for'),
      userAgent: request.headers.get('user-agent'),
    });

    return NextResponse.json(updatedTask, { status: 200 });
  } catch (error) {
    console.error('Task PATCH error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Check admin access
    const adminProfile = await getAdminProfile();
    if (!adminProfile) {
      return NextResponse.json(
        { error: 'Unauthorized - admin access required' },
        { status: 401 }
      );
    }

    // Only super_admin can delete tasks
    if (adminProfile.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Forbidden - only super admins can delete tasks' },
        { status: 403 }
      );
    }

    // Get task for audit log
    const { data: task, error: fetchError } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Delete task
    const { error: deleteError } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Task delete error:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete task' },
        { status: 500 }
      );
    }

    // Create audit log
    await createAuditLog({
      userId: adminProfile.id,
      action: AUDIT_ACTIONS.DELETE_TASK,
      entityType: AUDIT_ENTITY_TYPES.TASK,
      entityId: id,
      oldData: task,
      ipAddress: request.headers.get('x-forwarded-for'),
      userAgent: request.headers.get('user-agent'),
    });

    return NextResponse.json(
      { message: 'Task deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Task DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
