import { execSync } from 'child_process';
import { test, expect } from '@playwright/test';

/**
 * Test runner configuration for comprehensive E2E testing
 * Handles test setup, database seeding, and cleanup
 */
export class TestRunner {
  
  static async setupTestEnvironment() {
    console.log('Setting up test environment...');
    
    try {
      // Push database schema
      execSync('npm run db:push', { stdio: 'inherit' });
      
      // Seed test data
      execSync('npx tsx scripts/seed-users.ts', { stdio: 'inherit' });
      execSync('npx tsx scripts/seed-realistic-events.ts', { stdio: 'inherit' });
      execSync('npx tsx scripts/seed-tickets.ts', { stdio: 'inherit' });
      
      console.log('Test environment setup complete');
    } catch (error) {
      console.error('Failed to setup test environment:', error);
      throw error;
    }
  }
  
  static async cleanupTestData() {
    console.log('Cleaning up test data...');
    // Add cleanup logic if needed
  }
  
  static getTestConfig() {
    return {
      timeout: 30000,
      retries: 2,
      workers: process.env.CI ? 1 : 2,
      reporter: [
        ['html', { outputFolder: 'test-results/html-report' }],
        ['json', { outputFile: 'test-results/results.json' }],
        ['junit', { outputFile: 'test-results/junit.xml' }]
      ]
    };
  }
}

// Global test setup
test.beforeAll(async () => {
  await TestRunner.setupTestEnvironment();
});

test.afterAll(async () => {
  await TestRunner.cleanupTestData();
});