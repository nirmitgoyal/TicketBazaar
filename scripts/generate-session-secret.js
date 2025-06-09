#!/usr/bin/env node

/**
 * Generate a cryptographically secure session secret
 * Usage: node scripts/generate-session-secret.js
 */

import { randomBytes } from 'crypto';

function generateSessionSecret() {
  // Generate 32 bytes of random data and encode as base64
  const secret = randomBytes(32).toString('base64');
  
  console.log('🔑 Generated Session Secret:');
  console.log(`SESSION_SECRET=${secret}`);
  console.log('');
  console.log('Copy this to your .env file.');
  console.log('⚠️  Keep this secret secure and never commit it to version control!');
  
  return secret;
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateSessionSecret();
}

export { generateSessionSecret };
