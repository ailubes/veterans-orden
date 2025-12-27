-- Migration: Add category_slug to search_help_articles function
-- This fixes the search result links to properly navigate to article pages

-- Drop the old function
DROP FUNCTION IF EXISTS search_help_articles(TEXT, INT);

-- Recreate with category_slug included
CREATE OR REPLACE FUNCTION search_help_articles(
  search_query TEXT,
  max_results INT DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  title VARCHAR,
  excerpt TEXT,
  slug VARCHAR,
  category_name VARCHAR,
  category_slug VARCHAR,
  rank DOUBLE PRECISION
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id,
    a.title,
    a.excerpt,
    a.slug,
    c.name_uk,
    c.slug,
    GREATEST(
      -- Title exact match (highest priority)
      CASE WHEN LOWER(a.title) = LOWER(search_query) THEN 1.0 ELSE 0.0 END,
      -- Title contains query
      CASE WHEN LOWER(a.title) LIKE '%' || LOWER(search_query) || '%' THEN 0.8 ELSE 0.0 END,
      -- Full-text search match
      CASE WHEN a.search_vector @@ plainto_tsquery('simple', search_query)
        THEN ts_rank(a.search_vector, plainto_tsquery('simple', search_query)) * 0.6
        ELSE 0.0
      END,
      -- Keywords match
      CASE WHEN a.keywords::text ILIKE '%' || search_query || '%' THEN 0.4 ELSE 0.0 END
    ) AS rank
  FROM help_articles a
  JOIN help_categories c ON a.category_id = c.id
  WHERE a.status = 'published'
    AND (
      LOWER(a.title) LIKE '%' || LOWER(search_query) || '%'
      OR a.search_vector @@ plainto_tsquery('simple', search_query)
      OR a.keywords::text ILIKE '%' || search_query || '%'
    )
  ORDER BY rank DESC, a.view_count DESC
  LIMIT max_results;
END;
$$ LANGUAGE plpgsql;
