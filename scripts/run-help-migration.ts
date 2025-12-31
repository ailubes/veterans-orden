import { readFileSync } from 'fs';
import { join } from 'path';
import pg from 'pg';

const { Pool } = pg;

// Database connection
const pool = new Pool({
  connectionString: 'postgres://postgres.ckcucfofooarisquhmxm:Enex2024@db.ckcucfofooarisquhmxm.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function runMigration() {
  const client = await pool.connect();

  try {
    console.log('🚀 Starting migration...');

    // Read migration SQL
    const sql = readFileSync(join(__dirname, '../src/lib/db/migrations/0040_add_progression_help_content.sql'), 'utf8');

    console.log(`📄 SQL file size: ${sql.length} characters`);
    console.log('⏳ Executing migration...');

    // Execute migration
    await client.query(sql);

    console.log('✅ Migration completed successfully!');
    console.log('📊 Checking results...');

    // Check category
    const categoryResult = await client.query("SELECT * FROM help_categories WHERE slug = 'rivni-chlenstva'");
    console.log(`✓ Category created: ${categoryResult.rows[0]?.name_uk}`);

    // Check articles
    const articlesResult = await client.query("SELECT COUNT(*) as count FROM help_articles WHERE category_id = $1", [categoryResult.rows[0]?.id]);
    console.log(`✓ Articles created: ${articlesResult.rows[0]?.count}`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration().catch(console.error);
