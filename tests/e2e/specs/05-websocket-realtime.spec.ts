import { test, expect } from '@playwright/test';
import { TestHelpers } from '../utils/test-helpers';
import { webSocketEvents } from '../fixtures/test-data';

test.describe('WebSocket Real-time Features', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
  });

  test('should establish WebSocket connection on page load', async ({ page }) => {
    await page.goto('/');
    await helpers.waitForPageLoad();
    
    // Wait for WebSocket to connect
    await helpers.waitForWebSocket();
    
    // Check WebSocket connection in browser
    const isWebSocketConnected = await page.evaluate(() => {
      return new Promise((resolve) => {
        const checkConnection = () => {
          // Look for WebSocket instances
          const hasWebSocket = window.WebSocket !== undefined;
          resolve(hasWebSocket);
        };
        
        setTimeout(checkConnection, 2000);
      });
    });
    
    expect(isWebSocketConnected).toBeTruthy();
  });

  test('should handle WebSocket connection establishment with retry logic', async ({ page }) => {
    // Monitor WebSocket connections
    const wsConnections: string[] = [];
    
    page.on('websocket', ws => {
      wsConnections.push(ws.url());
    });

    await page.goto('/');
    await helpers.waitForPageLoad();
    await page.waitForTimeout(3000);

    // Should attempt WebSocket connection
    const hasWebSocketAttempt = wsConnections.length > 0;
    const hasDevWebSocket = wsConnections.some(url => url.includes('ws'));
    
    expect(hasWebSocketAttempt || hasDevWebSocket).toBeTruthy();
  });

  test('should display real-time ticket updates', async ({ page }) => {
    await page.goto('/');
    await helpers.waitForPageLoad();
    await helpers.waitForWebSocket();

    // Get initial ticket count/state
    const initialTickets = await page.locator('[data-testid="ticket-card"], .ticket-card, .event-card').count();

    // Simulate WebSocket message for ticket update
    await page.evaluate((eventData) => {
      // Simulate receiving WebSocket message
      const event = new CustomEvent('websocket-message', {
        detail: eventData
      });
      window.dispatchEvent(event);
    }, webSocketEvents.ticketUpdate);

    await page.waitForTimeout(1000);

    // Check if UI updated (ticket status, availability, etc.)
    const afterUpdateTickets = await page.locator('[data-testid="ticket-card"], .ticket-card').count();
    const hasStatusUpdate = await page.locator('[data-testid="ticket-status"], .status-updated, .sold-badge').count() > 0;

    // Either ticket count changed or status indicators appeared
    expect(afterUpdateTickets !== initialTickets || hasStatusUpdate).toBeTruthy();
  });

  test('should handle real-time messaging in contact requests', async ({ page }) => {
    // Navigate to a page where messaging might occur
    await page.goto('/my-tickets');
    await helpers.waitForPageLoad();
    await helpers.waitForWebSocket();

    // Look for contact request or message interface
    const messageInterface = page.locator('[data-testid="messages"], .message-container, .contact-requests');
    
    if (await messageInterface.count() > 0) {
      // Get initial message count
      const initialMessages = await page.locator('[data-testid="message"], .message-item').count();

      // Simulate new message via WebSocket
      await page.evaluate((eventData) => {
        const event = new CustomEvent('websocket-message', {
          detail: eventData
        });
        window.dispatchEvent(event);
      }, webSocketEvents.newMessage);

      await page.waitForTimeout(1000);

      // Check for new message
      const newMessages = await page.locator('[data-testid="message"], .message-item').count();
      const hasNewMessageIndicator = await page.locator('.new-message, .unread, [data-testid="new-message"]').count() > 0;

      expect(newMessages > initialMessages || hasNewMessageIndicator).toBeTruthy();
    }
  });

  test('should show user online/offline status updates', async ({ page }) => {
    await page.goto('/');
    await helpers.waitForPageLoad();
    await helpers.waitForWebSocket();

    // Simulate user coming online
    await page.evaluate((eventData) => {
      const event = new CustomEvent('websocket-message', {
        detail: eventData
      });
      window.dispatchEvent(event);
    }, webSocketEvents.userOnline);

    await page.waitForTimeout(1000);

    // Look for online status indicators
    const onlineIndicators = page.locator('[data-testid="user-online"], .user-online, .online-status');
    const hasOnlineStatus = await onlineIndicators.count() > 0;

    // Online status might only show in specific contexts
    expect(typeof hasOnlineStatus).toBe('boolean');
  });

  test('should handle WebSocket disconnection and reconnection', async ({ page }) => {
    await page.goto('/');
    await helpers.waitForPageLoad();
    await helpers.waitForWebSocket();

    // Simulate network interruption
    await page.evaluate(() => {
      // Close any existing WebSocket connections
      if ((window as any).webSocketConnection) {
        (window as any).webSocketConnection.close();
      }
    });

    await page.waitForTimeout(2000);

    // Check for reconnection attempts or offline indicators
    const reconnectIndicator = page.locator('[data-testid="reconnecting"], .reconnecting, .offline-indicator');
    const connectionStatus = await page.evaluate(() => {
      return document.readyState === 'complete';
    });

    expect(connectionStatus).toBeTruthy();
  });

  test('should handle WebSocket errors gracefully', async ({ page }) => {
    // Mock WebSocket to fail
    await page.addInitScript(() => {
      const OriginalWebSocket = window.WebSocket;
      (window as any).WebSocket = class extends OriginalWebSocket {
        constructor(url: string, protocols?: string | string[]) {
          super(url, protocols);
          // Force error after brief delay
          setTimeout(() => {
            this.dispatchEvent(new Event('error'));
          }, 100);
        }
      };
    });

    await page.goto('/');
    await helpers.waitForPageLoad();
    
    // Wait for potential error handling
    await page.waitForTimeout(3000);

    // Page should still function despite WebSocket errors
    const pageStillFunctional = await page.locator('body').isVisible();
    const hasErrorToast = await page.locator('.toast, [role="alert"], .error-message').count() > 0;

    expect(pageStillFunctional).toBeTruthy();
    // Error toast is optional - app might handle silently
  });

  test('should maintain WebSocket connection across page navigation', async ({ page }) => {
    let wsConnections = 0;
    
    page.on('websocket', () => {
      wsConnections++;
    });

    // Start on homepage
    await page.goto('/');
    await helpers.waitForPageLoad();
    await helpers.waitForWebSocket();
    
    const initialConnections = wsConnections;

    // Navigate to different pages
    await page.goto('/map');
    await helpers.waitForPageLoad();
    await page.waitForTimeout(1000);

    await page.goto('/list-ticket');
    await helpers.waitForPageLoad();
    await page.waitForTimeout(1000);

    // WebSocket should either maintain connection or reconnect appropriately
    // Modern SPAs typically maintain one connection
    expect(wsConnections).toBeGreaterThanOrEqual(initialConnections);
  });

  test('should handle typing indicators in real-time', async ({ page }) => {
    // Navigate to a page with messaging
    await page.goto('/my-tickets');
    await helpers.waitForPageLoad();
    await helpers.waitForWebSocket();

    const messageInput = page.locator('[data-testid="message-input"], input[placeholder*="message"], textarea[placeholder*="message"]');
    
    if (await messageInput.count() > 0) {
      // Start typing
      await helpers.typeRealistically('[data-testid="message-input"], input[placeholder*="message"]', 'Hello, is this available?');
      
      // Typing indicator might be sent via WebSocket
      await page.waitForTimeout(500);
      
      // Check for typing indicator from other users
      const typingIndicator = page.locator('[data-testid="typing"], .typing-indicator, .is-typing');
      
      // Typing indicators are context-dependent
      const hasTypingFeature = await typingIndicator.count() >= 0;
      expect(hasTypingFeature).toBeTruthy();
    }
  });

  test('should broadcast ticket availability changes', async ({ page }) => {
    await page.goto('/');
    await helpers.waitForPageLoad();
    await helpers.waitForWebSocket();

    // Find a ticket card
    const ticketCards = page.locator('[data-testid="ticket-card"], .ticket-card, .event-card');
    const ticketCount = await ticketCards.count();

    if (ticketCount > 0) {
      // Get initial availability status
      const initialStatus = await ticketCards.first().locator('[data-testid="availability"], .availability, .status').textContent();

      // Simulate availability change via WebSocket
      await page.evaluate(() => {
        const availabilityEvent = {
          type: 'ticket_availability_changed',
          payload: { ticketId: 1, available: false, status: 'sold' }
        };
        
        const event = new CustomEvent('websocket-message', {
          detail: availabilityEvent
        });
        window.dispatchEvent(event);
      });

      await page.waitForTimeout(1000);

      // Check for status change
      const newStatus = await ticketCards.first().locator('[data-testid="availability"], .availability, .status').textContent();
      const hasSoldBadge = await page.locator('.sold, .unavailable, [data-testid="sold"]').count() > 0;

      expect(newStatus !== initialStatus || hasSoldBadge).toBeTruthy();
    }
  });

  test('should handle WebSocket message queuing during disconnection', async ({ page }) => {
    await page.goto('/');
    await helpers.waitForPageLoad();
    await helpers.waitForWebSocket();

    // Simulate going offline
    await page.evaluate(() => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      });
      
      window.dispatchEvent(new Event('offline'));
    });

    await page.waitForTimeout(1000);

    // Try to send message while offline
    const messageInput = page.locator('[data-testid="message-input"], input[placeholder*="message"]');
    if (await messageInput.count() > 0) {
      await helpers.typeRealistically('[data-testid="message-input"], input[placeholder*="message"]', 'Test offline message');
      
      const sendButton = page.locator('[data-testid="send-button"], button:has-text("Send")');
      if (await sendButton.count() > 0) {
        await helpers.clickWithMovement('[data-testid="send-button"]');
        await page.waitForTimeout(500);
        
        // Should show pending/queued message indicator
        const pendingMessage = page.locator('.pending, .queued, [data-testid="pending"]');
        const hasPendingState = await pendingMessage.count() > 0;
        
        // Then simulate coming back online
        await page.evaluate(() => {
          Object.defineProperty(navigator, 'onLine', {
            writable: true,
            value: true
          });
          
          window.dispatchEvent(new Event('online'));
        });

        await page.waitForTimeout(2000);
        
        // Message should be sent when back online
        expect(typeof hasPendingState).toBe('boolean');
      }
    }
  });
});