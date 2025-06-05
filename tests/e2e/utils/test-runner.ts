#!/usr/bin/env node

/**
 * Advanced test runner with custom reporting and analytics
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

interface TestConfig {
  project?: string;
  spec?: string;
  headed?: boolean;
  debug?: boolean;
  slowMo?: number;
  workers?: number;
  retries?: number;
  reporter?: string[];
}

class E2ETestRunner {
  private config: TestConfig;
  private startTime: number;

  constructor(config: TestConfig = {}) {
    this.config = config;
    this.startTime = Date.now();
  }

  /**
   * Run the test suite with specified configuration
   */
  async run(): Promise<void> {
    console.log('🚀 Starting E2E Test Suite');
    console.log('================================');
    
    await this.validatePrerequisites();
    await this.setupTestEnvironment();
    
    const command = this.buildPlaywrightCommand();
    
    console.log(`📋 Running command: ${command.join(' ')}`);
    console.log('⏱️  Starting tests...\n');
    
    try {
      await this.executeTests(command);
      await this.generateReport();
      console.log('\n✅ All tests completed successfully!');
    } catch (error) {
      console.error('\n❌ Tests failed:', error);
      process.exit(1);
    }
  }

  /**
   * Validate that all prerequisites are met
   */
  private async validatePrerequisites(): Promise<void> {
    console.log('🔍 Validating prerequisites...');
    
    // Check if server is running
    try {
      const response = await fetch('http://localhost:5000/api/health');
      if (!response.ok) {
        throw new Error('Server health check failed');
      }
      console.log('  ✓ Server is running on localhost:5000');
    } catch (error) {
      console.error('  ❌ Server is not running. Please start with: npm run dev');
      process.exit(1);
    }

    // Check if Playwright browsers are installed
    const browserCheck = spawn('npx', ['playwright', '--version'], { stdio: 'pipe' });
    await new Promise((resolve, reject) => {
      browserCheck.on('close', (code) => {
        if (code === 0) {
          console.log('  ✓ Playwright is installed');
          resolve(void 0);
        } else {
          console.error('  ❌ Playwright not found. Run: npx playwright install');
          reject(new Error('Playwright not installed'));
        }
      });
    });

    // Check test fixtures
    const fixturesPath = path.join(__dirname, '../fixtures');
    if (fs.existsSync(fixturesPath)) {
      console.log('  ✓ Test fixtures available');
    } else {
      console.warn('  ⚠️  Test fixtures directory not found');
    }
  }

  /**
   * Setup test environment and cleanup
   */
  private async setupTestEnvironment(): Promise<void> {
    console.log('🛠️  Setting up test environment...');
    
    // Create test results directory
    const resultsDir = path.join(process.cwd(), 'test-results');
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
      console.log('  ✓ Created test results directory');
    }

    // Clear previous test artifacts if any
    const reportDir = path.join(process.cwd(), 'playwright-report');
    if (fs.existsSync(reportDir)) {
      fs.rmSync(reportDir, { recursive: true, force: true });
      console.log('  ✓ Cleared previous test reports');
    }

    console.log('  ✓ Environment setup complete');
  }

  /**
   * Build the Playwright command based on configuration
   */
  private buildPlaywrightCommand(): string[] {
    const command = ['npx', 'playwright', 'test'];

    if (this.config.project) {
      command.push('--project', this.config.project);
    }

    if (this.config.spec) {
      command.push(this.config.spec);
    }

    if (this.config.headed) {
      command.push('--headed');
    }

    if (this.config.debug) {
      command.push('--debug');
    }

    if (this.config.slowMo) {
      command.push('--slowMo', this.config.slowMo.toString());
    }

    if (this.config.workers) {
      command.push('--workers', this.config.workers.toString());
    }

    if (this.config.retries !== undefined) {
      command.push('--retries', this.config.retries.toString());
    }

    if (this.config.reporter) {
      this.config.reporter.forEach(reporter => {
        command.push('--reporter', reporter);
      });
    }

    return command;
  }

  /**
   * Execute the Playwright tests
   */
  private async executeTests(command: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      const testProcess = spawn(command[0], command.slice(1), {
        stdio: 'inherit',
        cwd: process.cwd()
      });

      testProcess.on('close', (code) => {
        const duration = Date.now() - this.startTime;
        console.log(`\n⏱️  Total execution time: ${Math.round(duration / 1000)}s`);
        
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Tests failed with exit code ${code}`));
        }
      });

      testProcess.on('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * Generate comprehensive test report
   */
  private async generateReport(): Promise<void> {
    console.log('\n📊 Generating test report...');
    
    try {
      // Read test results
      const resultsPath = path.join(process.cwd(), 'test-results/results.json');
      
      if (fs.existsSync(resultsPath)) {
        const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
        
        console.log('📈 Test Summary:');
        console.log(`  Total Tests: ${results.stats?.total || 'N/A'}`);
        console.log(`  Passed: ${results.stats?.passed || 'N/A'}`);
        console.log(`  Failed: ${results.stats?.failed || 'N/A'}`);
        console.log(`  Skipped: ${results.stats?.skipped || 'N/A'}`);
        
        if (results.stats?.failed > 0) {
          console.log('\n❌ Failed Tests:');
          results.suites?.forEach((suite: any) => {
            suite.specs?.forEach((spec: any) => {
              spec.tests?.forEach((test: any) => {
                if (test.results?.some((result: any) => result.status === 'failed')) {
                  console.log(`  - ${suite.title}: ${test.title}`);
                }
              });
            });
          });
        }
      }

      // Generate HTML report link
      const reportPath = path.join(process.cwd(), 'playwright-report/index.html');
      if (fs.existsSync(reportPath)) {
        console.log(`\n📋 Detailed HTML report: file://${reportPath}`);
      }

    } catch (error) {
      console.warn('⚠️  Could not generate detailed report:', error);
    }
  }

  /**
   * Run specific test categories
   */
  static async runCategory(category: string): Promise<void> {
    const categoryMap: Record<string, string> = {
      'auth': 'tests/e2e/specs/02-authentication-flow.spec.ts',
      'search': 'tests/e2e/specs/03-search-and-filters.spec.ts',
      'map': 'tests/e2e/specs/04-map-interactions.spec.ts',
      'websocket': 'tests/e2e/specs/05-websocket-realtime.spec.ts',
      'upload': 'tests/e2e/specs/06-file-upload-functionality.spec.ts',
      'forms': 'tests/e2e/specs/07-form-validation-edge-cases.spec.ts',
      'purchase': 'tests/e2e/specs/08-ticket-purchase-flow.spec.ts',
      'performance': 'tests/e2e/specs/09-performance-accessibility.spec.ts',
      'compatibility': 'tests/e2e/specs/10-cross-browser-compatibility.spec.ts'
    };

    const spec = categoryMap[category];
    if (!spec) {
      console.error(`❌ Unknown category: ${category}`);
      console.log('Available categories:', Object.keys(categoryMap).join(', '));
      process.exit(1);
    }

    const runner = new E2ETestRunner({ spec });
    await runner.run();
  }

  /**
   * Run tests for specific browser
   */
  static async runBrowser(browser: string): Promise<void> {
    const validBrowsers = ['chromium', 'firefox', 'webkit', 'Mobile Chrome', 'Mobile Safari'];
    
    if (!validBrowsers.includes(browser)) {
      console.error(`❌ Invalid browser: ${browser}`);
      console.log('Available browsers:', validBrowsers.join(', '));
      process.exit(1);
    }

    const runner = new E2ETestRunner({ project: browser });
    await runner.run();
  }

  /**
   * Run tests in debug mode
   */
  static async runDebug(spec?: string): Promise<void> {
    const runner = new E2ETestRunner({
      spec,
      headed: true,
      debug: true,
      workers: 1
    });
    await runner.run();
  }
}

// CLI handling
const args = process.argv.slice(2);
const command = args[0];

async function main() {
  try {
    switch (command) {
      case 'category':
        await E2ETestRunner.runCategory(args[1]);
        break;
      case 'browser':
        await E2ETestRunner.runBrowser(args[1]);
        break;
      case 'debug':
        await E2ETestRunner.runDebug(args[1]);
        break;
      case 'all':
      default:
        const runner = new E2ETestRunner();
        await runner.run();
        break;
    }
  } catch (error) {
    console.error('❌ Test runner failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { E2ETestRunner };