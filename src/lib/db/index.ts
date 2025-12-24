import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Debug: Check DATABASE_URL
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('⚠️ DATABASE_URL is not set in environment variables');
} else {
  // Log sanitized connection info (hide password)
  const sanitized = connectionString.replace(/:([^@]+)@/, ':***@');
  console.log('🔌 Database connection:', sanitized);
}

// For query purposes (with SSL for Supabase)
const queryClient = postgres(connectionString || '', {
  ssl: 'require',
  onnotice: (notice) => {
    console.log('📝 DB Notice:', notice.message);
  },
});

// Create drizzle instance with schema
export const db = drizzle(queryClient, { schema });

// Export schema for use in other files
export * from './schema';
