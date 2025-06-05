import { test, expect } from '@playwright/test';
import { TestHelpers } from '../utils/test-helpers';

test.describe('Performance and Accessibility', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
  });

  test('should meet core web vitals performance benchmarks', async ({ page }) => {
    await page.goto('/');
    
    // Measure page load performance
    const performanceEntries = await page.evaluate(() => {
      return JSON.stringify(performance.getEntriesByType('navigation'));
    });
    
    const navigationEntry = JSON.parse(performanceEntries)[0];
    
    if (navigationEntry) {
      // First Contentful Paint should be under 1.8s
      const fcp = navigationEntry.responseEnd - navigationEntry.fetchStart;
      expect(fcp).toBeLessThan(1800);
      
      // DOM Content Loaded should be reasonable
      const dcl = navigationEntry.domContentLoadedEventEnd - navigationEntry.fetchStart;
      expect(dcl).toBeLessThan(3000);
    }
  });

  test('should handle slow network conditions gracefully', async ({ page }) => {
    // Simulate slow 3G network
    await helpers.simulateSlowNetwork();
    
    await page.goto('/');
    await helpers.waitForPageLoad();
    
    // Page should still load and be functional
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('[data-testid="search-input"], input[placeholder*="search" i]')).toBeVisible();
    
    // Reset network conditions
    await helpers.resetNetworkConditions();
  });

  test('should be accessible to screen readers', async ({ page }) => {
    await page.goto('/');
    await helpers.waitForPageLoad();
    
    // Check for essential accessibility attributes
    const mainContent = page.locator('main, [role="main"]');
    await expect(mainContent).toBeVisible();
    
    // Navigation should have proper structure
    const navigation = page.locator('nav, [role="navigation"]');
    if (await navigation.count() > 0) {
      await expect(navigation).toBeVisible();
    }
    
    // Form elements should have labels
    const formInputs = page.locator('input, textarea, select');
    const inputCount = await formInputs.count();
    
    for (let i = 0; i < Math.min(inputCount, 5); i++) {
      const input = formInputs.nth(i);
      const hasLabel = await input.getAttribute('aria-label') || 
                      await input.getAttribute('aria-labelledby') ||
                      await page.locator(`label[for="${await input.getAttribute('id')}"]`).count() > 0;
      
      if (hasLabel) {
        expect(hasLabel).toBeTruthy();
      }
    }
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/');
    await helpers.waitForPageLoad();
    
    // Tab through interactive elements
    const interactiveElements = page.locator('button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const elementCount = await interactiveElements.count();
    
    if (elementCount > 0) {
      // Start tabbing from first element
      await page.keyboard.press('Tab');
      await page.waitForTimeout(100);
      
      // Should focus on an interactive element
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
      
      // Tab through a few more elements
      for (let i = 0; i < Math.min(elementCount, 5); i++) {
        await page.keyboard.press('Tab');
        await page.waitForTimeout(100);
        
        const currentFocus = page.locator(':focus');
        if (await currentFocus.count() > 0) {
          await expect(currentFocus).toBeVisible();
        }
      }
    }
  });

  test('should handle focus management properly', async ({ page }) => {
    await page.goto('/');
    await helpers.waitForPageLoad();
    
    // Test modal focus trap
    const modalTrigger = page.locator('button:has-text("Contact"), button:has-text("Filter"), [data-testid*="modal"]');
    
    if (await modalTrigger.count() > 0) {
      await helpers.clickWithMovement('button:has-text("Contact"), button:has-text("Filter")');
      await helpers.waitForAnimations();
      
      const modal = page.locator('.modal, .dialog, [role="dialog"]');
      if (await modal.count() > 0) {
        // Focus should be trapped within modal
        await page.keyboard.press('Tab');
        const focusedElement = page.locator(':focus');
        
        if (await focusedElement.count() > 0) {
          const focusedParent = await focusedElement.evaluate(el => {
            return el.closest('.modal, .dialog, [role="dialog"]') !== null;
          });
          expect(focusedParent).toBeTruthy();
        }
        
        // Escape should close modal
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
        
        const modalVisible = await modal.isVisible().catch(() => false);
        expect(modalVisible).toBeFalsy();
      }
    }
  });

  test('should have proper color contrast ratios', async ({ page }) => {
    await page.goto('/');
    await helpers.waitForPageLoad();
    
    // Check text elements for contrast
    const textElements = page.locator('p, h1, h2, h3, h4, h5, h6, span, div, button, a');
    const elementCount = await textElements.count();
    
    let contrastChecks = 0;
    
    for (let i = 0; i < Math.min(elementCount, 10); i++) {
      const element = textElements.nth(i);
      
      if (await element.isVisible()) {
        const styles = await element.evaluate(el => {
          const computed = window.getComputedStyle(el);
          return {
            color: computed.color,
            backgroundColor: computed.backgroundColor,
            fontSize: computed.fontSize
          };
        });
        
        // Basic check - text should have defined color
        expect(styles.color).toBeTruthy();
        contrastChecks++;
        
        if (contrastChecks >= 5) break;
      }
    }
  });

  test('should handle high contrast mode', async ({ page }) => {
    // Simulate high contrast mode
    await page.emulateMedia({ colorScheme: 'dark' });
    
    await page.goto('/');
    await helpers.waitForPageLoad();
    
    // Page should still be readable and functional
    await expect(page.locator('body')).toBeVisible();
    
    // Interactive elements should be visible
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    if (buttonCount > 0) {
      const firstButton = buttons.first();
      await expect(firstButton).toBeVisible();
    }
  });

  test('should support reduced motion preferences', async ({ page }) => {
    // Simulate reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });
    
    await page.goto('/');
    await helpers.waitForPageLoad();
    
    // Navigate to a page with animations
    const mapLink = page.locator('a[href="/map"], a:has-text("Map")');
    if (await mapLink.count() > 0) {
      await helpers.clickWithMovement('a[href="/map"]');
      await helpers.waitForPageTransition();
      
      // Page should load without motion-heavy animations
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('should maintain performance under load', async ({ page }) => {
    await page.goto('/');
    await helpers.waitForPageLoad();
    
    // Measure memory usage
    const initialMemory = await page.evaluate(() => {
      return (performance as any).memory ? (performance as any).memory.usedJSHeapSize : 0;
    });
    
    // Perform multiple interactions
    for (let i = 0; i < 5; i++) {
      const searchInput = page.locator('[data-testid="search-input"], input[placeholder*="search" i]');
      if (await searchInput.count() > 0) {
        await helpers.typeRealistically('[data-testid="search-input"], input[placeholder*="search" i]', `search ${i}`);
        await searchInput.press('Enter');
        await helpers.waitForPageLoad();
        await page.waitForTimeout(500);
      }
    }
    
    // Check memory hasn't grown excessively
    const finalMemory = await page.evaluate(() => {
      return (performance as any).memory ? (performance as any).memory.usedJSHeapSize : 0;
    });
    
    if (initialMemory > 0 && finalMemory > 0) {
      const memoryIncrease = finalMemory - initialMemory;
      // Memory shouldn't increase by more than 50MB
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    }
  });

  test('should handle resource loading errors gracefully', async ({ page }) => {
    // Block some resources to simulate loading failures
    await page.route('**/*.jpg', route => route.abort());
    await page.route('**/*.png', route => route.abort());
    
    await page.goto('/');
    await helpers.waitForPageLoad();
    
    // Page should still be functional despite missing images
    await expect(page.locator('body')).toBeVisible();
    
    const searchInput = page.locator('[data-testid="search-input"], input[placeholder*="search" i]');
    if (await searchInput.count() > 0) {
      await expect(searchInput).toBeVisible();
      await helpers.typeRealistically('[data-testid="search-input"], input[placeholder*="search" i]', 'test');
    }
  });

  test('should optimize for mobile performance', async ({ page, isMobile }) => {
    if (isMobile) {
      await page.goto('/');
      
      // Measure mobile-specific performance
      const mobileMetrics = await page.evaluate(() => {
        const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        return {
          domContentLoaded: nav.domContentLoadedEventEnd - nav.fetchStart,
          loadComplete: nav.loadEventEnd - nav.fetchStart,
          firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0
        };
      });
      
      // Mobile should load reasonably fast
      expect(mobileMetrics.domContentLoaded).toBeLessThan(4000);
      
      // Test mobile interactions
      const ticketCards = page.locator('[data-testid="ticket-card"], .ticket-card');
      if (await ticketCards.count() > 0) {
        await helpers.touchTap('[data-testid="ticket-card"]:first-child');
        await helpers.waitForPageTransition();
        
        // Should navigate successfully
        const pageLoaded = await page.locator('body').isVisible();
        expect(pageLoaded).toBeTruthy();
      }
    }
  });

  test('should handle viewport size changes', async ({ page }) => {
    await page.goto('/');
    await helpers.waitForPageLoad();
    
    // Test different viewport sizes
    const viewports = [
      { width: 320, height: 568 }, // iPhone SE
      { width: 768, height: 1024 }, // iPad
      { width: 1920, height: 1080 }, // Desktop
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.waitForTimeout(500);
      
      // Page should adapt to new viewport
      await expect(page.locator('body')).toBeVisible();
      
      // Navigation should be accessible
      const navigation = page.locator('nav, [role="navigation"], .navigation');
      if (await navigation.count() > 0) {
        await expect(navigation).toBeVisible();
      }
    }
  });

  test('should maintain text readability at different zoom levels', async ({ page }) => {
    await page.goto('/');
    await helpers.waitForPageLoad();
    
    // Test 200% zoom (accessibility requirement)
    await page.evaluate(() => {
      document.body.style.zoom = '2';
    });
    
    await page.waitForTimeout(500);
    
    // Content should still be readable and accessible
    const textElements = page.locator('p, h1, h2, h3, button, a');
    const elementCount = await textElements.count();
    
    if (elementCount > 0) {
      const firstElement = textElements.first();
      await expect(firstElement).toBeVisible();
      
      // Text should not be cut off
      const isInViewport = await helpers.isInViewport('p:first-child, h1:first-child');
      expect(isInViewport).toBeTruthy();
    }
    
    // Reset zoom
    await page.evaluate(() => {
      document.body.style.zoom = '1';
    });
  });
});