import * as fs from 'fs';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

interface KatottgRecord {
  code: string;
  category: string;
  name: string;
  level: number;
  oblast_code: string | null;
  raion_code: string | null;
  hromada_code: string | null;
  oblast_name: string | null;
  raion_name: string | null;
  hromada_name: string | null;
  full_path: string;
  name_normalized: string;
}

interface CsvRow {
  id: string;
  level1: string;
  level2: string;
  level3: string;
  level4: string;
  level5: string;
  category: string;
  name: string;
}

const recordsByCode = new Map<string, { name: string; category: string }>();

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

// Normalize category: convert Cyrillic lookalikes to Latin
function normalizeCategory(cat: string): string {
  const mapping: Record<string, string> = {
    'С': 'C', // Cyrillic С (U+0421) -> Latin C (U+0043)
    'О': 'O', // Cyrillic О -> Latin O (just in case)
    'Р': 'P', // Cyrillic Р -> Latin P (just in case)
    'Н': 'H', // Cyrillic Н -> Latin H (just in case)
    'К': 'K', // Cyrillic К -> Latin K (just in case)
    'М': 'M', // Cyrillic М -> Latin M (just in case)
    'Т': 'T', // Cyrillic Т -> Latin T (just in case)
    'Х': 'X', // Cyrillic Х -> Latin X (just in case)
    'В': 'B', // Cyrillic В -> Latin B (just in case)
  };
  return mapping[cat] || cat;
}

function normalizeForSearch(name: string): string {
  return name
    .toLowerCase()
    .replace(/['ʼ`']/g, '')
    .replace(/[^а-яіїєґa-z0-9\s-]/g, '')
    .trim();
}

function determineLevel(row: CsvRow): number {
  if (row.level5) return 5;
  if (row.level4) return 4;
  if (row.level3) return 3;
  if (row.level2) return 2;
  return 1;
}

function getCode(row: CsvRow): string {
  return row.level5 || row.level4 || row.level3 || row.level2 || row.level1;
}

async function main() {
  console.log('🚀 Starting KATOTTG seeding script...\n');

  // Setup Supabase client with service role key
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Missing SUPABASE_URL or SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false }
  });

  // Check if table already has data
  const { count: existingCount } = await supabase
    .from('katottg')
    .select('*', { count: 'exact', head: true });

  if (existingCount && existingCount > 0) {
    console.log(`⚠️ Table already has ${existingCount} records.`);
    console.log('   To re-seed, first truncate the table manually.');
    console.log('   Run: TRUNCATE TABLE katottg;');
    process.exit(0);
  }

  // Read CSV
  const csvPath = path.join(__dirname, '..', 'docs', 'KODYFIKATOR.csv');
  console.log(`📖 Reading CSV from: ${csvPath}`);
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const lines = csvContent.split('\n').filter(line => line.trim());

  const dataLines = lines.slice(1); // Skip header
  console.log(`📊 Total records to process: ${dataLines.length}\n`);

  // First pass: collect all records
  console.log('🔍 First pass: collecting all records...');
  const rows: CsvRow[] = [];

  for (const line of dataLines) {
    const parts = parseCsvLine(line);
    if (parts.length < 8) continue;

    // Skip non-data lines (disclaimer at the end)
    const rawCategory = parts[6];
    if (!rawCategory || rawCategory.length !== 1) continue;

    // Skip if no valid code found
    const code = parts[5] || parts[4] || parts[3] || parts[2] || parts[1];
    if (!code || !code.startsWith('UA')) continue;

    const row: CsvRow = {
      id: parts[0],
      level1: parts[1],
      level2: parts[2],
      level3: parts[3],
      level4: parts[4],
      level5: parts[5],
      category: normalizeCategory(rawCategory), // Normalize Cyrillic to Latin
      name: parts[7].trim(),
    };

    rows.push(row);
    recordsByCode.set(code, { name: row.name, category: row.category });
  }

  console.log(`✅ Collected ${rows.length} records\n`);

  // Second pass: build full records
  console.log('🔧 Second pass: building hierarchy...');
  const records: KatottgRecord[] = [];

  for (const row of rows) {
    const code = getCode(row);
    const level = determineLevel(row);

    let oblast_code: string | null = null;
    let raion_code: string | null = null;
    let hromada_code: string | null = null;
    let oblast_name: string | null = null;
    let raion_name: string | null = null;
    let hromada_name: string | null = null;

    if (level >= 2) {
      oblast_code = row.level1;
      oblast_name = recordsByCode.get(row.level1)?.name || null;
    }
    if (level >= 3) {
      raion_code = row.level2;
      raion_name = recordsByCode.get(row.level2)?.name || null;
    }
    if (level >= 4) {
      hromada_code = row.level3;
      hromada_name = recordsByCode.get(row.level3)?.name || null;
    }

    const pathParts: string[] = [];
    if (oblast_name) pathParts.push(oblast_name);
    if (raion_name) pathParts.push(raion_name);
    if (hromada_name) pathParts.push(hromada_name);
    if (level >= 4 || (level === 1 && row.category === 'K')) {
      pathParts.push(row.name);
    } else if (level < 4 && pathParts.length === 0) {
      pathParts.push(row.name);
    }

    let full_path = pathParts.join(' > ');
    if (level <= 3 && !full_path) {
      full_path = row.name;
    }

    records.push({
      code,
      category: row.category,
      name: row.name,
      level,
      oblast_code,
      raion_code,
      hromada_code,
      oblast_name,
      raion_name,
      hromada_name,
      full_path,
      name_normalized: normalizeForSearch(row.name),
    });
  }

  console.log(`✅ Built ${records.length} records with hierarchy\n`);

  // Insert in batches
  const batchSize = 500;
  const totalBatches = Math.ceil(records.length / batchSize);

  console.log(`📤 Inserting ${records.length} records in ${totalBatches} batches...`);
  console.log('');

  let inserted = 0;
  let errors = 0;

  for (let i = 0; i < records.length; i += batchSize) {
    const batchNum = Math.floor(i / batchSize) + 1;
    const batch = records.slice(i, i + batchSize);

    process.stdout.write(`   Batch ${batchNum}/${totalBatches} (${batch.length} records)... `);

    const { error } = await supabase.from('katottg').insert(batch);

    if (error) {
      console.log(`❌ Error: ${error.message}`);
      errors++;
      // Log the first record in the batch for debugging
      console.log('   First record in failed batch:', batch[0]?.code);
    } else {
      inserted += batch.length;
      console.log(`✅`);
    }
  }

  console.log('');
  console.log('📊 Summary:');
  console.log(`   Total records: ${records.length}`);
  console.log(`   Inserted: ${inserted}`);
  console.log(`   Errors: ${errors} batches failed`);
  console.log('');

  // Verify count
  const { count: finalCount } = await supabase
    .from('katottg')
    .select('*', { count: 'exact', head: true });

  console.log(`🔍 Verification: ${finalCount} records in database`);

  if (finalCount === records.length) {
    console.log('🎉 KATOTTG seeding completed successfully!');
  } else {
    console.log('⚠️ Record count mismatch. Some records may have failed.');
  }
}

main().catch((error) => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});
