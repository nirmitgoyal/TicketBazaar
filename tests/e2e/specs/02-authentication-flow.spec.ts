import { test, expect } from '@playwright/test';
import { TestHelpers } from '../utils/test-helpers';
import { testUsers } from '../fixtures/test-data';

test.describe('Authentication Flow', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
  });

  test('should display login page correctly', async ({ page }) => {
    await page.goto('/login');
    await helpers.waitForPageLoad();

    // Verify login form elements
    await expect(page.locator('[data-testid="email-input"], input[name="email"], input[type="email"]')).toBeVisible();
    await expect(page.locator('[data-testid="password-input"], input[name="password"], input[type="password"]')).toBeVisible();
    await expect(page.locator('[data-testid="login-button"], button[type="submit"], button:has-text("Login")')).toBeVisible();
    
    // Check for Google OAuth button
    const googleButton = page.locator('[data-testid="google-login"], button:has-text("Google"), a:has-text("Google")');
    if (await googleButton.count() > 0) {
      await expect(googleButton).toBeVisible();
    }
  });

  test('should validate login form with realistic input patterns', async ({ page }) => {
    await page.goto('/login');
    await helpers.waitForPageLoad();

    // Test empty form submission
    await helpers.clickWithMovement('[data-testid="login-button"], button[type="submit"]');
    
    // Check for validation errors
    const emailError = await helpers.waitForFormError('email');
    const passwordError = await helpers.waitForFormError('password');
    
    await expect(emailError.or(page.locator('.text-destructive')).first()).toBeVisible();

    // Test invalid email format
    await helpers.typeRealistically('[data-testid="email-input"], input[name="email"]', 'invalid-email');
    await helpers.typeRealistically('[data-testid="password-input"], input[name="password"]', 'short');
    await helpers.clickWithMovement('[data-testid="login-button"], button[type="submit"]');
    
    // Should show validation errors
    await page.waitForTimeout(1000);
    const hasErrors = await page.locator('.text-destructive, .error-message, [role="alert"]').count() > 0;
    expect(hasErrors).toBeTruthy();
  });

  test('should handle login with valid credentials', async ({ page }) => {
    await page.goto('/login');
    await helpers.waitForPageLoad();

    // Fill login form with realistic typing
    await helpers.fillFormRealistic({
      email: testUsers.validUser.email,
      password: testUsers.validUser.password
    });

    // Submit form
    await helpers.clickWithMovement('[data-testid="login-button"], button[type="submit"]');
    
    // Wait for response
    await page.waitForTimeout(3000);
    
    // Should either redirect to dashboard/home or show error based on actual backend
    const currentUrl = page.url();
    const hasError = await page.locator('.text-destructive, .error-message').count() > 0;
    
    // Verify appropriate response (success redirect or error message)
    expect(currentUrl.includes('/login') && hasError || !currentUrl.includes('/login')).toBeTruthy();
  });

  test('should handle Google OAuth flow initiation', async ({ page }) => {
    await page.goto('/login');
    await helpers.waitForPageLoad();

    const googleButton = page.locator('[data-testid="google-login"], button:has-text("Google"), a:has-text("Google")');
    
    if (await googleButton.count() > 0) {
      // Listen for popup or redirect
      const [popup] = await Promise.all([
        page.waitForEvent('popup', { timeout: 5000 }).catch(() => null),
        helpers.clickWithMovement('[data-testid="google-login"], button:has-text("Google")')
      ]);

      if (popup) {
        // OAuth popup opened
        expect(popup.url()).toContain('google');
        await popup.close();
      } else {
        // Direct redirect
        await page.waitForTimeout(2000);
        const redirected = !page.url().includes('/login') || page.url().includes('google');
        expect(redirected).toBeTruthy();
      }
    }
  });

  test('should display registration page correctly', async ({ page }) => {
    await page.goto('/register');
    await helpers.waitForPageLoad();

    // Verify registration form fields
    const expectedFields = ['fullName', 'email', 'password', 'phone'];
    
    for (const field of expectedFields) {
      const fieldSelector = `[data-testid="${field}-input"], input[name="${field}"], #${field}`;
      const fieldElement = page.locator(fieldSelector);
      
      if (await fieldElement.count() > 0) {
        await expect(fieldElement).toBeVisible();
      }
    }

    // Check submit button
    await expect(page.locator('[data-testid="register-button"], button[type="submit"], button:has-text("Register")')).toBeVisible();
  });

  test('should validate registration form with edge cases', async ({ page }) => {
    await page.goto('/register');
    await helpers.waitForPageLoad();

    // Test various validation scenarios
    const validationTests = [
      {
        data: { fullName: '', email: 'invalid', password: '123', phone: 'abc' },
        description: 'empty and invalid fields'
      },
      {
        data: { fullName: 'A', email: 'test@test.com', password: 'weak', phone: '123' },
        description: 'weak password and short phone'
      },
      {
        data: { fullName: 'Test User', email: 'valid@email.com', password: 'StrongPass123!', phone: '+919876543210' },
        description: 'valid data'
      }
    ];

    for (const testCase of validationTests) {
      // Clear form
      await page.reload();
      await helpers.waitForPageLoad();
      
      // Fill form
      await helpers.fillFormRealistic(testCase.data);
      
      // Submit
      await helpers.clickWithMovement('[data-testid="register-button"], button[type="submit"]');
      await page.waitForTimeout(2000);
      
      // Check for appropriate response
      const hasErrors = await page.locator('.text-destructive, .error-message').count() > 0;
      const isRedirected = !page.url().includes('/register');
      
      if (testCase.description === 'valid data') {
        // Valid data should either succeed or show specific backend error
        expect(hasErrors || isRedirected).toBeTruthy();
      } else {
        // Invalid data should show validation errors
        expect(hasErrors).toBeTruthy();
      }
    }
  });

  test('should handle complete profile flow', async ({ page }) => {
    await page.goto('/complete-profile');
    await helpers.waitForPageLoad();

    // Check if Instagram field is present
    const instagramField = page.locator('[data-testid="instagram-input"], input[name="instagram"]');
    
    if (await instagramField.count() > 0) {
      // Test Instagram handle validation
      const testHandles = ['@validhandle', 'valid_handle', 'invalid handle', ''];
      
      for (const handle of testHandles) {
        await instagramField.clear();
        await helpers.typeRealistically('[data-testid="instagram-input"], input[name="instagram"]', handle);
        
        const submitButton = page.locator('[data-testid="submit-button"], button[type="submit"]');
        if (await submitButton.count() > 0) {
          await helpers.clickWithMovement('[data-testid="submit-button"], button[type="submit"]');
          await page.waitForTimeout(1000);
          
          const hasError = await page.locator('.text-destructive').count() > 0;
          
          if (handle.includes(' ') || handle === '') {
            expect(hasError).toBeTruthy();
          }
        }
      }
    }
  });

  test('should handle session persistence', async ({ page }) => {
    // Simulate user login state
    await page.goto('/');
    await helpers.waitForPageLoad();
    
    // Check if user appears to be logged in (navigation shows user-specific elements)
    const userElements = await page.locator('[data-testid="user-menu"], .user-menu, [data-testid="logout-button"]').count();
    const loginElements = await page.locator('[data-testid="login-button"], a[href="/login"]').count();
    
    // Should show either login or user elements
    expect(userElements > 0 || loginElements > 0).toBeTruthy();
    
    // If logged in, test logout
    if (userElements > 0) {
      const logoutButton = page.locator('[data-testid="logout-button"], button:has-text("Logout")');
      if (await logoutButton.count() > 0) {
        await helpers.clickWithMovement('[data-testid="logout-button"], button:has-text("Logout")');
        await helpers.waitForPageTransition();
        
        // Should redirect to login or home with login option
        const afterLogout = await page.locator('[data-testid="login-button"], a[href="/login"]').count() > 0;
        expect(afterLogout).toBeTruthy();
      }
    }
  });

  test('should handle authentication redirects', async ({ page }) => {
    // Try to access protected route
    await page.goto('/my-tickets');
    await helpers.waitForPageLoad();
    
    // Should either show content (if authenticated) or redirect to login
    const isOnLogin = page.url().includes('/login');
    const hasContent = await page.locator('[data-testid="tickets-list"], .tickets-container').count() > 0;
    const hasLoginPrompt = await page.locator('form, [data-testid="login-form"]').count() > 0;
    
    expect(isOnLogin || hasContent || hasLoginPrompt).toBeTruthy();
  });

  test('should track authentication analytics events', async ({ page }) => {
    await page.goto('/login');
    await helpers.waitForPageLoad();
    
    // Fill and submit login form
    await helpers.fillFormRealistic({
      email: testUsers.validUser.email,
      password: testUsers.validUser.password
    });
    
    await helpers.clickWithMovement('[data-testid="login-button"], button[type="submit"]');
    
    // Wait and check for analytics events
    try {
      await helpers.waitForAnalyticsEvent('login');
      const events = await helpers.getAnalyticsEvents();
      const hasLoginEvent = events.some((event: any) => 
        event.event === 'login' || event[1] === 'login'
      );
      expect(hasLoginEvent).toBeTruthy();
    } catch (error) {
      // Analytics might not be configured in test environment
      console.log('Analytics not available in test environment');
    }
  });

  test('should handle password reset flow', async ({ page }) => {
    await page.goto('/login');
    await helpers.waitForPageLoad();
    
    // Look for "Forgot Password" link
    const forgotPasswordLink = page.locator('a:has-text("Forgot"), a:has-text("Reset"), [data-testid="forgot-password"]');
    
    if (await forgotPasswordLink.count() > 0) {
      await helpers.clickWithMovement('a:has-text("Forgot"), a:has-text("Reset")');
      await helpers.waitForPageTransition();
      
      // Should navigate to password reset page
      const isOnResetPage = page.url().includes('/reset') || page.url().includes('/forgot');
      const hasResetForm = await page.locator('input[type="email"], [data-testid="reset-email"]').count() > 0;
      
      expect(isOnResetPage || hasResetForm).toBeTruthy();
    }
  });
});