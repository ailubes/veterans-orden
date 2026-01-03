import postgres from 'postgres';
import * as dotenv from 'dotenv';
import { regionalConfig } from '../config/regional.config';

// Load environment variables
dotenv.config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL!;

if (!connectionString) {
  console.error('❌ DATABASE_URL is not set in .env.local');
  process.exit(1);
}

const client = postgres(connectionString, { ssl: 'require' });

async function seedCommanderies() {
  console.log('🏛️  Seeding commanderies for Order of Veterans...\n');

  try {
    // Check if commanderies table exists
    const tableCheck = await client`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'commanderies'
      );
    `;

    if (!tableCheck[0].exists) {
      console.error('❌ Error: commanderies table does not exist.');
      console.log('   Run database migration first: npm run db:push');
      process.exit(1);
    }

    // Clear existing commanderies (optional - comment out if you want to preserve data)
    await client`DELETE FROM commanderies;`;
    console.log('🗑️  Cleared existing commanderies');

    // Insert all commanderies from config
    let insertedCount = 0;

    for (const unit of regionalConfig.units) {
      await client`
        INSERT INTO commanderies (code, name, type, parent_code)
        VALUES (
          ${unit.code},
          ${unit.name},
          ${unit.type},
          ${unit.parent || null}
        )
        ON CONFLICT (code) DO UPDATE SET
          name = EXCLUDED.name,
          type = EXCLUDED.type,
          parent_code = EXCLUDED.parent_code;
      `;

      insertedCount++;

      const emoji = unit.type === 'commandery' ? '🏛️ ' : '🏙️ ';
      console.log(`${emoji} ${unit.name} (${unit.code})`);
    }

    console.log(`\n✅ Successfully seeded ${insertedCount} commanderies!`);
    console.log('\nCommanderies structure:');
    console.log('  5 Macro-regions (commandery)');
    console.log('  10 City commanderies');
    console.log('  ---');
    console.log(`  ${insertedCount} Total commanderies`);

  } catch (error) {
    console.error('❌ Failed to seed commanderies:', error);
    process.exit(1);
  } finally {
    await client.end();
    process.exit(0);
  }
}

seedCommanderies();
