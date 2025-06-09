import { test, expect } from "@playwright/test";

/**
 * Basic Smoke Tests
 * Simple tests to verify core functionality is working
 */
test.describe("Basic Smoke Tests", () => {
  test("should load home page successfully", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    
    // Check if the page loads and has basic structure
    await expect(page).toHaveTitle(/Ticket Bazaar/);
    
    // Check if navigation is present
    const navigation = page.locator('[data-testid="navigation"]');
    await expect(navigation).toBeVisible();
  });


});
