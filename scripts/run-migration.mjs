import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = 'https://ckcucfofooarisquhmxm.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNrY3VjZm9mb29hcmlzcXVobXhtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDk5NzYyMCwiZXhwIjoyMDUwNTczNjIwfQ.hJvRlYYkm-QkMy_nH7YdQLcZVwj9cWf_6_EO4x8jC10';

const supabase = createClient(supabaseUrl, supabaseKey);

// Read migration file
const migrationPath = join(__dirname, '../src/lib/db/migrations/0040_add_progression_help_content.sql');
const sql = readFileSync(migrationPath, 'utf8');

console.log('Executing migration...');
console.log(`SQL length: ${sql.length} characters`);

const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql }).select();

if (error) {
  console.error('Migration failed:',  error);
  process.exit(1);
} else {
  console.log('Migration completed successfully!');
  console.log('Result:', data);
  process.exit(0);
}
