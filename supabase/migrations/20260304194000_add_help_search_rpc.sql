-- Add missing help articles search RPC used by /api/help/articles/search
-- Created: 2026-03-04

CREATE OR REPLACE FUNCTION public.search_help_articles(
  search_query TEXT,
  max_results INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  title VARCHAR,
  excerpt TEXT,
  slug VARCHAR,
  category_name VARCHAR,
  category_slug VARCHAR,
  rank REAL
)
LANGUAGE sql
STABLE
AS $$
  WITH ranked AS (
    SELECT
      ha.id,
      ha.title,
      ha.excerpt,
      ha.slug,
      hc.name_uk AS category_name,
      hc.slug AS category_slug,
      ts_rank_cd(
        setweight(to_tsvector('simple', COALESCE(ha.title, '')), 'A') ||
        setweight(to_tsvector('simple', COALESCE(ha.excerpt, '')), 'B') ||
        setweight(to_tsvector('simple', COALESCE(ha.content, '')), 'C'),
        plainto_tsquery('simple', search_query)
      ) AS rank
    FROM public.help_articles ha
    LEFT JOIN public.help_categories hc ON hc.id = ha.category_id
    WHERE ha.status = 'published'
      AND (
        to_tsvector('simple', COALESCE(ha.title, '') || ' ' || COALESCE(ha.excerpt, '') || ' ' || COALESCE(ha.content, ''))
          @@ plainto_tsquery('simple', search_query)
        OR ha.title ILIKE ('%' || search_query || '%')
        OR ha.excerpt ILIKE ('%' || search_query || '%')
      )
  )
  SELECT
    ranked.id,
    ranked.title,
    ranked.excerpt,
    ranked.slug,
    ranked.category_name,
    ranked.category_slug,
    ranked.rank
  FROM ranked
  ORDER BY ranked.rank DESC NULLS LAST, ranked.title ASC
  LIMIT GREATEST(1, LEAST(max_results, 50));
$$;

GRANT EXECUTE ON FUNCTION public.search_help_articles(TEXT, INTEGER) TO anon;
GRANT EXECUTE ON FUNCTION public.search_help_articles(TEXT, INTEGER) TO authenticated;

