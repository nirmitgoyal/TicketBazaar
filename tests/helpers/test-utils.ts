import { Page, expect, Locator } from '@playwright/test';

export class TestUtils {
  constructor(private page: Page) {}

  // Navigation helpers
  async navigateToHome() {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
  }

  async navigateToMap() {
    await this.page.goto('/map');
    await this.page.waitForLoadState('networkidle');
  }

  async navigateToListTicket() {
    await this.page.goto('/list-ticket');
    await this.page.waitForLoadState('networkidle');
  }

  async navigateToProfile() {
    await this.page.goto('/profile');
    await this.page.waitForLoadState('networkidle');
  }

  // Authentication helpers
  async attemptGoogleLogin() {
    const loginButton = this.page.getByRole('button', { name: /sign in with google/i });
    await expect(loginButton).toBeVisible();
    await loginButton.click();
  }

  async waitForAuthenticationState() {
    // Wait for either authenticated or unauthenticated state
    await this.page.waitForFunction(() => {
      return document.querySelector('[data-testid="auth-state"]') !== null ||
             document.querySelector('[data-testid="login-button"]') !== null;
    }, { timeout: 10000 });
  }

  // Form helpers
  async fillTicketListingForm(ticketData: {
    title: string;
    description: string;
    venue: string;
    date: string;
    price: string;
    category: string;
  }) {
    await this.page.fill('[data-testid="ticket-title"]', ticketData.title);
    await this.page.fill('[data-testid="ticket-description"]', ticketData.description);
    await this.page.fill('[data-testid="ticket-venue"]', ticketData.venue);
    await this.page.fill('[data-testid="ticket-date"]', ticketData.date);
    await this.page.fill('[data-testid="ticket-price"]', ticketData.price);
    await this.page.selectOption('[data-testid="ticket-category"]', ticketData.category);
  }

  async submitForm(formSelector: string) {
    const submitButton = this.page.locator(`${formSelector} [type="submit"]`);
    await expect(submitButton).toBeEnabled();
    await submitButton.click();
  }

  // Error validation helpers
  async expectFormError(fieldName: string, expectedError?: string) {
    const errorElement = this.page.locator(`[data-testid="${fieldName}-error"]`);
    await expect(errorElement).toBeVisible();
    if (expectedError) {
      await expect(errorElement).toContainText(expectedError);
    }
  }

  async expectSuccessMessage(message?: string) {
    const successElement = this.page.locator('[data-testid="success-message"]');
    await expect(successElement).toBeVisible();
    if (message) {
      await expect(successElement).toContainText(message);
    }
  }

  // Map interaction helpers
  async interactWithMap() {
    const mapContainer = this.page.locator('[data-testid="google-map"]');
    await expect(mapContainer).toBeVisible();
    
    // Simulate map interactions
    await mapContainer.click({ position: { x: 200, y: 200 } });
    await this.page.mouse.wheel(0, -100); // Zoom in
    await this.page.mouse.wheel(0, 100);  // Zoom out
  }

  async clickMapMarker(markerIndex: number = 0) {
    const markers = this.page.locator('[data-testid="map-marker"]');
    await markers.nth(markerIndex).click();
  }

  // UI state validation helpers
  async expectPageLoaded(pageTitle: string) {
    await expect(this.page).toHaveTitle(new RegExp(pageTitle, 'i'));
    await this.page.waitForLoadState('networkidle');
  }

  async expectElementVisible(selector: string) {
    await expect(this.page.locator(selector)).toBeVisible();
  }

  async expectElementNotVisible(selector: string) {
    await expect(this.page.locator(selector)).not.toBeVisible();
  }

  // Animation and transition helpers
  async waitForPageTransition() {
    await this.page.waitForTimeout(500); // Allow for page transitions
    await this.page.waitForLoadState('networkidle');
  }

  async waitForModalAnimation() {
    await this.page.waitForTimeout(300); // Allow for modal animations
  }

  // Error simulation helpers
  async triggerNetworkError() {
    await this.page.route('**/api/**', route => route.abort());
  }

  async restoreNetwork() {
    await this.page.unroute('**/api/**');
  }

  async simulateSlowNetwork() {
    await this.page.route('**/api/**', route => {
      setTimeout(() => route.continue(), 2000);
    });
  }

  // Responsive design helpers
  async testResponsiveBreakpoints() {
    const breakpoints = [
      { width: 375, height: 667, name: 'mobile' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 1024, height: 768, name: 'desktop-small' },
      { width: 1440, height: 900, name: 'desktop-large' }
    ];

    return breakpoints;
  }

  // WebSocket helpers
  async waitForWebSocketConnection() {
    await this.page.waitForFunction(() => {
      return window.WebSocket && 
             Array.from(document.querySelectorAll('*')).some(el => 
               el.textContent?.includes('connected') || 
               el.getAttribute('data-connection-status') === 'connected'
             );
    }, { timeout: 10000 });
  }

  async simulateWebSocketDisconnection() {
    await this.page.evaluate(() => {
      // Close any existing WebSocket connections
      const connections = (window as any)._wsConnections || [];
      connections.forEach((ws: WebSocket) => ws.close());
    });
  }

  // Data validation helpers
  async validateEventData(expectedEventCount?: number) {
    const eventCards = this.page.locator('[data-testid="event-card"]');
    if (expectedEventCount) {
      await expect(eventCards).toHaveCount(expectedEventCount);
    } else {
      await expect(eventCards.first()).toBeVisible();
    }
  }

  async validateTicketData() {
    const ticketCards = this.page.locator('[data-testid="ticket-card"]');
    await expect(ticketCards.first()).toBeVisible();
    
    // Validate essential ticket information is present
    await expect(ticketCards.first().locator('[data-testid="ticket-title"]')).toBeVisible();
    await expect(ticketCards.first().locator('[data-testid="ticket-price"]')).toBeVisible();
  }

  // Screenshot helpers
  async takeScreenshot(name: string) {
    await this.page.screenshot({ 
      path: `test-results/screenshots/${name}.png`,
      fullPage: true 
    });
  }

  async takeElementScreenshot(selector: string, name: string) {
    await this.page.locator(selector).screenshot({
      path: `test-results/screenshots/${name}.png`
    });
  }
}