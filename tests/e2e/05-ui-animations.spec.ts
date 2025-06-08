import { test, expect } from '@playwright/test';
import { TestUtils } from '../helpers/test-utils';

test.describe('UI Animation & Responsiveness', () => {
  let utils: TestUtils;

  test.beforeEach(async ({ page }) => {
    utils = new TestUtils(page);
  });

  test('should animate page transitions smoothly', async ({ page }) => {
    await utils.navigateToHome();
    
    // Navigate to map with transition
    await page.click('[data-testid="nav-map"]');
    await utils.waitForPageTransition();
    
    // Verify transition completed
    await expect(page.url()).toContain('/map');
    await expect(page.locator('[data-testid="google-map"]')).toBeVisible();
    
    // Navigate to list ticket
    await page.click('[data-testid="nav-list-ticket"]');
    await utils.waitForPageTransition();
    await expect(page.url()).toContain('/list-ticket');
  });

  test('should handle modal animations correctly', async ({ page }) => {
    await utils.navigateToHome();
    
    // Open event modal
    await page.click('[data-testid="event-card"]');
    await utils.waitForModalAnimation();
    
    // Verify modal is visible and animated
    const modal = page.locator('[data-testid="event-modal"]');
    await expect(modal).toBeVisible();
    
    // Close modal
    await page.click('[data-testid="close-modal"]');
    await utils.waitForModalAnimation();
    await expect(modal).not.toBeVisible();
  });

  test('should maintain responsiveness across viewport sizes', async ({ page }) => {
    const breakpoints = await utils.testResponsiveBreakpoints();
    
    for (const breakpoint of breakpoints) {
      await page.setViewportSize({ width: breakpoint.width, height: breakpoint.height });
      await page.waitForTimeout(500);
      
      await utils.navigateToHome();
      
      // Verify layout adapts correctly
      const navigation = page.locator('[data-testid="navigation"]');
      const eventGrid = page.locator('[data-testid="event-grid"]');
      
      if (breakpoint.width < 768) {
        // Mobile layout
        await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
      } else {
        // Desktop layout
        await expect(navigation).toBeVisible();
      }
      
      await expect(eventGrid).toBeVisible();
    }
  });

  test('should animate form submissions with loading states', async ({ page }) => {
    await utils.navigateToListTicket();
    
    const validData = {
      title: 'Animation Test Event',
      description: 'Testing form submission animations',
      venue: 'Test Venue',
      date: '2024-12-31',
      price: '1000',
      category: 'Music'
    };
    
    await utils.fillTicketListingForm(validData);
    
    // Submit and check for loading animation
    await page.click('[type="submit"]');
    
    const loadingSpinner = page.locator('[data-testid="loading-spinner"]');
    const submitButton = page.locator('[type="submit"]');
    
    // Verify loading state
    await expect(loadingSpinner).toBeVisible();
    await expect(submitButton).toBeDisabled();
  });

  test('should handle hover animations on interactive elements', async ({ page }) => {
    await utils.navigateToHome();
    
    // Test event card hover
    const eventCard = page.locator('[data-testid="event-card"]').first();
    await eventCard.hover();
    await page.waitForTimeout(300);
    
    // Test button hover effects
    const buttons = page.locator('button[data-testid*="button"]');
    for (let i = 0; i < Math.min(3, await buttons.count()); i++) {
      await buttons.nth(i).hover();
      await page.waitForTimeout(200);
    }
  });

  test('should handle scroll animations and lazy loading', async ({ page }) => {
    await utils.navigateToHome();
    
    // Scroll down to trigger animations
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await page.waitForTimeout(1000);
    
    // Verify content loads as expected
    await utils.validateEventData();
    
    // Continue scrolling
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);
  });
});