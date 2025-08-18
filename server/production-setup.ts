/**
 * Production environment setup for Heroku
 * This file ensures proper SSL configuration for PostgreSQL connections
 */

// Set SSL mode for PostgreSQL connections on Heroku
if (process.env.NODE_ENV === 'production' || process.env.DYNO) {
  // Heroku requires SSL connections but uses self-signed certificates
  // This environment variable tells PostgreSQL client to not verify certificates
  process.env.PGSSLMODE = 'no-verify';
  
  // Alternative: Set NODE_TLS_REJECT_UNAUTHORIZED for node-postgres
  // This is less secure but necessary for Heroku's self-signed certificates
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  
  console.log('[PRODUCTION] SSL configuration set for Heroku PostgreSQL');
  console.log('[PRODUCTION] PGSSLMODE:', process.env.PGSSLMODE);
  console.log('[PRODUCTION] NODE_TLS_REJECT_UNAUTHORIZED:', process.env.NODE_TLS_REJECT_UNAUTHORIZED);
}

export {}; // Make this a module