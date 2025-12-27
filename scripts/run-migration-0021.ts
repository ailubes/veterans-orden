import postgres from 'postgres';
import * as dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load environment variables
dotenv.config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL!;

if (!connectionString) {
  console.error('❌ DATABASE_URL is not set');
  process.exit(1);
}

async function runMigration() {
  const client = postgres(connectionString, { ssl: 'require' });

  try {
    console.log('🔄 Running migration 0021_add_help_system.sql...\n');

    // Read migration file
    const migrationPath = join(__dirname, '../src/lib/db/migrations/0021_add_help_system.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf-8');

    // Split by statement (simple approach - split on semicolons outside of function definitions)
    // For complex migrations with functions, it's better to run the whole file
    await client.unsafe(migrationSQL);

    console.log('✅ Migration completed successfully!\n');
    console.log('Created:');
    console.log('  - help_categories table');
    console.log('  - help_articles table (with full-text search)');
    console.log('  - help_article_feedback table');
    console.log('  - help_tooltips table');
    console.log('  - search_help_articles() function');
    console.log('  - Full-text search trigger with Ukrainian language support\n');

    await client.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    await client.end();
    process.exit(1);
  }
}

runMigration();
