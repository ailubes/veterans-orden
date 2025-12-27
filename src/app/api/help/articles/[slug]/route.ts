import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { ArticleDetailResponse } from '@/lib/help/types';

interface RouteContext {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * GET /api/help/articles/[slug]
 * Get a single help article by slug with related articles
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;
    const supabase = await createClient();

    // Get the article
    const { data: article, error: articleError } = await supabase
      .from('help_articles')
      .select(`
        *,
        category:help_categories!inner(
          id,
          name_uk,
          name_en,
          slug,
          icon,
          description
        ),
        author:users!help_articles_author_id_fkey(
          id,
          first_name,
          last_name,
          avatar_url
        )
      `)
      .eq('slug', slug)
      .eq('status', 'published')
      .single();

    if (articleError || !article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    // Increment view count (fire and forget)
    void (async () => {
      try {
        await supabase
          .from('help_articles')
          .update({ view_count: (article.view_count || 0) + 1 })
          .eq('id', article.id);
      } catch (err) {
        console.error('Failed to increment view count:', err);
      }
    })();

    // Get related articles
    let relatedArticles: any[] = [];

    if (article.related_article_ids && Array.isArray(article.related_article_ids) && article.related_article_ids.length > 0) {
      // Get articles by IDs
      const { data: relatedByIds } = await supabase
        .from('help_articles')
        .select(`
          id,
          title,
          slug,
          excerpt,
          view_count,
          category:help_categories!inner(name_uk, icon)
        `)
        .in('id', article.related_article_ids)
        .eq('status', 'published')
        .limit(3);

      relatedArticles = relatedByIds || [];
    }

    // If we don't have enough related articles, get more from the same category
    if (relatedArticles.length < 3) {
      const { data: sameCategoryArticles } = await supabase
        .from('help_articles')
        .select(`
          id,
          title,
          slug,
          excerpt,
          view_count,
          category:help_categories!inner(name_uk, icon)
        `)
        .eq('category_id', article.category_id)
        .eq('status', 'published')
        .neq('id', article.id)
        .order('view_count', { ascending: false })
        .limit(3 - relatedArticles.length);

      if (sameCategoryArticles) {
        relatedArticles = [...relatedArticles, ...sameCategoryArticles];
      }
    }

    const response: ArticleDetailResponse = {
      article,
      relatedArticles: relatedArticles.slice(0, 3), // Max 3 related articles
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[GET /api/help/articles/[slug]]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
