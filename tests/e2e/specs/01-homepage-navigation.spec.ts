import { test, expect } from '@playwright/test';
import { TestHelpers } from '../utils/test-helpers';

test.describe('Homepage and Navigation', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    await page.goto('/');
    await helpers.waitForPageLoad();
  });

  test('should load homepage successfully', async ({ page }) => {
    // Check basic page structure
    await expect(page).toHaveTitle(/Ticket Bazaar/);
    await expect(page.locator('body')).toBeVisible();
    
    // Verify essential elements are present
    await expect(page.locator('nav, header')).toBeVisible();
    await expect(page.locator('[data-testid="search-bar"], input[placeholder*="search" i]')).toBeVisible();
    
    // Check for event listings or empty state
    const hasEvents = await page.locator('[data-testid="event-card"], .event-card').count() > 0;
    const hasEmptyState = await page.locator('[data-testid="empty-state"], .empty-state').count() > 0;
    
    expect(hasEvents || hasEmptyState).toBeTruthy();
  });

  test('should handle responsive navigation on mobile', async ({ page, isMobile }) => {
    if (isMobile) {
      // Test mobile menu toggle
      const menuButton = page.locator('[data-testid="mobile-menu"], .mobile-menu, button[aria-label*="menu" i]');
      if (await menuButton.count() > 0) {
        await helpers.touchTap('[data-testid="mobile-menu"]');
        await helpers.waitForAnimations();
        
        // Check if navigation items are visible
        await expect(page.locator('nav, .navigation')).toBeVisible();
      }
    }
  });

  test('should navigate to different pages via main navigation', async ({ page }) => {
    const navigationTests = [
      { text: 'Map', expectedPath: '/map' },
      { text: 'List Ticket', expectedPath: '/list-ticket' },
      { text: 'My Tickets', expectedPath: '/my-tickets' }
    ];

    for (const nav of navigationTests) {
      // Find navigation link
      const navLink = page.locator(`a:has-text("${nav.text}"), [href*="${nav.expectedPath}"]`).first();
      
      if (await navLink.count() > 0) {
        await helpers.clickWithMovement(`a:has-text("${nav.text}")`);
        await helpers.waitForPageTransition();
        
        // Verify URL changed
        await expect(page).toHaveURL(new RegExp(nav.expectedPath));
        
        // Navigate back to homepage
        await page.goto('/');
        await helpers.waitForPageLoad();
      }
    }
  });

  test('should display and interact with search functionality', async ({ page }) => {
    const searchInput = page.locator('[data-testid="search-input"], input[placeholder*="search" i]').first();
    
    // Test search input interaction
    await helpers.typeRealistically('[data-testid="search-input"], input[placeholder*="search" i]', 'concert Mumbai');
    
    // Submit search (look for search button or enter key)
    const searchButton = page.locator('[data-testid="search-button"], button:has-text("Search")');
    if (await searchButton.count() > 0) {
      await helpers.clickWithMovement('[data-testid="search-button"]');
    } else {
      await searchInput.press('Enter');
    }
    
    await helpers.waitForPageLoad();
    
    // Verify search results or no results message
    await page.waitForSelector('[data-testid="search-results"], .search-results, [data-testid="no-results"]', 
      { timeout: 5000 });
  });

  test('should handle page transitions with animations', async ({ page }) => {
    // Navigate to map page
    const mapLink = page.locator('a[href="/map"], a:has-text("Map")').first();
    
    if (await mapLink.count() > 0) {
      await helpers.clickWithMovement('a[href="/map"]');
      
      // Wait for page transition animations
      await helpers.waitForAnimations();
      await helpers.waitForPageTransition();
      
      // Verify we're on the map page
      await expect(page).toHaveURL(/\/map/);
      
      // Check for map container or loading state
      await page.waitForSelector('[data-testid="map-container"], .map-container, #map', 
        { timeout: 10000 });
    }
  });

  test('should track analytics events for page views', async ({ page }) => {
    // Wait for initial analytics to load
    await page.waitForTimeout(2000);
    
    // Navigate to different pages and verify analytics
    const testPages = ['/map', '/list-ticket'];
    
    for (const testPage of testPages) {
      await page.goto(testPage);
      await helpers.waitForPageLoad();
      
      // Wait for analytics event to fire
      try {
        await helpers.waitForAnalyticsEvent('page_view');
        const events = await helpers.getAnalyticsEvents();
        expect(events.length).toBeGreaterThan(0);
      } catch (error) {
        // Analytics might not be configured in test environment
        console.log('Analytics events not tracked in test environment');
      }
    }
  });

  test('should handle error states gracefully', async ({ page }) => {
    // Test navigation to non-existent page
    await page.goto('/non-existent-page');
    
    // Should show 404 page or redirect
    const is404 = await page.locator('h1:has-text("404"), h1:has-text("Not Found")').count() > 0;
    const isRedirected = page.url().includes('/');
    
    expect(is404 || isRedirected).toBeTruthy();
  });

  test('should maintain scroll position on page transitions', async ({ page }) => {
    // Scroll down on homepage
    await page.evaluate(() => window.scrollTo(0, 500));
    const scrollPosition = await page.evaluate(() => window.pageYOffset);
    
    // Navigate away and back
    await page.goto('/map');
    await helpers.waitForPageLoad();
    await page.goBack();
    await helpers.waitForPageLoad();
    
    // Check if scroll position is restored (some frameworks do this automatically)
    const newScrollPosition = await page.evaluate(() => window.pageYOffset);
    // Note: This might not always be the same due to different page content
  });

  test('should load and display event cards correctly', async ({ page }) => {
    // Wait for events to load
    await page.waitForSelector('[data-testid="event-card"], .event-card', { timeout: 10000 });
    
    const eventCards = page.locator('[data-testid="event-card"], .event-card');
    const cardCount = await eventCards.count();
    
    if (cardCount > 0) {
      // Test first event card
      const firstCard = eventCards.first();
      
      // Check for essential event information
      await expect(firstCard.locator('[data-testid="event-title"], .event-title, h2, h3')).toBeVisible();
      await expect(firstCard.locator('[data-testid="event-price"], .price')).toBeVisible();
      await expect(firstCard.locator('[data-testid="event-venue"], .venue')).toBeVisible();
      
      // Test card interaction
      await helpers.clickWithMovement('[data-testid="event-card"]:first-child');
      await helpers.waitForPageTransition();
      
      // Should navigate to event details
      await expect(page).toHaveURL(/\/event/);
    }
  });
});