import { test, expect, TestHelpers } from '../setup/test-setup';

test.describe('Page Navigation & Routing', () => {
  
  test('should navigate through all public pages correctly', async ({ page }) => {
    // Test home page
    await page.goto('/');
    expect(page.url()).toContain('/');
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="home-page"]');
    
    // Test events page
    await page.goto('/events');
    expect(page.url()).toContain('/events');
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="events-page"]');
    
    // Test search page
    await page.goto('/search');
    expect(page.url()).toContain('/search');
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="search-page"]');
    
    // Test map page
    await page.goto('/map');
    expect(page.url()).toContain('/map');
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="map-page"]');
    
    // Test login page
    await page.goto('/login');
    expect(page.url()).toContain('/login');
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="login-form"]');
    
    // Test register page
    await page.goto('/register');
    expect(page.url()).toContain('/register');
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="register-form"]');
  });

  test('should handle navigation with authentication', async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    
    // Test dashboard access
    await page.goto('/dashboard');
    expect(page.url()).toContain('/dashboard');
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="dashboard-page"]');
    
    // Test sell page access
    await page.goto('/sell');
    expect(page.url()).toContain('/sell');
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="sell-form"]');
    
    // Test profile page access
    await page.goto('/profile');
    expect(page.url()).toContain('/profile');
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="profile-page"]');
    
    // Test my tickets page
    await page.goto('/my-tickets');
    expect(page.url()).toContain('/my-tickets');
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="my-tickets-page"]');
  });

  test('should handle invalid routes correctly', async ({ page }) => {
    // Test non-existent route
    await page.goto('/non-existent-page');
    
    // Should redirect to 404 page or home
    await page.waitForTimeout(2000);
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/(404|\/)/);
    
    // Test invalid event ID
    await page.goto('/events/99999');
    await page.waitForTimeout(2000);
    
    // Should show error message or redirect
    const hasErrorMessage = await page.locator('[data-testid="error-message"]').isVisible();
    const redirectedToEvents = page.url().includes('/events');
    expect(hasErrorMessage || redirectedToEvents).toBeTruthy();
  });

  test('should navigate using navigation links', async ({ page }) => {
    await page.goto('/');
    
    // Test navigation bar links
    await page.click('[data-testid="nav-events"]');
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="events-page"]');
    expect(page.url()).toContain('/events');
    
    await page.click('[data-testid="nav-search"]');
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="search-page"]');
    expect(page.url()).toContain('/search');
    
    await page.click('[data-testid="nav-map"]');
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="map-page"]');
    expect(page.url()).toContain('/map');
    
    // Test logo navigation back to home
    await page.click('[data-testid="nav-logo"]');
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="home-page"]');
    expect(page.url()).toMatch(/\/$|\/home/);
  });

  test('should handle browser back and forward navigation', async ({ page }) => {
    // Navigate through pages
    await page.goto('/');
    await page.goto('/events');
    await page.goto('/search');
    
    // Test back navigation
    await page.goBack();
    expect(page.url()).toContain('/events');
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="events-page"]');
    
    await page.goBack();
    expect(page.url()).toMatch(/\/$|\/home/);
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="home-page"]');
    
    // Test forward navigation
    await page.goForward();
    expect(page.url()).toContain('/events');
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="events-page"]');
  });

  test('should maintain proper URL state during navigation', async ({ page }) => {
    // Test event detail page URL
    await page.goto('/events');
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="event-card"]');
    
    // Click on first event
    await page.click('[data-testid="event-card"]:first-child');
    
    // Verify URL contains event ID
    await page.waitForTimeout(1000);
    expect(page.url()).toMatch(/\/events\/\d+/);
    
    // Test search with query parameters
    await page.goto('/search?q=concert&category=music&location=mumbai');
    
    // Verify query parameters are preserved
    expect(page.url()).toContain('q=concert');
    expect(page.url()).toContain('category=music');
    expect(page.url()).toContain('location=mumbai');
  });

  test('should handle responsive navigation on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    
    // Check if mobile menu button is visible
    const mobileMenuButton = page.locator('[data-testid="mobile-menu-button"]');
    await expect(mobileMenuButton).toBeVisible();
    
    // Open mobile menu
    await mobileMenuButton.click();
    
    // Verify mobile menu items are visible
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="mobile-nav-events"]');
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="mobile-nav-search"]');
    
    // Test navigation through mobile menu
    await page.click('[data-testid="mobile-nav-events"]');
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="events-page"]');
    expect(page.url()).toContain('/events');
  });

  test('should handle deep linking correctly', async ({ page }) => {
    // Test direct access to event detail page
    const eventId = '23'; // Using existing event from logs
    await page.goto(`/events/${eventId}`);
    
    // Should load event details
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="event-details"]');
    
    // Test direct access to search with parameters
    await page.goto('/search?q=music&location=mumbai');
    
    // Should load search results
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="search-results"]');
    
    // Verify search form is populated with parameters
    const searchInput = page.locator('[data-testid="search-input"]');
    await expect(searchInput).toHaveValue('music');
  });
});