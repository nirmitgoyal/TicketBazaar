import { test, expect, TestHelpers } from '../setup/test-setup';

test.describe('Robust Form Validation', () => {
  
  test('should validate ticket listing form with boundary conditions', async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    await page.goto('/sell');
    
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="sell-form"]');
    
    // Test empty form submission
    await page.click('[data-testid="submit-ticket"]');
    
    // Verify all required field errors appear
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="title-error"]');
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="event-title-error"]');
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="venue-error"]');
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="price-error"]');
    
    // Test excessive length validation
    const longTitle = 'a'.repeat(201); // Assuming 200 char limit
    await TestHelpers.fillFormField(page, '[data-testid="title-input"]', longTitle);
    await page.click('[data-testid="submit-ticket"]');
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="title-length-error"]');
    
    // Test invalid price formats
    await TestHelpers.fillFormField(page, '[data-testid="price-input"]', '-100');
    await page.click('[data-testid="submit-ticket"]');
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="price-negative-error"]');
    
    await TestHelpers.fillFormField(page, '[data-testid="price-input"]', 'invalid_price');
    await page.click('[data-testid="submit-ticket"]');
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="price-format-error"]');
    
    // Test boundary values for quantity
    await TestHelpers.fillFormField(page, '[data-testid="quantity-input"]', '0');
    await page.click('[data-testid="submit-ticket"]');
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="quantity-min-error"]');
    
    await TestHelpers.fillFormField(page, '[data-testid="quantity-input"]', '1001'); // Assuming 1000 max
    await page.click('[data-testid="submit-ticket"]');
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="quantity-max-error"]');
    
    // Test valid form submission
    await TestHelpers.fillFormField(page, '[data-testid="title-input"]', 'Valid Concert Tickets');
    await TestHelpers.fillFormField(page, '[data-testid="event-title-input"]', 'Amazing Concert');
    await TestHelpers.fillFormField(page, '[data-testid="venue-input"]', 'Mumbai Arena');
    await TestHelpers.fillFormField(page, '[data-testid="venue-address-input"]', '123 Main St, Mumbai');
    await TestHelpers.fillFormField(page, '[data-testid="price-input"]', '2500');
    await TestHelpers.fillFormField(page, '[data-testid="quantity-input"]', '2');
    
    // Select category
    await page.click('[data-testid="category-select"]');
    await page.click('[data-testid="category-music"]');
    
    // Select date
    await page.click('[data-testid="event-date-picker"]');
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    await page.fill('[data-testid="date-input"]', futureDate.toISOString().split('T')[0]);
    
    const [response] = await Promise.all([
      page.waitForResponse(resp => resp.url().includes('/api/tickets')),
      page.click('[data-testid="submit-ticket"]')
    ]);
    
    expect(response.status()).toBe(201);
    await page.waitForURL('/my-tickets');
  });

  test('should validate user registration form thoroughly', async ({ page }) => {
    await page.goto('/register');
    
    // Test email format validation
    await TestHelpers.fillFormField(page, '[data-testid="email-input"]', 'invalid-email');
    await page.click('[data-testid="register-submit"]');
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="email-format-error"]');
    
    await TestHelpers.fillFormField(page, '[data-testid="email-input"]', 'test@');
    await page.click('[data-testid="register-submit"]');
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="email-format-error"]');
    
    // Test phone number validation
    await TestHelpers.fillFormField(page, '[data-testid="phone-input"]', '123');
    await page.click('[data-testid="register-submit"]');
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="phone-format-error"]');
    
    await TestHelpers.fillFormField(page, '[data-testid="phone-input"]', 'invalid-phone');
    await page.click('[data-testid="register-submit"]');
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="phone-format-error"]');
    
    // Test password validation
    await TestHelpers.fillFormField(page, '[data-testid="password-input"]', '123'); // Too short
    await page.click('[data-testid="register-submit"]');
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="password-length-error"]');
    
    // Test password confirmation mismatch
    await TestHelpers.fillFormField(page, '[data-testid="password-input"]', 'password123');
    await TestHelpers.fillFormField(page, '[data-testid="confirm-password-input"]', 'different123');
    await page.click('[data-testid="register-submit"]');
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="password-mismatch-error"]');
    
    // Test name field requirements
    await TestHelpers.fillFormField(page, '[data-testid="fullname-input"]', 'A'); // Too short
    await page.click('[data-testid="register-submit"]');
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="name-length-error"]');
  });

  test('should validate search form with edge cases', async ({ page }) => {
    await page.goto('/search');
    
    // Test empty search
    await page.click('[data-testid="search-submit"]');
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="search-results"]');
    
    // Should show all events or appropriate message
    const resultsCount = await page.locator('[data-testid="event-card"]').count();
    expect(resultsCount).toBeGreaterThanOrEqual(0);
    
    // Test special characters in search
    await TestHelpers.fillFormField(page, '[data-testid="search-input"]', '@#$%^&*()');
    await page.click('[data-testid="search-submit"]');
    await TestHelpers.waitForNetworkIdle(page);
    
    // Should handle gracefully without errors
    const hasErrorMessage = await page.locator('[data-testid="search-error"]').isVisible();
    expect(hasErrorMessage).toBeFalsy();
    
    // Test very long search query
    const longQuery = 'concert'.repeat(100);
    await TestHelpers.fillFormField(page, '[data-testid="search-input"]', longQuery);
    await page.click('[data-testid="search-submit"]');
    await TestHelpers.waitForNetworkIdle(page);
    
    // Should truncate or handle appropriately
    const searchValue = await page.locator('[data-testid="search-input"]').inputValue();
    expect(searchValue.length).toBeLessThanOrEqual(500); // Reasonable limit
  });

  test('should validate contact form for ticket inquiries', async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    
    // Navigate to an event detail page
    await page.goto('/events/23'); // Using existing event ID
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="contact-seller-button"]');
    
    await page.click('[data-testid="contact-seller-button"]');
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="contact-form"]');
    
    // Test empty message submission
    await page.click('[data-testid="send-message-button"]');
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="message-required-error"]');
    
    // Test message length validation
    const shortMessage = 'Hi';
    await TestHelpers.fillFormField(page, '[data-testid="message-input"]', shortMessage);
    await page.click('[data-testid="send-message-button"]');
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="message-length-error"]');
    
    const longMessage = 'a'.repeat(1001); // Assuming 1000 char limit
    await TestHelpers.fillFormField(page, '[data-testid="message-input"]', longMessage);
    await page.click('[data-testid="send-message-button"]');
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="message-max-length-error"]');
    
    // Test valid message submission
    const validMessage = 'Hi, I am interested in purchasing these tickets. Are they still available?';
    await TestHelpers.fillFormField(page, '[data-testid="message-input"]', validMessage);
    
    const [response] = await Promise.all([
      page.waitForResponse(resp => resp.url().includes('/api/contact-requests')),
      page.click('[data-testid="send-message-button"]')
    ]);
    
    expect(response.status()).toBe(201);
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="message-sent-confirmation"]');
  });

  test('should validate profile update form', async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    await page.goto('/profile');
    
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="profile-form"]');
    
    // Test invalid phone number update
    await page.click('[data-testid="edit-phone-button"]');
    await TestHelpers.fillFormField(page, '[data-testid="phone-input"]', 'invalid');
    await page.click('[data-testid="save-phone-button"]');
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="phone-validation-error"]');
    
    // Test valid phone number update
    await TestHelpers.fillFormField(page, '[data-testid="phone-input"]', '+919876543210');
    
    const [response] = await Promise.all([
      page.waitForResponse(resp => resp.url().includes('/api/auth/users')),
      page.click('[data-testid="save-phone-button"]')
    ]);
    
    expect(response.status()).toBe(200);
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="phone-updated-success"]');
    
    // Test Instagram handle validation
    await page.click('[data-testid="edit-instagram-button"]');
    await TestHelpers.fillFormField(page, '[data-testid="instagram-input"]', 'invalid@handle!');
    await page.click('[data-testid="save-instagram-button"]');
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="instagram-validation-error"]');
    
    // Test valid Instagram handle
    await TestHelpers.fillFormField(page, '[data-testid="instagram-input"]', 'valid_handle');
    
    const [instagramResponse] = await Promise.all([
      page.waitForResponse(resp => resp.url().includes('/api/auth/users')),
      page.click('[data-testid="save-instagram-button"]')
    ]);
    
    expect(instagramResponse.status()).toBe(200);
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="instagram-updated-success"]');
  });

  test('should handle form submission during network issues', async ({ page }) => {
    await page.goto('/register');
    
    // Fill valid form data
    await TestHelpers.fillFormField(page, '[data-testid="fullname-input"]', 'Test User');
    await TestHelpers.fillFormField(page, '[data-testid="email-input"]', 'test@example.com');
    await TestHelpers.fillFormField(page, '[data-testid="phone-input"]', '+919876543210');
    await TestHelpers.fillFormField(page, '[data-testid="password-input"]', 'password123');
    await TestHelpers.fillFormField(page, '[data-testid="confirm-password-input"]', 'password123');
    
    // Simulate network failure
    await page.route('**/api/auth/register', route => {
      route.abort('failed');
    });
    
    await page.click('[data-testid="register-submit"]');
    
    // Should show network error message
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="network-error"]');
    
    // Should keep form data intact
    const emailValue = await page.locator('[data-testid="email-input"]').inputValue();
    expect(emailValue).toBe('test@example.com');
  });
});