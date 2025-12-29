import * as fs from 'fs';
import * as path from 'path';

interface KatottgRecord {
  code: string;
  category: string;
  name: string;
  level: number;
  oblastCode: string | null;
  raionCode: string | null;
  hromadaCode: string | null;
  oblastName: string | null;
  raionName: string | null;
  hromadaName: string | null;
  fullPath: string;
  nameNormalized: string;
}

interface CsvRow {
  id: string;
  level1: string; // Oblast code
  level2: string; // Raion code
  level3: string; // Hromada code
  level4: string; // Settlement code
  level5: string; // Additional level
  category: string;
  name: string;
}

// Store parsed records for building hierarchy
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

function normalizeForSearch(name: string): string {
  return name
    .toLowerCase()
    .replace(/['ʼ`']/g, '')  // Remove apostrophes
    .replace(/[^а-яіїєґa-z0-9\s-]/g, '')  // Keep only letters, numbers, spaces, hyphens
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

function escapeSQL(str: string): string {
  return str.replace(/'/g, "''");
}

async function main() {
  console.log('🚀 Starting KATOTTG import script...\n');

  const csvPath = path.join(__dirname, '..', 'docs', 'KODYFIKATOR.csv');
  const outputPath = path.join(__dirname, '..', 'src', 'lib', 'db', 'migrations', '0033_seed_katottg_data.sql');

  // Read CSV file
  console.log(`📖 Reading CSV from: ${csvPath}`);
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const lines = csvContent.split('\n').filter(line => line.trim());

  // Skip header
  const header = lines[0];
  console.log(`📋 Header: ${header}`);

  const dataLines = lines.slice(1);
  console.log(`📊 Total records to process: ${dataLines.length}\n`);

  // First pass: collect all records with their names
  console.log('🔍 First pass: collecting all records...');
  const rows: CsvRow[] = [];

  for (const line of dataLines) {
    const parts = parseCsvLine(line);
    if (parts.length < 8) continue;

    const row: CsvRow = {
      id: parts[0],
      level1: parts[1],
      level2: parts[2],
      level3: parts[3],
      level4: parts[4],
      level5: parts[5],
      category: parts[6],
      name: parts[7].trim(),
    };

    rows.push(row);

    // Store for hierarchy lookup
    const code = getCode(row);
    recordsByCode.set(code, { name: row.name, category: row.category });
  }

  console.log(`✅ Collected ${rows.length} records\n`);

  // Second pass: build full records with hierarchy
  console.log('🔧 Second pass: building hierarchy...');
  const records: KatottgRecord[] = [];

  for (const row of rows) {
    const code = getCode(row);
    const level = determineLevel(row);

    // Get parent info
    let oblastCode: string | null = null;
    let raionCode: string | null = null;
    let hromadaCode: string | null = null;
    let oblastName: string | null = null;
    let raionName: string | null = null;
    let hromadaName: string | null = null;

    if (level >= 2) {
      oblastCode = row.level1;
      const oblastRecord = recordsByCode.get(row.level1);
      oblastName = oblastRecord?.name || null;
    }

    if (level >= 3) {
      raionCode = row.level2;
      const raionRecord = recordsByCode.get(row.level2);
      raionName = raionRecord?.name || null;
    }

    if (level >= 4) {
      hromadaCode = row.level3;
      const hromadaRecord = recordsByCode.get(row.level3);
      hromadaName = hromadaRecord?.name || null;
    }

    // Build full path
    const pathParts: string[] = [];
    if (oblastName) pathParts.push(oblastName);
    if (raionName) pathParts.push(raionName);
    if (hromadaName) pathParts.push(hromadaName);
    if (level >= 4 || (level === 1 && row.category === 'K')) {
      // For settlements or special cities, add the name itself
      pathParts.push(row.name);
    } else if (level < 4 && pathParts.length === 0) {
      // For top-level items with no parents
      pathParts.push(row.name);
    }

    // For level 1-3, the name IS the full path (they ARE the hierarchy)
    let fullPath = pathParts.join(' > ');
    if (level <= 3 && !fullPath) {
      fullPath = row.name;
    }

    records.push({
      code,
      category: row.category,
      name: row.name,
      level,
      oblastCode,
      raionCode,
      hromadaCode,
      oblastName,
      raionName,
      hromadaName,
      fullPath,
      nameNormalized: normalizeForSearch(row.name),
    });
  }

  console.log(`✅ Built ${records.length} records with hierarchy\n`);

  // Count by category
  const categoryCounts = new Map<string, number>();
  for (const r of records) {
    categoryCounts.set(r.category, (categoryCounts.get(r.category) || 0) + 1);
  }
  console.log('📈 Records by category:');
  for (const [cat, count] of categoryCounts) {
    console.log(`   ${cat}: ${count}`);
  }
  console.log('');

  // Generate SQL
  console.log('📝 Generating SQL migration file...');

  let sql = `-- KATOTTG (Ukrainian Administrative Units) Seed Data
-- Generated from docs/KODYFIKATOR.csv
-- Total records: ${records.length}
-- Generated at: ${new Date().toISOString()}

-- Insert data in batches
`;

  // Split into batches of 500 for better performance
  const batchSize = 500;
  let batchNum = 0;

  for (let i = 0; i < records.length; i += batchSize) {
    batchNum++;
    const batch = records.slice(i, i + batchSize);

    sql += `\n-- Batch ${batchNum} (records ${i + 1} to ${Math.min(i + batchSize, records.length)})\n`;
    sql += `INSERT INTO katottg (code, category, name, level, oblast_code, raion_code, hromada_code, oblast_name, raion_name, hromada_name, full_path, name_normalized) VALUES\n`;

    const values = batch.map((r, idx) => {
      const isLast = idx === batch.length - 1;
      return `  ('${escapeSQL(r.code)}', '${r.category}', '${escapeSQL(r.name)}', ${r.level}, ${r.oblastCode ? `'${escapeSQL(r.oblastCode)}'` : 'NULL'}, ${r.raionCode ? `'${escapeSQL(r.raionCode)}'` : 'NULL'}, ${r.hromadaCode ? `'${escapeSQL(r.hromadaCode)}'` : 'NULL'}, ${r.oblastName ? `'${escapeSQL(r.oblastName)}'` : 'NULL'}, ${r.raionName ? `'${escapeSQL(r.raionName)}'` : 'NULL'}, ${r.hromadaName ? `'${escapeSQL(r.hromadaName)}'` : 'NULL'}, '${escapeSQL(r.fullPath)}', '${escapeSQL(r.nameNormalized)}')${isLast ? ';' : ','}`;
    });

    sql += values.join('\n') + '\n';
  }

  // Write output
  fs.writeFileSync(outputPath, sql, 'utf-8');
  console.log(`✅ Generated SQL file: ${outputPath}`);
  console.log(`📊 File size: ${(fs.statSync(outputPath).size / 1024 / 1024).toFixed(2)} MB\n`);

  console.log('🎉 KATOTTG import script completed successfully!');
}

main().catch((error) => {
  console.error('❌ Import failed:', error);
  process.exit(1);
});
