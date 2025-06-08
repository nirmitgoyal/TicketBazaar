import { test, expect } from '@playwright/test';
import { TestUtils } from '../helpers/test-utils';

test.describe('Page Navigation & Routing', () => {
  let utils: TestUtils;

  test.beforeEach(async ({ page }) => {
    utils = new TestUtils(page);
  });

  test('should navigate between key pages and verify correct content rendering', async ({ page }) => {
    // Test home page navigation
    await utils.navigateToHome();
    await utils.expectPageLoaded('TicketSwap');
    await expect(page.locator('[data-testid="hero-section"]')).toBeVisible();
    await expect(page.locator('[data-testid="event-grid"]')).toBeVisible();

    // Test map page navigation
    await page.click('[data-testid="nav-map"]');
    await utils.waitForPageTransition();
    await expect(page.url()).toContain('/map');
    await expect(page.locator('[data-testid="google-map"]')).toBeVisible();

    // Test list ticket page navigation
    await page.click('[data-testid="nav-list-ticket"]');
    await utils.waitForPageTransition();
    await expect(page.url()).toContain('/list-ticket');
    await expect(page.locator('[data-testid="ticket-listing-form"]')).toBeVisible();

    // Test profile page navigation
    await page.click('[data-testid="nav-profile"]');
    await utils.waitForPageTransition();
    await expect(page.url()).toContain('/profile');
  });

  test('should handle invalid URLs with graceful fallback', async ({ page }) => {
    const invalidUrls = [
      '/nonexistent-page',
      '/events/invalid-id',
      '/tickets/999999',
      '/random-path'
    ];

    for (const url of invalidUrls) {
      await page.goto(url, { waitUntil: 'networkidle' });
      
      // Should either redirect to home or show 404
      const isOnHome = page.url().endsWith('/');
      const has404Content = await page.locator('[data-testid="not-found"]').isVisible();
      const hasErrorMessage = await page.locator('text=/page not found|404|not found/i').isVisible();
      
      expect(isOnHome || has404Content || hasErrorMessage).toBeTruthy();
    }
  });

  test('should maintain navigation state during page transitions', async ({ page }) => {
    await utils.navigateToHome();
    
    // Navigate through multiple pages and verify browser history
    await page.click('[data-testid="nav-map"]');
    await utils.waitForPageTransition();
    
    await page.click('[data-testid="nav-list-ticket"]');
    await utils.waitForPageTransition();
    
    // Test back button functionality
    await page.goBack();
    await expect(page.url()).toContain('/map');
    
    await page.goBack();
    await expect(page.url()).toMatch(/\/$|\/home/);
    
    // Test forward button
    await page.goForward();
    await expect(page.url()).toContain('/map');
  });

  test('should handle direct URL access to protected routes', async ({ page }) => {
    // Try accessing profile directly without authentication
    await page.goto('/profile', { waitUntil: 'networkidle' });
    
    // Should either redirect to login or show authentication prompt
    const hasLoginButton = await page.locator('[data-testid="login-button"]').isVisible();
    const isRedirectedToAuth = page.url().includes('auth') || page.url().includes('login');
    const hasAuthPrompt = await page.locator('text=/sign in|login|authenticate/i').isVisible();
    
    expect(hasLoginButton || isRedirectedToAuth || hasAuthPrompt).toBeTruthy();
  });

  test('should render navigation consistently across viewport sizes', async ({ page }) => {
    await utils.navigateToHome();
    
    const breakpoints = await utils.testResponsiveBreakpoints();
    
    for (const breakpoint of breakpoints) {
      await page.setViewportSize({ width: breakpoint.width, height: breakpoint.height });
      await page.waitForTimeout(500);
      
      // Navigation should be accessible on all screen sizes
      const navVisible = await page.locator('[data-testid="navigation"]').isVisible();
      const mobileMenuVisible = await page.locator('[data-testid="mobile-menu"]').isVisible();
      const hamburgerVisible = await page.locator('[data-testid="hamburger-menu"]').isVisible();
      
      // At least one navigation method should be visible
      expect(navVisible || mobileMenuVisible || hamburgerVisible).toBeTruthy();
    }
  });
});