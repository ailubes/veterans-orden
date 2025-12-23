import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Create postgres client
const connectionString = process.env.DATABASE_URL!;

// For query purposes
const queryClient = postgres(connectionString);

// Create drizzle instance with schema
export const db = drizzle(queryClient, { schema });

// Export schema for use in other files
export * from './schema';
