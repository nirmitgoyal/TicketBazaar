/**
 * Database health check utilities for production monitoring
 * Helps diagnose connection issues, especially with AWS RDS
 */

import { config } from 'dotenv';
import postgres from 'postgres';

// Load environment variables
config();

export interface DatabaseHealthCheck {
  isConnected: boolean;
  connectionTime: number;
  queryTime: number;
  error?: string;
  timestamp: Date;
}

/**
 * Perform a comprehensive database health check
 */
export async function checkDatabaseHealth(): Promise<DatabaseHealthCheck> {
  const startTime = Date.now();
  let connectionTime = 0;
  let queryTime = 0;
  
  if (!process.env.DATABASE_URL) {
    return {
      isConnected: false,
      connectionTime: 0,
      queryTime: 0,
      error: 'DATABASE_URL not configured',
      timestamp: new Date()
    };
  }
  
  try {
    const isAWSRDS = process.env.DATABASE_URL.includes('amazonaws.com');
    const isProduction = process.env.NODE_ENV === 'production';
    
    // Configure connection for health check
    const connectionConfig = {
      max: 1,
      idle_timeout: isProduction ? 60 : 20,
      connect_timeout: isAWSRDS ? 30 : (isProduction ? 20 : 10),
      ssl: isProduction ? { rejectUnauthorized: false } : false,
      transform: { undefined: null },
      prepare: false,
      onnotice: () => {},
    };
    
    const sql = postgres(process.env.DATABASE_URL, connectionConfig);
    
    // Test basic connection
    const connectStart = Date.now();
    
    // Simple connection test
    await sql`SELECT 1 as health_check`;
    connectionTime = Date.now() - connectStart;
    
    // Test a more complex query to verify database functionality
    const queryStart = Date.now();
    await sql`SELECT current_timestamp, version() as pg_version`;
    queryTime = Date.now() - queryStart;
    
    // Clean up connection
    await sql.end();
    
    console.log(`[DB-HEALTH] ✅ Database health check passed - Connection: ${connectionTime}ms, Query: ${queryTime}ms`);
    
    return {
      isConnected: true,
      connectionTime,
      queryTime,
      timestamp: new Date()
    };
    
  } catch (error: any) {
    const totalTime = Date.now() - startTime;
    console.error(`[DB-HEALTH] ❌ Database health check failed after ${totalTime}ms:`, error.message);
    
    return {
      isConnected: false,
      connectionTime: totalTime,
      queryTime: 0,
      error: error.message,
      timestamp: new Date()
    };
  }
}

/**
 * Retry database operation with exponential backoff
 */
export async function retryDatabaseOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      
      if (attempt === maxRetries) {
        console.error(`[DB-RETRY] Failed after ${maxRetries} attempts:`, error.message);
        throw error;
      }
      
      const delay = baseDelay * Math.pow(2, attempt - 1);
      console.log(`[DB-RETRY] Attempt ${attempt}/${maxRetries} failed, retrying in ${delay}ms:`, error.message);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}

/**
 * Test database connection with detailed logging
 */
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    console.log('[DB-TEST] Testing database connection...');
    
    const healthCheck = await checkDatabaseHealth();
    
    if (healthCheck.isConnected) {
      console.log('[DB-TEST] ✅ Database connection successful');
      return true;
    } else {
      console.error('[DB-TEST] ❌ Database connection failed:', healthCheck.error);
      return false;
    }
    
  } catch (error: any) {
    console.error('[DB-TEST] ❌ Database connection test failed:', error.message);
    return false;
  }
}