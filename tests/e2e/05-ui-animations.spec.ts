import { test, expect } from "@playwright/test";

/**
 * UI Animations Visual Regression Tests
 * Tests visual consistency of animated components and transitions
 */
test.describe("UI Animations Visual Regression", () => {
  test.beforeEach(async ({ page }) => {
    // Reduce motion for consistent visual testing
    await page.addInitScript(() => {
      // Disable CSS animations and transitions for consistent screenshots
      const css = `
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
        }
      `;
      const style = document.createElement("style");
      style.textContent = css;
      document.head.appendChild(style);
    });
  });

  test("should render home page with consistent layout", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    
    // Wait for any loading states to complete
    await page.waitForTimeout(1000);
    
    // Take screenshot of the full home page
    await expect(page).toHaveScreenshot("home-page-full.png", {
      fullPage: true,
      threshold: 0.3,
    });
  });

  test("should render navigation consistently", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    
    // Focus on navigation area
    const nav = page.locator("nav").first();
    await expect(nav).toBeVisible();
    
    await expect(nav).toHaveScreenshot("navigation-bar.png", {
      threshold: 0.3,
    });
  });

  test("should render event cards grid consistently", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    
    // Wait for event cards to load
    await page.waitForSelector('[data-testid="event-grid"]');
    const eventGrid = page.locator('[data-testid="event-grid"]');
    
    // Take screenshot of event grid
    await expect(eventGrid).toHaveScreenshot("event-grid.png", {
      threshold: 0.3,
    });
  });

  test("should render individual event card consistently", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    
    // Wait for event cards to load
    await page.waitForSelector('[data-testid="event-card"]');
    const firstEventCard = page.locator('[data-testid="event-card"]').first();
    
    // Take screenshot of first event card
    await expect(firstEventCard).toHaveScreenshot("event-card.png", {
      threshold: 0.3,
    });
  });

  test("should render event modal consistently", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    
    // Click on first event card to open modal
    const firstEventCard = page.locator('[data-testid="event-card"]').first();
    await firstEventCard.click();
    
    // Wait for modal to be visible
    const modal = page.locator('[data-testid="event-modal"]');
    await expect(modal).toBeVisible();
    await page.waitForTimeout(500);
    
    // Take screenshot of modal
    await expect(modal).toHaveScreenshot("event-modal.png", {
      threshold: 0.3,
    });
  });

  test("should render map page consistently", async ({ page }) => {
    await page.goto("/map");
    await page.waitForLoadState("networkidle");
    
    // Wait for map to load (if any)
    await page.waitForTimeout(2000);
    
    // Take screenshot of map page
    await expect(page).toHaveScreenshot("map-page.png", {
      fullPage: true,
      threshold: 0.3,
    });
  });

  test("should render list ticket page consistently", async ({ page }) => {
    await page.goto("/list-ticket");
    await page.waitForLoadState("networkidle");
    
    // Wait for form to load
    await page.waitForTimeout(1000);
    
    // Take screenshot of list ticket page
    await expect(page).toHaveScreenshot("list-ticket-page.png", {
      fullPage: true,
      threshold: 0.3,
    });
  });

  test("should render form elements consistently", async ({ page }) => {
    await page.goto("/list-ticket");
    await page.waitForLoadState("networkidle");
    
    // Focus on the form area
    const form = page.locator("form").first();
    if (await form.isVisible()) {
      await expect(form).toHaveScreenshot("ticket-form.png", {
        threshold: 0.3,
      });
    } else {
      // If no form found, take screenshot of main content area
      const main = page.locator("main").first();
      await expect(main).toHaveScreenshot("ticket-form-content.png", {
        threshold: 0.3,
      });
    }
  });

  test("should render buttons and UI components consistently", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    
    // Test primary buttons
    const buttons = page.locator('button, [role="button"]');
    const buttonCount = await buttons.count();
    
    if (buttonCount > 0) {
      // Take screenshot of first few buttons
      for (let i = 0; i < Math.min(3, buttonCount); i++) {
        const button = buttons.nth(i);
        if (await button.isVisible()) {
          await expect(button).toHaveScreenshot(`button-${i}.png`, {
            threshold: 0.3,
          });
        }
      }
    }
  });

  test("should render responsive layout on mobile", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);
    
    // Take screenshot of mobile layout
    await expect(page).toHaveScreenshot("mobile-home-page.png", {
      fullPage: true,
      threshold: 0.3,
    });
  });

  test("should render responsive navigation on mobile", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    
    // Check mobile navigation
    const nav = page.locator("nav").first();
    if (await nav.isVisible()) {
      await expect(nav).toHaveScreenshot("mobile-navigation.png", {
        threshold: 0.3,
      });
    }
  });

  test("should handle hover states consistently", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    
    // Test hover on first event card
    const firstEventCard = page.locator('[data-testid="event-card"]').first();
    if (await firstEventCard.isVisible()) {
      await firstEventCard.hover();
      await page.waitForTimeout(300);
      
      await expect(firstEventCard).toHaveScreenshot("event-card-hover.png", {
        threshold: 0.3,
      });
    }
  });

  test("should render loading states consistently", async ({ page }) => {
    // Start navigation but don't wait for it to complete
    await page.goto("/", { waitUntil: "domcontentloaded" });
    
    // Try to capture loading state if any loading indicators exist
    const loadingIndicators = page.locator('[data-testid*="loading"], .loading, .spinner');
    const count = await loadingIndicators.count();
    
    if (count > 0) {
      await expect(loadingIndicators.first()).toHaveScreenshot("loading-state.png", {
        threshold: 0.3,
      });
    }
    
    // Wait for full load and take final screenshot
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);
  });

  test("should render error states consistently", async ({ page }) => {
    // Try to navigate to a non-existent page to trigger error
    await page.goto("/non-existent-page");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);
    
    // Take screenshot of error state
    await expect(page).toHaveScreenshot("error-page.png", {
      fullPage: true,
      threshold: 0.3,
    });
  });
});
