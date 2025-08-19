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
// For production (AWS RDS/Heroku), configure SSL to handle self-signed certificates
// For test environment, disable SSL entirely
const sslConfig = process.env.NODE_ENV === 'production' 
  ? { rejectUnauthorized: false }
  : process.env.NODE_ENV === 'test'
  ? false
  : 'require';

// Detect if we're on AWS RDS (from the database URL hostname)
const isAWSRDS = process.env.DATABASE_URL?.includes('amazonaws.com') || false;
const isProduction = process.env.NODE_ENV === 'production';

// Configure connection timeouts for AWS RDS reliability
const connectionConfig = {
  max: isProduction ? 15 : 10, // Increased pool size for production
  idle_timeout: isProduction ? 60 : 20, // Longer idle timeout for production
  connect_timeout: isAWSRDS ? 30 : (isProduction ? 20 : 10), // Much longer for AWS RDS
  max_lifetime: isProduction ? 3600 : null, // Connection lifetime in production
  ssl: sslConfig,
  transform: {
    undefined: null,
  },
  // Add retry logic for failed connections
  onnotice: () => {}, // Suppress notices in production
  // Connection validation
  prepare: false, // Disable prepared statements for better compatibility
};

console.log(`[DB] Configuring database connection - AWS RDS: ${isAWSRDS}, Production: ${isProduction}`);
console.log(`[DB] Connection timeout: ${connectionConfig.connect_timeout}s, Idle timeout: ${connectionConfig.idle_timeout}s`);

const queryClient = postgres(process.env.DATABASE_URL, connectionConfig);

const db = drizzlePostgres(queryClient, { schema });

export { db };
