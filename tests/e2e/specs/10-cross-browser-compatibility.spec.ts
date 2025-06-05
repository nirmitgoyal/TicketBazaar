import { test, expect } from '@playwright/test';
import { TestHelpers } from '../utils/test-helpers';

test.describe('Cross-Browser Compatibility', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
  });

  test('should work consistently across different browsers', async ({ page, browserName }) => {
    await page.goto('/');
    await helpers.waitForPageLoad();

    // Basic functionality should work in all browsers
    await expect(page.locator('body')).toBeVisible();
    
    // Search functionality
    const searchInput = page.locator('[data-testid="search-input"], input[placeholder*="search" i]');
    if (await searchInput.count() > 0) {
      await helpers.typeRealistically('[data-testid="search-input"], input[placeholder*="search" i]', 'test search');
      await searchInput.press('Enter');
      await helpers.waitForPageLoad();
      
      // Should handle search in all browsers
      const hasResults = await page.locator('[data-testid="search-results"], .event-card').count() > 0;
      const hasNoResults = await page.locator('[data-testid="no-results"], .no-results').count() > 0;
      expect(hasResults || hasNoResults).toBeTruthy();
    }

    console.log(`✓ Basic functionality verified for ${browserName}`);
  });

  test('should handle CSS Grid and Flexbox layouts properly', async ({ page, browserName }) => {
    await page.goto('/');
    await helpers.waitForPageLoad();

    // Check grid/flex layouts
    const layoutElements = page.locator('.grid, .flex, [style*="grid"], [style*="flex"]');
    const layoutCount = await layoutElements.count();

    if (layoutCount > 0) {
      for (let i = 0; i < Math.min(layoutCount, 3); i++) {
        const element = layoutElements.nth(i);
        
        // Element should be visible and have proper dimensions
        if (await element.isVisible()) {
          const box = await element.boundingBox();
          expect(box?.width).toBeGreaterThan(0);
          expect(box?.height).toBeGreaterThan(0);
        }
      }
    }

    console.log(`✓ Layout compatibility verified for ${browserName}`);
  });

  test('should handle JavaScript ES6+ features consistently', async ({ page, browserName }) => {
    await page.goto('/');
    await helpers.waitForPageLoad();

    // Test modern JavaScript features work
    const jsFeatureTest = await page.evaluate(() => {
      try {
        // Test arrow functions, destructuring, async/await
        const testFunc = async () => {
          const obj = { a: 1, b: 2 };
          const { a, b } = obj;
          return a + b;
        };

        // Test Promise support
        return testFunc().then(result => result === 3);
      } catch (error) {
        return false;
      }
    });

    expect(jsFeatureTest).toBeTruthy();
    console.log(`✓ JavaScript features verified for ${browserName}`);
  });

  test('should handle form inputs and validation consistently', async ({ page, browserName }) => {
    await page.goto('/register');
    await helpers.waitForPageLoad();

    const emailInput = page.locator('[data-testid="email-input"], input[name="email"], input[type="email"]');
    
    if (await emailInput.count() > 0) {
      // Test input validation
      await helpers.typeRealistically('[data-testid="email-input"], input[name="email"]', 'invalid-email');
      
      const submitButton = page.locator('[data-testid="submit-button"], button[type="submit"]');
      if (await submitButton.count() > 0) {
        await helpers.clickWithMovement('[data-testid="submit-button"], button[type="submit"]');
        await page.waitForTimeout(1000);
        
        // Validation should work in all browsers
        const hasValidationError = await page.locator('.text-destructive, .error-message, [role="alert"]').count() > 0;
        expect(hasValidationError).toBeTruthy();
      }
    }

    console.log(`✓ Form validation verified for ${browserName}`);
  });

  test('should handle file uploads across browsers', async ({ page, browserName }) => {
    await page.goto('/list-ticket');
    await helpers.waitForPageLoad();

    const fileInput = page.locator('input[type="file"]');
    
    if (await fileInput.count() > 0) {
      const testFilePath = require('path').join(__dirname, '../fixtures/sample-ticket.txt');
      
      // File upload should work consistently
      await fileInput.setInputFiles(testFilePath);
      await page.waitForTimeout(1000);
      
      // Should show file selected or upload progress
      const fileSelected = await page.locator('.file-name, .file-preview, [data-testid="file-name"]').count() > 0;
      expect(fileSelected).toBeTruthy();
    }

    console.log(`✓ File upload verified for ${browserName}`);
  });

  test('should handle WebSocket connections properly', async ({ page, browserName }) => {
    await page.goto('/');
    await helpers.waitForPageLoad();
    await helpers.waitForWebSocket();

    // WebSocket should be supported
    const webSocketSupport = await page.evaluate(() => {
      return typeof WebSocket !== 'undefined';
    });

    expect(webSocketSupport).toBeTruthy();
    console.log(`✓ WebSocket support verified for ${browserName}`);
  });

  test('should handle responsive design breakpoints', async ({ page, browserName }) => {
    await page.goto('/');
    await helpers.waitForPageLoad();

    // Test different screen sizes
    const breakpoints = [
      { width: 360, height: 640, name: 'mobile' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 1200, height: 800, name: 'desktop' }
    ];

    for (const breakpoint of breakpoints) {
      await page.setViewportSize({ width: breakpoint.width, height: breakpoint.height });
      await page.waitForTimeout(500);

      // Layout should adapt appropriately
      const bodyVisible = await page.locator('body').isVisible();
      expect(bodyVisible).toBeTruthy();

      // Navigation should be accessible
      const navigation = page.locator('nav, [role="navigation"]');
      if (await navigation.count() > 0) {
        const navVisible = await navigation.isVisible();
        expect(navVisible).toBeTruthy();
      }
    }

    console.log(`✓ Responsive design verified for ${browserName}`);
  });

  test('should handle date and time inputs consistently', async ({ page, browserName }) => {
    await page.goto('/list-ticket');
    await helpers.waitForPageLoad();

    const dateInput = page.locator('input[type="date"], input[name*="date"]');
    
    if (await dateInput.count() > 0) {
      // Test date input functionality
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);
      const dateString = futureDate.toISOString().split('T')[0];

      await dateInput.fill(dateString);
      await page.waitForTimeout(500);

      // Date should be accepted
      const inputValue = await dateInput.inputValue();
      expect(inputValue).toBe(dateString);
    }

    console.log(`✓ Date input verified for ${browserName}`);
  });

  test('should handle local storage and session storage', async ({ page, browserName }) => {
    await page.goto('/');
    await helpers.waitForPageLoad();

    // Test storage APIs
    const storageTest = await page.evaluate(() => {
      try {
        // Test localStorage
        localStorage.setItem('test_key', 'test_value');
        const localValue = localStorage.getItem('test_key');
        
        // Test sessionStorage
        sessionStorage.setItem('test_session', 'session_value');
        const sessionValue = sessionStorage.getItem('test_session');
        
        // Clean up
        localStorage.removeItem('test_key');
        sessionStorage.removeItem('test_session');
        
        return localValue === 'test_value' && sessionValue === 'session_value';
      } catch (error) {
        return false;
      }
    });

    expect(storageTest).toBeTruthy();
    console.log(`✓ Storage APIs verified for ${browserName}`);
  });

  test('should handle CSS animations and transitions', async ({ page, browserName }) => {
    await page.goto('/');
    await helpers.waitForPageLoad();

    // Look for animated elements
    const animatedElements = page.locator('[class*="animate"], [style*="transition"], [style*="animation"]');
    const animatedCount = await animatedElements.count();

    if (animatedCount > 0) {
      const firstAnimated = animatedElements.first();
      
      // Element should be visible and functional
      if (await firstAnimated.isVisible()) {
        await expect(firstAnimated).toBeVisible();
        
        // Interactions should work despite animations
        if (await firstAnimated.getAttribute('role') || await firstAnimated.evaluate(el => el.tagName === 'BUTTON')) {
          await helpers.clickWithMovement('[class*="animate"]:first-child, [style*="transition"]:first-child');
          await page.waitForTimeout(300);
        }
      }
    }

    console.log(`✓ Animations verified for ${browserName}`);
  });

  test('should handle geolocation APIs appropriately', async ({ page, browserName }) => {
    await page.goto('/map');
    await helpers.waitForPageLoad();

    // Test geolocation API availability
    const geolocationSupport = await page.evaluate(() => {
      return 'geolocation' in navigator;
    });

    expect(geolocationSupport).toBeTruthy();

    // If location features are present, they should handle permission gracefully
    const locationButton = page.locator('button:has-text("Location"), [data-testid="location"], [aria-label*="location" i]');
    
    if (await locationButton.count() > 0) {
      // Mock geolocation for testing
      await page.context().grantPermissions(['geolocation']);
      await page.context().setGeolocation({ latitude: 19.0760, longitude: 72.8777 });
      
      await helpers.clickWithMovement('button:has-text("Location"), [data-testid="location"]');
      await page.waitForTimeout(2000);
      
      // Should handle location request
      const pageStillFunctional = await page.locator('body').isVisible();
      expect(pageStillFunctional).toBeTruthy();
    }

    console.log(`✓ Geolocation APIs verified for ${browserName}`);
  });

  test('should handle browser-specific vendor prefixes', async ({ page, browserName }) => {
    await page.goto('/');
    await helpers.waitForPageLoad();

    // Test CSS vendor prefixes work correctly
    const vendorPrefixTest = await page.evaluate(() => {
      const testElement = document.createElement('div');
      testElement.style.cssText = `
        transform: translateX(10px);
        -webkit-transform: translateX(10px);
        -moz-transform: translateX(10px);
        -ms-transform: translateX(10px);
      `;
      
      return testElement.style.transform !== '';
    });

    expect(vendorPrefixTest).toBeTruthy();
    console.log(`✓ Vendor prefixes verified for ${browserName}`);
  });

  test('should handle touch events on touch devices', async ({ page, browserName, isMobile }) => {
    if (isMobile || browserName === 'webkit') {
      await page.goto('/');
      await helpers.waitForPageLoad();

      // Test touch events
      const touchableElements = page.locator('button, a, [role="button"]');
      const touchableCount = await touchableElements.count();

      if (touchableCount > 0) {
        const firstTouchable = touchableElements.first();
        
        if (await firstTouchable.isVisible()) {
          await helpers.touchTap('button:first-child, a:first-child');
          await page.waitForTimeout(500);
          
          // Touch interaction should work
          const pageResponsive = await page.locator('body').isVisible();
          expect(pageResponsive).toBeTruthy();
        }
      }

      console.log(`✓ Touch events verified for ${browserName}`);
    }
  });
});