import { defineConfig, devices } from "@playwright/test";

/**
 * Simplified Playwright Configuration
 * Basic setup for essential E2E testing
 */
export default defineConfig({
  testDir: "./tests/e2e",
  
  // Test execution settings
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1, // Run tests sequentially for simplicity
  
  // Simple reporting
  reporter: [
    ["html", { outputFolder: "playwright-report" }],
    ["line"]
  ],
  
  // Basic test configuration
  use: {
    baseURL: "http://localhost:5000",
    actionTimeout: 10000,
    navigationTimeout: 15000,
    screenshot: "only-on-failure",
    ignoreHTTPSErrors: true,
    // Set test environment marker to prevent external script loading
    extraHTTPHeaders: {
      'X-Test-Environment': 'true'
    }
  },

  // Single browser project
  projects: [
    {
      name: "chromium",
      use: { 
        ...devices["Desktop Chrome"],
        headless: true,
        // Add test environment markers
        extraHTTPHeaders: {
          'X-Test-Environment': 'true'
        }
      },
    },
  ],

  // Development server configuration
  webServer: process.env.CI ? {
    command: "npm run build && NODE_ENV=test PORT=5000 node dist/index.js",
    url: "http://localhost:5000",
    reuseExistingServer: true,
    timeout: 120 * 1000,
    env: {
      NODE_ENV: "test",
      DATABASE_URL: process.env.DATABASE_URL || "postgresql://test:test@localhost:5432/test",
      SESSION_SECRET: process.env.SESSION_SECRET || "test-session-secret-for-ci",
      VITE_GOOGLE_MAPS_API_KEY: process.env.VITE_GOOGLE_MAPS_API_KEY || "test-key",
      SENDGRID_API_KEY: process.env.SENDGRID_API_KEY || "test-key",
      PERPLEXITY_API_KEY: process.env.PERPLEXITY_API_KEY || "test-key",
      VITE_PUBLIC_BUILDER_KEY: process.env.VITE_PUBLIC_BUILDER_KEY || "test-key",
      PORT: "5000",
    },
  } : {
    command: "npm run dev",
    url: "http://localhost:5000",
    reuseExistingServer: true,
    timeout: 60 * 1000,
  },
});

// Note: Simplified configuration focusing on basic DOM testing
// Visual regression testing removed for better reliability