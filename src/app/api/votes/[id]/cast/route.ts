import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/get-user';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: voteId } = await params;
    const { user, supabase, error: authError } = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json({ error: authError || 'Unauthorized' }, { status: 401 });
    }

    // Get user's database ID, role and points
    const { data: profile } = await supabase
      .from('users')
      .select('id, role, points')
      .eq('clerk_id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Check if vote exists and is active
    const { data: vote } = await supabase
      .from('votes')
      .select('*, options:vote_options(*)')
      .eq('id', voteId)
      .single();

    if (!vote) {
      return NextResponse.json({ error: 'Vote not found' }, { status: 404 });
    }

    if (vote.status !== 'active') {
      return NextResponse.json({ error: 'Vote is not active' }, { status: 400 });
    }

    const now = new Date();
    if (new Date(vote.end_date) < now) {
      return NextResponse.json({ error: 'Vote has ended' }, { status: 400 });
    }

    // Check if user is eligible to vote
    const eligibleRoles = vote.eligible_roles as string[];
    if (eligibleRoles && !eligibleRoles.includes(profile.role)) {
      return NextResponse.json(
        { error: 'You are not eligible to vote' },
        { status: 403 }
      );
    }

    // Check if user has already voted
    const { data: existingVote } = await supabase
      .from('user_votes')
      .select('id')
      .eq('vote_id', voteId)
      .eq('user_id', profile.id)
      .single();

    if (existingVote) {
      return NextResponse.json(
        { error: 'You have already voted' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { optionId, rankedChoices } = body;

    // Validate option exists
    const option = vote.options.find((o: { id: string }) => o.id === optionId);
    if (!option) {
      return NextResponse.json({ error: 'Invalid option' }, { status: 400 });
    }

    // Cast vote
    const { error: castError } = await supabase.from('user_votes').insert({
      vote_id: voteId,
      user_id: profile.id,
      option_id: optionId,
      ranked_choices: rankedChoices || null,
      casted_at: new Date().toISOString(),
    });

    if (castError) throw castError;

    // Update vote option count
    await supabase
      .from('vote_options')
      .update({
        vote_count: (option.vote_count || 0) + 1,
      })
      .eq('id', optionId);

    // Update total vote count
    await supabase
      .from('votes')
      .update({
        total_votes: (vote.total_votes || 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', voteId);

    // Award points to user for voting
    await supabase
      .from('users')
      .update({
        points: (profile.points || 0) + 5, // 5 points for voting
        updated_at: new Date().toISOString(),
      })
      .eq('id', profile.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Vote cast error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
