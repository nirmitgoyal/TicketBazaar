#!/usr/bin/env node
/**
 * Wait for PostgreSQL database to be ready
 * Simple connection test with retry logic
 */

import postgres from 'postgres';

async function waitForDatabase() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('DATABASE_URL environment variable is required');
    process.exit(1);
  }

  console.log('Waiting for database to be ready...');
  
  let retries = 30; // 30 attempts with 2 second intervals = 1 minute max
  
  while (retries > 0) {
    try {
      const client = postgres(databaseUrl, { 
        max: 1,
        ssl: false,
        prepare: false,
        connect_timeout: 5
      });
      
      // Simple connection test
      await client`SELECT 1 as test`;
      await client.end();
      
      console.log('Database is ready');
      process.exit(0);
      
    } catch (error: any) {
      retries--;
      
      if (retries === 0) {
        console.error('Database failed to become ready within timeout period');
        console.error('Last error:', error.message);
        process.exit(1);
      }
      
      console.log(`Database not ready, retrying... (${retries} attempts remaining)`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}

waitForDatabase();