/**
 * Production environment setup for AWS RDS and Heroku
 * This file ensures proper SSL configuration for PostgreSQL connections
 */

// Set SSL mode for PostgreSQL connections on Heroku and AWS RDS
if (process.env.NODE_ENV === 'production' || process.env.DYNO) {
  // Heroku requires SSL connections but uses self-signed certificates
  // AWS RDS also requires SSL but has different certificate handling
  const isAWSRDS = process.env.DATABASE_URL?.includes('amazonaws.com');
  
  if (isAWSRDS) {
    // AWS RDS specific configuration
    process.env.PGSSLMODE = 'require';
    // AWS RDS has proper certificates, but we still need to handle some edge cases
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // Still needed for some AWS RDS configurations
    console.log('[PRODUCTION] SSL configuration set for AWS RDS PostgreSQL');
  } else {
    // Heroku specific configuration  
    process.env.PGSSLMODE = 'no-verify';
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    console.log('[PRODUCTION] SSL configuration set for Heroku PostgreSQL');
  }
  
  console.log('[PRODUCTION] PGSSLMODE:', process.env.PGSSLMODE);
  console.log('[PRODUCTION] NODE_TLS_REJECT_UNAUTHORIZED:', process.env.NODE_TLS_REJECT_UNAUTHORIZED);
  console.log('[PRODUCTION] AWS RDS detected:', isAWSRDS);
}

export {}; // Make this a module