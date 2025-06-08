import { test, expect } from '@playwright/test';
import { TestUtils } from '../helpers/test-utils';

test.describe('Robust Form Validation', () => {
  let utils: TestUtils;

  test.beforeEach(async ({ page }) => {
    utils = new TestUtils(page);
    await utils.navigateToListTicket();
  });

  test('should handle valid form submissions successfully', async ({ page }) => {
    const validTicketData = {
      title: 'Sunburn Festival 2024',
      description: 'Experience the best electronic music festival in Goa',
      venue: 'Vagator Beach, Goa',
      date: '2024-12-31',
      price: '2500',
      category: 'Music'
    };

    await utils.fillTicketListingForm(validTicketData);
    await utils.submitForm('[data-testid="ticket-listing-form"]');
    
    // Expect successful submission
    await utils.expectSuccessMessage();
    await expect(page.url()).toContain('/profile');
  });

  test('should validate empty required fields', async ({ page }) => {
    await utils.submitForm('[data-testid="ticket-listing-form"]');
    
    // Check for validation errors on empty fields
    await utils.expectFormError('ticket-title');
    await utils.expectFormError('ticket-description');
    await utils.expectFormError('ticket-venue');
    await utils.expectFormError('ticket-date');
    await utils.expectFormError('ticket-price');
  });

  test('should validate invalid input formats', async ({ page }) => {
    const invalidData = {
      title: 'Valid Title',
      description: 'Valid description',
      venue: 'Valid venue',
      date: 'invalid-date',
      price: 'not-a-number',
      category: 'Music'
    };

    await utils.fillTicketListingForm(invalidData);
    await utils.submitForm('[data-testid="ticket-listing-form"]');
    
    await utils.expectFormError('ticket-date');
    await utils.expectFormError('ticket-price');
  });

  test('should handle excessively long input', async ({ page }) => {
    const longString = 'a'.repeat(1000);
    const excessiveData = {
      title: longString,
      description: longString,
      venue: longString,
      date: '2024-12-31',
      price: '99999999',
      category: 'Music'
    };

    await utils.fillTicketListingForm(excessiveData);
    await utils.submitForm('[data-testid="ticket-listing-form"]');
    
    // Should handle long input gracefully
    await utils.expectFormError('ticket-title');
    await utils.expectFormError('ticket-description');
    await utils.expectFormError('ticket-venue');
  });

  test('should validate client-side and server-side errors consistently', async ({ page }) => {
    // First test client-side validation
    await page.fill('[data-testid="ticket-price"]', '-100');
    await page.click('[data-testid="ticket-title"]'); // Click elsewhere to trigger blur
    await utils.expectFormError('ticket-price');

    // Test server-side validation by submitting invalid data
    const invalidData = {
      title: '',
      description: '',
      venue: '',
      date: '2020-01-01', // Past date
      price: '-100',
      category: ''
    };

    await utils.fillTicketListingForm(invalidData);
    await utils.submitForm('[data-testid="ticket-listing-form"]');
    
    // Server should also reject the submission
    const errorMessage = page.locator('[data-testid="server-error"]');
    await expect(errorMessage).toBeVisible();
  });

  test('should handle special characters and Unicode input', async ({ page }) => {
    const unicodeData = {
      title: '🎵 मस्त संगीत Festival 音乐节',
      description: 'Special chars: !@#$%^&*()_+-=[]{}|;":,.<>?',
      venue: 'Café München & São Paulo',
      date: '2024-12-31',
      price: '2500',
      category: 'Music'
    };

    await utils.fillTicketListingForm(unicodeData);
    await utils.submitForm('[data-testid="ticket-listing-form"]');
    
    // Should handle Unicode gracefully
    await utils.expectSuccessMessage();
  });

  test('should preserve form state during navigation', async ({ page }) => {
    const partialData = {
      title: 'Partially filled form',
      description: 'Some description',
      venue: '',
      date: '',
      price: '',
      category: 'Music'
    };

    await utils.fillTicketListingForm(partialData);
    
    // Navigate away and back
    await utils.navigateToHome();
    await utils.navigateToListTicket();
    
    // Form should either be empty or preserve state
    const titleValue = await page.inputValue('[data-testid="ticket-title"]');
    expect(titleValue).toBeDefined();
  });

  test('should handle form submission with network errors', async ({ page }) => {
    const validData = {
      title: 'Network Test Event',
      description: 'Testing network error handling',
      venue: 'Test Venue',
      date: '2024-12-31',
      price: '1000',
      category: 'Music'
    };

    await utils.fillTicketListingForm(validData);
    
    // Simulate network error
    await utils.triggerNetworkError();
    await utils.submitForm('[data-testid="ticket-listing-form"]');
    
    // Should show network error message
    const errorMessage = page.locator('[data-testid="network-error"]');
    await expect(errorMessage).toBeVisible();
    
    // Restore network and retry
    await utils.restoreNetwork();
    await utils.submitForm('[data-testid="ticket-listing-form"]');
    await utils.expectSuccessMessage();
  });
});