import { test, expect } from "@playwright/test";

/**
 * Basic Form Tests
 * Tests essential form functionality and validation
 */
test.describe("Basic Forms", () => {
  test("should validate ticket listing form", async ({ page }) => {
    await page.goto("/list-ticket");
    await page.waitForLoadState("networkidle");

    // Try to submit empty form
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // Check for validation errors
    const errorMessages = page.locator('[data-testid="error-message"]');
    await expect(errorMessages.first()).toBeVisible();
  });

  test("should fill out basic ticket form", async ({ page }) => {
    await page.goto("/list-ticket");
    await page.waitForLoadState("networkidle");

    // Fill form fields
    await page.fill('[data-testid="ticket-title"]', "Test Event Ticket");
    await page.fill('[data-testid="ticket-price"]', "50");
    await page.fill('[data-testid="ticket-description"]', "Test description for event ticket");

    // Select event type if dropdown exists
    const eventTypeSelect = page.locator('[data-testid="event-type"]');
    if (await eventTypeSelect.isVisible()) {
      await eventTypeSelect.click();
      await page.locator('[data-testid="event-type-option"]').first().click();
    }

    // Check if form is fillable (no actual submission to avoid database changes)
    const titleField = page.locator('[data-testid="ticket-title"]');
    await expect(titleField).toHaveValue("Test Event Ticket");
  });

  test("should handle contact form", async ({ page }) => {
    await page.goto("/");
    
    // Look for contact or feedback form
    const contactForm = page.locator('[data-testid="contact-form"]');
    if (await contactForm.isVisible()) {
      await page.fill('[data-testid="contact-email"]', "test@example.com");
      await page.fill('[data-testid="contact-message"]', "Test message");
      
      // Verify form fields are filled
      const emailField = page.locator('[data-testid="contact-email"]');
      await expect(emailField).toHaveValue("test@example.com");
    }
  });
});
