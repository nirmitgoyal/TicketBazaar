# Test info

- Name: Page Navigation & Routing >> should navigate between key pages and verify correct content rendering
- Location: /home/runner/workspace/tests/e2e/01-navigation-routing.spec.ts:11:3

# Error details

```
Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
Call log:
  - navigating to "/", waiting until "load"

    at TestUtils.navigateToHome (/home/runner/workspace/tests/helpers/test-utils.ts:8:21)
    at /home/runner/workspace/tests/e2e/01-navigation-routing.spec.ts:13:17
```

# Test source

```ts
   1 | import { Page, expect, Locator } from '@playwright/test';
   2 |
   3 | export class TestUtils {
   4 |   constructor(private page: Page) {}
   5 |
   6 |   // Navigation helpers
   7 |   async navigateToHome() {
>  8 |     await this.page.goto('/');
     |                     ^ Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
   9 |     await this.page.waitForLoadState('networkidle');
   10 |   }
   11 |
   12 |   async navigateToMap() {
   13 |     await this.page.goto('/map');
   14 |     await this.page.waitForLoadState('networkidle');
   15 |   }
   16 |
   17 |   async navigateToListTicket() {
   18 |     await this.page.goto('/list-ticket');
   19 |     await this.page.waitForLoadState('networkidle');
   20 |   }
   21 |
   22 |   async navigateToProfile() {
   23 |     await this.page.goto('/profile');
   24 |     await this.page.waitForLoadState('networkidle');
   25 |   }
   26 |
   27 |   // Authentication helpers
   28 |   async attemptGoogleLogin() {
   29 |     const loginButton = this.page.getByRole('button', { name: /sign in with google/i });
   30 |     await expect(loginButton).toBeVisible();
   31 |     await loginButton.click();
   32 |   }
   33 |
   34 |   async waitForAuthenticationState() {
   35 |     // Wait for either authenticated or unauthenticated state
   36 |     await this.page.waitForFunction(() => {
   37 |       return document.querySelector('[data-testid="auth-state"]') !== null ||
   38 |              document.querySelector('[data-testid="login-button"]') !== null;
   39 |     }, { timeout: 10000 });
   40 |   }
   41 |
   42 |   // Form helpers
   43 |   async fillTicketListingForm(ticketData: {
   44 |     title: string;
   45 |     description: string;
   46 |     venue: string;
   47 |     date: string;
   48 |     price: string;
   49 |     category: string;
   50 |   }) {
   51 |     await this.page.fill('[data-testid="ticket-title"]', ticketData.title);
   52 |     await this.page.fill('[data-testid="ticket-description"]', ticketData.description);
   53 |     await this.page.fill('[data-testid="ticket-venue"]', ticketData.venue);
   54 |     await this.page.fill('[data-testid="ticket-date"]', ticketData.date);
   55 |     await this.page.fill('[data-testid="ticket-price"]', ticketData.price);
   56 |     await this.page.selectOption('[data-testid="ticket-category"]', ticketData.category);
   57 |   }
   58 |
   59 |   async submitForm(formSelector: string) {
   60 |     const submitButton = this.page.locator(`${formSelector} [type="submit"]`);
   61 |     await expect(submitButton).toBeEnabled();
   62 |     await submitButton.click();
   63 |   }
   64 |
   65 |   // Error validation helpers
   66 |   async expectFormError(fieldName: string, expectedError?: string) {
   67 |     const errorElement = this.page.locator(`[data-testid="${fieldName}-error"]`);
   68 |     await expect(errorElement).toBeVisible();
   69 |     if (expectedError) {
   70 |       await expect(errorElement).toContainText(expectedError);
   71 |     }
   72 |   }
   73 |
   74 |   async expectSuccessMessage(message?: string) {
   75 |     const successElement = this.page.locator('[data-testid="success-message"]');
   76 |     await expect(successElement).toBeVisible();
   77 |     if (message) {
   78 |       await expect(successElement).toContainText(message);
   79 |     }
   80 |   }
   81 |
   82 |   // Map interaction helpers
   83 |   async interactWithMap() {
   84 |     const mapContainer = this.page.locator('[data-testid="google-map"]');
   85 |     await expect(mapContainer).toBeVisible();
   86 |     
   87 |     // Simulate map interactions
   88 |     await mapContainer.click({ position: { x: 200, y: 200 } });
   89 |     await this.page.mouse.wheel(0, -100); // Zoom in
   90 |     await this.page.mouse.wheel(0, 100);  // Zoom out
   91 |   }
   92 |
   93 |   async clickMapMarker(markerIndex: number = 0) {
   94 |     const markers = this.page.locator('[data-testid="map-marker"]');
   95 |     await markers.nth(markerIndex).click();
   96 |   }
   97 |
   98 |   // UI state validation helpers
   99 |   async expectPageLoaded(pageTitle: string) {
  100 |     await expect(this.page).toHaveTitle(new RegExp(pageTitle, 'i'));
  101 |     await this.page.waitForLoadState('networkidle');
  102 |   }
  103 |
  104 |   async expectElementVisible(selector: string) {
  105 |     await expect(this.page.locator(selector)).toBeVisible();
  106 |   }
  107 |
  108 |   async expectElementNotVisible(selector: string) {
```