import { test, expect } from "@playwright/test";

/**
 * Basic User Flow Tests
 * Tests essential user journeys and interactions
 */
test.describe("Basic User Flows", () => {
  test("should complete basic ticket browsing flow", async ({ page }) => {
    // Start on home page
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Browse events
    const eventCards = page.locator('[data-testid="event-card"]');
    await expect(eventCards.first()).toBeVisible();

    // View event details
    await eventCards.first().click();
    const modal = page.locator('[data-testid="event-modal"]');
    await expect(modal).toBeVisible();

    // Close modal and navigate to map
    await page.locator('[data-testid="close-modal"]').click();
    await page.click('[data-testid="nav-map"]');
    await expect(page.url()).toContain("/map");
  });

  test("should handle basic authentication flow", async ({ page }) => {
    await page.goto("/");
    
    // Look for login/auth elements
    const authButton = page.locator('[data-testid="auth-button"], [data-testid="login-button"]');
    
    if (await authButton.isVisible()) {
      await authButton.click();
      
      // Check if auth modal or redirect occurs
      await page.waitForTimeout(1000);
      
      // Verify some auth-related UI appears
      const authModal = page.locator('[data-testid="auth-modal"], [data-testid="login-modal"]');
      const isAuthPage = page.url().includes("auth") || page.url().includes("login");
      
      expect(await authModal.isVisible() || isAuthPage).toBeTruthy();
    }
  });

  test("should navigate through ticket listing flow", async ({ page }) => {
    await page.goto("/list-ticket");
    await page.waitForLoadState("networkidle");

    // Check form is present
    const form = page.locator('[data-testid="ticket-listing-form"], form');
    await expect(form).toBeVisible();

    // Fill basic required fields
    const titleField = page.locator('[data-testid="ticket-title"], input[name="title"]');
    if (await titleField.isVisible()) {
      await titleField.fill("Test Concert Ticket");
    }

    const priceField = page.locator('[data-testid="ticket-price"], input[name="price"]');
    if (await priceField.isVisible()) {
      await priceField.fill("75");
    }

    // Navigate back to home
    await page.click('[data-testid="nav-home"], a[href="/"]');
    await expect(page.url()).toBe(new URL("/", page.url()).href);
  });

  test("should handle error states gracefully", async ({ page }) => {
    // Test 404 page
    await page.goto("/non-existent-page");
    
    // Should either redirect to home or show 404 page
    await page.waitForLoadState("networkidle");
    
    const is404 = page.url().includes("404") || 
                  await page.locator("text=/not found/i").isVisible() ||
                  await page.locator("text=/404/i").isVisible();
    
    const isRedirectedHome = page.url().endsWith("/");
    
    expect(is404 || isRedirectedHome).toBeTruthy();
  });
});
