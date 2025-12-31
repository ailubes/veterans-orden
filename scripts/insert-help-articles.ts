/**
 * Script to insert 9 progression help articles
 * Run with: npx tsx scripts/insert-help-articles.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ckcucfofooarisquhmxm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNrY3VjZm9mb29hcmlzcXVobXhtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDk5NzYyMCwiZXhwIjoyMDUwNTczNjIwfQ.hJvRlYYkm-QkMy_nH7YdQLcZVwj9cWf_6_EO4x8jC10';

const supabase = createClient(supabaseUrl, supabaseKey);

const CATEGORY_ID = '56ca5767-e2cd-4b67-bc21-b94b9cfd4991';
const AUTHOR_ID = '519f19f8-8045-4190-b0d4-e29cecefe25b';

async function main() {
  console.log('🚀 Starting to insert help articles...\n');

  try {
    // Read the full migration file
    const { readFileSync } = await import('fs');
    const { join } = await import('path');

    const sql = readFileSync(join(__dirname, '../src/lib/db/migrations/0040_add_progression_help_content.sql'), 'utf8');

    console.log('📄 Migration file loaded');
    console.log(`📊 Total size: ${sql.length} characters\n`);

    // Execute the DO block (articles insertion)
    console.log('⏳ Executing article insertions...');

    const { data, error } = await supabase.rpc('exec_sql', {
      query: sql
    });

    if (error) {
      console.error('❌ Error:', error);
      throw error;
    }

    console.log('✅ Articles inserted successfully!\n');

    // Verify results
    const { data: articles, error: queryError } = await supabase
      .from('help_articles')
      .select('title, slug, audience')
      .eq('category_id', CATEGORY_ID)
      .order('created_at');

    if (queryError) {
      console.error('Error querying articles:', queryError);
    } else {
      console.log(`📚 Articles created (${articles?.length || 0}):`);
      articles?.forEach((article, i) => {
        console.log(`  ${i + 1}. ${article.title} [${article.audience}]`);
      });
    }

    console.log('\n✨ Done!');

  } catch (error) {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  }
}

main();
