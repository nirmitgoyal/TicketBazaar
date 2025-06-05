import { Page, expect, Locator } from '@playwright/test';
import path from 'path';

export class TestHelpers {
  constructor(private page: Page) {}

  /**
   * Wait for page to load completely with network idle
   */
  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Fill form field with realistic typing behavior
   */
  async typeRealistically(selector: string, text: string, delay = 50) {
    const element = this.page.locator(selector);
    await element.click();
    await element.clear();
    
    // Type with human-like delays
    for (const char of text) {
      await element.type(char, { delay: delay + Math.random() * 50 });
    }
  }

  /**
   * Simulate realistic mouse movement and click
   */
  async clickWithMovement(selector: string) {
    const element = this.page.locator(selector);
    const box = await element.boundingBox();
    
    if (box) {
      // Move mouse to a random point near the element first
      await this.page.mouse.move(
        box.x + box.width * 0.3,
        box.y + box.height * 0.3
      );
      await this.page.waitForTimeout(100);
      
      // Then move to center and click
      await this.page.mouse.move(
        box.x + box.width / 2,
        box.y + box.height / 2
      );
      await this.page.waitForTimeout(50);
      await this.page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    } else {
      await element.click();
    }
  }

  /**
   * Wait for and verify toast notification
   */
  async waitForToast(expectedText?: string) {
    const toast = this.page.locator('[data-testid="toast"], .toast, [role="alert"]').first();
    await toast.waitFor({ state: 'visible', timeout: 5000 });
    
    if (expectedText) {
      await expect(toast).toContainText(expectedText);
    }
    
    return toast;
  }

  /**
   * Wait for form validation errors
   */
  async waitForFormError(fieldName: string) {
    const errorElement = this.page.locator(`[data-testid="${fieldName}-error"], .text-destructive, .error-message`);
    await errorElement.waitFor({ state: 'visible', timeout: 3000 });
    return errorElement;
  }

  /**
   * Upload file with drag and drop simulation
   */
  async uploadFileWithDragDrop(fileSelector: string, filePath: string) {
    const fileInput = this.page.locator(fileSelector);
    const file = path.resolve(__dirname, '../fixtures', filePath);
    
    // Simulate drag and drop
    await fileInput.setInputFiles(file);
    
    // Wait for upload to complete
    await this.page.waitForTimeout(1000);
  }

  /**
   * Wait for WebSocket connection
   */
  async waitForWebSocket() {
    // Wait for WebSocket to be established
    await this.page.waitForFunction(() => {
      return window.WebSocket && document.readyState === 'complete';
    });
    
    // Additional wait for connection
    await this.page.waitForTimeout(2000);
  }

  /**
   * Simulate realistic form filling
   */
  async fillFormRealistic(formData: Record<string, string>) {
    for (const [field, value] of Object.entries(formData)) {
      await this.typeRealistically(`[name="${field}"], #${field}, [data-testid="${field}"]`, value);
      await this.page.waitForTimeout(100 + Math.random() * 200);
    }
  }

  /**
   * Wait for analytics events to fire
   */
  async waitForAnalyticsEvent(eventName: string) {
    return this.page.waitForFunction(
      (name) => {
        return (window as any).dataLayer && (window as any).dataLayer.some(
          (event: any) => event.event === name || event[0] === 'event' && event[1] === name
        );
      },
      eventName,
      { timeout: 5000 }
    );
  }

  /**
   * Get all analytics events fired
   */
  async getAnalyticsEvents() {
    return this.page.evaluate(() => (window as any).dataLayer || []);
  }

  /**
   * Wait for Framer Motion animations to complete
   */
  async waitForAnimations() {
    await this.page.waitForFunction(() => {
      const animations = document.getAnimations();
      return animations.length === 0 || animations.every(anim => anim.playState === 'finished');
    });
  }

  /**
   * Simulate mobile touch interactions
   */
  async touchTap(selector: string) {
    const element = this.page.locator(selector);
    await element.tap();
  }

  /**
   * Simulate swipe gesture
   */
  async swipe(selector: string, direction: 'left' | 'right' | 'up' | 'down') {
    const element = this.page.locator(selector);
    const box = await element.boundingBox();
    
    if (box) {
      const startX = box.x + box.width / 2;
      const startY = box.y + box.height / 2;
      
      let endX = startX;
      let endY = startY;
      
      switch (direction) {
        case 'left':
          endX = startX - box.width * 0.8;
          break;
        case 'right':
          endX = startX + box.width * 0.8;
          break;
        case 'up':
          endY = startY - box.height * 0.8;
          break;
        case 'down':
          endY = startY + box.height * 0.8;
          break;
      }
      
      await this.page.touchscreen.tap(startX, startY);
      await this.page.mouse.move(startX, startY);
      await this.page.mouse.down();
      await this.page.mouse.move(endX, endY);
      await this.page.mouse.up();
    }
  }

  /**
   * Check if element is in viewport
   */
  async isInViewport(selector: string): Promise<boolean> {
    const element = this.page.locator(selector);
    const box = await element.boundingBox();
    if (!box) return false;
    
    const viewport = this.page.viewportSize();
    if (!viewport) return false;
    
    return (
      box.x >= 0 &&
      box.y >= 0 &&
      box.x + box.width <= viewport.width &&
      box.y + box.height <= viewport.height
    );
  }

  /**
   * Scroll element into view smoothly
   */
  async scrollIntoView(selector: string) {
    await this.page.locator(selector).scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(300); // Wait for smooth scroll
  }

  /**
   * Wait for page transition to complete
   */
  async waitForPageTransition() {
    await this.page.waitForLoadState('networkidle');
    await this.waitForAnimations();
    await this.page.waitForTimeout(500);
  }

  /**
   * Simulate network conditions
   */
  async simulateSlowNetwork() {
    const client = await this.page.context().newCDPSession(this.page);
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: 1.5 * 1024 * 1024 / 8, // 1.5 Mbps
      uploadThroughput: 750 * 1024 / 8, // 750 Kbps
      latency: 40,
    });
  }

  /**
   * Reset network conditions
   */
  async resetNetworkConditions() {
    const client = await this.page.context().newCDPSession(this.page);
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: -1,
      uploadThroughput: -1,
      latency: 0,
    });
  }
}