#!/usr/bin/env npx tsx
/**
 * Apply role progression migrations
 * Run this script locally: npx tsx scripts/apply-role-migrations.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing environment variables. Make sure .env.local is loaded.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const migrationsDir = path.join(__dirname, '../src/lib/db/migrations');

const migrations = [
  '0028_add_role_progression_functions.sql',
  '0029_add_role_progression_triggers.sql',
];

async function checkFunctionExists(name: string): Promise<boolean> {
  const { data, error } = await supabase.rpc(name as never, { p_user_id: '00000000-0000-0000-0000-000000000000' } as never);
  // If error is PGRST202, function doesn't exist
  if (error && error.code === 'PGRST202') {
    return false;
  }
  return true;
}

async function main() {
  console.log('Checking if role progression functions exist...');

  const exists = await checkFunctionExists('get_user_role_progress');

  if (exists) {
    console.log('✅ Role progression functions already exist!');
    return;
  }

  console.log('❌ Role progression functions not found.');
  console.log('\nTo apply the migrations, please run the following SQL in the Supabase Dashboard SQL Editor:');
  console.log('Dashboard URL: https://supabase.com/dashboard/project/ckcucfofooarisquhmxm/sql/new\n');

  for (const migration of migrations) {
    const filePath = path.join(migrationsDir, migration);
    if (fs.existsSync(filePath)) {
      console.log(`--- ${migration} ---`);
      console.log('Copy the contents of this file to the SQL editor:\n');
      console.log(`File path: ${filePath}`);
      console.log('\n');
    }
  }

  console.log('After running the migrations, refresh your dashboard to see the role progress card.');
}

main().catch(console.error);
