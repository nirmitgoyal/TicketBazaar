import { Page, expect } from "@playwright/test";

/**
 * Simple Test Utilities
 * Basic helper functions for common test operations
 */
export class SimpleTestUtils {
  constructor(private page: Page) {}

  /** Navigate to home page and wait for load */
  async goHome() {
    await this.page.goto("/");
    await this.page.waitForLoadState("networkidle");
  }

  /** Navigate to map page */
  async goToMap() {
    await this.page.goto("/map");
    await this.page.waitForLoadState("networkidle");
  }

  /** Navigate to list ticket page */
  async goToListTicket() {
    await this.page.goto("/list-ticket");
    await this.page.waitForLoadState("networkidle");
  }

  /** Wait for page to load completely */
  async waitForLoad() {
    await this.page.waitForLoadState("networkidle");
  }

  /** Check if element is visible */
  async isVisible(selector: string): Promise<boolean> {
    try {
      const element = this.page.locator(selector);
      return await element.isVisible();
    } catch {
      return false;
    }
  }

  /** Fill form field if it exists */
  async fillIfExists(selector: string, value: string) {
    if (await this.isVisible(selector)) {
      await this.page.fill(selector, value);
    }
  }

  /** Click element if it exists */
  async clickIfExists(selector: string) {
    if (await this.isVisible(selector)) {
      await this.page.click(selector);
    }
  }

  /** Get page title */
  async getTitle(): Promise<string> {
    return await this.page.title();
  }

  /** Check if URL contains path */
  urlContains(path: string): boolean {
    return this.page.url().includes(path);
  }
}
