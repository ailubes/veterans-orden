import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = 'https://ckcucfofooarisquhmxm.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNrY3VjZm9mb29hcmlzcXVobXhtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDk5NzYyMCwiZXhwIjoyMDUwNTczNjIwfQ.hJvRlYYkm-QkMy_nH7YdQLcZVwj9cWf_6_EO4x8jC10';

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
  try {
    console.log('🚀 Reading migration file...');
    const sqlPath = join(__dirname, '../src/lib/db/migrations/0040_add_progression_help_content.sql');
    const sql = readFileSync(sqlPath, 'utf8');

    console.log(`📄 SQL size: ${sql.length} characters`);
    console.log('⏳ Executing migration via RPC...');

    // Execute using execute_sql RPC function
    const { data, error } = await supabase.rpc('execute_sql', {
      sql_query: sql
    });

    if (error) {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    }

    console.log('✅ Migration executed successfully!');

    // Verify results
    console.log('\n📊 Verifying results...');
    const { data: articles, error: queryError } = await supabase
      .from('help_articles')
      .select('title, slug, audience')
      .eq('category_id', (select_query) => {
        return supabase
          .from('help_categories')
          .select('id')
          .eq('slug', 'rivni-chlenstva')
          .single();
      });

    if (!queryError && articles) {
      console.log(`\n📚 Articles in "Рівні членства" category: ${articles.length}`);
      articles.forEach((article, i) => {
        console.log(`  ${i + 1}. ${article.title} [${article.audience}]`);
      });
    }

    console.log('\n✨ Done!');
    process.exit(0);

  } catch (error) {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  }
}

applyMigration();
