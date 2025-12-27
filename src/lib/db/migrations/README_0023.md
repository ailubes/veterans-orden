# Migration 0023: Add Category Slug to Search Results

## Purpose
Fixes help search results to properly navigate to article pages instead of showing "Category not found" error.

## Issue
When users clicked on search results, they were navigated to `/help/[articleSlug]` which triggered the category page, resulting in "Категорію не знайдено" error because the article slug is not a valid category slug.

## Solution
Updated the `search_help_articles` PostgreSQL function to also return `category_slug` so search results can construct the correct URL: `/help/[categorySlug]/[articleSlug]`

## How to Apply

### Option 1: Via Supabase Dashboard
1. Go to https://supabase.com/dashboard/project/YOUR_PROJECT/sql
2. Open `0023_add_category_slug_to_search.sql`
3. Copy the entire SQL content
4. Paste into the SQL Editor
5. Click "Run"

### Option 2: Via Supabase CLI
```bash
supabase db push
```

## Verification
After applying the migration, test:
1. Go to `/help` page
2. Search for an article (e.g., "оплата")
3. Click on a search result
4. Should navigate to `/help/chasti-pytannia/oplata-chlenskoho-vnesku` (or similar)
5. Article page should load successfully instead of showing error

## Related Files Updated
- `src/lib/help/types.ts` - Added `categorySlug` to `SearchResult` interface
- `src/app/api/help/articles/search/route.ts` - Map `category_slug` in response
- `src/components/help/help-search.tsx` - Use correct URL pattern with category slug
