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
const queryClient = postgres(process.env.DATABASE_URL, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
<<<<<<< HEAD
  ssl: 'require',
=======
  ssl: process.env.NODE_ENV === 'production' ? 'require' : false,
>>>>>>> ab0e74f (Legal (#24))
  transform: {
    undefined: null,
  },
});

const db = drizzlePostgres(queryClient, { schema });

export { db };
