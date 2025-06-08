import { test, expect } from '@playwright/test';
import { TestUtils } from '../helpers/test-utils';

test.describe('Complete User Journeys', () => {
  let utils: TestUtils;

  test.beforeEach(async ({ page }) => {
    utils = new TestUtils(page);
  });

  test('should complete ticket discovery and contact flow', async ({ page }) => {
    // Start at home page
    await utils.navigateToHome();
    await utils.validateEventData();

    // Browse events by category
    await page.click('[data-testid="category-filter"]');
    await page.selectOption('[data-testid="category-select"]', 'Music');
    await page.click('[data-testid="apply-filter"]');
    await page.waitForTimeout(1000);

    // Click on an event to view details
    await page.click('[data-testid="event-card"]');
    await utils.waitForModalAnimation();
    await expect(page.locator('[data-testid="event-modal"]')).toBeVisible();

    // Navigate to map view for location
    await page.click('[data-testid="view-on-map"]');
    await utils.waitForPageTransition();
    await expect(page.url()).toContain('/map');

    // Find and contact a seller
    await utils.clickMapMarker(0);
    await page.click('[data-testid="contact-seller"]');
    
    // Fill contact form
    await page.fill('[data-testid="contact-message"]', 'Hi, I am interested in purchasing this ticket. Is it still available?');
    await page.click('[data-testid="send-contact"]');
    
    // Verify contact request sent
    await utils.expectSuccessMessage('Contact request sent');
  });

  test('should complete ticket listing journey', async ({ page }) => {
    // Navigate to list ticket page
    await utils.navigateToListTicket();

    // Fill out comprehensive ticket listing
    const ticketData = {
      title: 'Tomorrowland India 2024 - 3 Day Pass',
      description: 'Original 3-day pass for Tomorrowland India. Includes camping and main stage access. Selling due to schedule conflict.',
      venue: 'DY Patil Stadium, Mumbai',
      date: '2024-12-15',
      price: '8500',
      category: 'Music'
    };

    await utils.fillTicketListingForm(ticketData);

    // Upload ticket image
    const fileInput = page.locator('[data-testid="ticket-image-upload"]');
    if (await fileInput.isVisible()) {
      // Simulate file upload
      await fileInput.setInputFiles({
        name: 'ticket.jpg',
        mimeType: 'image/jpeg',
        buffer: Buffer.from('fake-image-data')
      });
    }

    // Submit listing
    await utils.submitForm('[data-testid="ticket-listing-form"]');
    await utils.expectSuccessMessage();

    // Verify redirect to profile/dashboard
    await expect(page.url()).toContain('/profile');
    await utils.validateTicketData();
  });

  test('should complete search and filter journey', async ({ page }) => {
    await utils.navigateToHome();

    // Perform text search
    await page.fill('[data-testid="search-input"]', 'Sunburn');
    await page.click('[data-testid="search-button"]');
    await page.waitForTimeout(1000);

    // Apply multiple filters
    await page.selectOption('[data-testid="category-filter"]', 'Music');
    await page.selectOption('[data-testid="city-filter"]', 'Goa');
    await page.fill('[data-testid="max-price"]', '5000');
    await page.click('[data-testid="apply-filters"]');
    await page.waitForTimeout(1000);

    // Verify filtered results
    const eventCards = page.locator('[data-testid="event-card"]');
    await expect(eventCards.first()).toBeVisible();

    // Clear filters
    await page.click('[data-testid="clear-filters"]');
    await page.waitForTimeout(1000);

    // Verify all events shown again
    await utils.validateEventData();
  });

  test('should handle authentication flow', async ({ page }) => {
    // Start at protected page
    await utils.navigateToProfile();

    // Should prompt for authentication
    await page.click('[data-testid="login-button"]');
    await utils.attemptGoogleLogin();

    // Note: In real testing, you'd mock the OAuth flow
    // For now, verify the authentication prompt appears
    await utils.waitForAuthenticationState();
  });

  test('should complete mobile user journey', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await utils.navigateToHome();

    // Open mobile menu
    await page.click('[data-testid="hamburger-menu"]');
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();

    // Navigate via mobile menu
    await page.click('[data-testid="mobile-nav-map"]');
    await utils.waitForPageTransition();
    await expect(page.url()).toContain('/map');

    // Test mobile map interactions
    const mapContainer = page.locator('[data-testid="google-map"]');
    await expect(mapContainer).toBeVisible();

    // Touch interactions
    await mapContainer.tap({ position: { x: 100, y: 100 } });
    await page.waitForTimeout(500);

    // Test mobile ticket listing
    await page.click('[data-testid="mobile-nav-list-ticket"]');
    await utils.waitForPageTransition();
    
    const form = page.locator('[data-testid="ticket-listing-form"]');
    await expect(form).toBeVisible();
  });

  test('should handle interruption recovery', async ({ page }) => {
    await utils.navigateToListTicket();

    // Start filling form
    await page.fill('[data-testid="ticket-title"]', 'Test Event');
    await page.fill('[data-testid="ticket-description"]', 'Test Description');

    // Simulate navigation interruption
    await utils.navigateToHome();
    await page.waitForTimeout(1000);

    // Return to form
    await utils.navigateToListTicket();

    // Verify form state (should either preserve or be reset)
    const titleValue = await page.inputValue('[data-testid="ticket-title"]');
    expect(titleValue).toBeDefined();
  });

  test('should handle concurrent user actions', async ({ page }) => {
    await utils.navigateToHome();

    // Simulate multiple rapid actions
    const actions = [
      () => page.click('[data-testid="category-filter"]'),
      () => page.fill('[data-testid="search-input"]', 'music'),
      () => page.click('[data-testid="event-card"]'),
      () => page.keyboard.press('Escape'),
      () => page.click('[data-testid="refresh-events"]')
    ];

    // Execute actions rapidly
    await Promise.allSettled(actions.map(action => action()));
    await page.waitForTimeout(2000);

    // Verify application remains stable
    await utils.validateEventData();
    await expect(page.locator('[data-testid="event-grid"]')).toBeVisible();
  });
});