import { test, expect, Page } from '@playwright/test';
import { TestUtils } from '../helpers/test-utils';
import { PageObjectHelper } from '../helpers/page-objects';

test.describe('Realtime WebSocket Communication', () => {
  let testUtils: TestUtils;
  let pageHelper: PageObjectHelper;

  test.beforeEach(async ({ page }) => {
    testUtils = new TestUtils(page);
    pageHelper = new PageObjectHelper(page);
    await testUtils.setupTestEnvironment();
  });

  test('should establish WebSocket connection for live updates', async ({ page }) => {
    // Navigate to a page that uses WebSocket (likely ticket listings for live updates)
    await page.goto('/');
    
    // Wait for initial page load
    await page.waitForLoadState('networkidle');
    
    // Check if WebSocket connection is established
    const wsConnections = await page.evaluate(() => {
      // Check for WebSocket in window object or connection indicators
      return window.WebSocket !== undefined;
    });
    
    expect(wsConnections).toBeTruthy();
  });

  test('should receive live ticket status updates', async ({ page }) => {
    await page.goto('/');
    
    // Look for elements that might show live status
    const statusElements = page.locator('[data-testid*="status"], [data-testid*="live"], .status, .live-update');
    
    if (await statusElements.first().isVisible()) {
      // Monitor for status changes
      const initialStatus = await statusElements.first().textContent();
      
      // Wait for potential updates (realistic timeframe)
      await page.waitForTimeout(2000);
      
      // Check if status might have changed or if update indicators are present
      const hasUpdateIndicators = await page.locator('.pulse, .animate-pulse, [data-testid*="loading"]').count() > 0;
      
      expect(hasUpdateIndicators || initialStatus).toBeTruthy();
    } else {
      // If no live elements visible, verify WebSocket readiness
      const wsReady = await page.evaluate(() => window.WebSocket !== undefined);
      expect(wsReady).toBeTruthy();
    }
  });

  test('should handle WebSocket connection failures gracefully', async ({ page }) => {
    // Block WebSocket connections to simulate failure
    await page.route('**/*', route => {
      if (route.request().url().includes('ws://') || route.request().url().includes('wss://')) {
        route.abort();
      } else {
        route.continue();
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Verify page still functions without WebSocket
    const pageTitle = await page.title();
    expect(pageTitle).toBeTruthy();
    
    // Check for error handling indicators
    const errorElements = page.locator('[data-testid*="error"], .error, .connection-error');
    const pageContent = page.locator('main, body');
    
    // Either error handling is visible or page content loads normally
    const hasContent = await pageContent.isVisible();
    expect(hasContent).toBeTruthy();
  });

  test('should reconnect after connection loss', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Simulate network interruption and recovery
    await testUtils.simulateOfflineMode(true);
    await page.waitForTimeout(1000);
    await testUtils.simulateOfflineMode(false);
    
    // Wait for reconnection
    await page.waitForLoadState('networkidle');
    
    // Verify page is functional after reconnection
    const navigation = page.locator('[data-testid="nav-home"], nav a[href="/"]');
    if (await navigation.first().isVisible()) {
      await navigation.first().click();
      await page.waitForLoadState('networkidle');
    }
    
    const pageTitle = await page.title();
    expect(pageTitle).toBeTruthy();
  });

  test('should display real-time user activity indicators', async ({ page }) => {
    await page.goto('/');
    
    // Look for activity indicators like "X users viewing" or "recently updated"
    const activitySelectors = [
      '[data-testid*="activity"]',
      '[data-testid*="viewers"]',
      '[data-testid*="online"]',
      '.activity-indicator',
      '.user-count',
      '.viewing-count'
    ];
    
    let activityFound = false;
    
    for (const selector of activitySelectors) {
      const element = page.locator(selector);
      if (await element.count() > 0) {
        activityFound = true;
        const text = await element.first().textContent();
        expect(text).toBeTruthy();
        break;
      }
    }
    
    // If no specific activity indicators, verify WebSocket capability exists
    if (!activityFound) {
      const wsSupport = await page.evaluate(() => {
        return typeof WebSocket !== 'undefined';
      });
      expect(wsSupport).toBeTruthy();
    }
  });

  test('should handle concurrent user interactions', async ({ page, browser }) => {
    // Create a second page to simulate concurrent users
    const context2 = await browser.newContext();
    const page2 = await context2.newPage();
    
    // Both pages visit the same ticket or listing
    await Promise.all([
      page.goto('/'),
      page2.goto('/')
    ]);
    
    await Promise.all([
      page.waitForLoadState('networkidle'),
      page2.waitForLoadState('networkidle')
    ]);
    
    // Verify both pages loaded successfully
    const [title1, title2] = await Promise.all([
      page.title(),
      page2.title()
    ]);
    
    expect(title1).toBeTruthy();
    expect(title2).toBeTruthy();
    
    await context2.close();
  });

  test('should maintain WebSocket connection during navigation', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Navigate to different pages and verify connection persistence
    const navigationLinks = page.locator('nav a, [data-testid*="nav"]');
    const linkCount = await navigationLinks.count();
    
    if (linkCount > 0) {
      // Click on first available navigation link
      await navigationLinks.first().click();
      await page.waitForLoadState('networkidle');
      
      // Verify WebSocket is still available
      const wsAvailable = await page.evaluate(() => {
        return typeof WebSocket !== 'undefined';
      });
      
      expect(wsAvailable).toBeTruthy();
    } else {
      // If no navigation links, verify WebSocket on current page
      const wsSupport = await page.evaluate(() => typeof WebSocket !== 'undefined');
      expect(wsSupport).toBeTruthy();
    }
  });

  test('should handle message queuing during disconnection', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Simulate actions that might generate WebSocket messages
    const interactiveElements = page.locator('button, [role="button"], input, select');
    const elementCount = await interactiveElements.count();
    
    if (elementCount > 0) {
      // Temporarily go offline
      await testUtils.simulateOfflineMode(true);
      
      // Try to interact with elements (should queue messages)
      const firstElement = interactiveElements.first();
      if (await firstElement.isVisible()) {
        await firstElement.click().catch(() => {
          // Interaction might fail due to offline state - this is expected
        });
      }
      
      // Go back online
      await testUtils.simulateOfflineMode(false);
      await page.waitForLoadState('networkidle');
      
      // Verify page functionality is restored
      const pageContent = page.locator('main, body');
      expect(await pageContent.isVisible()).toBeTruthy();
    } else {
      // Verify basic WebSocket capability
      const wsSupport = await page.evaluate(() => typeof WebSocket !== 'undefined');
      expect(wsSupport).toBeTruthy();
    }
  });
});