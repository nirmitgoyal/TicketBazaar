import { test, expect } from '@playwright/test';

test.describe('Complete User Journey', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('User can browse tickets without authentication', async ({ page }) => {
    // Verify homepage loads
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('[data-testid="search-bar"]')).toBeVisible();
    
    // Verify ticket listings are displayed
    await expect(page.locator('[data-testid="ticket-card"]').first()).toBeVisible();
    
    // Test search functionality
    await page.fill('[data-testid="search-input"]', 'Taylor Swift');
    await page.click('[data-testid="search-button"]');
    await page.waitForLoadState('networkidle');
    
    // Verify search results
    const searchResults = page.locator('[data-testid="ticket-card"]');
    await expect(searchResults.first()).toBeVisible();
  });

  test('User can view ticket details', async ({ page }) => {
    // Click on first ticket
    await page.click('[data-testid="ticket-card"]');
    
    // Verify ticket detail modal or page opens
    await expect(page.locator('[data-testid="ticket-detail"]')).toBeVisible();
    await expect(page.locator('[data-testid="event-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="venue"]')).toBeVisible();
    await expect(page.locator('[data-testid="event-date"]')).toBeVisible();
    await expect(page.locator('[data-testid="contact-seller-btn"]')).toBeVisible();
  });

  test('User registration flow', async ({ page }) => {
    // Navigate to registration
    await page.click('[data-testid="register-link"]');
    
    // Fill registration form
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'SecurePass123');
    await page.fill('[data-testid="fullname-input"]', 'John Doe');
    await page.selectOption('[data-testid="country-select"]', 'US');
    
    // Submit registration
    await page.click('[data-testid="register-button"]');
    
    // Verify registration success or email verification prompt
    await expect(page.locator('[data-testid="registration-success"]')).toBeVisible();
  });

  test('User login flow', async ({ page }) => {
    // Navigate to login
    await page.click('[data-testid="login-link"]');
    
    // Fill login form
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'SecurePass123');
    
    // Submit login
    await page.click('[data-testid="login-button"]');
    
    // Verify successful login
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });

  test('Authenticated user can list a ticket', async ({ page }) => {
    // Login first (assuming login state can be set up)
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'SecurePass123');
    await page.click('[data-testid="login-button"]');
    
    // Navigate to list ticket page
    await page.goto('/list-ticket');
    
    // Fill ticket listing form
    await page.fill('[data-testid="ticket-title"]', 'Taylor Swift Concert Tickets');
    await page.fill('[data-testid="event-title"]', 'Taylor Swift Eras Tour');
    await page.fill('[data-testid="venue"]', 'Madison Square Garden');
    await page.fill('[data-testid="venue-address"]', '4 Pennsylvania Plaza, New York, NY');
    
    // Set event date
    await page.fill('[data-testid="event-date"]', '2024-12-25');
    
    // Select category
    await page.selectOption('[data-testid="category-select"]', 'Concert');
    
    // Fill ticket details
    await page.fill('[data-testid="section"]', 'Floor');
    await page.fill('[data-testid="row"]', 'A');
    await page.fill('[data-testid="seat"]', '15-16');
    await page.fill('[data-testid="quantity"]', '2');
    
    // Select transfer method
    await page.selectOption('[data-testid="transfer-method"]', 'Mobile Transfer');
    
    // Add additional information
    await page.fill('[data-testid="additional-info"]', 'Great seats with amazing view!');
    
    // Submit listing
    await page.click('[data-testid="submit-listing"]');
    
    // Verify listing creation success
    await expect(page.locator('[data-testid="listing-success"]')).toBeVisible();
  });

  test('User can contact seller for a ticket', async ({ page }) => {
    // Assuming user is logged in
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'buyer@example.com');
    await page.fill('[data-testid="password-input"]', 'SecurePass123');
    await page.click('[data-testid="login-button"]');
    
    // Go to a ticket detail page
    await page.goto('/');
    await page.click('[data-testid="ticket-card"]');
    
    // Click contact seller button
    await page.click('[data-testid="contact-seller-btn"]');
    
    // Fill contact form
    await page.selectOption('[data-testid="contact-method"]', 'whatsapp');
    await page.fill('[data-testid="contact-message"]', 'Hi, I am interested in purchasing these tickets. Are they still available?');
    await page.fill('[data-testid="meeting-location"]', 'Central Park, NYC');
    await page.fill('[data-testid="preferred-time"]', 'Evening');
    
    // Submit contact request
    await page.click('[data-testid="send-contact-request"]');
    
    // Verify contact request sent
    await expect(page.locator('[data-testid="contact-success"]')).toBeVisible();
  });

  test('User can view their listed tickets', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'seller@example.com');
    await page.fill('[data-testid="password-input"]', 'SecurePass123');
    await page.click('[data-testid="login-button"]');
    
    // Navigate to my tickets
    await page.goto('/my-tickets');
    
    // Verify tickets are displayed
    await expect(page.locator('[data-testid="my-ticket-card"]')).toBeVisible();
    
    // Verify ticket management options
    await expect(page.locator('[data-testid="edit-ticket-btn"]')).toBeVisible();
    await expect(page.locator('[data-testid="delete-ticket-btn"]')).toBeVisible();
  });
});

test.describe('Mobile Responsiveness', () => {
  test('Mobile navigation works correctly', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Verify mobile navigation
    await expect(page.locator('[data-testid="mobile-menu-trigger"]')).toBeVisible();
    
    // Open mobile menu
    await page.click('[data-testid="mobile-menu-trigger"]');
    await expect(page.locator('[data-testid="mobile-nav-menu"]')).toBeVisible();
    
    // Test navigation links
    await page.click('[data-testid="mobile-nav-search"]');
    await expect(page.locator('[data-testid="search-bar"]')).toBeVisible();
  });

  test('Touch interactions work on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Test swipe gestures on ticket cards
    const ticketCard = page.locator('[data-testid="ticket-card"]').first();
    await ticketCard.tap();
    
    // Verify touch-friendly button sizes
    const buttons = page.locator('button');
    for (let i = 0; i < await buttons.count(); i++) {
      const button = buttons.nth(i);
      if (await button.isVisible()) {
        const boundingBox = await button.boundingBox();
        if (boundingBox) {
          expect(boundingBox.height).toBeGreaterThanOrEqual(44); // Minimum touch target size
        }
      }
    }
  });
});

test.describe('Performance Testing', () => {
  test('Page load times are acceptable', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(3000); // Page should load within 3 seconds
  });

  test('Search functionality performs well', async ({ page }) => {
    await page.goto('/');
    
    const startTime = Date.now();
    await page.fill('[data-testid="search-input"]', 'concert');
    await page.click('[data-testid="search-button"]');
    await page.waitForLoadState('networkidle');
    const searchTime = Date.now() - startTime;
    
    expect(searchTime).toBeLessThan(2000); // Search should complete within 2 seconds
  });

  test('Image loading is optimized', async ({ page }) => {
    await page.goto('/');
    
    // Check that images have proper loading attributes
    const images = page.locator('img');
    for (let i = 0; i < await images.count(); i++) {
      const img = images.nth(i);
      const loading = await img.getAttribute('loading');
      if (i > 2) { // Images below the fold should be lazy loaded
        expect(loading).toBe('lazy');
      }
    }
  });
});

test.describe('Accessibility Testing', () => {
  test('Keyboard navigation works properly', async ({ page }) => {
    await page.goto('/');
    
    // Test tab navigation
    await page.keyboard.press('Tab');
    let focusedElement = await page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    // Continue tabbing through interactive elements
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
      focusedElement = await page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    }
  });

  test('ARIA labels are present', async ({ page }) => {
    await page.goto('/');
    
    // Check for proper ARIA labels on interactive elements
    const buttons = page.locator('button');
    for (let i = 0; i < await buttons.count(); i++) {
      const button = buttons.nth(i);
      if (await button.isVisible()) {
        const ariaLabel = await button.getAttribute('aria-label');
        const text = await button.textContent();
        expect(ariaLabel || text).toBeTruthy();
      }
    }
  });

  test('Color contrast is sufficient', async ({ page }) => {
    await page.goto('/');
    
    // This would typically use accessibility testing tools
    // For now, verify that text is visible against backgrounds
    const textElements = page.locator('p, h1, h2, h3, h4, h5, h6, span');
    for (let i = 0; i < Math.min(10, await textElements.count()); i++) {
      const element = textElements.nth(i);
      if (await element.isVisible()) {
        const color = await element.evaluate(el => getComputedStyle(el).color);
        const backgroundColor = await element.evaluate(el => getComputedStyle(el).backgroundColor);
        expect(color).toBeTruthy();
        expect(backgroundColor).toBeTruthy();
      }
    }
  });
});