-- Fix Ukrainian text search configuration issue
-- Replace 'pg_catalog.ukrainian' with 'simple' which is available in all PostgreSQL installations

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS help_articles_search_vector_trigger ON help_articles;
DROP FUNCTION IF EXISTS help_articles_search_vector_update();

-- Recreate trigger function with 'simple' configuration
CREATE OR REPLACE FUNCTION help_articles_search_vector_update()
RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('simple', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(NEW.content, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(NEW.excerpt, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger
CREATE TRIGGER help_articles_search_vector_trigger
  BEFORE INSERT OR UPDATE ON help_articles
  FOR EACH ROW
  EXECUTE FUNCTION help_articles_search_vector_update();

-- Update search_help_articles function to use 'simple' instead of 'pg_catalog.ukrainian'
DROP FUNCTION IF EXISTS search_help_articles(text, int);

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
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id,
    a.title,
    a.excerpt,
    a.slug,
    c.name_uk,
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
