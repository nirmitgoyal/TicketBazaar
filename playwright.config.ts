import { defineConfig, devices } from "@playwrigh  // Development server (disabled in CI)
  webServer: process.env.CI ? undefined : {
    command: "npm run dev",
    url: "http://localhost:5000",
    reuseExistingServer: true,
    timeout: 60 * 1000,
  },;

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
    baseURL: "http://localhost:5001",
    actionTimeout: 10000,
    navigationTimeout: 15000,
    screenshot: "only-on-failure",
    // Visual testing configuration
    ignoreHTTPSErrors: true,
  },

  // Visual testing configuration
  expect: {
    // Threshold for visual comparisons (0.2 = 20% difference allowed)
    toHaveScreenshot: { threshold: 0.2 },
    toMatchSnapshot: { threshold: 0.2 },
  },

  // Single browser project
  projects: [
    {
      name: "chromium",
      use: { 
        ...devices["Desktop Chrome"],
        headless: true,
      },
    },
  ],

  // Development server
  webServer: {
    command: "npm run dev",
    url: "http://localhost:5000",
    reuseExistingServer: true,
    timeout: 60 * 1000,
  },
});