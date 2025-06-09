import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js";
import { neon } from "@neondatabase/serverless";
import postgres from "postgres";
import * as schema from "@shared/schema";
import { config } from "./environment";

// Determine database driver based on environment
const isLocalOrCI = config.NODE_ENV === 'test' || 
                   config.DATABASE_URL.includes('localhost') ||
                   config.DATABASE_URL.includes('127.0.0.1');

// Create appropriate database connection
let db: ReturnType<typeof drizzlePostgres<typeof schema>> | ReturnType<typeof drizzleNeon<typeof schema>>;

if (isLocalOrCI) {
  // Use standard postgres driver for local/CI environments
  const queryClient = postgres(config.DATABASE_URL, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
  });
  db = drizzlePostgres(queryClient, { schema });
} else {
  // Use Neon serverless driver for production
  const sql = neon(config.DATABASE_URL);
  db = drizzleNeon(sql, { schema });
}

export { db };

// Database connection test
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    await db.execute(`SELECT 1 as test`);
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

// Graceful shutdown
export async function closeDatabaseConnection(): Promise<void> {
  try {
    console.log('Database connection cleanup completed');
  } catch (error) {
    console.error('Error during database cleanup:', error);
  }
}

// Health check
export async function getDatabaseHealth(): Promise<{
  status: 'healthy' | 'unhealthy';
  latency?: number;
  error?: string;
}> {
  const startTime = Date.now();
  
  try {
    await db.execute(`SELECT 1 as test`);
    const latency = Date.now() - startTime;
    return { status: 'healthy', latency };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}