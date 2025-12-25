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

    // Get existing article for permission check and audit log
    const { data: existingArticle, error: fetchError } = await supabase
      .from('news_articles')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existingArticle) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    // Check permissions - super_admin, admin, or regional_leader who created it
    const canEdit =
      adminProfile.role === 'super_admin' ||
      adminProfile.role === 'admin' ||
      (adminProfile.role === 'regional_leader' &&
        existingArticle.author_id === adminProfile.id);

    if (!canEdit) {
      return NextResponse.json(
        { error: 'Forbidden - insufficient permissions' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();

    const {
      title,
      slug,
      excerpt,
      content,
      category,
      status,
      featured_image_url,
      shouldSetPublishedAt,
    } = body;

    // Validate required fields
    if (!title || !content || !slug) {
      return NextResponse.json(
        { error: 'Title, content, and slug are required' },
        { status: 400 }
      );
    }

    // Build update object
    const updateData: any = {
      title,
      slug,
      excerpt,
      content,
      category,
      status,
      featured_image_url,
      updated_at: new Date().toISOString(),
    };

    // Set published_at if status is being changed to published
    if (
      shouldSetPublishedAt &&
      status === 'published' &&
      !existingArticle.published_at
    ) {
      updateData.published_at = new Date().toISOString();
    }

    // Update article
    const { data: updatedArticle, error: updateError } = await supabase
      .from('news_articles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('News update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update article' },
        { status: 500 }
      );
    }

    // Create audit log
    await createAuditLog({
      userId: adminProfile.id,
      action: AUDIT_ACTIONS.UPDATE_NEWS,
      entityType: AUDIT_ENTITY_TYPES.NEWS,
      entityId: id,
      oldData: existingArticle,
      newData: updatedArticle,
      ipAddress: request.headers.get('x-forwarded-for'),
      userAgent: request.headers.get('user-agent'),
    });

    return NextResponse.json(updatedArticle, { status: 200 });
  } catch (error) {
    console.error('News PATCH error:', error);
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

    // Only super_admin can delete news
    if (adminProfile.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Forbidden - only super admins can delete news' },
        { status: 403 }
      );
    }

    // Get article for audit log
    const { data: article, error: fetchError } = await supabase
      .from('news_articles')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    // Delete article
    const { error: deleteError } = await supabase
      .from('news_articles')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('News delete error:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete article' },
        { status: 500 }
      );
    }

    // Create audit log
    await createAuditLog({
      userId: adminProfile.id,
      action: AUDIT_ACTIONS.DELETE_NEWS,
      entityType: AUDIT_ENTITY_TYPES.NEWS,
      entityId: id,
      oldData: article,
      ipAddress: request.headers.get('x-forwarded-for'),
      userAgent: request.headers.get('user-agent'),
    });

    return NextResponse.json(
      { message: 'Article deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('News DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
