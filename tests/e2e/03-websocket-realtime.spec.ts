import { test, expect } from '@playwright/test';
import { TestUtils } from '../helpers/test-utils';

test.describe('Real-Time Features (WebSocket)', () => {
  let utils: TestUtils;

  test.beforeEach(async ({ page }) => {
    utils = new TestUtils(page);
  });

  test('should establish WebSocket connection and receive live updates', async ({ page }) => {
    await utils.navigateToHome();
    await utils.waitForWebSocketConnection();
    
    // Monitor WebSocket messages
    const wsMessages: any[] = [];
    page.on('websocket', ws => {
      ws.on('framereceived', event => wsMessages.push(event.payload));
    });

    // Trigger an action that should generate real-time updates
    await page.click('[data-testid="refresh-events"]');
    
    // Wait for WebSocket messages
    await page.waitForFunction(() => {
      return window.performance.getEntriesByType('navigation').length > 0;
    }, { timeout: 5000 });

    // Validate live updates are rendered
    await utils.validateEventData();
  });

  test('should handle WebSocket disconnection and reconnection', async ({ page }) => {
    await utils.navigateToHome();
    await utils.waitForWebSocketConnection();

    // Simulate disconnection
    await utils.simulateWebSocketDisconnection();
    
    // Check for disconnection indicator
    const connectionStatus = page.locator('[data-testid="connection-status"]');
    await expect(connectionStatus).toHaveText(/disconnected|offline/i);

    // Wait for automatic reconnection
    await page.waitForTimeout(3000);
    await utils.waitForWebSocketConnection();
    
    // Verify reconnection
    await expect(connectionStatus).toHaveText(/connected|online/i);
  });

  test('should maintain data consistency after reconnection', async ({ page }) => {
    await utils.navigateToHome();
    
    // Capture initial data state
    const initialEventCount = await page.locator('[data-testid="event-card"]').count();
    
    // Simulate connection loss and reconnection
    await utils.simulateWebSocketDisconnection();
    await page.waitForTimeout(2000);
    await utils.waitForWebSocketConnection();
    
    // Verify data consistency
    const reconnectedEventCount = await page.locator('[data-testid="event-card"]').count();
    expect(reconnectedEventCount).toBeGreaterThanOrEqual(initialEventCount);
  });

  test('should handle real-time notifications', async ({ page }) => {
    await utils.navigateToHome();
    
    // Listen for notification events
    const notifications: string[] = [];
    page.on('console', msg => {
      if (msg.text().includes('notification')) {
        notifications.push(msg.text());
      }
    });

    // Trigger action that generates notifications
    await page.click('[data-testid="contact-seller"]');
    
    // Wait for notification to appear
    const notificationElement = page.locator('[data-testid="notification"]');
    await expect(notificationElement).toBeVisible();
    
    // Verify notification content
    await expect(notificationElement).toContainText(/contact request|message/i);
  });
});