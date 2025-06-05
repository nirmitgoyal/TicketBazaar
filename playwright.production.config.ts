import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for production environment testing
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false, // Sequential for production safety
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0, // Limited retries for production
  workers: 1, // Single worker for production testing
  
  reporter: [
    ['html', { outputFolder: 'production-test-results/html-report' }],
    ['json', { outputFile: 'production-test-results/results.json' }],
    ['line']
  ],
  
  use: {
    baseURL: process.env.PRODUCTION_URL || 'https://your-production-url.com',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 20000, // Conservative timeouts for production
    navigationTimeout: 60000,
  },

  projects: [
    {
      name: 'production-smoke-test',
      use: { ...devices['Desktop Chrome'] },
      testMatch: [
        '**/01-homepage-navigation.spec.ts',
        '**/03-search-and-filters.spec.ts',
        '**/09-performance-accessibility.spec.ts'
      ]
    },
  ],

  timeout: 120 * 1000, // Conservative timeout for production
  expect: {
    timeout: 20 * 1000,
  },
});