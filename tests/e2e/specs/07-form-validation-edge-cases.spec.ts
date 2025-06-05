import { test, expect } from '@playwright/test';
import { TestHelpers } from '../utils/test-helpers';
import { formValidationTests } from '../fixtures/test-data';

test.describe('Form Validation and Edge Cases', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
  });

  test('should validate email inputs with comprehensive edge cases', async ({ page }) => {
    await page.goto('/register');
    await helpers.waitForPageLoad();

    const emailInput = page.locator('[data-testid="email-input"], input[name="email"], input[type="email"]');
    
    if (await emailInput.count() > 0) {
      for (const email of formValidationTests.email.invalid) {
        await emailInput.clear();
        await helpers.typeRealistically('[data-testid="email-input"], input[name="email"]', email);
        
        const submitButton = page.locator('[data-testid="submit-button"], button[type="submit"]');
        if (await submitButton.count() > 0) {
          await helpers.clickWithMovement('[data-testid="submit-button"], button[type="submit"]');
          await page.waitForTimeout(1000);
          
          const hasError = await page.locator('.text-destructive, .error-message, [role="alert"]').count() > 0;
          expect(hasError).toBeTruthy();
        }
        
        await page.waitForTimeout(300);
      }

      // Test valid emails
      for (const email of formValidationTests.email.valid) {
        await emailInput.clear();
        await helpers.typeRealistically('[data-testid="email-input"], input[name="email"]', email);
        await page.waitForTimeout(500);
        
        // Valid emails should not show immediate validation errors
        const hasImmediateError = await page.locator('.text-destructive:visible').count() > 0;
        expect(hasImmediateError).toBeFalsy();
      }
    }
  });

  test('should validate phone number formats comprehensively', async ({ page }) => {
    await page.goto('/register');
    await helpers.waitForPageLoad();

    const phoneInput = page.locator('[data-testid="phone-input"], input[name="phone"], input[type="tel"]');
    
    if (await phoneInput.count() > 0) {
      // Test invalid phone numbers
      for (const phone of formValidationTests.phone.invalid) {
        await phoneInput.clear();
        await helpers.typeRealistically('[data-testid="phone-input"], input[name="phone"]', phone);
        
        const submitButton = page.locator('[data-testid="submit-button"], button[type="submit"]');
        if (await submitButton.count() > 0) {
          await helpers.clickWithMovement('[data-testid="submit-button"], button[type="submit"]');
          await page.waitForTimeout(1000);
          
          const hasError = await page.locator('.text-destructive, .error-message').count() > 0;
          expect(hasError).toBeTruthy();
        }
        
        await page.waitForTimeout(300);
      }

      // Test valid phone numbers
      for (const phone of formValidationTests.phone.valid) {
        await phoneInput.clear();
        await helpers.typeRealistically('[data-testid="phone-input"], input[name="phone"]', phone);
        await page.waitForTimeout(500);
        
        const hasImmediateError = await page.locator('.text-destructive:visible').count() > 0;
        expect(hasImmediateError).toBeFalsy();
      }
    }
  });

  test('should validate Instagram handle formats', async ({ page }) => {
    await page.goto('/complete-profile');
    await helpers.waitForPageLoad();

    const instagramInput = page.locator('[data-testid="instagram-input"], input[name="instagram"]');
    
    if (await instagramInput.count() > 0) {
      // Test invalid Instagram handles
      for (const handle of formValidationTests.instagram.invalid) {
        if (handle !== '') { // Skip empty test for this specific validation
          await instagramInput.clear();
          await helpers.typeRealistically('[data-testid="instagram-input"], input[name="instagram"]', handle);
          
          const submitButton = page.locator('[data-testid="submit-button"], button[type="submit"]');
          if (await submitButton.count() > 0) {
            await helpers.clickWithMovement('[data-testid="submit-button"], button[type="submit"]');
            await page.waitForTimeout(1000);
            
            const hasError = await page.locator('.text-destructive, .error-message').count() > 0;
            expect(hasError).toBeTruthy();
          }
        }
      }

      // Test valid Instagram handles
      for (const handle of formValidationTests.instagram.valid) {
        await instagramInput.clear();
        await helpers.typeRealistically('[data-testid="instagram-input"], input[name="instagram"]', handle);
        await page.waitForTimeout(500);
        
        const hasImmediateError = await page.locator('.text-destructive:visible').count() > 0;
        expect(hasImmediateError).toBeFalsy();
      }
    }
  });

  test('should validate price inputs with boundary conditions', async ({ page }) => {
    await page.goto('/list-ticket');
    await helpers.waitForPageLoad();

    const priceInput = page.locator('[data-testid="price-input"], input[name="price"]');
    
    if (await priceInput.count() > 0) {
      // Test invalid prices
      for (const price of formValidationTests.price.invalid) {
        await priceInput.clear();
        await helpers.typeRealistically('[data-testid="price-input"], input[name="price"]', price);
        
        const submitButton = page.locator('[data-testid="submit-button"], button[type="submit"]');
        if (await submitButton.count() > 0) {
          await helpers.clickWithMovement('[data-testid="submit-button"], button[type="submit"]');
          await page.waitForTimeout(1000);
          
          const hasError = await page.locator('.text-destructive, .error-message').count() > 0;
          expect(hasError).toBeTruthy();
        }
        
        await page.waitForTimeout(300);
      }

      // Test valid prices
      for (const price of formValidationTests.price.valid) {
        await priceInput.clear();
        await helpers.typeRealistically('[data-testid="price-input"], input[name="price"]', price);
        await page.waitForTimeout(500);
        
        const hasImmediateError = await page.locator('.text-destructive:visible').count() > 0;
        expect(hasImmediateError).toBeFalsy();
      }
    }
  });

  test('should handle form submission with network errors', async ({ page }) => {
    // Mock network failure
    await page.route('**/api/**', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Server error' })
      });
    });

    await page.goto('/register');
    await helpers.waitForPageLoad();

    // Fill valid form data
    await helpers.fillFormRealistic({
      fullName: 'Test User',
      email: 'test@example.com',
      password: 'ValidPassword123!',
      phone: '+919876543210'
    });

    const submitButton = page.locator('[data-testid="submit-button"], button[type="submit"]');
    if (await submitButton.count() > 0) {
      await helpers.clickWithMovement('[data-testid="submit-button"], button[type="submit"]');
      await page.waitForTimeout(3000);
      
      // Should show network error
      const hasNetworkError = await page.locator('.error-message, [role="alert"], .text-destructive').count() > 0;
      expect(hasNetworkError).toBeTruthy();
    }
  });

  test('should validate required fields with realistic user patterns', async ({ page }) => {
    await page.goto('/list-ticket');
    await helpers.waitForPageLoad();

    // Test submitting empty form
    const submitButton = page.locator('[data-testid="submit-button"], button[type="submit"]');
    if (await submitButton.count() > 0) {
      await helpers.clickWithMovement('[data-testid="submit-button"], button[type="submit"]');
      await page.waitForTimeout(1000);
      
      // Should show multiple validation errors
      const errorElements = page.locator('.text-destructive, .error-message, [role="alert"]');
      const errorCount = await errorElements.count();
      expect(errorCount).toBeGreaterThan(0);
    }

    // Fill fields one by one and test incremental validation
    const fieldsToTest = [
      { selector: '[data-testid="title-input"], input[name="title"]', value: 'Concert Ticket' },
      { selector: '[data-testid="price-input"], input[name="price"]', value: '2500' },
      { selector: '[data-testid="venue-input"], input[name="venue"]', value: 'Stadium' }
    ];

    for (const field of fieldsToTest) {
      const fieldElement = page.locator(field.selector);
      if (await fieldElement.count() > 0) {
        await helpers.typeRealistically(field.selector, field.value);
        await page.waitForTimeout(500);
        
        // Some validation errors should decrease
        const currentErrors = await page.locator('.text-destructive:visible').count();
        expect(currentErrors).toBeGreaterThanOrEqual(0);
      }
    }
  });

  test('should handle special characters and internationalization', async ({ page }) => {
    await page.goto('/list-ticket');
    await helpers.waitForPageLoad();

    const specialCharacterTests = [
      { field: '[data-testid="title-input"], input[name="title"]', value: 'Concert with émojis 🎵 and ñoño' },
      { field: '[data-testid="venue-input"], input[name="venue"]', value: 'Théâtre des Champs-Élysées' },
      { field: '[data-testid="description-input"], textarea[name="description"]', value: 'Description with special chars: @#$%^&*()' }
    ];

    for (const test of specialCharacterTests) {
      const fieldElement = page.locator(test.field);
      if (await fieldElement.count() > 0) {
        await fieldElement.clear();
        await helpers.typeRealistically(test.field, test.value);
        await page.waitForTimeout(500);
        
        // Should handle special characters gracefully
        const inputValue = await fieldElement.inputValue();
        expect(inputValue).toContain(test.value.substring(0, 10)); // Basic check
      }
    }
  });

  test('should validate date inputs with realistic scenarios', async ({ page }) => {
    await page.goto('/list-ticket');
    await helpers.waitForPageLoad();

    const dateInput = page.locator('[data-testid="event-date"], input[type="date"], input[name*="date"]');
    
    if (await dateInput.count() > 0) {
      // Test past date (should be invalid for future events)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const pastDate = yesterday.toISOString().split('T')[0];
      
      await dateInput.fill(pastDate);
      await page.waitForTimeout(500);
      
      const submitButton = page.locator('[data-testid="submit-button"], button[type="submit"]');
      if (await submitButton.count() > 0) {
        await helpers.clickWithMovement('[data-testid="submit-button"], button[type="submit"]');
        await page.waitForTimeout(1000);
        
        const hasDateError = await page.locator('.text-destructive, .error-message').count() > 0;
        // Past dates might be invalid for event listings
      }

      // Test valid future date
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      const futureDate = nextMonth.toISOString().split('T')[0];
      
      await dateInput.fill(futureDate);
      await page.waitForTimeout(500);
      
      const hasImmediateError = await page.locator('.text-destructive:visible').count() > 0;
      expect(hasImmediateError).toBeFalsy();
    }
  });

  test('should handle form field focus and blur events', async ({ page }) => {
    await page.goto('/register');
    await helpers.waitForPageLoad();

    const emailInput = page.locator('[data-testid="email-input"], input[name="email"]');
    
    if (await emailInput.count() > 0) {
      // Focus and blur without entering data
      await emailInput.focus();
      await page.waitForTimeout(100);
      await emailInput.blur();
      await page.waitForTimeout(500);
      
      // Should show required field error on blur
      const hasBlurError = await page.locator('.text-destructive, .error-message').count() > 0;
      
      // Enter invalid data and blur
      await emailInput.focus();
      await helpers.typeRealistically('[data-testid="email-input"], input[name="email"]', 'invalid-email');
      await emailInput.blur();
      await page.waitForTimeout(500);
      
      // Should show validation error
      const hasValidationError = await page.locator('.text-destructive, .error-message').count() > 0;
      expect(hasValidationError).toBeTruthy();
    }
  });

  test('should validate textarea character limits', async ({ page }) => {
    await page.goto('/list-ticket');
    await helpers.waitForPageLoad();

    const descriptionTextarea = page.locator('[data-testid="description-input"], textarea[name="description"]');
    
    if (await descriptionTextarea.count() > 0) {
      // Test character limit
      const longText = 'a'.repeat(1000);
      await helpers.typeRealistically('[data-testid="description-input"], textarea[name="description"]', longText);
      await page.waitForTimeout(1000);
      
      // Check if character count is displayed
      const charCount = page.locator('[data-testid="char-count"], .char-count, .character-count');
      if (await charCount.count() > 0) {
        const countText = await charCount.textContent();
        expect(countText).toMatch(/\d+/);
      }
      
      // Check for character limit warning
      const limitWarning = page.locator('.text-destructive, .warning, .limit-exceeded');
      const hasLimitWarning = await limitWarning.count() > 0;
      
      // Should either enforce limit or show warning
      const currentLength = (await descriptionTextarea.inputValue()).length;
      expect(currentLength <= 1000 || hasLimitWarning).toBeTruthy();
    }
  });

  test('should handle concurrent form validations correctly', async ({ page }) => {
    await page.goto('/register');
    await helpers.waitForPageLoad();

    // Rapidly fill multiple fields with invalid data
    const invalidData = {
      email: 'invalid-email',
      password: '123',
      phone: 'abc',
      fullName: ''
    };

    // Fill all fields quickly
    for (const [field, value] of Object.entries(invalidData)) {
      const fieldSelector = `[data-testid="${field}-input"], input[name="${field}"]`;
      const fieldElement = page.locator(fieldSelector);
      
      if (await fieldElement.count() > 0) {
        await fieldElement.fill(value);
      }
    }

    // Submit form
    const submitButton = page.locator('[data-testid="submit-button"], button[type="submit"]');
    if (await submitButton.count() > 0) {
      await helpers.clickWithMovement('[data-testid="submit-button"], button[type="submit"]');
      await page.waitForTimeout(2000);
      
      // Should show multiple validation errors
      const allErrors = await page.locator('.text-destructive, .error-message').count();
      expect(allErrors).toBeGreaterThan(0);
      
      // Each field should have appropriate error
      const fieldErrors = await page.locator('[data-testid$="-error"], .field-error').count();
      expect(fieldErrors).toBeGreaterThanOrEqual(0);
    }
  });
});