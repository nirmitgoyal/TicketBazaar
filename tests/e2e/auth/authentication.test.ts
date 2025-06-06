import { test, expect, TestHelpers } from '../setup/test-setup';

test.describe('Authentication & Session Management', () => {
  
  test.beforeEach(async ({ page }) => {
    // Ensure clean state before each test
    await page.goto('/');
  });

  test('should successfully login with correct credentials and maintain session', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');
    
    // Verify login form is visible
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="login-form"]');
    
    // Fill valid credentials
    await TestHelpers.fillFormField(page, '[data-testid="email-input"]', 'nirmit@example.com');
    await TestHelpers.fillFormField(page, '[data-testid="password-input"]', 'password123');
    
    // Submit login form and wait for redirect
    const [response] = await Promise.all([
      page.waitForResponse(resp => resp.url().includes('/api/auth/login')),
      page.click('[data-testid="login-submit"]')
    ]);
    
    // Verify successful login response
    expect(response.status()).toBe(200);
    
    // Verify redirect to dashboard/home
    await page.waitForURL('/', { timeout: 10000 });
    
    // Verify user is authenticated - check for user-specific elements
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="user-profile"]');
    
    // Test session persistence across page reload
    await page.reload();
    await TestHelpers.waitForNetworkIdle(page);
    
    // Verify user remains logged in after reload
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="user-profile"]');
    
    // Test session persistence across navigation
    await page.goto('/events');
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="events-page"]');
    
    // Navigate back to home
    await page.goto('/');
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="user-profile"]');
  });

  test('should reject login with incorrect credentials', async ({ page }) => {
    await page.goto('/login');
    
    // Test with invalid email
    await TestHelpers.fillFormField(page, '[data-testid="email-input"]', 'invalid@example.com');
    await TestHelpers.fillFormField(page, '[data-testid="password-input"]', 'wrongpassword');
    
    const [response] = await Promise.all([
      page.waitForResponse(resp => resp.url().includes('/api/auth/login')),
      page.click('[data-testid="login-submit"]')
    ]);
    
    // Verify failed login response
    expect(response.status()).toBe(401);
    
    // Verify error message is displayed
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="login-error"]');
    
    // Verify user remains on login page
    expect(page.url()).toContain('/login');
    
    // Test with valid email but wrong password
    await page.fill('[data-testid="email-input"]', 'nirmit@example.com');
    await page.fill('[data-testid="password-input"]', 'wrongpassword');
    
    const [response2] = await Promise.all([
      page.waitForResponse(resp => resp.url().includes('/api/auth/login')),
      page.click('[data-testid="login-submit"]')
    ]);
    
    expect(response2.status()).toBe(401);
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="login-error"]');
  });

  test('should handle empty form submission', async ({ page }) => {
    await page.goto('/login');
    
    // Try to submit empty form
    await page.click('[data-testid="login-submit"]');
    
    // Verify validation errors appear
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="email-error"]');
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="password-error"]');
    
    // Verify form doesn't submit
    expect(page.url()).toContain('/login');
  });

  test('should successfully register new user', async ({ page }) => {
    await page.goto('/register');
    
    // Fill registration form
    await TestHelpers.fillFormField(page, '[data-testid="fullname-input"]', 'Test User');
    await TestHelpers.fillFormField(page, '[data-testid="email-input"]', 'newuser@example.com');
    await TestHelpers.fillFormField(page, '[data-testid="phone-input"]', '+919876543210');
    await TestHelpers.fillFormField(page, '[data-testid="password-input"]', 'password123');
    await TestHelpers.fillFormField(page, '[data-testid="confirm-password-input"]', 'password123');
    
    const [response] = await Promise.all([
      page.waitForResponse(resp => resp.url().includes('/api/auth/register')),
      page.click('[data-testid="register-submit"]')
    ]);
    
    // Verify successful registration
    expect(response.status()).toBe(201);
    
    // Verify redirect to login or dashboard
    await page.waitForURL(/\/(login|dashboard|$)/, { timeout: 10000 });
  });

  test('should handle logout correctly', async ({ page }) => {
    // First login
    await page.goto('/login');
    await TestHelpers.fillFormField(page, '[data-testid="email-input"]', 'nirmit@example.com');
    await TestHelpers.fillFormField(page, '[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-submit"]');
    await page.waitForURL('/');
    
    // Verify logged in state
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="user-profile"]');
    
    // Perform logout
    await page.click('[data-testid="user-menu"]');
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="logout-button"]');
    
    const [response] = await Promise.all([
      page.waitForResponse(resp => resp.url().includes('/api/auth/logout')),
      page.click('[data-testid="logout-button"]')
    ]);
    
    expect(response.status()).toBe(200);
    
    // Verify redirect to login page
    await page.waitForURL('/login', { timeout: 10000 });
    
    // Verify session is cleared
    await page.goto('/');
    await page.waitForURL('/login'); // Should redirect to login if not authenticated
  });

  test('should protect authenticated routes', async ({ page }) => {
    // Try to access protected route without authentication
    await page.goto('/dashboard');
    
    // Should redirect to login
    await page.waitForURL('/login', { timeout: 10000 });
    
    // Try to access sell page
    await page.goto('/sell');
    await page.waitForURL('/login', { timeout: 10000 });
    
    // Try to access profile page
    await page.goto('/profile');
    await page.waitForURL('/login', { timeout: 10000 });
  });

  test('should handle session timeout gracefully', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await TestHelpers.fillFormField(page, '[data-testid="email-input"]', 'nirmit@example.com');
    await TestHelpers.fillFormField(page, '[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-submit"]');
    await page.waitForURL('/');
    
    // Simulate session expiration by clearing cookies
    await page.context().clearCookies();
    
    // Try to access protected resource
    await page.goto('/dashboard');
    
    // Should redirect to login
    await page.waitForURL('/login', { timeout: 10000 });
    
    // Verify appropriate message is shown
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="session-expired-message"]');
  });
});