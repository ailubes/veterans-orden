import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAuthenticatedUser } from '@/lib/auth/get-user';

/**
 * POST /api/help/feedback
 * Submit feedback for a help article
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { articleId, isHelpful, comment } = body;

    if (!articleId || typeof isHelpful !== 'boolean') {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get authenticated user (optional - allow anonymous feedback)
    const { user } = await getAuthenticatedUser(request);
    let userId = null;

    if (user) {
      // Get user profile
      const { data: profile } = await supabase
        .from('users')
        .select('id')
        .eq('clerk_id', user.id)
        .single();

      userId = profile?.id || null;
    }

    // Insert feedback
    const { error: feedbackError } = await supabase
      .from('help_article_feedback')
      .insert({
        article_id: articleId,
        user_id: userId,
        is_helpful: isHelpful,
        comment: comment || null,
      });

    if (feedbackError) {
      throw feedbackError;
    }

    // Update article helpful/not helpful counts
    const { data: article } = await supabase
      .from('help_articles')
      .select('helpful_count, not_helpful_count')
      .eq('id', articleId)
      .single();

    if (article) {
      await supabase
        .from('help_articles')
        .update({
          helpful_count: isHelpful ? (article.helpful_count || 0) + 1 : article.helpful_count,
          not_helpful_count: !isHelpful ? (article.not_helpful_count || 0) + 1 : article.not_helpful_count,
        })
        .eq('id', articleId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[POST /api/help/feedback]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
