import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for staging environment testing
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false, // Reduced parallelism for staging
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 3 : 1, // More retries for staging
  workers: process.env.CI ? 2 : 1, // Limited workers for staging
  
  reporter: [
    ['html', { outputFolder: 'staging-test-results/html-report' }],
    ['json', { outputFile: 'staging-test-results/results.json' }],
    ['line']
  ],
  
  use: {
    baseURL: process.env.STAGING_URL || 'https://your-staging-url.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15000, // Longer timeouts for staging
    navigationTimeout: 45000,
  },

  projects: [
    {
      name: 'staging-chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'staging-mobile',
      use: { ...devices['Pixel 5'] },
    },
  ],

  timeout: 90 * 1000, // Longer timeout for staging tests
  expect: {
    timeout: 15 * 1000,
  },
});