#!/usr/bin/env node
/**
 * Test database connection with the new SSL configuration
 * This verifies the fix for GitHub issue #25
 */

import { config } from "dotenv";
import postgres from "postgres";

// Load environment variables
config();

async function testConnection() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL environment variable is required');
    process.exit(1);
  }

  console.log('🔍 Testing database connection with environment-aware SSL...');
  
  // Use the same SSL logic as in server/db.ts
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

  console.log(`🔐 SSL Configuration: ${sslConfig === false ? 'disabled' : 'enabled (' + sslConfig + ')'}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);

  try {
    const client = postgres(databaseUrl, {
      max: 1,
      ssl: sslConfig,
      connect_timeout: 10,
    });

    // Test basic connection
    await client`SELECT 1 as test`;
    console.log('✅ Database connection successful!');

    // Test a simple query
    const result = await client`SELECT current_database() as db_name, version() as version`;
    console.log(`📊 Connected to database: ${result[0].db_name}`);
    console.log(`🔧 PostgreSQL version: ${result[0].version.split(' ')[0]} ${result[0].version.split(' ')[1]}`);

    await client.end();
    console.log('🎉 Connection test completed successfully');
    process.exit(0);

  } catch (error: any) {
    console.error('❌ Database connection failed:', error.message);
    
    if (error.message.includes('SSL')) {
      console.error('💡 This appears to be an SSL-related issue. The fix should resolve this.');
    }
    
    process.exit(1);
  }
}

testConnection();
