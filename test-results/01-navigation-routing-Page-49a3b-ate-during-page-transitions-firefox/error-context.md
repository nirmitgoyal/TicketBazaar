# Test info

- Name: Page Navigation & Routing >> should maintain navigation state during page transitions
- Location: /home/runner/workspace/tests/e2e/01-navigation-routing.spec.ts:56:3

# Error details

```
Error: browserType.launch: Executable doesn't exist at /home/runner/workspace/.cache/ms-playwright/firefox-1482/firefox/firefox
╔═════════════════════════════════════════════════════════════════════════╗
║ Looks like Playwright Test or Playwright was just installed or updated. ║
║ Please run the following command to download new browsers:              ║
║                                                                         ║
║     npx playwright install                                              ║
║                                                                         ║
║ <3 Playwright Team                                                      ║
╚═════════════════════════════════════════════════════════════════════════╝
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 | import { TestUtils } from '../helpers/test-utils';
   3 |
   4 | test.describe('Page Navigation & Routing', () => {
   5 |   let utils: TestUtils;
   6 |
   7 |   test.beforeEach(async ({ page }) => {
   8 |     utils = new TestUtils(page);
   9 |   });
   10 |
   11 |   test('should navigate between key pages and verify correct content rendering', async ({ page }) => {
   12 |     // Test home page navigation
   13 |     await utils.navigateToHome();
   14 |     await utils.expectPageLoaded('TicketSwap');
   15 |     await expect(page.locator('[data-testid="hero-section"]')).toBeVisible();
   16 |     await expect(page.locator('[data-testid="event-grid"]')).toBeVisible();
   17 |
   18 |     // Test map page navigation
   19 |     await page.click('[data-testid="nav-map"]');
   20 |     await utils.waitForPageTransition();
   21 |     await expect(page.url()).toContain('/map');
   22 |     await expect(page.locator('[data-testid="google-map"]')).toBeVisible();
   23 |
   24 |     // Test list ticket page navigation
   25 |     await page.click('[data-testid="nav-list-ticket"]');
   26 |     await utils.waitForPageTransition();
   27 |     await expect(page.url()).toContain('/list-ticket');
   28 |     await expect(page.locator('[data-testid="ticket-listing-form"]')).toBeVisible();
   29 |
   30 |     // Test profile page navigation
   31 |     await page.click('[data-testid="nav-profile"]');
   32 |     await utils.waitForPageTransition();
   33 |     await expect(page.url()).toContain('/profile');
   34 |   });
   35 |
   36 |   test('should handle invalid URLs with graceful fallback', async ({ page }) => {
   37 |     const invalidUrls = [
   38 |       '/nonexistent-page',
   39 |       '/events/invalid-id',
   40 |       '/tickets/999999',
   41 |       '/random-path'
   42 |     ];
   43 |
   44 |     for (const url of invalidUrls) {
   45 |       await page.goto(url, { waitUntil: 'networkidle' });
   46 |       
   47 |       // Should either redirect to home or show 404
   48 |       const isOnHome = page.url().endsWith('/');
   49 |       const has404Content = await page.locator('[data-testid="not-found"]').isVisible();
   50 |       const hasErrorMessage = await page.locator('text=/page not found|404|not found/i').isVisible();
   51 |       
   52 |       expect(isOnHome || has404Content || hasErrorMessage).toBeTruthy();
   53 |     }
   54 |   });
   55 |
>  56 |   test('should maintain navigation state during page transitions', async ({ page }) => {
      |   ^ Error: browserType.launch: Executable doesn't exist at /home/runner/workspace/.cache/ms-playwright/firefox-1482/firefox/firefox
   57 |     await utils.navigateToHome();
   58 |     
   59 |     // Navigate through multiple pages and verify browser history
   60 |     await page.click('[data-testid="nav-map"]');
   61 |     await utils.waitForPageTransition();
   62 |     
   63 |     await page.click('[data-testid="nav-list-ticket"]');
   64 |     await utils.waitForPageTransition();
   65 |     
   66 |     // Test back button functionality
   67 |     await page.goBack();
   68 |     await expect(page.url()).toContain('/map');
   69 |     
   70 |     await page.goBack();
   71 |     await expect(page.url()).toMatch(/\/$|\/home/);
   72 |     
   73 |     // Test forward button
   74 |     await page.goForward();
   75 |     await expect(page.url()).toContain('/map');
   76 |   });
   77 |
   78 |   test('should handle direct URL access to protected routes', async ({ page }) => {
   79 |     // Try accessing profile directly without authentication
   80 |     await page.goto('/profile', { waitUntil: 'networkidle' });
   81 |     
   82 |     // Should either redirect to login or show authentication prompt
   83 |     const hasLoginButton = await page.locator('[data-testid="login-button"]').isVisible();
   84 |     const isRedirectedToAuth = page.url().includes('auth') || page.url().includes('login');
   85 |     const hasAuthPrompt = await page.locator('text=/sign in|login|authenticate/i').isVisible();
   86 |     
   87 |     expect(hasLoginButton || isRedirectedToAuth || hasAuthPrompt).toBeTruthy();
   88 |   });
   89 |
   90 |   test('should render navigation consistently across viewport sizes', async ({ page }) => {
   91 |     await utils.navigateToHome();
   92 |     
   93 |     const breakpoints = await utils.testResponsiveBreakpoints();
   94 |     
   95 |     for (const breakpoint of breakpoints) {
   96 |       await page.setViewportSize({ width: breakpoint.width, height: breakpoint.height });
   97 |       await page.waitForTimeout(500);
   98 |       
   99 |       // Navigation should be accessible on all screen sizes
  100 |       const navVisible = await page.locator('[data-testid="navigation"]').isVisible();
  101 |       const mobileMenuVisible = await page.locator('[data-testid="mobile-menu"]').isVisible();
  102 |       const hamburgerVisible = await page.locator('[data-testid="hamburger-menu"]').isVisible();
  103 |       
  104 |       // At least one navigation method should be visible
  105 |       expect(navVisible || mobileMenuVisible || hamburgerVisible).toBeTruthy();
  106 |     }
  107 |   });
  108 | });
```