import { config } from "dotenv";
import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@shared/schema";

// Load environment variables
config();

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

/**
 * Dynamic SSL configuration based on environment
 * 
 * This resolves GitHub issue #25 where hardcoded SSL settings caused
 * connection failures in development and CI environments.
 * 
 * SSL is enabled when:
 * - DATABASE_URL contains sslmode=require or ssl=true
 * - NODE_ENV is set to 'production'
 * 
 * SSL is disabled for:
 * - Development environments
 * - CI/testing environments
 * - Local PostgreSQL without SSL
 */
const sslConfig = (() => {
  const url = process.env.DATABASE_URL;
  
  // If DATABASE_URL contains SSL-related parameters, use SSL
  if (url && (url.includes('sslmode=require') || url.includes('ssl=true'))) {
    return 'require';
  }
  
  // In production with cloud databases (like Neon, Heroku), enable SSL
  if (process.env.NODE_ENV === 'production') {
    return 'require';
  }
  
  // For development, testing, and CI environments, disable SSL
  return false;
})();

// Use standard PostgreSQL driver with environment-aware SSL configuration
const queryClient = postgres(process.env.DATABASE_URL, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
  ssl: sslConfig,
  transform: {
    undefined: null,
  },
});

const db = drizzlePostgres(queryClient, { schema });

export { db };
