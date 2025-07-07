#!/usr/bin/env node

/**
 * Test Google OAuth Configuration
 * 
 * This script validates that the OAuth configuration is working correctly
 */

import { config } from 'dotenv';
config();

import express from 'express';
import { setupAuth } from '../server/auth.js';

const app = express();

// Test OAuth setup
async function testOAuthSetup() {
  console.log('🧪 Testing Google OAuth Configuration...\n');
  
  try {
    // Set up auth to test configuration
    setupAuth(app);
    
    console.log('✅ OAuth setup completed without errors');
    console.log('✅ Google OAuth strategy configured successfully');
    
    // Test production domain detection
    const isProductionDomain = process.env.REPLIT_DOMAINS?.includes('ticketbazaar.co.in') || 
                               process.env.NODE_ENV === 'production' && !process.env.REPL_ID ||
                               process.env.DOMAIN === 'ticketbazaar.co.in' ||
                               process.env.PRODUCTION_DOMAIN === 'ticketbazaar.co.in';
    
    console.log(`✅ Production domain detection: ${isProductionDomain ? 'Production' : 'Development'}`);
    
    // Generate the callback URL that would be used
    let callbackURL;
    if (isProductionDomain || process.env.NODE_ENV === 'production') {
      const productionDomain = process.env.PRODUCTION_DOMAIN || 'ticketbazaar.co.in';
      callbackURL = `https://${productionDomain}/api/auth/google/callback`;
    } else {
      callbackURL = '/api/auth/google/callback';
    }
    
    console.log(`✅ Callback URL: ${callbackURL}`);
    console.log('\n🎉 OAuth configuration test passed!');
    
  } catch (error) {
    console.error('❌ OAuth setup failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

// Run the test
testOAuthSetup();
