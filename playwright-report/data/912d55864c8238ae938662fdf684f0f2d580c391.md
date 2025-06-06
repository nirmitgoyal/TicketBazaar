# Test info

- Name: Page Navigation & Routing >> should handle responsive navigation on mobile
- Location: /home/runner/workspace/tests/e2e/navigation/routing.test.ts:144:3

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
  106 |     await page.goto('/search');
  107 |     
  108 |     // Test back navigation
  109 |     await page.goBack();
  110 |     expect(page.url()).toContain('/events');
  111 |     await TestHelpers.waitForElementToBeVisible(page, '[data-testid="events-page"]');
  112 |     
  113 |     await page.goBack();
  114 |     expect(page.url()).toMatch(/\/$|\/home/);
  115 |     await TestHelpers.waitForElementToBeVisible(page, '[data-testid="home-page"]');
  116 |     
  117 |     // Test forward navigation
  118 |     await page.goForward();
  119 |     expect(page.url()).toContain('/events');
  120 |     await TestHelpers.waitForElementToBeVisible(page, '[data-testid="events-page"]');
  121 |   });
  122 |
  123 |   test('should maintain proper URL state during navigation', async ({ page }) => {
  124 |     // Test event detail page URL
  125 |     await page.goto('/events');
  126 |     await TestHelpers.waitForElementToBeVisible(page, '[data-testid="event-card"]');
  127 |     
  128 |     // Click on first event
  129 |     await page.click('[data-testid="event-card"]:first-child');
  130 |     
  131 |     // Verify URL contains event ID
  132 |     await page.waitForTimeout(1000);
  133 |     expect(page.url()).toMatch(/\/events\/\d+/);
  134 |     
  135 |     // Test search with query parameters
  136 |     await page.goto('/search?q=concert&category=music&location=mumbai');
  137 |     
  138 |     // Verify query parameters are preserved
  139 |     expect(page.url()).toContain('q=concert');
  140 |     expect(page.url()).toContain('category=music');
  141 |     expect(page.url()).toContain('location=mumbai');
  142 |   });
  143 |
> 144 |   test('should handle responsive navigation on mobile', async ({ page }) => {
      |   ^ Error: browserType.launch: 
  145 |     // Set mobile viewport
  146 |     await page.setViewportSize({ width: 375, height: 667 });
  147 |     
  148 |     await page.goto('/');
  149 |     
  150 |     // Check if mobile menu button is visible
  151 |     const mobileMenuButton = page.locator('[data-testid="mobile-menu-button"]');
  152 |     await expect(mobileMenuButton).toBeVisible();
  153 |     
  154 |     // Open mobile menu
  155 |     await mobileMenuButton.click();
  156 |     
  157 |     // Verify mobile menu items are visible
  158 |     await TestHelpers.waitForElementToBeVisible(page, '[data-testid="mobile-nav-events"]');
  159 |     await TestHelpers.waitForElementToBeVisible(page, '[data-testid="mobile-nav-search"]');
  160 |     
  161 |     // Test navigation through mobile menu
  162 |     await page.click('[data-testid="mobile-nav-events"]');
  163 |     await TestHelpers.waitForElementToBeVisible(page, '[data-testid="events-page"]');
  164 |     expect(page.url()).toContain('/events');
  165 |   });
  166 |
  167 |   test('should handle deep linking correctly', async ({ page }) => {
  168 |     // Test direct access to event detail page
  169 |     const eventId = '23'; // Using existing event from logs
  170 |     await page.goto(`/events/${eventId}`);
  171 |     
  172 |     // Should load event details
  173 |     await TestHelpers.waitForElementToBeVisible(page, '[data-testid="event-details"]');
  174 |     
  175 |     // Test direct access to search with parameters
  176 |     await page.goto('/search?q=music&location=mumbai');
  177 |     
  178 |     // Should load search results
  179 |     await TestHelpers.waitForElementToBeVisible(page, '[data-testid="search-results"]');
  180 |     
  181 |     // Verify search form is populated with parameters
  182 |     const searchInput = page.locator('[data-testid="search-input"]');
  183 |     await expect(searchInput).toHaveValue('music');
  184 |   });
  185 | });
```