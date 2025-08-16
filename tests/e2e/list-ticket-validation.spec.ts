import { test, expect } from '@playwright/test';

test.describe('List Ticket Form Validation', () => {
  test.beforeEach(async ({ page }) => {
    // First, create a test user session by directly calling the auth API
    const sessionResponse = await page.request.post('/api/auth/test-login', {
      data: {
        email: 'test@example.com',
        name: 'Test User'
      }
    });
    
    if (sessionResponse.ok()) {
      // Navigate to the list ticket page after authentication
      await page.goto('/list-ticket');
      // Wait for the page to fully load
      await page.waitForLoadState('networkidle');
    } else {
      throw new Error('Failed to create test user session');
    }
  });

  test('should show error for empty required fields', async ({ page }) => {
    // Try to submit without filling any fields
    await page.click('[data-testid="submit-button"]');
    
    // Check for validation errors
    await expect(page.locator('[role="alert"]')).toBeVisible();
    await expect(page.locator('text=Event title is required')).toBeVisible();
    await expect(page.locator('text=Venue location is required')).toBeVisible();
    await expect(page.locator('text=Event date is required')).toBeVisible();
    await expect(page.locator('text=Event time is required')).toBeVisible();
    await expect(page.locator('text=Event category is required')).toBeVisible();
  });

  test('should show error for whitespace-only inputs', async ({ page }) => {
    // Fill with whitespace-only inputs
    await page.fill('input[name="title"]', '   ');
    await page.fill('input[name="venue"]', '   ');
    
    // Try to submit
    await page.click('[data-testid="submit-button"]');
    
    // Check for whitespace validation errors
    await expect(page.locator('text=Event title cannot be only whitespace')).toBeVisible();
    await expect(page.locator('text=Venue location cannot be only whitespace')).toBeVisible();
  });

  test('should show error for past event date', async ({ page }) => {
    // Fill with a past date
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const pastDate = yesterday.toISOString().split('T')[0];
    
    await page.fill('input[name="eventDate"]', pastDate);
    await page.blur('input[name="eventDate"]');
    
    // Check for date validation error
    await expect(page.locator('text=Event date must be today or in the future')).toBeVisible();
  });

  test('should show error for too long title', async ({ page }) => {
    // Fill with a title longer than 100 characters
    const longTitle = 'A'.repeat(101);
    await page.fill('input[name="title"]', longTitle);
    await page.blur('input[name="title"]');
    
    // Check for length validation error
    await expect(page.locator('text=Event title must be 100 characters or less')).toBeVisible();
  });

  test('should show error for too short title', async ({ page }) => {
    // Fill with a title shorter than 3 characters
    await page.fill('input[name="title"]', 'AB');
    await page.blur('input[name="title"]');
    
    // Check for minimum length validation error
    await expect(page.locator('text=Event title must be at least 3 characters')).toBeVisible();
  });

  test('should show error for invalid special characters in title', async ({ page }) => {
    // Fill with invalid characters
    await page.fill('input[name="title"]', 'Test Event <script>');
    await page.blur('input[name="title"]');
    
    // Try to submit
    await page.click('[data-testid="submit-button"]');
    
    // Check for special character validation error
    await expect(page.locator('text=Event title contains invalid characters')).toBeVisible();
  });

  test('should show error for invalid time format', async ({ page }) => {
    // Fill with invalid time
    await page.fill('input[name="eventTime"]', '25:99');
    await page.blur('input[name="eventTime"]');
    
    // Check for time validation error
    await expect(page.locator('text=Event time must be in valid format')).toBeVisible();
  });

  test('should show error for quantity exceeding maximum', async ({ page }) => {
    // Fill quantity with a value exceeding maximum
    await page.fill('input[name="quantity"]', '25');
    await page.blur('input[name="quantity"]');
    
    // Check for quantity validation error
    await expect(page.locator('text=Quantity cannot exceed 20 tickets')).toBeVisible();
  });

  test('should show error for short additional info', async ({ page }) => {
    // Fill additional info with text less than 10 characters
    await page.fill('[data-testid="ticket-description"]', 'Too short');
    await page.blur('[data-testid="ticket-description"]');
    
    // Check for additional info validation error
    await expect(page.locator('text=Additional information must be at least 10 characters if provided')).toBeVisible();
  });

  test('should show error for too long additional info', async ({ page }) => {
    // Fill additional info with text longer than 1000 characters
    const longText = 'A'.repeat(1001);
    await page.fill('[data-testid="ticket-description"]', longText);
    await page.blur('[data-testid="ticket-description"]');
    
    // Check for length validation error
    await expect(page.locator('text=Additional information must be 1000 characters or less')).toBeVisible();
  });

  test('should disable submit button when errors are present', async ({ page }) => {
    // Fill with invalid data
    await page.fill('input[name="title"]', 'AB'); // Too short
    await page.blur('input[name="title"]');
    
    // Check that submit button is disabled
    await expect(page.locator('[data-testid="submit-button"]')).toBeDisabled();
  });

  test('should show accessibility error summary', async ({ page }) => {
    // Try to submit with empty fields
    await page.click('[data-testid="submit-button"]');
    
    // Check for error summary with proper ARIA
    const errorSummary = page.locator('[role="alert"]');
    await expect(errorSummary).toBeVisible();
    await expect(errorSummary.locator('#error-summary-title')).toHaveText('Please correct the following errors:');
    
    // Check that errors are listed
    await expect(errorSummary.locator('li')).toHaveCount.greaterThan(0);
  });

  test('should announce errors to screen readers', async ({ page }) => {
    // Try to submit with invalid data
    await page.fill('input[name="title"]', 'AB'); // Too short
    await page.click('[data-testid="submit-button"]');
    
    // Check for ARIA live region
    const liveRegion = page.locator('#form-errors-live-region');
    await expect(liveRegion).toBeVisible();
    await expect(liveRegion).toHaveAttribute('aria-live', 'polite');
    await expect(liveRegion).toHaveAttribute('aria-atomic', 'true');
  });

  test('should clear errors when valid data is entered', async ({ page }) => {
    // First, create an error
    await page.fill('input[name="title"]', 'AB'); // Too short
    await page.blur('input[name="title"]');
    await expect(page.locator('text=Event title must be at least 3 characters')).toBeVisible();
    
    // Then, fix the error
    await page.fill('input[name="title"]', 'Valid Event Title');
    await page.blur('input[name="title"]');
    
    // Error should be cleared
    await expect(page.locator('text=Event title must be at least 3 characters')).not.toBeVisible();
  });

  test('should validate all fields before submission', async ({ page }) => {
    // Fill all fields with valid data
    await page.fill('input[name="title"]', 'Test Concert Event');
    await page.fill('input[name="venue"]', 'Test Venue Location');
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const futureDate = tomorrow.toISOString().split('T')[0];
    await page.fill('input[name="eventDate"]', futureDate);
    await page.fill('input[name="eventTime"]', '19:30');
    
    // Select category
    await page.click('[data-testid="submit-button"]');
    
    // Should show category requirement
    await expect(page.locator('text=Event category is required')).toBeVisible();
  });
});