import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Use appropriate driver based on environment
// In CI/test environments, use standard PostgreSQL driver
// In production with Neon, use Neon serverless driver
const isLocalOrCI = process.env.NODE_ENV === 'test' || 
                   process.env.DATABASE_URL.includes('localhost') ||
                   process.env.DATABASE_URL.includes('127.0.0.1');

let db;

if (isLocalOrCI) {
  // Use standard postgres driver for local/CI environments
  const queryClient = postgres(process.env.DATABASE_URL);
  db = drizzlePostgres(queryClient, { schema });
} else {
  // Use Neon serverless driver for production
  const sql = neon(process.env.DATABASE_URL);
  db = drizzleNeon(sql, { schema });
}

export { db };
