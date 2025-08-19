#!/usr/bin/env node

/**
 * Database connection initialization with retry logic
 * Specifically designed to handle AWS RDS connection timeouts
 */

import { config } from 'dotenv';
import postgres from 'postgres';
import { checkDatabaseHealth, retryDatabaseOperation } from '../server/utils/db-health.js';

config();

async function initializeDatabaseConnection() {
  console.log('🔗 Initializing database connection...');
  
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is required');
    process.exit(1);
  }

  const isAWSRDS = process.env.DATABASE_URL.includes('amazonaws.com');
  const isProduction = process.env.NODE_ENV === 'production';
  
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔌 AWS RDS: ${isAWSRDS}`);
  console.log(`🏭 Production: ${isProduction}`);

  // Configure connection with proper timeouts for AWS RDS
  const connectionConfig = {
    max: 1, // Single connection for initialization
    idle_timeout: isProduction ? 60 : 20,
    connect_timeout: isAWSRDS ? 30 : (isProduction ? 20 : 10),
    ssl: isProduction ? { rejectUnauthorized: false } : false,
    transform: { undefined: null },
    prepare: false,
    onnotice: () => {}, // Suppress notices
  };

  console.log(`⏱️  Using connection timeout: ${connectionConfig.connect_timeout}s`);

  try {
    // Use retry logic for initial connection
    await retryDatabaseOperation(async () => {
      console.log('🔄 Attempting database connection...');
      
      const sql = postgres(process.env.DATABASE_URL!, connectionConfig);
      
      // Test connection
      await sql`SELECT 1 as test`;
      console.log('✅ Database connection test passed');
      
      // Clean up test connection
      await sql.end();
      
      return true;
    }, 5, 2000); // 5 retries with 2 second base delay

    // Perform full health check
    console.log('🏥 Running comprehensive health check...');
    const healthCheck = await checkDatabaseHealth();
    
    if (healthCheck.isConnected) {
      console.log(`✅ Database is healthy - Connection: ${healthCheck.connectionTime}ms, Query: ${healthCheck.queryTime}ms`);
      console.log('🎉 Database initialization completed successfully!');
    } else {
      console.error('❌ Database health check failed:', healthCheck.error);
      process.exit(1);
    }

  } catch (error: any) {
    console.error('❌ Database initialization failed:', error.message);
    
    if (error.message.includes('CONNECT_TIMEOUT')) {
      console.error('');
      console.error('💡 Connection timeout detected. This might be due to:');
      console.error('   • Network latency to AWS RDS');
      console.error('   • Database server being under heavy load');
      console.error('   • Security group or firewall blocking connections');
      console.error('   • SSL/TLS handshake issues');
      console.error('');
      console.error('🔧 Recommended fixes:');
      console.error('   • Check AWS RDS security groups');
      console.error('   • Verify SSL configuration');
      console.error('   • Monitor RDS performance metrics');
      console.error('   • Consider increasing connection timeout values');
    }
    
    process.exit(1);
  }
}

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  initializeDatabaseConnection().catch((error) => {
    console.error('💥 Initialization script failed:', error);
    process.exit(1);
  });
}

export { initializeDatabaseConnection };