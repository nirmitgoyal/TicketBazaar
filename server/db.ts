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

// Use standard PostgreSQL driver with proper SSL configuration
// For production (Heroku), configure SSL to handle self-signed certificates
const sslConfig = process.env.NODE_ENV === 'production' 
  ? { rejectUnauthorized: false }
  : 'require';

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
