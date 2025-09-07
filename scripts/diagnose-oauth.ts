#!/usr/bin/env node

/**
 * Google OAuth Diagnostics and Setup Script
 * 
 * This script helps diagnose and fix Google OAuth issues for TicketBazaar
 */

import { config } from 'dotenv';
config();

interface OAuthDiagnostics {
  environmentVariables: Record<string, string | undefined>;
  requiredVars: Record<string, boolean>;
  domainDetection: {
    isProductionDomain: boolean;
    detectionMethods: Record<string, boolean>;
  };
  recommendations: string[];
  errors: string[];
}

/**
 * Run comprehensive OAuth diagnostics
 */
function runOAuthDiagnostics(): OAuthDiagnostics {
  const diagnostics: OAuthDiagnostics = {
    environmentVariables: {},
    requiredVars: {},
    domainDetection: {
      isProductionDomain: false,
      detectionMethods: {}
    },
    recommendations: [],
    errors: []
  };

  // Check environment variables
  const envVars = [
    'NODE_ENV',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'SESSION_SECRET',
    'DATABASE_URL',
    'REPLIT_DOMAINS',
    'PRODUCTION_DOMAIN',
    'DOMAIN',
    'DYNO'
  ];

  envVars.forEach(varName => {
    diagnostics.environmentVariables[varName] = process.env[varName];
  });

  // Check required variables
  diagnostics.requiredVars.GOOGLE_CLIENT_ID = !!process.env.GOOGLE_CLIENT_ID;
  diagnostics.requiredVars.GOOGLE_CLIENT_SECRET = !!process.env.GOOGLE_CLIENT_SECRET;
  diagnostics.requiredVars.SESSION_SECRET = !!process.env.SESSION_SECRET;
  diagnostics.requiredVars.DATABASE_URL = !!process.env.DATABASE_URL;

  // Domain detection logic (same as in auth.ts)
  const replitDomainsCheck = process.env.REPLIT_DOMAINS?.includes('ticketbazaar.co.in');
  const nodeEnvCheck = process.env.NODE_ENV === 'production' && !process.env.REPL_ID;
  const domainCheck = process.env.DOMAIN === 'ticketbazaar.co.in';
  const productionDomainCheck = process.env.PRODUCTION_DOMAIN === 'ticketbazaar.co.in';

  diagnostics.domainDetection.detectionMethods = {
    replitDomainsCheck: !!replitDomainsCheck,
    nodeEnvCheck: !!nodeEnvCheck,
    domainCheck: !!domainCheck,
    productionDomainCheck: !!productionDomainCheck
  };

  diagnostics.domainDetection.isProductionDomain = 
    replitDomainsCheck || nodeEnvCheck || domainCheck || productionDomainCheck;

  // Generate recommendations and identify errors
  if (!process.env.GOOGLE_CLIENT_ID) {
    diagnostics.errors.push('GOOGLE_CLIENT_ID environment variable is missing');
    diagnostics.recommendations.push('Set GOOGLE_CLIENT_ID environment variable with your Google OAuth client ID');
  }

  if (!process.env.GOOGLE_CLIENT_SECRET) {
    diagnostics.errors.push('GOOGLE_CLIENT_SECRET environment variable is missing');
    diagnostics.recommendations.push('Set GOOGLE_CLIENT_SECRET environment variable with your Google OAuth client secret');
  }

  if (!process.env.SESSION_SECRET) {
    diagnostics.errors.push('SESSION_SECRET environment variable is missing');
    diagnostics.recommendations.push('Set SESSION_SECRET environment variable with a secure random string');
  }

  // Check callback URL configuration
  const isProduction = diagnostics.domainDetection.isProductionDomain || process.env.NODE_ENV === 'production';
  let expectedCallbackURL;
  
  if (isProduction) {
    const productionDomain = process.env.PRODUCTION_DOMAIN || 'ticketbazaar.co.in';
    expectedCallbackURL = `https://${productionDomain}/api/auth/google/callback`;
  } else {
    expectedCallbackURL = '/api/auth/google/callback (relative)';
  }

  diagnostics.recommendations.push(
    `Expected callback URL for current environment: ${expectedCallbackURL}`
  );

  if (isProduction) {
    diagnostics.recommendations.push(
      'Ensure your Google OAuth app has the following authorized redirect URI configured:'
    );
    diagnostics.recommendations.push(
      `- https://ticketbazaar.co.in/api/auth/google/callback`
    );
    diagnostics.recommendations.push(
      'Also ensure your Google OAuth app has the following authorized domains:'
    );
    diagnostics.recommendations.push(
      `- ticketbazaar.co.in`
    );
  }

  // Additional production checks
  if (isProduction) {
    if (!process.env.DATABASE_URL?.includes('ssl=true') && 
        !process.env.DATABASE_URL?.includes('sslmode=require')) {
      diagnostics.recommendations.push(
        'Consider enabling SSL for your production database connection'
      );
    }

    if (!diagnostics.domainDetection.isProductionDomain) {
      diagnostics.recommendations.push(
        'Production domain detection may not be working correctly. Consider setting PRODUCTION_DOMAIN=ticketbazaar.co.in'
      );
    }
  }

  return diagnostics;
}

/**
 * Display OAuth diagnostics in a readable format
 */
function displayDiagnostics(diagnostics: OAuthDiagnostics) {
  console.log('\n🔍 Google OAuth Diagnostics for TicketBazaar\n');
  console.log('=' .repeat(60));

  // Environment Variables
  console.log('\n📋 Environment Variables:');
  Object.entries(diagnostics.environmentVariables).forEach(([key, value]) => {
    const status = value ? '✅' : '❌';
    const displayValue = key.includes('SECRET') || key.includes('CLIENT') 
      ? (value ? '[SET]' : '[NOT SET]') 
      : (value || '[NOT SET]');
    console.log(`  ${status} ${key}: ${displayValue}`);
  });

  // Required Variables Check
  console.log('\n🔑 Required Variables Status:');
  Object.entries(diagnostics.requiredVars).forEach(([key, present]) => {
    const status = present ? '✅' : '❌';
    console.log(`  ${status} ${key}: ${present ? 'Present' : 'Missing'}`);
  });

  // Domain Detection
  console.log('\n🌐 Production Domain Detection:');
  console.log(`  Overall: ${diagnostics.domainDetection.isProductionDomain ? '✅ Production' : '❌ Development'}`);
  console.log('  Detection Methods:');
  Object.entries(diagnostics.domainDetection.detectionMethods).forEach(([method, detected]) => {
    const status = detected ? '✅' : '❌';
    console.log(`    ${status} ${method}: ${detected}`);
  });

  // Errors
  if (diagnostics.errors.length > 0) {
    console.error('\n❌ Errors Found:');
    diagnostics.errors.forEach((error, index) => {
      console.error(`  ${index + 1}. ${error}`);
    });
  }

  // Recommendations
  if (diagnostics.recommendations.length > 0) {
    console.log('\n💡 Recommendations:');
    diagnostics.recommendations.forEach((recommendation, index) => {
      console.log(`  ${index + 1}. ${recommendation}`);
    });
  }

  console.log('\n' + '=' .repeat(60));
  console.log('✨ OAuth Diagnostics Complete\n');
}

/**
 * Generate Google OAuth app configuration instructions
 */
function generateGoogleOAuthInstructions() {
  console.log('\n🔧 Google OAuth App Configuration Instructions\n');
  console.log('=' .repeat(60));
  
  console.log('\n1. Go to Google Cloud Console: https://console.cloud.google.com/');
  console.log('2. Select your project or create a new one');
  console.log('3. Navigate to "APIs & Services" > "Credentials"');
  console.log('4. Click "Create Credentials" > "OAuth 2.0 Client IDs"');
  console.log('5. Select "Web application" as the application type');
  
  console.log('\n📍 Authorized JavaScript Origins:');
  console.log('  - https://ticketbazaar.co.in');
  console.log('  - http://localhost:3000 (for development)');
  
  console.log('\n🔄 Authorized Redirect URIs:');
  console.log('  - https://ticketbazaar.co.in/api/auth/google/callback');
  console.log('  - http://localhost:3000/api/auth/google/callback (for development)');
  
  console.log('\n⚙️ OAuth Consent Screen Configuration:');
  console.log('  - User Type: External');
  console.log('  - App Name: TicketBazaar');
  console.log('  - User Support Email: [your-email]');
  console.log('  - Developer Contact Email: [your-email]');
  console.log('  - Authorized Domain: ticketbazaar.co.in');
  
  console.log('\n🔐 Required Scopes:');
  console.log('  - email');
  console.log('  - profile');
  console.log('  - openid');
  
  console.log('\n' + '=' .repeat(60));
}

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    const diagnostics = runOAuthDiagnostics();
    displayDiagnostics(diagnostics);
    
    // Show Google OAuth setup instructions if credentials are missing
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      generateGoogleOAuthInstructions();
    }
    
    // Exit with error code if there are errors
    if (diagnostics.errors.length > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error running OAuth diagnostics:', error);
    process.exit(1);
  }
}

export { runOAuthDiagnostics, displayDiagnostics, generateGoogleOAuthInstructions };
