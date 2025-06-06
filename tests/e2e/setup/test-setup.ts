import { test as base, expect } from '@playwright/test';

// Define custom fixtures interface
type CustomFixtures = {
  authenticatedPage: any;
  websocketMessages: { messages: any[] };
};

// Extend the base test with custom fixtures
export const test = base.extend<CustomFixtures>({
  // Authenticated user fixture
  authenticatedPage: async ({ page }, use) => {
    // Navigate to login page
    await page.goto('/login');
    
    // Fill in test credentials
    await page.fill('[data-testid="email-input"]', 'nirmit@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    
    // Submit login form
    await page.click('[data-testid="login-submit"]');
    
    // Wait for successful login redirect
    await page.waitForURL('/');
    
    await use(page);
  },

  // WebSocket connection fixture
  websocketMessages: async ({ page }, use) => {
    let wsMessages: any[] = [];
    
    // Listen for WebSocket messages
    page.on('websocket', ws => {
      ws.on('framereceived', event => {
        try {
          const data = JSON.parse(event.payload.toString());
          wsMessages.push(data);
        } catch (e) {
          // Non-JSON message
        }
      });
    });
    
    await use({ messages: wsMessages });
  }
});

export { expect } from '@playwright/test';

// Utility functions for tests
export class TestHelpers {
  static async waitForElementToBeVisible(page: any, selector: string, timeout = 10000) {
    await page.waitForSelector(selector, { state: 'visible', timeout });
  }

  static async waitForNetworkIdle(page: any, timeout = 5000) {
    await page.waitForLoadState('networkidle', { timeout });
  }

  static async fillFormField(page: any, selector: string, value: string) {
    await page.waitForSelector(selector);
    await page.fill(selector, value);
  }

  static async clickAndWait(page: any, selector: string, waitFor?: string) {
    await page.click(selector);
    if (waitFor) {
      await page.waitForSelector(waitFor);
    }
  }

  static async takeScreenshotOnFailure(page: any, testName: string) {
    const screenshot = await page.screenshot();
    return screenshot;
  }

  static async validateResponseStatus(page: any, url: string, expectedStatus: number) {
    const [response] = await Promise.all([
      page.waitForResponse(resp => resp.url().includes(url)),
    ]);
    expect(response.status()).toBe(expectedStatus);
    return response;
  }
}