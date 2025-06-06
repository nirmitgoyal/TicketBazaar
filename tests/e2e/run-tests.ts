#!/usr/bin/env node

/**
 * Comprehensive test execution script for the ticket resale platform
 * Handles test environment setup, execution, and reporting
 */

import { execSync, spawn } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import path from 'path';

interface TestConfig {
  category?: string;
  browser?: string;
  headed?: boolean;
  debug?: boolean;
  ui?: boolean;
  parallel?: boolean;
  retries?: number;
}

class TestExecutor {
  private baseDir = process.cwd();
  private testResultsDir = path.join(this.baseDir, 'test-results');

  constructor() {
    this.ensureDirectories();
  }

  private ensureDirectories() {
    if (!existsSync(this.testResultsDir)) {
      mkdirSync(this.testResultsDir, { recursive: true });
    }
  }

  async setupTestEnvironment() {
    console.log('🔧 Setting up test environment...');
    
    try {
      // Ensure database schema is up to date
      console.log('📊 Pushing database schema...');
      execSync('npm run db:push', { stdio: 'inherit' });

      // Seed test data
      console.log('🌱 Seeding test data...');
      execSync('npx tsx scripts/seed-users.ts', { stdio: 'inherit' });
      execSync('npx tsx scripts/seed-realistic-events.ts', { stdio: 'inherit' });
      execSync('npx tsx scripts/seed-tickets.ts', { stdio: 'inherit' });

      console.log('✅ Test environment setup complete');
    } catch (error) {
      console.error('❌ Failed to setup test environment:', error);
      throw error;
    }
  }

  async runTests(config: TestConfig = {}) {
    console.log('🚀 Starting comprehensive E2E test execution...');

    const playwrightArgs = ['test'];

    // Configure test category
    if (config.category) {
      playwrightArgs.push(`tests/e2e/${config.category}/`);
    }

    // Configure browser
    if (config.browser) {
      playwrightArgs.push('--project', config.browser);
    }

    // Configure execution mode
    if (config.headed) {
      playwrightArgs.push('--headed');
    }

    if (config.debug) {
      playwrightArgs.push('--debug');
    }

    if (config.ui) {
      playwrightArgs.push('--ui');
    }

    // Configure parallel execution
    if (config.parallel === false) {
      playwrightArgs.push('--workers=1');
    }

    // Configure retries
    if (config.retries) {
      playwrightArgs.push('--retries', config.retries.toString());
    }

    // Add reporting
    playwrightArgs.push('--reporter=html,json,junit');

    try {
      const testProcess = spawn('npx', ['playwright', ...playwrightArgs], {
        stdio: 'inherit',
        cwd: this.baseDir
      });

      return new Promise((resolve, reject) => {
        testProcess.on('close', (code) => {
          if (code === 0) {
            console.log('✅ All tests completed successfully');
            this.generateTestSummary();
            resolve(code);
          } else {
            console.error(`❌ Tests failed with exit code ${code}`);
            this.generateTestSummary();
            reject(new Error(`Test execution failed with code ${code}`));
          }
        });

        testProcess.on('error', (error) => {
          console.error('❌ Failed to start test process:', error);
          reject(error);
        });
      });
    } catch (error) {
      console.error('❌ Test execution error:', error);
      throw error;
    }
  }

  async runTestSuite(suiteName: string) {
    const suites = {
      auth: 'Authentication & Session Management',
      navigation: 'Page Navigation & Routing',
      forms: 'Form Validation & Data Input',
      websocket: 'Real-time WebSocket Features',
      maps: 'Google Maps Integration',
      uploads: 'File Upload Scenarios',
      animations: 'UI Animations & Responsiveness',
      errors: 'Error Handling & Recovery'
    };

    if (!suites[suiteName as keyof typeof suites]) {
      throw new Error(`Unknown test suite: ${suiteName}`);
    }

    console.log(`🧪 Running ${suites[suiteName as keyof typeof suites]} tests...`);
    
    await this.runTests({ category: suiteName });
  }

  async runCriticalPath() {
    console.log('🎯 Running critical user journey tests...');
    
    const criticalTests = [
      'tests/e2e/auth/authentication.test.ts',
      'tests/e2e/navigation/routing.test.ts',
      'tests/e2e/forms/form-validation.test.ts'
    ];

    for (const testFile of criticalTests) {
      console.log(`🔍 Running ${testFile}...`);
      
      try {
        execSync(`npx playwright test ${testFile}`, { 
          stdio: 'inherit',
          cwd: this.baseDir 
        });
      } catch (error) {
        console.error(`❌ Critical test failed: ${testFile}`);
        throw error;
      }
    }

    console.log('✅ Critical path tests completed');
  }

  private generateTestSummary() {
    console.log('\n📊 Test Execution Summary');
    console.log('==========================');
    
    const reportPath = path.join(this.testResultsDir, 'results.json');
    if (existsSync(reportPath)) {
      try {
        const results = require(reportPath);
        console.log(`Total Tests: ${results.stats?.total || 'N/A'}`);
        console.log(`Passed: ${results.stats?.passed || 'N/A'}`);
        console.log(`Failed: ${results.stats?.failed || 'N/A'}`);
        console.log(`Skipped: ${results.stats?.skipped || 'N/A'}`);
      } catch (error) {
        console.log('Could not parse test results');
      }
    }

    console.log(`\n📁 Reports available in: ${this.testResultsDir}`);
    console.log('🌐 View HTML report: npx playwright show-report');
  }

  async validateTestEnvironment() {
    console.log('🔍 Validating test environment...');

    const requirements = [
      { command: 'npm --version', name: 'npm' },
      { command: 'npx playwright --version', name: 'Playwright' },
      { command: 'node --version', name: 'Node.js' }
    ];

    for (const req of requirements) {
      try {
        execSync(req.command, { stdio: 'pipe' });
        console.log(`✅ ${req.name} is available`);
      } catch (error) {
        console.error(`❌ ${req.name} is not available`);
        throw new Error(`Missing requirement: ${req.name}`);
      }
    }

    // Check if server is running
    try {
      const response = await fetch('http://localhost:5000/api/auth/user');
      console.log('✅ Development server is running');
    } catch (error) {
      console.warn('⚠️  Development server may not be running on port 5000');
    }

    console.log('✅ Environment validation complete');
  }
}

// CLI interface
async function main() {
  const executor = new TestExecutor();
  const args = process.argv.slice(2);
  const command = args[0];

  try {
    await executor.validateTestEnvironment();

    switch (command) {
      case 'setup':
        await executor.setupTestEnvironment();
        break;

      case 'run':
        await executor.setupTestEnvironment();
        await executor.runTests({
          category: args[1],
          browser: args.includes('--browser') ? args[args.indexOf('--browser') + 1] : undefined,
          headed: args.includes('--headed'),
          debug: args.includes('--debug'),
          ui: args.includes('--ui')
        });
        break;

      case 'suite':
        await executor.setupTestEnvironment();
        await executor.runTestSuite(args[1]);
        break;

      case 'critical':
        await executor.setupTestEnvironment();
        await executor.runCriticalPath();
        break;

      case 'all':
        await executor.setupTestEnvironment();
        await executor.runTests();
        break;

      default:
        console.log(`
🧪 Comprehensive E2E Test Runner

Usage:
  npx tsx tests/e2e/run-tests.ts <command> [options]

Commands:
  setup                 Setup test environment and seed data
  run [category]        Run tests (optionally specify category)
  suite <name>          Run specific test suite
  critical             Run critical user journey tests
  all                  Run all tests

Categories:
  auth                 Authentication & Session Management
  navigation           Page Navigation & Routing  
  forms                Form Validation & Data Input
  websocket            Real-time WebSocket Features
  maps                 Google Maps Integration
  uploads              File Upload Scenarios
  animations           UI Animations & Responsiveness
  errors               Error Handling & Recovery

Options:
  --headed             Run tests in headed mode
  --debug              Run tests in debug mode
  --ui                 Run tests in UI mode
  --browser <name>     Run tests in specific browser

Examples:
  npx tsx tests/e2e/run-tests.ts setup
  npx tsx tests/e2e/run-tests.ts run auth --headed
  npx tsx tests/e2e/run-tests.ts suite forms
  npx tsx tests/e2e/run-tests.ts critical
  npx tsx tests/e2e/run-tests.ts all
        `);
        break;
    }
  } catch (error) {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { TestExecutor };