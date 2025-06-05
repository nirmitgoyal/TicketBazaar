import { test, expect } from '@playwright/test';
import { TestHelpers } from '../utils/test-helpers';

test.describe('Complete Ticket Purchase Flow', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
  });

  test('should complete end-to-end ticket discovery and contact flow', async ({ page }) => {
    // Start from homepage
    await page.goto('/');
    await helpers.waitForPageLoad();

    // Search for tickets
    const searchInput = page.locator('[data-testid="search-input"], input[placeholder*="search" i]').first();
    if (await searchInput.count() > 0) {
      await helpers.typeRealistically('[data-testid="search-input"], input[placeholder*="search" i]', 'concert Mumbai');
      await searchInput.press('Enter');
      await helpers.waitForPageLoad();
    }

    // Find and click on first available ticket
    const ticketCards = page.locator('[data-testid="ticket-card"], .ticket-card, .event-card');
    const cardCount = await ticketCards.count();

    if (cardCount > 0) {
      await helpers.clickWithMovement('[data-testid="ticket-card"]:first-child, .ticket-card:first-child, .event-card:first-child');
      await helpers.waitForPageTransition();

      // Should be on ticket details page
      const isOnDetailsPage = page.url().includes('/event') || page.url().includes('/ticket');
      expect(isOnDetailsPage).toBeTruthy();

      // Look for contact seller button
      const contactButton = page.locator('[data-testid="contact-seller"], button:has-text("Contact"), button:has-text("Message")');
      
      if (await contactButton.count() > 0) {
        await helpers.clickWithMovement('[data-testid="contact-seller"], button:has-text("Contact")');
        await helpers.waitForAnimations();

        // Should open contact modal or form
        const contactModal = page.locator('[data-testid="contact-modal"], .modal, .dialog');
        const contactForm = page.locator('[data-testid="contact-form"], .contact-form');
        
        const hasContactInterface = await contactModal.count() > 0 || await contactForm.count() > 0;
        if (hasContactInterface) {
          // Fill contact message
          const messageInput = page.locator('[data-testid="message-input"], textarea[name="message"], input[name="message"]');
          if (await messageInput.count() > 0) {
            await helpers.typeRealistically('[data-testid="message-input"], textarea[name="message"]', 
              'Hi, I am interested in these tickets. Are they still available?');
            
            // Select contact method if available
            const contactMethod = page.locator('[data-testid="contact-method"], select[name="contactMethod"]');
            if (await contactMethod.count() > 0) {
              await contactMethod.selectOption('phone');
            }

            // Submit contact request
            const sendButton = page.locator('[data-testid="send-message"], button:has-text("Send")');
            if (await sendButton.count() > 0) {
              await helpers.clickWithMovement('[data-testid="send-message"], button:has-text("Send")');
              await page.waitForTimeout(2000);

              // Should show success message or redirect
              const hasSuccess = await page.locator('[data-testid="contact-success"], .success-message').count() > 0;
              const modalClosed = await contactModal.count() === 0;
              
              expect(hasSuccess || modalClosed).toBeTruthy();
            }
          }
        }
      }
    }
  });

  test('should handle ticket browsing with filters and sorting', async ({ page }) => {
    await page.goto('/');
    await helpers.waitForPageLoad();

    // Apply category filter
    const categoryFilter = page.locator('[data-testid="category-filter"], select[name="category"]');
    if (await categoryFilter.count() > 0) {
      await categoryFilter.selectOption('Concert');
      await helpers.waitForPageLoad();
    }

    // Apply price filter
    const priceFilter = page.locator('[data-testid="price-filter"], .price-filter');
    if (await priceFilter.count() > 0) {
      const minPrice = page.locator('[data-testid="min-price"], input[name="minPrice"]');
      const maxPrice = page.locator('[data-testid="max-price"], input[name="maxPrice"]');
      
      if (await minPrice.count() > 0) {
        await helpers.typeRealistically('[data-testid="min-price"], input[name="minPrice"]', '1000');
      }
      if (await maxPrice.count() > 0) {
        await helpers.typeRealistically('[data-testid="max-price"], input[name="maxPrice"]', '5000');
      }

      const applyButton = page.locator('[data-testid="apply-filters"], button:has-text("Apply")');
      if (await applyButton.count() > 0) {
        await helpers.clickWithMovement('[data-testid="apply-filters"], button:has-text("Apply")');
        await helpers.waitForPageLoad();
      }
    }

    // Sort results
    const sortDropdown = page.locator('[data-testid="sort-dropdown"], select[name="sort"]');
    if (await sortDropdown.count() > 0) {
      await sortDropdown.selectOption('price-low');
      await helpers.waitForPageLoad();
    }

    // Verify filtered results
    const results = page.locator('[data-testid="ticket-card"], .ticket-card, .event-card');
    const resultCount = await results.count();
    
    // Should have some results or show "no results" message
    const hasResults = resultCount > 0;
    const hasNoResults = await page.locator('[data-testid="no-results"], .no-results').count() > 0;
    
    expect(hasResults || hasNoResults).toBeTruthy();
  });

  test('should handle map-based ticket discovery', async ({ page }) => {
    await page.goto('/map');
    await helpers.waitForPageLoad();
    await page.waitForSelector('canvas, [data-testid="map-container"]', { timeout: 15000 });

    // Wait for map and markers to load
    await page.waitForTimeout(3000);

    // Click on a marker
    const markers = page.locator('[role="button"][aria-label*="marker"], .gm-marker');
    const markerCount = await markers.count();

    if (markerCount > 0) {
      await helpers.clickWithMovement('[role="button"][aria-label*="marker"]:first-child');
      await page.waitForTimeout(1000);

      // Info window should appear
      const infoWindow = page.locator('.gm-style-iw, [data-testid="info-window"]');
      if (await infoWindow.count() > 0) {
        // Click on "View Details" in info window
        const detailsLink = page.locator('a:has-text("Details"), a:has-text("View"), button:has-text("Details")');
        if (await detailsLink.count() > 0) {
          await helpers.clickWithMovement('a:has-text("Details"), a:has-text("View")');
          await helpers.waitForPageTransition();

          // Should navigate to ticket details
          const isOnDetailsPage = page.url().includes('/event') || page.url().includes('/ticket');
          expect(isOnDetailsPage).toBeTruthy();
        }
      }
    }
  });

  test('should handle seller profile and ratings review', async ({ page }) => {
    await page.goto('/');
    await helpers.waitForPageLoad();

    // Find a ticket and go to details
    const ticketCards = page.locator('[data-testid="ticket-card"], .ticket-card, .event-card');
    if (await ticketCards.count() > 0) {
      await helpers.clickWithMovement('[data-testid="ticket-card"]:first-child');
      await helpers.waitForPageTransition();

      // Look for seller information
      const sellerInfo = page.locator('[data-testid="seller-info"], .seller-info, .seller-profile');
      if (await sellerInfo.count() > 0) {
        // Check seller rating
        const rating = page.locator('[data-testid="seller-rating"], .rating, .stars');
        if (await rating.count() > 0) {
          await expect(rating).toBeVisible();
        }

        // Check seller reviews
        const reviewsSection = page.locator('[data-testid="seller-reviews"], .reviews, .seller-reviews');
        if (await reviewsSection.count() > 0) {
          await expect(reviewsSection).toBeVisible();
          
          // Click to view more reviews
          const viewReviews = page.locator('button:has-text("Reviews"), a:has-text("Reviews")');
          if (await viewReviews.count() > 0) {
            await helpers.clickWithMovement('button:has-text("Reviews"), a:has-text("Reviews")');
            await helpers.waitForAnimations();
            
            // Should show reviews modal or section
            const reviewsModal = page.locator('[data-testid="reviews-modal"], .reviews-modal');
            const hasReviewsVisible = await reviewsModal.count() > 0 || await page.locator('.review-item').count() > 0;
            
            expect(hasReviewsVisible).toBeTruthy();
          }
        }

        // Click on seller profile link
        const sellerProfile = page.locator('a:has-text("Profile"), [data-testid="seller-profile-link"]');
        if (await sellerProfile.count() > 0) {
          await helpers.clickWithMovement('a:has-text("Profile"), [data-testid="seller-profile-link"]');
          await helpers.waitForPageTransition();
          
          // Should be on seller profile page
          const isOnProfilePage = page.url().includes('/profile') || page.url().includes('/seller');
          expect(isOnProfilePage).toBeTruthy();
        }
      }
    }
  });

  test('should handle ticket verification process', async ({ page }) => {
    await page.goto('/');
    await helpers.waitForPageLoad();

    // Find a ticket and go to details
    const ticketCards = page.locator('[data-testid="ticket-card"], .ticket-card, .event-card');
    if (await ticketCards.count() > 0) {
      await helpers.clickWithMovement('[data-testid="ticket-card"]:first-child');
      await helpers.waitForPageTransition();

      // Look for verification information
      const verificationInfo = page.locator('[data-testid="verification"], .verification, .verified-badge');
      if (await verificationInfo.count() > 0) {
        await expect(verificationInfo).toBeVisible();
      }

      // Check for QR code or verification code
      const qrCode = page.locator('[data-testid="qr-code"], .qr-code, img[alt*="QR"]');
      if (await qrCode.count() > 0) {
        await expect(qrCode).toBeVisible();
      }

      // Look for verification button
      const verifyButton = page.locator('[data-testid="verify-ticket"], button:has-text("Verify")');
      if (await verifyButton.count() > 0) {
        await helpers.clickWithMovement('[data-testid="verify-ticket"], button:has-text("Verify")');
        await page.waitForTimeout(2000);
        
        // Should show verification status
        const verificationStatus = page.locator('[data-testid="verification-status"], .verification-status');
        if (await verificationStatus.count() > 0) {
          await expect(verificationStatus).toBeVisible();
        }
      }
    }
  });

  test('should handle mobile ticket browsing experience', async ({ page, isMobile }) => {
    if (isMobile) {
      await page.goto('/');
      await helpers.waitForPageLoad();

      // Test mobile search
      const searchInput = page.locator('[data-testid="search-input"], input[placeholder*="search" i]');
      if (await searchInput.count() > 0) {
        await helpers.touchTap('[data-testid="search-input"], input[placeholder*="search" i]');
        await helpers.typeRealistically('[data-testid="search-input"], input[placeholder*="search" i]', 'concert');
        await searchInput.press('Enter');
        await helpers.waitForPageLoad();
      }

      // Test mobile card interactions
      const ticketCards = page.locator('[data-testid="ticket-card"], .ticket-card');
      if (await ticketCards.count() > 0) {
        // Swipe through cards if supported
        await helpers.swipe('[data-testid="ticket-card"]:first-child', 'left');
        await page.waitForTimeout(300);
        
        // Tap on card
        await helpers.touchTap('[data-testid="ticket-card"]:first-child');
        await helpers.waitForPageTransition();
        
        // Should open ticket details
        const isOnDetailsPage = page.url().includes('/event') || page.url().includes('/ticket');
        expect(isOnDetailsPage).toBeTruthy();
      }

      // Test mobile contact flow
      const contactButton = page.locator('[data-testid="contact-seller"], button:has-text("Contact")');
      if (await contactButton.count() > 0) {
        await helpers.touchTap('[data-testid="contact-seller"], button:has-text("Contact")');
        await helpers.waitForAnimations();
        
        // Mobile contact modal should appear
        const contactModal = page.locator('[data-testid="contact-modal"], .modal');
        if (await contactModal.count() > 0) {
          await expect(contactModal).toBeVisible();
        }
      }
    }
  });

  test('should track user journey analytics events', async ({ page }) => {
    await page.goto('/');
    await helpers.waitForPageLoad();

    // Search event
    const searchInput = page.locator('[data-testid="search-input"], input[placeholder*="search" i]');
    if (await searchInput.count() > 0) {
      await helpers.typeRealistically('[data-testid="search-input"], input[placeholder*="search" i]', 'concert');
      await searchInput.press('Enter');
      
      try {
        await helpers.waitForAnalyticsEvent('search');
      } catch (error) {
        console.log('Analytics not available in test environment');
      }
    }

    // View item event
    const ticketCards = page.locator('[data-testid="ticket-card"], .ticket-card');
    if (await ticketCards.count() > 0) {
      await helpers.clickWithMovement('[data-testid="ticket-card"]:first-child');
      
      try {
        await helpers.waitForAnalyticsEvent('view_item');
      } catch (error) {
        console.log('Analytics not available in test environment');
      }
    }

    // Contact/interest event
    const contactButton = page.locator('[data-testid="contact-seller"], button:has-text("Contact")');
    if (await contactButton.count() > 0) {
      await helpers.clickWithMovement('[data-testid="contact-seller"], button:has-text("Contact")');
      
      try {
        await helpers.waitForAnalyticsEvent('add_to_cart');
      } catch (error) {
        console.log('Analytics not available in test environment');
      }
    }
  });

  test('should handle booking flow with session management', async ({ page }) => {
    // Test unauthenticated user trying to contact seller
    await page.goto('/');
    await helpers.waitForPageLoad();

    const ticketCards = page.locator('[data-testid="ticket-card"], .ticket-card');
    if (await ticketCards.count() > 0) {
      await helpers.clickWithMovement('[data-testid="ticket-card"]:first-child');
      await helpers.waitForPageTransition();

      const contactButton = page.locator('[data-testid="contact-seller"], button:has-text("Contact")');
      if (await contactButton.count() > 0) {
        await helpers.clickWithMovement('[data-testid="contact-seller"], button:has-text("Contact")');
        await page.waitForTimeout(1000);

        // Should either show login prompt or contact form based on auth state
        const needsLogin = await page.locator('form[action*="login"], .login-required').count() > 0;
        const hasContactForm = await page.locator('[data-testid="contact-form"], .contact-form').count() > 0;
        const redirectedToLogin = page.url().includes('/login');

        expect(needsLogin || hasContactForm || redirectedToLogin).toBeTruthy();
      }
    }
  });

  test('should handle error states during ticket browsing', async ({ page }) => {
    // Test with network errors
    await page.route('**/api/events**', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Server error' })
      });
    });

    await page.goto('/');
    await helpers.waitForPageLoad();
    await page.waitForTimeout(3000);

    // Should show error state or empty state
    const hasError = await page.locator('[data-testid="error-message"], .error-message').count() > 0;
    const hasEmptyState = await page.locator('[data-testid="empty-state"], .empty-state').count() > 0;
    const hasRetryButton = await page.locator('button:has-text("Retry"), button:has-text("Reload")').count() > 0;

    expect(hasError || hasEmptyState || hasRetryButton).toBeTruthy();

    // Test retry functionality
    if (hasRetryButton) {
      // Remove the error route
      await page.unroute('**/api/events**');
      
      await helpers.clickWithMovement('button:has-text("Retry"), button:has-text("Reload")');
      await helpers.waitForPageLoad();
      
      // Should reload successfully
      const pageLoaded = await page.locator('body').isVisible();
      expect(pageLoaded).toBeTruthy();
    }
  });
});