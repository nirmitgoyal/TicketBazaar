/**
 * Production environment setup for Heroku
 * This file ensures proper SSL configuration for PostgreSQL connections
 */

// Set SSL mode for PostgreSQL connections on Heroku
if (process.env.NODE_ENV === 'production' || process.env.DYNO) {
  // Heroku requires SSL connections but uses self-signed certificates
  // This environment variable tells PostgreSQL client to not verify certificates
  process.env.PGSSLMODE = 'no-verify';
  
  // Note: Database SSL configuration is handled in server/db.ts with driver-specific settings
  // We no longer set NODE_TLS_REJECT_UNAUTHORIZED globally for security reasons
  
  console.log('[PRODUCTION] SSL configuration set for Heroku PostgreSQL');
  console.log('[PRODUCTION] PGSSLMODE:', process.env.PGSSLMODE);
}

export {}; // Make this a module