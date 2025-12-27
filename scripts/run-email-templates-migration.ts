import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  console.log('[Migration] Running 0025_add_email_templates_system...');

  try {
    const migrationSql = readFileSync(
      join(__dirname, '../src/lib/db/migrations/0025_add_email_templates_system.sql'),
      'utf-8'
    );

    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: migrationSql
    });

    if (error) {
      console.error('[Migration] Error:', error);
      process.exit(1);
    }

    console.log('[Migration] Success!');
    console.log('[Migration] Email templates tables created and seeded');
  } catch (error) {
    console.error('[Migration] Failed:', error);
    process.exit(1);
  }
}

runMigration();
