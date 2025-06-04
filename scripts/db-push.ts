import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import * as schema from "../shared/schema";

// Script to push schema changes to the ticket_bazaar database

// Create a PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create a drizzle instance
const db = drizzle(pool, { schema });

// Push the schema to the database
async function main() {
  try {
    console.log("Pushing schema changes to database...");
    await migrate(db, { migrationsFolder: "./drizzle" });
    console.log("Schema changes applied successfully!");
  } catch (error) {
    console.error("Error applying schema changes:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
