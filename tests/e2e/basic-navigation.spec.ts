import { test, expect } from "@playwright/test";

/**
 * Basic Navigation Tests
 * Tests core navigation functionality and page loading
 */
test.describe("Basic Navigation", () => {
  test("should navigate to main pages", async ({ page }) => {
    // Test home page
    await page.goto("/");
    await expect(page).toHaveTitle(/Ticket Bazaar/);
    await expect(page.locator("h1")).toContainText("Ticket Bazaar");

    // Test map page
    await page.click('[data-testid="nav-map"]');
    await expect(page.url()).toContain("/map");
    await expect(page.locator("h1")).toContainText("Event Map");

    // Test list ticket page
    await page.click('[data-testid="nav-list-ticket"]');
    await expect(page.url()).toContain("/list-ticket");
    await expect(page.locator("h1")).toContainText("List Your Ticket");
  });

  test("should display event cards on home page", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    
    // Check if event grid is visible
    const eventGrid = page.locator('[data-testid="event-grid"]');
    await expect(eventGrid).toBeVisible();

    // Check if at least one event card exists
    const eventCards = page.locator('[data-testid="event-card"]');
    await expect(eventCards.first()).toBeVisible();
  });

  test("should open event modal when clicking event card", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Click first event card
    const firstEventCard = page.locator('[data-testid="event-card"]').first();
    await firstEventCard.click();

    // Check if modal opens
    const modal = page.locator('[data-testid="event-modal"]');
    await expect(modal).toBeVisible();

    // Close modal
    const closeButton = page.locator('[data-testid="close-modal"]');
    await closeButton.click();
    await expect(modal).not.toBeVisible();
  });
});
