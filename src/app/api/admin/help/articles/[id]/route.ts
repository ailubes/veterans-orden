import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/lib/db/supabase-server';

/**
 * PUT /api/admin/help/articles/[id]
 * Update an existing help article
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
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

    // Check if article exists
    const { data: existingArticle } = await supabase
      .from('help_articles')
      .select('id, slug, status, published_at')
      .eq('id', id)
      .single();

    if (!existingArticle) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    // Check if slug is being changed and if new slug already exists
    if (slug && slug !== existingArticle.slug) {
      const { data: slugCheck } = await supabase
        .from('help_articles')
        .select('id')
        .eq('slug', slug)
        .single();

      if (slugCheck) {
        return NextResponse.json(
          { error: 'Article with this slug already exists' },
          { status: 409 }
        );
      }
    }

    // Prepare update data
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (categoryId) updateData.category_id = categoryId;
    if (title) updateData.title = title;
    if (slug) updateData.slug = slug;
    if (content !== undefined) updateData.content = content;
    if (excerpt !== undefined) updateData.excerpt = excerpt || null;
    if (videoUrl !== undefined) updateData.video_url = videoUrl || null;
    if (keywords !== undefined) updateData.keywords = keywords || [];
    if (audience) updateData.audience = audience;
    if (metaTitle !== undefined) updateData.meta_title = metaTitle || null;
    if (metaDescription !== undefined) updateData.meta_description = metaDescription || null;
    if (relatedArticleIds !== undefined) updateData.related_article_ids = relatedArticleIds || [];

    // Handle status changes
    if (status !== undefined) {
      updateData.status = status;

      // Set published_at when transitioning to published
      if (status === 'published' && existingArticle.status !== 'published') {
        updateData.published_at = new Date().toISOString();
      }
    }

    // Update article
    const { data: article, error } = await supabase
      .from('help_articles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[Admin Update Article] Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ article });
  } catch (error) {
    console.error('[Admin Update Article] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/help/articles/[id]
 * Delete a help article
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    // Verify admin role (only admins can delete)
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('clerk_id', userId)
      .single();

    if (!userData || userData.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
    }

    const { id } = await params;

    // Check if article exists
    const { data: existingArticle } = await supabase
      .from('help_articles')
      .select('id')
      .eq('id', id)
      .single();

    if (!existingArticle) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    // Delete article
    const { error } = await supabase
      .from('help_articles')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[Admin Delete Article] Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Article deleted successfully' });
  } catch (error) {
    console.error('[Admin Delete Article] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
