#!/usr/bin/env node

/**
 * Google OAuth 2.0 Diagnostics & Troubleshooting Script
 * This script helps identify and fix common Google OAuth issues
 */

import { config } from 'dotenv';
config();

import express from 'express';
import { setupAuth } from '../server/auth.js';
import passport from 'passport';
import chalk from 'chalk';
import fetch from 'node-fetch';

const log = {
  info: (msg: string) => console.log(chalk.blue('ℹ'), msg),
  success: (msg: string) => console.log(chalk.green('✓'), msg),
  error: (msg: string) => console.log(chalk.red('✗'), msg),
  warn: (msg: string) => console.log(chalk.yellow('⚠'), msg),
  debug: (msg: string) => console.log(chalk.gray('🔍'), msg)
};

interface DiagnosticResult {
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: any;
  fix?: string;
}

class GoogleOAuthDiagnostics {
  private results: DiagnosticResult[] = [];
  
  async runAllDiagnostics() {
    console.log(chalk.bold.blue('\n🔬 Google OAuth 2.0 Diagnostics\n'));
    
    // 1. Check environment variables
    await this.checkEnvironmentVariables();
    
    // 2. Check callback URL configuration
    await this.checkCallbackUrl();
    
    // 3. Test Passport configuration
    await this.testPassportSetup();
    
    // 4. Check session configuration
    await this.checkSessionConfig();
    
    // 5. Test Google OAuth endpoints
    await this.testGoogleEndpoints();
    
    // 6. Check common CORS/HTTPS issues
    await this.checkSecuritySettings();
    
    // 7. Display results and recommendations
    this.displayResults();
  }
  
  private async checkEnvironmentVariables() {
    log.info('Checking environment variables...');
    
    const requiredVars = {
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
      SESSION_SECRET: process.env.SESSION_SECRET,
      DATABASE_URL: process.env.DATABASE_URL
    };
    
    const optionalVars = {
      GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL,
      NODE_ENV: process.env.NODE_ENV,
      REPL_ID: process.env.REPL_ID,
      REPLIT_DEV_DOMAIN: process.env.REPLIT_DEV_DOMAIN
    };
    
    // Check required variables
    for (const [key, value] of Object.entries(requiredVars)) {
      if (!value) {
        this.results.push({
          status: 'fail',
          message: `Missing required environment variable: ${key}`,
          fix: `Set ${key} in your environment variables`
        });
      } else {
        this.results.push({
          status: 'pass',
          message: `${key} is configured`,
          details: key === 'GOOGLE_CLIENT_ID' ? value : '***hidden***'
        });
      }
    }
    
    // Check optional variables
    for (const [key, value] of Object.entries(optionalVars)) {
      if (!value) {
        this.results.push({
          status: 'warning',
          message: `Optional variable ${key} not set`,
          details: 'This might be fine depending on your setup'
        });
      } else {
        this.results.push({
          status: 'pass',
          message: `${key} is configured`,
          details: value
        });
      }
    }
  }
  
  private async checkCallbackUrl() {
    log.info('Checking callback URL configuration...');
    
    const isReplit = process.env.REPL_ID || process.env.REPLIT_DB_URL;
    const isProduction = process.env.NODE_ENV === 'production' && !isReplit;
    
    let expectedCallbackUrl: string;
    
    if (process.env.GOOGLE_CALLBACK_URL) {
      expectedCallbackUrl = process.env.GOOGLE_CALLBACK_URL;
    } else if (isReplit) {
      const replitDomain = process.env.REPLIT_DEV_DOMAIN || 
                          `${process.env.REPL_SLUG}-${process.env.REPL_OWNER}.repl.co`;
      expectedCallbackUrl = `https://${replitDomain}/api/auth/google/callback`;
    } else if (isProduction) {
      expectedCallbackUrl = 'https://ticketbazaar.co.in/api/auth/google/callback';
    } else {
      expectedCallbackUrl = '/api/auth/google/callback';
    }
    
    this.results.push({
      status: 'pass',
      message: 'Callback URL determined',
      details: {
        expectedCallbackUrl,
        isReplit,
        isProduction,
        googleCallbackUrl: process.env.GOOGLE_CALLBACK_URL
      }
    });
    
    // Check if this matches Google Console configuration
    log.warn(`\nIMPORTANT: Ensure this callback URL is added to your Google OAuth app:`);
    console.log(chalk.bold.cyan(`  ${expectedCallbackUrl}\n`));
  }
  
  private async testPassportSetup() {
    log.info('Testing Passport configuration...');
    
    try {
      const app = express();
      setupAuth(app);
      
      // Check if Google strategy is registered
      const strategies = (passport as any)._strategies;
      if (strategies.google) {
        this.results.push({
          status: 'pass',
          message: 'Google OAuth strategy is registered',
          details: 'Passport.js is configured correctly'
        });
      } else {
        this.results.push({
          status: 'fail',
          message: 'Google OAuth strategy not found',
          fix: 'Check that GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set'
        });
      }
    } catch (error: any) {
      this.results.push({
        status: 'fail',
        message: 'Error setting up authentication',
        details: error.message,
        fix: 'Check your auth.ts file for errors'
      });
    }
  }
  
  private async checkSessionConfig() {
    log.info('Checking session configuration...');
    
    const sessionSecret = process.env.SESSION_SECRET;
    
    if (!sessionSecret) {
      this.results.push({
        status: 'fail',
        message: 'SESSION_SECRET not configured',
        fix: 'Generate a secure session secret: openssl rand -base64 32'
      });
    } else if (sessionSecret.length < 32) {
      this.results.push({
        status: 'warning',
        message: 'SESSION_SECRET is too short',
        details: `Current length: ${sessionSecret.length} characters`,
        fix: 'Use at least 32 characters for better security'
      });
    } else {
      this.results.push({
        status: 'pass',
        message: 'Session secret is properly configured',
        details: `Length: ${sessionSecret.length} characters`
      });
    }
    
    // Check database connection for session store
    if (process.env.DATABASE_URL) {
      this.results.push({
        status: 'pass',
        message: 'Database URL configured for session storage',
        details: 'Sessions will persist across server restarts'
      });
    } else {
      this.results.push({
        status: 'warning',
        message: 'No database URL for session storage',
        details: 'Sessions will be lost on server restart'
      });
    }
  }
  
  private async testGoogleEndpoints() {
    log.info('Testing Google OAuth endpoints...');
    
    try {
      // Test Google's discovery document
      const response = await fetch('https://accounts.google.com/.well-known/openid-configuration');
      const config = await response.json();
      
      if (config.authorization_endpoint && config.token_endpoint) {
        this.results.push({
          status: 'pass',
          message: 'Google OAuth endpoints are accessible',
          details: {
            authEndpoint: config.authorization_endpoint,
            tokenEndpoint: config.token_endpoint
          }
        });
      }
    } catch (error: any) {
      this.results.push({
        status: 'fail',
        message: 'Cannot reach Google OAuth endpoints',
        details: error.message,
        fix: 'Check your internet connection and firewall settings'
      });
    }
  }
  
  private async checkSecuritySettings() {
    log.info('Checking security settings...');
    
    const isProduction = process.env.NODE_ENV === 'production';
    const isHttps = process.env.GOOGLE_CALLBACK_URL?.startsWith('https://');
    
    // HTTPS check
    if (isProduction && !isHttps) {
      this.results.push({
        status: 'warning',
        message: 'Production environment should use HTTPS',
        fix: 'Ensure your callback URL uses HTTPS in production'
      });
    } else {
      this.results.push({
        status: 'pass',
        message: 'HTTPS configuration is appropriate',
        details: isProduction ? 'Using HTTPS' : 'Development mode'
      });
    }
    
    // CORS configuration
    this.results.push({
      status: 'pass',
      message: 'CORS configuration reminder',
      details: 'Google OAuth handles CORS internally via redirects'
    });
    
    // Cookie settings
    if (isProduction) {
      this.results.push({
        status: 'pass',
        message: 'Cookie security for production',
        details: 'Secure cookies will be used with SameSite=lax'
      });
    }
  }
  
  private displayResults() {
    console.log(chalk.bold.blue('\n📊 Diagnostic Results\n'));
    
    const passed = this.results.filter(r => r.status === 'pass').length;
    const failed = this.results.filter(r => r.status === 'fail').length;
    const warnings = this.results.filter(r => r.status === 'warning').length;
    
    // Display individual results
    this.results.forEach(result => {
      const icon = result.status === 'pass' ? '✓' : 
                   result.status === 'fail' ? '✗' : '⚠';
      const color = result.status === 'pass' ? chalk.green :
                    result.status === 'fail' ? chalk.red : chalk.yellow;
      
      console.log(color(icon), result.message);
      if (result.details) {
        console.log(chalk.gray('  Details:'), result.details);
      }
      if (result.fix) {
        console.log(chalk.cyan('  Fix:'), result.fix);
      }
    });
    
    // Summary
    console.log(chalk.bold.blue('\n📈 Summary\n'));
    console.log(`  Passed: ${chalk.green(passed)}`);
    console.log(`  Failed: ${chalk.red(failed)}`);
    console.log(`  Warnings: ${chalk.yellow(warnings)}`);
    
    // Common issues and fixes
    if (failed > 0) {
      console.log(chalk.bold.red('\n🔧 Common Issues & Fixes\n'));
      
      console.log(chalk.bold('1. Redirect URI Mismatch'));
      console.log('   - Add the exact callback URL to Google Console');
      console.log('   - Check for trailing slashes and protocol (http/https)');
      
      console.log(chalk.bold('\n2. Invalid Client'));
      console.log('   - Verify GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET');
      console.log('   - Ensure credentials are from the correct project');
      
      console.log(chalk.bold('\n3. Session Issues'));
      console.log('   - Clear browser cookies and try again');
      console.log('   - Check SESSION_SECRET is set and consistent');
      
      console.log(chalk.bold('\n4. CORS/HTTPS Issues'));
      console.log('   - Use HTTPS in production');
      console.log('   - Ensure cookies are configured correctly');
    }
    
    // Next steps
    console.log(chalk.bold.blue('\n🚀 Next Steps\n'));
    console.log('1. Fix any failed checks above');
    console.log('2. Ensure callback URL is added to Google Console');
    console.log('3. Test login flow with browser DevTools open');
    console.log('4. Check server logs for detailed error messages');
    
    // Test URLs
    console.log(chalk.bold.blue('\n🔗 Test URLs\n'));
    const baseUrl = process.env.REPLIT_DEV_DOMAIN 
      ? `https://${process.env.REPLIT_DEV_DOMAIN}`
      : 'http://localhost:3000';
    console.log(`Login page: ${chalk.cyan(`${baseUrl}/login`)}`);
    console.log(`OAuth endpoint: ${chalk.cyan(`${baseUrl}/api/auth/google`)}`);
    console.log(`Check auth: ${chalk.cyan(`${baseUrl}/api/auth/me`)}`);
  }
}

// Run diagnostics
async function main() {
  try {
    const diagnostics = new GoogleOAuthDiagnostics();
    await diagnostics.runAllDiagnostics();
    
    console.log(chalk.bold.blue('\n💡 Debug Commands\n'));
    console.log('Watch server logs:');
    console.log(chalk.gray('  npm run dev'));
    console.log('\nTest auth endpoint:');
    console.log(chalk.gray('  curl http://localhost:3000/api/auth/me'));
    console.log('\nMonitor network requests:');
    console.log(chalk.gray('  Open Browser DevTools > Network tab'));
    
  } catch (error: any) {
    log.error(`Diagnostic failed: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

// Run the diagnostic
main();