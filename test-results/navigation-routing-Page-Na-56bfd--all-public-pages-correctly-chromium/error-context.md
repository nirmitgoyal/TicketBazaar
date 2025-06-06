# Test info

- Name: Page Navigation & Routing >> should navigate through all public pages correctly
- Location: /home/runner/workspace/tests/e2e/navigation/routing.test.ts:5:3

# Error details

```
Error: browserType.launch: 
╔══════════════════════════════════════════════════════╗
║ Host system is missing dependencies to run browsers. ║
║ Missing libraries:                                   ║
║     libglib-2.0.so.0                                 ║
║     libgobject-2.0.so.0                              ║
║     libnss3.so                                       ║
║     libnssutil3.so                                   ║
║     libnspr4.so                                      ║
║     libdbus-1.so.3                                   ║
║     libatk-1.0.so.0                                  ║
║     libatk-bridge-2.0.so.0                           ║
║     libgio-2.0.so.0                                  ║
║     libexpat.so.1                                    ║
║     libatspi.so.0                                    ║
║     libX11.so.6                                      ║
║     libXcomposite.so.1                               ║
║     libXdamage.so.1                                  ║
║     libXext.so.6                                     ║
║     libXfixes.so.3                                   ║
║     libXrandr.so.2                                   ║
║     libgbm.so.1                                      ║
║     libxcb.so.1                                      ║
║     libxkbcommon.so.0                                ║
║     libudev.so.1                                     ║
║     libasound.so.2                                   ║
╚══════════════════════════════════════════════════════╝
```

# Test source

```ts
   1 | import { test, expect, TestHelpers } from '../setup/test-setup';
   2 |
   3 | test.describe('Page Navigation & Routing', () => {
   4 |   
>  5 |   test('should navigate through all public pages correctly', async ({ page }) => {
     |   ^ Error: browserType.launch: 
   6 |     // Test home page
   7 |     await page.goto('/');
   8 |     expect(page.url()).toContain('/');
   9 |     await TestHelpers.waitForElementToBeVisible(page, '[data-testid="home-page"]');
   10 |     
   11 |     // Test events page
   12 |     await page.goto('/events');
   13 |     expect(page.url()).toContain('/events');
   14 |     await TestHelpers.waitForElementToBeVisible(page, '[data-testid="events-page"]');
   15 |     
   16 |     // Test search page
   17 |     await page.goto('/search');
   18 |     expect(page.url()).toContain('/search');
   19 |     await TestHelpers.waitForElementToBeVisible(page, '[data-testid="search-page"]');
   20 |     
   21 |     // Test map page
   22 |     await page.goto('/map');
   23 |     expect(page.url()).toContain('/map');
   24 |     await TestHelpers.waitForElementToBeVisible(page, '[data-testid="map-page"]');
   25 |     
   26 |     // Test login page
   27 |     await page.goto('/login');
   28 |     expect(page.url()).toContain('/login');
   29 |     await TestHelpers.waitForElementToBeVisible(page, '[data-testid="login-form"]');
   30 |     
   31 |     // Test register page
   32 |     await page.goto('/register');
   33 |     expect(page.url()).toContain('/register');
   34 |     await TestHelpers.waitForElementToBeVisible(page, '[data-testid="register-form"]');
   35 |   });
   36 |
   37 |   test('should handle navigation with authentication', async ({ authenticatedPage }) => {
   38 |     const page = authenticatedPage;
   39 |     
   40 |     // Test dashboard access
   41 |     await page.goto('/dashboard');
   42 |     expect(page.url()).toContain('/dashboard');
   43 |     await TestHelpers.waitForElementToBeVisible(page, '[data-testid="dashboard-page"]');
   44 |     
   45 |     // Test sell page access
   46 |     await page.goto('/sell');
   47 |     expect(page.url()).toContain('/sell');
   48 |     await TestHelpers.waitForElementToBeVisible(page, '[data-testid="sell-form"]');
   49 |     
   50 |     // Test profile page access
   51 |     await page.goto('/profile');
   52 |     expect(page.url()).toContain('/profile');
   53 |     await TestHelpers.waitForElementToBeVisible(page, '[data-testid="profile-page"]');
   54 |     
   55 |     // Test my tickets page
   56 |     await page.goto('/my-tickets');
   57 |     expect(page.url()).toContain('/my-tickets');
   58 |     await TestHelpers.waitForElementToBeVisible(page, '[data-testid="my-tickets-page"]');
   59 |   });
   60 |
   61 |   test('should handle invalid routes correctly', async ({ page }) => {
   62 |     // Test non-existent route
   63 |     await page.goto('/non-existent-page');
   64 |     
   65 |     // Should redirect to 404 page or home
   66 |     await page.waitForTimeout(2000);
   67 |     const currentUrl = page.url();
   68 |     expect(currentUrl).toMatch(/(404|\/)/);
   69 |     
   70 |     // Test invalid event ID
   71 |     await page.goto('/events/99999');
   72 |     await page.waitForTimeout(2000);
   73 |     
   74 |     // Should show error message or redirect
   75 |     const hasErrorMessage = await page.locator('[data-testid="error-message"]').isVisible();
   76 |     const redirectedToEvents = page.url().includes('/events');
   77 |     expect(hasErrorMessage || redirectedToEvents).toBeTruthy();
   78 |   });
   79 |
   80 |   test('should navigate using navigation links', async ({ page }) => {
   81 |     await page.goto('/');
   82 |     
   83 |     // Test navigation bar links
   84 |     await page.click('[data-testid="nav-events"]');
   85 |     await TestHelpers.waitForElementToBeVisible(page, '[data-testid="events-page"]');
   86 |     expect(page.url()).toContain('/events');
   87 |     
   88 |     await page.click('[data-testid="nav-search"]');
   89 |     await TestHelpers.waitForElementToBeVisible(page, '[data-testid="search-page"]');
   90 |     expect(page.url()).toContain('/search');
   91 |     
   92 |     await page.click('[data-testid="nav-map"]');
   93 |     await TestHelpers.waitForElementToBeVisible(page, '[data-testid="map-page"]');
   94 |     expect(page.url()).toContain('/map');
   95 |     
   96 |     // Test logo navigation back to home
   97 |     await page.click('[data-testid="nav-logo"]');
   98 |     await TestHelpers.waitForElementToBeVisible(page, '[data-testid="home-page"]');
   99 |     expect(page.url()).toMatch(/\/$|\/home/);
  100 |   });
  101 |
  102 |   test('should handle browser back and forward navigation', async ({ page }) => {
  103 |     // Navigate through pages
  104 |     await page.goto('/');
  105 |     await page.goto('/events');
```