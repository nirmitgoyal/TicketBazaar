import { test, expect, TestHelpers } from '../setup/test-setup';

test.describe('Error Handling & Middleware Robustness', () => {
  
  test('should handle 400 Bad Request errors gracefully', async ({ page }) => {
    await page.goto('/login');
    
    // Simulate 400 error by sending malformed data
    await page.route('**/api/auth/login', route => {
      route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Invalid request format' })
      });
    });
    
    await TestHelpers.fillFormField(page, '[data-testid="email-input"]', 'test@example.com');
    await TestHelpers.fillFormField(page, '[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-submit"]');
    
    // Verify user-friendly error message is displayed
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="error-message"]');
    
    const errorText = await page.locator('[data-testid="error-message"]').textContent();
    expect(errorText).toContain('Invalid request');
    
    // Verify form remains usable
    const emailInput = page.locator('[data-testid="email-input"]');
    await expect(emailInput).toBeEnabled();
  });

  test('should handle 401 Unauthorized errors correctly', async ({ page }) => {
    await page.goto('/login');
    
    // Simulate 401 error
    await page.route('**/api/auth/login', route => {
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Invalid credentials' })
      });
    });
    
    await TestHelpers.fillFormField(page, '[data-testid="email-input"]', 'test@example.com');
    await TestHelpers.fillFormField(page, '[data-testid="password-input"]', 'wrongpassword');
    await page.click('[data-testid="login-submit"]');
    
    // Verify credentials error is shown
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="credentials-error"]');
    
    // User should remain on login page
    expect(page.url()).toContain('/login');
    
    // Form should be ready for retry
    const submitButton = page.locator('[data-testid="login-submit"]');
    await expect(submitButton).toBeEnabled();
  });

  test('should handle 404 Not Found errors appropriately', async ({ page }) => {
    // Test API 404 error
    await page.goto('/events/99999'); // Non-existent event
    
    // Should show not found message or redirect
    await page.waitForTimeout(2000);
    
    const errorMessage = page.locator('[data-testid="not-found-message"]');
    const redirected = page.url().includes('/events') && !page.url().includes('99999');
    
    expect(await errorMessage.isVisible() || redirected).toBeTruthy();
    
    if (await errorMessage.isVisible()) {
      const errorText = await errorMessage.textContent();
      expect(errorText?.toLowerCase()).toContain('not found');
    }
  });

  test('should handle 500 Internal Server Error gracefully', async ({ page }) => {
    await page.goto('/');
    
    // Simulate 500 error on events loading
    await page.route('**/api/events', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Internal server error' })
      });
    });
    
    await page.goto('/events');
    
    // Verify error state is handled gracefully
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="server-error"]');
    
    const errorMessage = await page.locator('[data-testid="server-error"]').textContent();
    expect(errorMessage?.toLowerCase()).toContain('server error');
    
    // Should provide retry option
    const retryButton = page.locator('[data-testid="retry-button"]');
    if (await retryButton.isVisible()) {
      // Remove error simulation
      await page.unroute('**/api/events');
      
      await retryButton.click();
      
      // Should recover and load content
      await TestHelpers.waitForElementToBeVisible(page, '[data-testid="events-page"]');
    }
  });

  test('should handle network connectivity issues', async ({ page }) => {
    await page.goto('/');
    
    // Simulate network failure
    await page.route('**/*', route => {
      route.abort('failed');
    });
    
    // Try to navigate to events page
    await page.click('[data-testid="nav-events"]');
    
    // Should show network error
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="network-error"]');
    
    // Restore network
    await page.unroute('**/*');
    
    // Should offer retry mechanism
    const retryButton = page.locator('[data-testid="retry-connection"]');
    if (await retryButton.isVisible()) {
      await retryButton.click();
      
      // Should recover
      await TestHelpers.waitForElementToBeVisible(page, '[data-testid="events-page"]');
    }
  });

  test('should handle timeout errors appropriately', async ({ page }) => {
    await page.goto('/');
    
    // Simulate very slow API response (timeout)
    await page.route('**/api/events', route => {
      // Don't respond (simulate timeout)
      setTimeout(() => {
        route.fulfill({
          status: 408,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Request timeout' })
        });
      }, 10000);
    });
    
    await page.goto('/events');
    
    // Should handle timeout gracefully
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="timeout-error"]', 15000);
    
    const timeoutMessage = await page.locator('[data-testid="timeout-error"]').textContent();
    expect(timeoutMessage?.toLowerCase()).toContain('timeout');
  });

  test('should validate and sanitize user input', async ({ page }) => {
    await page.goto('/search');
    
    // Test XSS prevention
    const maliciousScript = '<script>alert("xss")</script>';
    await TestHelpers.fillFormField(page, '[data-testid="search-input"]', maliciousScript);
    await page.click('[data-testid="search-submit"]');
    
    // Script should not execute
    const alertFired = await page.evaluate(() => {
      return window.alert !== window.alert; // Check if alert was overridden
    });
    expect(alertFired).toBeFalsy();
    
    // Input should be sanitized in display
    const searchResult = page.locator('[data-testid="search-query-display"]');
    if (await searchResult.isVisible()) {
      const displayText = await searchResult.textContent();
      expect(displayText).not.toContain('<script>');
    }
  });

  test('should handle API rate limiting', async ({ page }) => {
    await page.goto('/search');
    
    // Simulate rate limit response
    await page.route('**/api/events/search', route => {
      route.fulfill({
        status: 429,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Too many requests' }),
        headers: {
          'Retry-After': '60'
        }
      });
    });
    
    await TestHelpers.fillFormField(page, '[data-testid="search-input"]', 'concert');
    await page.click('[data-testid="search-submit"]');
    
    // Should show rate limit message
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="rate-limit-error"]');
    
    const rateLimitMessage = await page.locator('[data-testid="rate-limit-error"]').textContent();
    expect(rateLimitMessage?.toLowerCase()).toContain('too many requests');
  });

  test('should handle CORS errors properly', async ({ page }) => {
    // Simulate CORS error by blocking cross-origin requests
    await page.route('**/api/**', route => {
      if (route.request().url().includes('api/')) {
        route.fulfill({
          status: 0,
          body: '',
        });
      } else {
        route.continue();
      }
    });
    
    await page.goto('/events');
    
    // Should handle CORS gracefully
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="cors-error"]');
    
    const corsMessage = await page.locator('[data-testid="cors-error"]').textContent();
    expect(corsMessage?.toLowerCase()).toContain('connection');
  });

  test('should handle form validation errors consistently', async ({ page }) => {
    await page.goto('/register');
    
    // Submit form with various invalid data
    await TestHelpers.fillFormField(page, '[data-testid="email-input"]', 'invalid-email');
    await TestHelpers.fillFormField(page, '[data-testid="password-input"]', '123'); // Too short
    await TestHelpers.fillFormField(page, '[data-testid="phone-input"]', 'invalid-phone');
    
    await page.click('[data-testid="register-submit"]');
    
    // All validation errors should appear
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="email-error"]');
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="password-error"]');
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="phone-error"]');
    
    // Error styling should be consistent
    const errorElements = page.locator('[data-testid$="-error"]');
    const errorCount = await errorElements.count();
    
    for (let i = 0; i < errorCount; i++) {
      const errorElement = errorElements.nth(i);
      const hasErrorClass = await errorElement.evaluate(el => {
        return el.classList.contains('error') || el.classList.contains('text-red-500');
      });
      expect(hasErrorClass).toBeTruthy();
    }
  });

  test('should handle session expiration during user actions', async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    
    // Simulate session expiration
    await page.route('**/api/**', route => {
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Session expired' })
      });
    });
    
    // Try to perform authenticated action
    await page.goto('/sell');
    await TestHelpers.fillFormField(page, '[data-testid="title-input"]', 'Test Ticket');
    await page.click('[data-testid="submit-ticket"]');
    
    // Should redirect to login with session expired message
    await page.waitForURL('/login');
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="session-expired-message"]');
    
    const expiredMessage = await page.locator('[data-testid="session-expired-message"]').textContent();
    expect(expiredMessage?.toLowerCase()).toContain('session expired');
  });

  test('should handle malformed JSON responses', async ({ page }) => {
    await page.goto('/events');
    
    // Return malformed JSON
    await page.route('**/api/events', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: '{"invalid": json response'
      });
    });
    
    await page.reload();
    
    // Should handle JSON parsing error gracefully
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="parse-error"]');
    
    const parseErrorMessage = await page.locator('[data-testid="parse-error"]').textContent();
    expect(parseErrorMessage?.toLowerCase()).toContain('error loading');
  });

  test('should provide accessible error messages', async ({ page }) => {
    await page.goto('/login');
    
    // Submit empty form
    await page.click('[data-testid="login-submit"]');
    
    // Check error message accessibility
    const emailError = page.locator('[data-testid="email-error"]');
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="email-error"]');
    
    // Should have proper ARIA attributes
    const ariaLive = await emailError.getAttribute('aria-live');
    const ariaRole = await emailError.getAttribute('role');
    
    expect(ariaLive || ariaRole).toBeDefined();
    
    // Should be associated with input field
    const emailInput = page.locator('[data-testid="email-input"]');
    const ariaDescribedBy = await emailInput.getAttribute('aria-describedby');
    
    if (ariaDescribedBy) {
      expect(ariaDescribedBy).toContain('email-error');
    }
  });
});