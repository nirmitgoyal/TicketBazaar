import { Page, Locator } from '@playwright/test';

export class PageObjectHelper {
  constructor(private page: Page) {}

  // Navigation elements
  get navigationMenu(): Locator {
    return this.page.locator('[data-testid="nav-menu"], nav');
  }

  get homeLink(): Locator {
    return this.page.locator('[data-testid="nav-home"], nav a[href="/"]');
  }

  get mapLink(): Locator {
    return this.page.locator('[data-testid="nav-map"], nav a[href="/map"]');
  }

  get loginButton(): Locator {
    return this.page.locator('[data-testid="login-button"], button:has-text("Login"), a:has-text("Login")');
  }

  // Form elements
  get emailInput(): Locator {
    return this.page.locator('[data-testid="email-input"], input[type="email"], input[name="email"]');
  }

  get passwordInput(): Locator {
    return this.page.locator('[data-testid="password-input"], input[type="password"], input[name="password"]');
  }

  get submitButton(): Locator {
    return this.page.locator('[data-testid="submit-button"], button[type="submit"], input[type="submit"]');
  }

  // Search and filtering
  get searchInput(): Locator {
    return this.page.locator('[data-testid="search-input"], input[placeholder*="search" i]');
  }

  get locationFilter(): Locator {
    return this.page.locator('[data-testid="location-filter"], select[name*="location"], select[name*="city"]');
  }

  get categoryFilter(): Locator {
    return this.page.locator('[data-testid="category-filter"], select[name*="category"]');
  }

  // Ticket and event elements
  get ticketCards(): Locator {
    return this.page.locator('[data-testid="ticket-card"], .ticket-card, .event-card');
  }

  get ticketTitles(): Locator {
    return this.page.locator('[data-testid="ticket-title"], .ticket-title, .event-title');
  }

  get ticketPrices(): Locator {
    return this.page.locator('[data-testid="ticket-price"], .price, .ticket-price');
  }

  get buyButton(): Locator {
    return this.page.locator('[data-testid="buy-button"], button:has-text("Buy"), button:has-text("Contact")');
  }

  // Map elements
  get mapContainer(): Locator {
    return this.page.locator('[data-testid="map-container"], .map-container, #map');
  }

  get venueMarkers(): Locator {
    return this.page.locator('[data-testid="venue-marker"], .marker, .venue-marker');
  }

  // User interface elements
  get userProfile(): Locator {
    return this.page.locator('[data-testid="user-profile"], .user-profile');
  }

  get notificationBell(): Locator {
    return this.page.locator('[data-testid="notifications"], .notification-bell');
  }

  get loadingSpinner(): Locator {
    return this.page.locator('[data-testid="loading"], .loading, .spinner');
  }

  get errorMessage(): Locator {
    return this.page.locator('[data-testid="error"], .error, .error-message');
  }

  // Modal and dialog elements
  get modal(): Locator {
    return this.page.locator('[data-testid="modal"], .modal, [role="dialog"]');
  }

  get modalCloseButton(): Locator {
    return this.page.locator('[data-testid="modal-close"], .modal-close, button:has-text("Close")');
  }

  // Helper methods
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  async clickAndWaitForNavigation(locator: Locator): Promise<void> {
    await Promise.all([
      this.page.waitForNavigation(),
      locator.click()
    ]);
  }

  async fillForm(fields: Record<string, string>): Promise<void> {
    for (const [field, value] of Object.entries(fields)) {
      const input = this.page.locator(`[data-testid="${field}"], input[name="${field}"], input[id="${field}"]`);
      await input.fill(value);
    }
  }

  async selectDropdownOption(selector: string, option: string): Promise<void> {
    const dropdown = this.page.locator(selector);
    await dropdown.selectOption(option);
  }

  async waitForElementToBeVisible(locator: Locator, timeout = 5000): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout });
  }

  async waitForElementToBeHidden(locator: Locator, timeout = 5000): Promise<void> {
    await locator.waitFor({ state: 'hidden', timeout });
  }

  async scrollToElement(locator: Locator): Promise<void> {
    await locator.scrollIntoViewIfNeeded();
  }

  async getElementText(locator: Locator): Promise<string> {
    return await locator.textContent() || '';
  }

  async isElementVisible(locator: Locator): Promise<boolean> {
    return await locator.isVisible();
  }

  async clickIfVisible(locator: Locator): Promise<boolean> {
    if (await this.isElementVisible(locator)) {
      await locator.click();
      return true;
    }
    return false;
  }

  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({ path: `test-results/${name}.png` });
  }
}