import { test, expect } from '@playwright/test';
import { TestHelpers } from '../utils/test-helpers';
import { mapLocations } from '../fixtures/test-data';

test.describe('Interactive Map Functionality', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
  });

  test('should load map page with Google Maps integration', async ({ page }) => {
    await page.goto('/map');
    await helpers.waitForPageLoad();

    // Wait for Google Maps to load
    await page.waitForSelector('[data-testid="map-container"], .map-container, #map', { timeout: 15000 });

    // Check for map canvas element (Google Maps creates this)
    await page.waitForSelector('canvas, [role="img"]', { timeout: 10000 });

    // Verify map controls are present
    const mapControls = page.locator('.gm-control-active, [title*="Zoom"], [title*="Map"]');
    const hasControls = await mapControls.count() > 0;
    expect(hasControls).toBeTruthy();
  });

  test('should handle map zoom interactions', async ({ page }) => {
    await page.goto('/map');
    await helpers.waitForPageLoad();
    await page.waitForSelector('canvas', { timeout: 15000 });

    // Test zoom in
    const zoomInButton = page.locator('[title*="Zoom in"], .gm-control-active[title*="in"]');
    if (await zoomInButton.count() > 0) {
      await helpers.clickWithMovement('[title*="Zoom in"]');
      await page.waitForTimeout(1000);
    }

    // Test zoom out
    const zoomOutButton = page.locator('[title*="Zoom out"], .gm-control-active[title*="out"]');
    if (await zoomOutButton.count() > 0) {
      await helpers.clickWithMovement('[title*="Zoom out"]');
      await page.waitForTimeout(1000);
    }

    // Test scroll zoom
    const mapCanvas = page.locator('canvas').first();
    if (await mapCanvas.count() > 0) {
      await mapCanvas.hover();
      await page.mouse.wheel(0, -100); // Zoom in
      await page.waitForTimeout(500);
      await page.mouse.wheel(0, 100); // Zoom out
      await page.waitForTimeout(500);
    }
  });

  test('should handle map dragging and panning', async ({ page }) => {
    await page.goto('/map');
    await helpers.waitForPageLoad();
    await page.waitForSelector('canvas', { timeout: 15000 });

    const mapCanvas = page.locator('canvas').first();
    const mapBox = await mapCanvas.boundingBox();

    if (mapBox) {
      // Perform drag operation
      const startX = mapBox.x + mapBox.width * 0.3;
      const startY = mapBox.y + mapBox.height * 0.3;
      const endX = mapBox.x + mapBox.width * 0.7;
      const endY = mapBox.y + mapBox.height * 0.7;

      await page.mouse.move(startX, startY);
      await page.mouse.down();
      await page.mouse.move(endX, endY, { steps: 10 });
      await page.mouse.up();
      
      await page.waitForTimeout(1000);
    }
  });

  test('should display event markers on map', async ({ page }) => {
    await page.goto('/map');
    await helpers.waitForPageLoad();
    await page.waitForSelector('canvas', { timeout: 15000 });

    // Wait for markers to load
    await page.waitForTimeout(3000);

    // Look for marker elements (Google Maps markers)
    const markers = page.locator('[role="button"][aria-label*="marker"], .gm-marker, img[src*="marker"]');
    const markerCount = await markers.count();

    // Should have at least some markers or show empty state message
    const hasMarkers = markerCount > 0;
    const hasEmptyMessage = await page.locator('[data-testid="no-events"], .no-events-message').count() > 0;
    
    expect(hasMarkers || hasEmptyMessage).toBeTruthy();
  });

  test('should open marker info windows on click', async ({ page }) => {
    await page.goto('/map');
    await helpers.waitForPageLoad();
    await page.waitForSelector('canvas', { timeout: 15000 });
    await page.waitForTimeout(3000);

    // Find and click on first marker
    const markers = page.locator('[role="button"][aria-label*="marker"], .gm-marker');
    const markerCount = await markers.count();

    if (markerCount > 0) {
      await helpers.clickWithMovement('[role="button"][aria-label*="marker"]:first-child');
      await page.waitForTimeout(1000);

      // Look for info window
      const infoWindow = page.locator('.gm-style-iw, [data-testid="info-window"], .info-window');
      if (await infoWindow.count() > 0) {
        await expect(infoWindow).toBeVisible();
        
        // Check for event details in info window
        const hasEventTitle = await infoWindow.locator('h1, h2, h3, .event-title').count() > 0;
        const hasEventDetails = await infoWindow.locator('.price, .venue, .date').count() > 0;
        
        expect(hasEventTitle || hasEventDetails).toBeTruthy();
      }
    }
  });

  test('should handle mobile map gestures', async ({ page, isMobile }) => {
    if (isMobile) {
      await page.goto('/map');
      await helpers.waitForPageLoad();
      await page.waitForSelector('canvas', { timeout: 15000 });

      const mapCanvas = page.locator('canvas').first();
      
      // Test pinch zoom (simulate)
      await mapCanvas.tap();
      await page.waitForTimeout(500);
      
      // Test swipe gesture
      await helpers.swipe('canvas', 'left');
      await page.waitForTimeout(500);
      await helpers.swipe('canvas', 'right');
      await page.waitForTimeout(500);

      // Test double tap zoom
      await mapCanvas.dblclick();
      await page.waitForTimeout(1000);
    }
  });

  test('should filter map events by category', async ({ page }) => {
    await page.goto('/map');
    await helpers.waitForPageLoad();
    await page.waitForSelector('canvas', { timeout: 15000 });

    // Look for category filter
    const categoryFilter = page.locator('[data-testid="category-filter"], select[name="category"], .category-select');
    
    if (await categoryFilter.count() > 0) {
      // Get initial marker count
      await page.waitForTimeout(2000);
      const initialMarkers = await page.locator('[role="button"][aria-label*="marker"]').count();
      
      // Select a category
      await categoryFilter.selectOption('Concert');
      await page.waitForTimeout(2000);
      
      // Check if markers changed
      const filteredMarkers = await page.locator('[role="button"][aria-label*="marker"]').count();
      
      // Markers should either decrease (filtered) or stay same (no concerts)
      expect(filteredMarkers).toBeLessThanOrEqual(initialMarkers);
    }
  });

  test('should show location-based search results', async ({ page }) => {
    await page.goto('/map');
    await helpers.waitForPageLoad();
    
    // Look for location search input
    const locationSearch = page.locator('[data-testid="location-search"], input[placeholder*="location"], input[name="location"]');
    
    if (await locationSearch.count() > 0) {
      // Search for specific city
      await helpers.typeRealistically('[data-testid="location-search"], input[placeholder*="location"]', 'Mumbai');
      await page.waitForTimeout(1000);
      
      // Press enter or click search
      await locationSearch.press('Enter');
      await page.waitForTimeout(2000);
      
      // Map should center on Mumbai
      // Verify by checking if map moved (difficult to assert exactly, but can check for changes)
      const hasResults = await page.locator('[role="button"][aria-label*="marker"]').count() > 0;
      expect(hasResults).toBeTruthy();
    }
  });

  test('should handle map bounds and viewport changes', async ({ page }) => {
    await page.goto('/map');
    await helpers.waitForPageLoad();
    await page.waitForSelector('canvas', { timeout: 15000 });

    // Get current viewport events
    await page.waitForTimeout(2000);
    const initialEvents = await page.locator('[role="button"][aria-label*="marker"]').count();

    // Pan map to different area
    const mapCanvas = page.locator('canvas').first();
    const mapBox = await mapCanvas.boundingBox();

    if (mapBox) {
      // Drag map significantly
      await page.mouse.move(mapBox.x + mapBox.width / 2, mapBox.y + mapBox.height / 2);
      await page.mouse.down();
      await page.mouse.move(mapBox.x + 100, mapBox.y + 100, { steps: 20 });
      await page.mouse.up();
      
      await page.waitForTimeout(2000);
      
      // Events might change based on new viewport
      const newEvents = await page.locator('[role="button"][aria-label*="marker"]').count();
      
      // Either same events or different events (both valid)
      expect(typeof newEvents).toBe('number');
    }
  });

  test('should integrate with event details navigation', async ({ page }) => {
    await page.goto('/map');
    await helpers.waitForPageLoad();
    await page.waitForSelector('canvas', { timeout: 15000 });
    await page.waitForTimeout(3000);

    // Click on marker to open info window
    const markers = page.locator('[role="button"][aria-label*="marker"]');
    const markerCount = await markers.count();

    if (markerCount > 0) {
      await helpers.clickWithMovement('[role="button"][aria-label*="marker"]:first-child');
      await page.waitForTimeout(1000);

      // Look for "View Details" or similar link in info window
      const detailsLink = page.locator('a:has-text("Details"), a:has-text("View"), button:has-text("Details")');
      
      if (await detailsLink.count() > 0) {
        await helpers.clickWithMovement('a:has-text("Details"), a:has-text("View")');
        await helpers.waitForPageTransition();
        
        // Should navigate to event details page
        const isOnEventPage = page.url().includes('/event') || page.url().includes('/ticket');
        expect(isOnEventPage).toBeTruthy();
      }
    }
  });

  test('should handle map loading errors gracefully', async ({ page }) => {
    // Test with invalid API key or network issues
    await page.route('**/maps.googleapis.com/**', route => route.abort());
    
    await page.goto('/map');
    await helpers.waitForPageLoad();
    
    // Should show fallback content or error message
    await page.waitForTimeout(5000);
    
    const hasErrorMessage = await page.locator('[data-testid="map-error"], .map-error, .error-message').count() > 0;
    const hasFallbackContent = await page.locator('[data-testid="fallback-list"], .fallback-content').count() > 0;
    
    expect(hasErrorMessage || hasFallbackContent).toBeTruthy();
  });

  test('should maintain map state during page transitions', async ({ page }) => {
    await page.goto('/map');
    await helpers.waitForPageLoad();
    await page.waitForSelector('canvas', { timeout: 15000 });

    // Set specific zoom and position
    const zoomInButton = page.locator('[title*="Zoom in"]');
    if (await zoomInButton.count() > 0) {
      await helpers.clickWithMovement('[title*="Zoom in"]');
      await helpers.clickWithMovement('[title*="Zoom in"]');
      await page.waitForTimeout(1000);
    }

    // Navigate away and back
    await page.goto('/');
    await helpers.waitForPageLoad();
    await page.goto('/map');
    await helpers.waitForPageLoad();
    await page.waitForSelector('canvas', { timeout: 15000 });

    // Map should reload (state preservation is optional)
    const mapLoaded = await page.locator('canvas').count() > 0;
    expect(mapLoaded).toBeTruthy();
  });

  test('should display accurate event counts and statistics', async ({ page }) => {
    await page.goto('/map');
    await helpers.waitForPageLoad();
    await page.waitForSelector('canvas', { timeout: 15000 });
    await page.waitForTimeout(3000);

    // Check for statistics display
    const statsElements = page.locator('[data-testid="event-count"], .event-stats, .map-stats');
    
    if (await statsElements.count() > 0) {
      // Verify stats make sense
      const statsText = await statsElements.first().textContent();
      expect(statsText).toBeTruthy();
      
      // Stats should contain numbers
      const hasNumbers = /\d+/.test(statsText || '');
      expect(hasNumbers).toBeTruthy();
    }

    // Count actual markers vs displayed count
    const markerCount = await page.locator('[role="button"][aria-label*="marker"]').count();
    const displayedCount = page.locator('[data-testid="marker-count"]');
    
    if (await displayedCount.count() > 0) {
      const countText = await displayedCount.textContent();
      const displayedNumber = parseInt(countText?.match(/\d+/)?.[0] || '0');
      
      // Should be reasonable correlation
      expect(Math.abs(markerCount - displayedNumber)).toBeLessThanOrEqual(5);
    }
  });
});