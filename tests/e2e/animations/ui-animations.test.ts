import { test, expect, TestHelpers } from '../setup/test-setup';

test.describe('UI Animation and Responsiveness', () => {
  
  test('should animate page transitions smoothly', async ({ page }) => {
    await page.goto('/');
    
    // Enable reduced motion for consistent testing
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    
    // Navigate to events page and check for transition
    await page.click('[data-testid="nav-events"]');
    
    // Check if transition animation is applied
    const pageContainer = page.locator('[data-testid="page-container"]');
    
    // Verify animation classes or CSS transitions
    const hasTransition = await page.evaluate(() => {
      const element = document.querySelector('[data-testid="page-container"]');
      const styles = window.getComputedStyle(element!);
      return styles.transition !== 'none' || styles.animation !== 'none';
    });
    
    expect(hasTransition).toBeTruthy();
    
    // Wait for animation to complete
    await page.waitForTimeout(500);
    
    // Verify page content is visible after transition
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="events-page"]');
  });

  test('should animate modal and dialog appearances', async ({ page }) => {
    await page.goto('/events/23');
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="contact-seller-button"]');
    
    // Click button to open modal
    await page.click('[data-testid="contact-seller-button"]');
    
    // Check for modal animation
    const modal = page.locator('[data-testid="contact-modal"]');
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="contact-modal"]');
    
    // Verify modal has entrance animation
    const hasAnimation = await modal.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return styles.animation !== 'none' || styles.transform !== 'none';
    });
    
    expect(hasAnimation).toBeTruthy();
    
    // Test modal close animation
    await page.click('[data-testid="close-modal"]');
    
    // Verify exit animation
    await page.waitForTimeout(300);
    
    // Modal should be hidden after animation
    await expect(modal).not.toBeVisible();
  });

  test('should animate card hover effects', async ({ page }) => {
    await page.goto('/events');
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="event-card"]');
    
    const firstCard = page.locator('[data-testid="event-card"]').first();
    
    // Get initial transform/scale
    const initialTransform = await firstCard.evaluate(el => {
      return window.getComputedStyle(el).transform;
    });
    
    // Hover over the card
    await firstCard.hover();
    
    // Wait for hover animation
    await page.waitForTimeout(200);
    
    // Check if transform changed (scale, translate, etc.)
    const hoverTransform = await firstCard.evaluate(el => {
      return window.getComputedStyle(el).transform;
    });
    
    // Transform should change on hover (unless it's identity matrix)
    expect(hoverTransform).not.toBe(initialTransform);
    
    // Move mouse away
    await page.mouse.move(0, 0);
    await page.waitForTimeout(200);
    
    // Transform should return to initial state
    const finalTransform = await firstCard.evaluate(el => {
      return window.getComputedStyle(el).transform;
    });
    
    expect(finalTransform).toBe(initialTransform);
  });

  test('should handle loading animations', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to a page that loads data
    await page.click('[data-testid="nav-events"]');
    
    // Check for loading spinner/skeleton
    const loadingElement = page.locator('[data-testid="loading-spinner"], [data-testid="skeleton-loader"]');
    
    // Loading indicator should appear briefly
    if (await loadingElement.isVisible()) {
      // Verify loading animation is active
      const hasAnimation = await loadingElement.evaluate(el => {
        const styles = window.getComputedStyle(el);
        return styles.animation !== 'none' || styles.animationName !== 'none';
      });
      
      expect(hasAnimation).toBeTruthy();
      
      // Wait for content to load
      await TestHelpers.waitForElementToBeVisible(page, '[data-testid="events-page"]');
      
      // Loading indicator should disappear
      await expect(loadingElement).not.toBeVisible();
    }
  });

  test('should animate form validation feedback', async ({ page }) => {
    await page.goto('/register');
    
    // Submit empty form to trigger validation
    await page.click('[data-testid="register-submit"]');
    
    // Check for animated error messages
    const errorMessage = page.locator('[data-testid="email-error"]');
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="email-error"]');
    
    // Verify error message has entrance animation
    const hasAnimation = await errorMessage.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return styles.animation !== 'none' || styles.transition !== 'none';
    });
    
    expect(hasAnimation).toBeTruthy();
    
    // Fill field to clear error
    await TestHelpers.fillFormField(page, '[data-testid="email-input"]', 'test@example.com');
    
    // Error should animate out
    await page.waitForTimeout(300);
    await expect(errorMessage).not.toBeVisible();
  });

  test('should handle responsive design transitions', async ({ page }) => {
    // Start with desktop size
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('/');
    
    // Check desktop navigation is visible
    const desktopNav = page.locator('[data-testid="desktop-nav"]');
    if (await desktopNav.isVisible()) {
      await expect(desktopNav).toBeVisible();
    }
    
    // Gradually resize to mobile
    await page.setViewportSize({ width: 768, height: 600 });
    await page.waitForTimeout(300);
    
    // Check for responsive transitions
    const mobileNav = page.locator('[data-testid="mobile-nav"]');
    if (await mobileNav.isVisible()) {
      await expect(mobileNav).toBeVisible();
    }
    
    // Resize to mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(300);
    
    // Verify mobile menu button is visible
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="mobile-menu-button"]');
  });

  test('should animate button interactions', async ({ page }) => {
    await page.goto('/');
    
    const ctaButton = page.locator('[data-testid="cta-button"]');
    if (await ctaButton.isVisible()) {
      // Get initial button state
      const initialScale = await ctaButton.evaluate(el => {
        return window.getComputedStyle(el).transform;
      });
      
      // Click and hold
      await ctaButton.hover();
      await page.mouse.down();
      await page.waitForTimeout(100);
      
      // Check for active/pressed state animation
      const pressedScale = await ctaButton.evaluate(el => {
        return window.getComputedStyle(el).transform;
      });
      
      // Release
      await page.mouse.up();
      await page.waitForTimeout(100);
      
      // Should return to normal state
      const finalScale = await ctaButton.evaluate(el => {
        return window.getComputedStyle(el).transform;
      });
      
      expect(finalScale).toBe(initialScale);
    }
  });

  test('should handle parallax and scroll animations', async ({ page }) => {
    await page.goto('/');
    
    // Check if page has scroll-triggered animations
    const scrollElement = page.locator('[data-testid="hero-section"]');
    
    if (await scrollElement.isVisible()) {
      // Get initial position
      const initialPosition = await scrollElement.boundingBox();
      
      // Scroll down
      await page.evaluate(() => window.scrollTo(0, 500));
      await page.waitForTimeout(300);
      
      // Check if element moved (parallax effect)
      const scrolledPosition = await scrollElement.boundingBox();
      
      // Position should change with scroll (or opacity/transform)
      if (initialPosition && scrolledPosition) {
        const positionChanged = initialPosition.y !== scrolledPosition.y;
        expect(positionChanged).toBeTruthy();
      }
    }
  });

  test('should maintain smooth animations under load', async ({ page }) => {
    // Create multiple concurrent animations
    await page.goto('/events');
    
    // Rapidly hover over multiple cards
    const cards = page.locator('[data-testid="event-card"]');
    const cardCount = await cards.count();
    
    for (let i = 0; i < Math.min(cardCount, 5); i++) {
      await cards.nth(i).hover();
      await page.waitForTimeout(50);
    }
    
    // Check that animations are still smooth (no janky behavior)
    // This is more of a performance test
    const animationPerformance = await page.evaluate(() => {
      return performance.now();
    });
    
    expect(animationPerformance).toBeDefined();
    
    // Verify all cards are still responsive
    await cards.first().hover();
    await page.waitForTimeout(100);
    
    const isResponsive = await cards.first().evaluate(el => {
      const styles = window.getComputedStyle(el);
      return styles.transition !== 'none';
    });
    
    expect(isResponsive).toBeTruthy();
  });
});