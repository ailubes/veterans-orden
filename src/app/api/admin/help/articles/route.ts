import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/lib/db/supabase-server';

/**
 * POST /api/admin/help/articles
 * Create a new help article
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    // Verify admin/leader role
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('clerk_id', userId)
      .single();

    if (!userData || !['admin', 'leader'].includes(userData.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get current user ID for authorId
    const { data: currentUser } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single();

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const {
      categoryId,
      title,
      slug,
      content,
      excerpt,
      videoUrl,
      keywords,
      audience,
      metaTitle,
      metaDescription,
      relatedArticleIds,
      status,
    } = body;

    // Validate required fields
    if (!categoryId || !title || !slug || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: categoryId, title, slug, content' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const { data: existingArticle } = await supabase
      .from('help_articles')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existingArticle) {
      return NextResponse.json(
        { error: 'Article with this slug already exists' },
        { status: 409 }
      );
    }

    // Create article
    const { data: article, error } = await supabase
      .from('help_articles')
      .insert({
        category_id: categoryId,
        title,
        slug,
        content,
        excerpt: excerpt || null,
        video_url: videoUrl || null,
        keywords: keywords || [],
        audience: audience || 'all',
        meta_title: metaTitle || null,
        meta_description: metaDescription || null,
        related_article_ids: relatedArticleIds || [],
        status: status || 'draft',
        author_id: currentUser.id,
        published_at: status === 'published' ? new Date().toISOString() : null,
      })
      .select()
      .single();

    if (error) {
      console.error('[Admin Create Article] Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ article }, { status: 201 });
  } catch (error) {
    console.error('[Admin Create Article] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
