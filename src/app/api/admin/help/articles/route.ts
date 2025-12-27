import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserWithProfile } from '@/lib/auth/get-user';

/**
 * POST /api/admin/help/articles
 * Create a new help article
 */
export async function POST(request: NextRequest) {
  try {
    const { user, profile, supabase, error } = await getAuthenticatedUserWithProfile(request);

    if (!user || error) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
    }

    // Verify admin/leader role
    if (!profile || !['admin', 'leader', 'super_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
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
    const { data: article, error: dbError } = await supabase
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
        author_id: profile.id,
        published_at: status === 'published' ? new Date().toISOString() : null,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Error:', error);
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({ article }, { status: 201 });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
