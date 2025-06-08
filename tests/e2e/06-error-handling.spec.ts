import { test, expect } from '@playwright/test';
import { TestUtils } from '../helpers/test-utils';

test.describe('Backend Error Handling', () => {
  let utils: TestUtils;

  test.beforeEach(async ({ page }) => {
    utils = new TestUtils(page);
  });

  test('should handle 400 Bad Request errors gracefully', async ({ page }) => {
    await utils.navigateToListTicket();
    
    // Simulate 400 error by submitting malformed data
    await page.route('**/api/tickets', route => {
      route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Invalid ticket data provided' })
      });
    });
    
    const invalidData = {
      title: 'Test Event',
      description: 'Test Description',
      venue: 'Test Venue',
      date: '2024-12-31',
      price: 'invalid-price',
      category: 'Music'
    };
    
    await utils.fillTicketListingForm(invalidData);
    await utils.submitForm('[data-testid="ticket-listing-form"]');
    
    const errorMessage = page.locator('[data-testid="error-message"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText(/invalid|error/i);
  });

  test('should handle 401 Unauthorized errors with authentication prompts', async ({ page }) => {
    await utils.navigateToProfile();
    
    // Should redirect to authentication or show login prompt
    const loginPrompt = page.locator('[data-testid="login-required"]');
    const loginButton = page.locator('[data-testid="login-button"]');
    
    const hasAuthPrompt = await loginPrompt.isVisible() || await loginButton.isVisible();
    expect(hasAuthPrompt).toBeTruthy();
  });

  test('should handle 404 Not Found errors with proper fallback', async ({ page }) => {
    // Simulate 404 for non-existent ticket
    await page.route('**/api/tickets/999999', route => {
      route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Ticket not found' })
      });
    });
    
    await page.goto('/tickets/999999');
    
    const notFoundMessage = page.locator('[data-testid="not-found"]');
    const errorMessage = page.locator('[data-testid="error-message"]');
    
    const hasErrorHandling = await notFoundMessage.isVisible() || await errorMessage.isVisible();
    expect(hasErrorHandling).toBeTruthy();
  });

  test('should handle 500 Internal Server Error with user-friendly messages', async ({ page }) => {
    await utils.navigateToHome();
    
    // Simulate 500 error
    await page.route('**/api/events', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Internal server error' })
      });
    });
    
    await page.reload();
    
    const serverErrorMessage = page.locator('[data-testid="server-error"]');
    const fallbackContent = page.locator('[data-testid="error-fallback"]');
    
    const hasErrorFallback = await serverErrorMessage.isVisible() || await fallbackContent.isVisible();
    expect(hasErrorFallback).toBeTruthy();
  });

  test('should provide retry mechanisms for failed requests', async ({ page }) => {
    await utils.navigateToHome();
    
    let requestCount = 0;
    await page.route('**/api/events', route => {
      requestCount++;
      if (requestCount < 3) {
        route.fulfill({ status: 500, body: 'Server Error' });
      } else {
        route.continue();
      }
    });
    
    // Click retry button if available
    const retryButton = page.locator('[data-testid="retry-button"]');
    if (await retryButton.isVisible()) {
      await retryButton.click();
      await page.waitForTimeout(1000);
    }
    
    // Eventually should succeed
    await utils.validateEventData();
  });

  test('should handle network timeout errors', async ({ page }) => {
    await utils.navigateToHome();
    
    // Simulate slow network
    await utils.simulateSlowNetwork();
    
    await page.reload();
    await page.waitForTimeout(5000);
    
    const timeoutMessage = page.locator('[data-testid="timeout-error"]');
    const loadingState = page.locator('[data-testid="loading-state"]');
    
    // Should show appropriate loading or timeout handling
    const hasTimeoutHandling = await timeoutMessage.isVisible() || await loadingState.isVisible();
    expect(hasTimeoutHandling).toBeTruthy();
  });
});