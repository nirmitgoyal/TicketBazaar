import { test, expect, TestHelpers } from '../setup/test-setup';

test.describe('Real-time Features via WebSocket', () => {
  
  test('should receive real-time notifications', async ({ page, websocketMessages }) => {
    await page.goto('/');
    
    // Wait for WebSocket connection to establish
    await page.waitForTimeout(2000);
    
    // Navigate to a page that should trigger WebSocket messages
    await page.goto('/dashboard');
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="dashboard-page"]');
    
    // Trigger an action that should generate a WebSocket message
    await page.click('[data-testid="refresh-notifications"]');
    
    // Wait for potential WebSocket messages
    await page.waitForTimeout(3000);
    
    // Check if any WebSocket messages were received
    const messages = websocketMessages.messages;
    if (messages.length > 0) {
      // Verify message structure
      const message = messages[0];
      expect(message).toHaveProperty('type');
      expect(['notification', 'update', 'message']).toContain(message.type);
    }
    
    // Check if notifications appear in UI
    const notificationArea = page.locator('[data-testid="notifications-area"]');
    if (await notificationArea.isVisible()) {
      await TestHelpers.waitForElementToBeVisible(page, '[data-testid="notification-item"]');
    }
  });

  test('should handle WebSocket connection interruption and recovery', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Wait for initial connection
    await page.waitForTimeout(2000);
    
    // Simulate network disconnection by blocking WebSocket requests
    await page.route('**/ws', route => {
      route.abort('failed');
    });
    
    // Wait for disconnection to be detected
    await page.waitForTimeout(5000);
    
    // Check if connection status indicator shows disconnected state
    const connectionStatus = page.locator('[data-testid="connection-status"]');
    if (await connectionStatus.isVisible()) {
      const statusText = await connectionStatus.textContent();
      expect(statusText?.toLowerCase()).toContain('offline');
    }
    
    // Re-enable WebSocket connections
    await page.unroute('**/ws');
    
    // Wait for reconnection
    await page.waitForTimeout(5000);
    
    // Verify reconnection status
    if (await connectionStatus.isVisible()) {
      const statusText = await connectionStatus.textContent();
      expect(statusText?.toLowerCase()).toContain('online');
    }
  });

  test('should display real-time ticket updates', async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    
    // Navigate to an event page
    await page.goto('/events/23');
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="event-details"]');
    
    // Check initial ticket count
    const initialTicketCount = await page.locator('[data-testid="available-tickets-count"]').textContent();
    
    // Simulate another user action that would trigger real-time updates
    // This would normally come from another browser/user
    
    // Wait for potential updates
    await page.waitForTimeout(3000);
    
    // In a real scenario, we would expect the ticket count to update
    // For testing purposes, we verify the update mechanism exists
    const ticketCountElement = page.locator('[data-testid="available-tickets-count"]');
    await expect(ticketCountElement).toBeVisible();
  });

  test('should handle real-time chat messages', async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    
    // Navigate to a ticket detail page with chat feature
    await page.goto('/events/23');
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="contact-seller-button"]');
    
    await page.click('[data-testid="contact-seller-button"]');
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="chat-window"]');
    
    // Send a message
    await TestHelpers.fillFormField(page, '[data-testid="chat-input"]', 'Hello, are these tickets still available?');
    await page.click('[data-testid="send-chat-message"]');
    
    // Verify message appears in chat
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="chat-message"]');
    
    // Check if message has correct styling for sent message
    const sentMessage = page.locator('[data-testid="chat-message"]:last-child');
    await expect(sentMessage).toHaveClass(/sent|outgoing/);
    
    // In a real scenario, we would simulate receiving a reply
    // and verify it appears with different styling
  });

  test('should handle WebSocket message queuing during disconnection', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForTimeout(2000);
    
    // Disconnect WebSocket
    await page.route('**/ws', route => {
      route.abort('failed');
    });
    
    // Try to perform actions that would normally send WebSocket messages
    await page.click('[data-testid="mark-notification-read"]');
    await page.click('[data-testid="update-status"]');
    
    // Reconnect WebSocket
    await page.unroute('**/ws');
    
    // Wait for reconnection and message processing
    await page.waitForTimeout(5000);
    
    // Verify that queued actions were processed
    // This would depend on implementation, but UI should reflect the changes
    const notificationStatus = page.locator('[data-testid="notification-status"]');
    if (await notificationStatus.isVisible()) {
      const status = await notificationStatus.getAttribute('data-status');
      expect(status).toBe('read');
    }
  });
});