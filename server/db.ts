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

// PostgreSQL 17.4 optimized connection configuration
const queryClient = postgres(process.env.DATABASE_URL, {
  max: 15, // Increased for PostgreSQL 17.4 improved connection handling
  idle_timeout: 30, // Extended for better connection reuse
  connect_timeout: 15, // Increased for stability
  ssl: 'require',
  transform: {
    undefined: null,
  },
  // PostgreSQL 17.4 specific optimizations
  prepare: true, // Enable prepared statements for better performance
  debug: process.env.NODE_ENV === 'development' ? true : false,
  onnotice: process.env.NODE_ENV === 'development' ? console.log : undefined,
  // Enhanced connection pool settings for PostgreSQL 17.4
  connection: {
    application_name: 'ticketbazaar_app',
    search_path: 'public',
    statement_timeout: '30s',
    idle_in_transaction_session_timeout: '60s',
  },
});

const db = drizzlePostgres(queryClient, { schema });

export { db };
