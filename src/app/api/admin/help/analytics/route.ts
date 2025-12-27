import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserWithProfile } from '@/lib/auth/get-user';

/**
 * GET /api/admin/help/analytics
 * Get analytics data for help system
 */
export async function GET(request: NextRequest) {
  try {
    const { user, profile, supabase, error } = await getAuthenticatedUserWithProfile(request);

    if (!user || error) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
    }

    // Verify admin/leader role
    if (!profile || !['admin', 'leader', 'super_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get query parameters for date range
    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get('days') || '30');
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // 1. Article counts by status
    const { data: statusCounts } = await supabase
      .from('help_articles')
      .select('status');

    const statusSummary = {
      total: statusCounts?.length || 0,
      published: statusCounts?.filter((a: any) => a.status === 'published').length || 0,
      draft: statusCounts?.filter((a: any) => a.status === 'draft').length || 0,
      archived: statusCounts?.filter((a: any) => a.status === 'archived').length || 0,
    };

    // 2. Total views in period
    const { data: articlesWithViews } = await supabase
      .from('help_articles')
      .select('view_count');

    const totalViews = articlesWithViews?.reduce((sum: number, a: any) => sum + (a.view_count || 0), 0) || 0;

    // 3. Top 10 most viewed articles
    const { data: topViewedArticles } = await supabase
      .from('help_articles')
      .select(`
        id,
        title,
        slug,
        view_count,
        helpful_count,
        not_helpful_count,
        category:help_categories(name_uk)
      `)
      .eq('status', 'published')
      .order('view_count', { ascending: false })
      .limit(10);

    // 4. Calculate helpful rate for each article
    const articlesWithRates = topViewedArticles?.map((article: any) => {
      const totalFeedback = (article.helpful_count || 0) + (article.not_helpful_count || 0);
      const helpfulRate = totalFeedback > 0
        ? ((article.helpful_count || 0) / totalFeedback) * 100
        : null;

      return {
        ...article,
        totalFeedback,
        helpfulRate,
      };
    });

    // 5. Low-performing articles (< 50% helpful and at least 5 feedback entries)
    const { data: allArticles } = await supabase
      .from('help_articles')
      .select(`
        id,
        title,
        slug,
        view_count,
        helpful_count,
        not_helpful_count,
        category:help_categories(name_uk)
      `)
      .eq('status', 'published');

    const lowPerformingArticles = allArticles
      ?.map((article: any) => {
        const totalFeedback = (article.helpful_count || 0) + (article.not_helpful_count || 0);
        const helpfulRate = totalFeedback > 0
          ? ((article.helpful_count || 0) / totalFeedback) * 100
          : null;

        return {
          ...article,
          totalFeedback,
          helpfulRate,
        };
      })
      .filter((article: any) => article.totalFeedback >= 5 && article.helpfulRate !== null && article.helpfulRate < 50)
      .sort((a: any, b: any) => (a.helpfulRate || 0) - (b.helpfulRate || 0))
      .slice(0, 10) || [];

    // 6. Overall helpful rate
    const totalHelpful = allArticles?.reduce((sum: number, a: any) => sum + (a.helpful_count || 0), 0) || 0;
    const totalNotHelpful = allArticles?.reduce((sum: number, a: any) => sum + (a.not_helpful_count || 0), 0) || 0;
    const totalAllFeedback = totalHelpful + totalNotHelpful;
    const overallHelpfulRate = totalAllFeedback > 0
      ? (totalHelpful / totalAllFeedback) * 100
      : null;

    // 7. Recent feedback with comments
    const { data: recentFeedback } = await supabase
      .from('help_article_feedback')
      .select(`
        id,
        is_helpful,
        comment,
        created_at,
        article:help_articles(id, title, slug)
      `)
      .not('comment', 'is', null)
      .order('created_at', { ascending: false })
      .limit(10);

    // 8. Category performance
    const { data: categories } = await supabase
      .from('help_categories')
      .select(`
        id,
        name_uk,
        slug,
        articles:help_articles(
          id,
          view_count,
          helpful_count,
          not_helpful_count,
          status
        )
      `);

    const categoryPerformance = categories?.map((category: any) => {
      const publishedArticles = category.articles?.filter((a: any) => a.status === 'published') || [];
      const totalViews = publishedArticles.reduce((sum: number, a: any) => sum + (a.view_count || 0), 0);
      const totalHelpful = publishedArticles.reduce((sum: number, a: any) => sum + (a.helpful_count || 0), 0);
      const totalNotHelpful = publishedArticles.reduce((sum: number, a: any) => sum + (a.not_helpful_count || 0), 0);
      const totalFeedback = totalHelpful + totalNotHelpful;
      const helpfulRate = totalFeedback > 0 ? (totalHelpful / totalFeedback) * 100 : null;

      return {
        id: category.id,
        name: category.name_uk,
        slug: category.slug,
        articleCount: publishedArticles.length,
        totalViews,
        totalFeedback,
        helpfulRate,
      };
    }).sort((a: any, b: any) => b.totalViews - a.totalViews) || [];

    // 9. Views over time (last 30 days)
    // Note: Since we don't have view timestamps, we'll use article creation dates as a proxy
    // In production, you'd want to track views in a separate table with timestamps
    const { data: articlesWithDates } = await supabase
      .from('help_articles')
      .select('created_at, view_count')
      .eq('status', 'published')
      .gte('created_at', startDate.toISOString());

    // Group by date
    const viewsByDate = new Map<string, number>();
    articlesWithDates?.forEach((article: any) => {
      const date = new Date(article.created_at).toISOString().split('T')[0];
      viewsByDate.set(date, (viewsByDate.get(date) || 0) + (article.view_count || 0));
    });

    const viewsOverTime = Array.from(viewsByDate.entries())
      .map(([date, views]) => ({ date, views }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({
      summary: {
        ...statusSummary,
        totalViews,
        overallHelpfulRate,
        totalFeedback: totalAllFeedback,
      },
      topViewedArticles: articlesWithRates,
      lowPerformingArticles,
      recentFeedback,
      categoryPerformance,
      viewsOverTime,
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
