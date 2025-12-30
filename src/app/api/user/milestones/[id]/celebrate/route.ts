import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/user/milestones/[id]/celebrate
 * Marks a milestone as celebrated
 */
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database
    const { data: dbUser, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', authUser.id)
      .single();

    if (userError || !dbUser) {
      console.error('[Celebrate] Error fetching user:', userError);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const milestoneId = params.id;

    // Verify milestone belongs to user and update it
    const { data: milestone, error: updateError } = await supabase
      .from('progression_milestones')
      .update({ is_celebrated: true })
      .eq('id', milestoneId)
      .eq('user_id', dbUser.id)
      .select()
      .single();

    if (updateError) {
      if (updateError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Milestone not found or does not belong to user' },
          { status: 404 }
        );
      }
      console.error('[Celebrate] Error updating milestone:', updateError);
      return NextResponse.json(
        { error: 'Failed to celebrate milestone' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: milestone.id,
        type: milestone.milestone_type,
        title: milestone.title_uk,
        isCelebrated: milestone.is_celebrated,
      },
    });

  } catch (error) {
    console.error('[Celebrate] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
