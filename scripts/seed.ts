import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { oblasts } from '../src/lib/db/schema';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL!;

if (!connectionString) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

const client = postgres(connectionString, { ssl: 'require' });
const db = drizzle(client);

// 27 Ukrainian Administrative Units (24 oblasts + Crimea + Kyiv + Sevastopol)
const ukrainianOblasts = [
  { code: 'UA-05', name: 'Вінницька область' },
  { code: 'UA-07', name: 'Волинська область' },
  { code: 'UA-09', name: 'Луганська область' },
  { code: 'UA-12', name: 'Дніпропетровська область' },
  { code: 'UA-14', name: 'Донецька область' },
  { code: 'UA-18', name: 'Житомирська область' },
  { code: 'UA-21', name: 'Закарпатська область' },
  { code: 'UA-23', name: 'Запорізька область' },
  { code: 'UA-26', name: 'Івано-Франківська область' },
  { code: 'UA-30', name: 'Київ' },
  { code: 'UA-32', name: 'Київська область' },
  { code: 'UA-35', name: 'Кіровоградська область' },
  { code: 'UA-40', name: 'Севастополь' },
  { code: 'UA-43', name: 'Автономна Республіка Крим' },
  { code: 'UA-46', name: 'Львівська область' },
  { code: 'UA-48', name: 'Миколаївська область' },
  { code: 'UA-51', name: 'Одеська область' },
  { code: 'UA-53', name: 'Полтавська область' },
  { code: 'UA-56', name: 'Рівненська область' },
  { code: 'UA-59', name: 'Сумська область' },
  { code: 'UA-61', name: 'Тернопільська область' },
  { code: 'UA-63', name: 'Харківська область' },
  { code: 'UA-65', name: 'Херсонська область' },
  { code: 'UA-68', name: 'Хмельницька область' },
  { code: 'UA-71', name: 'Черкаська область' },
  { code: 'UA-74', name: 'Чернігівська область' },
  { code: 'UA-77', name: 'Чернівецька область' },
];

async function seed() {
  console.log('🌱 Starting seed...\n');

  console.log('📍 Seeding Ukrainian oblasts...');

  for (const oblast of ukrainianOblasts) {
    try {
      await db.insert(oblasts).values(oblast).onConflictDoNothing();
      console.log(`  ✓ ${oblast.name}`);
    } catch (error) {
      console.log(`  ⚠ ${oblast.name} (already exists or error)`);
    }
  }

  console.log(`\n✅ Seeded ${ukrainianOblasts.length} oblasts successfully!`);

  // Close connection
  await client.end();
  process.exit(0);
}

seed().catch((error) => {
  console.error('❌ Seed failed:', error);
  process.exit(1);
});
