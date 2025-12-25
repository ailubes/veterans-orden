import postgres from 'postgres';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL!;

if (!connectionString) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

const client = postgres(connectionString, { ssl: 'require' });

async function createOrgSettings() {
  console.log('🔧 Creating organization_settings table...\n');

  try {
    // Read the SQL file
    const sqlPath = path.join(__dirname, '../src/lib/db/organization-settings.sql');
    const sql = fs.readFileSync(sqlPath, 'utf-8');

    // Execute the SQL
    await client.unsafe(sql);

    console.log('✅ organization_settings table created and seeded successfully!');
  } catch (error) {
    console.error('❌ Failed to create organization_settings table:', error);
    process.exit(1);
  } finally {
    await client.end();
    process.exit(0);
  }
}

createOrgSettings();
