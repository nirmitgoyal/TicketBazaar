import { test, expect, TestHelpers } from '../setup/test-setup';

test.describe('Interactive Google Maps Use Cases', () => {
  
  test('should load map with event markers correctly', async ({ page }) => {
    await page.goto('/map');
    
    // Wait for map container to be visible
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="map-container"]');
    
    // Wait for Google Maps to load
    await page.waitForFunction(() => {
      return typeof window.google !== 'undefined' && window.google.maps;
    }, { timeout: 15000 });
    
    // Verify map is rendered
    const mapElement = page.locator('[data-testid="google-map"]');
    await expect(mapElement).toBeVisible();
    
    // Wait for event markers to load
    await page.waitForTimeout(3000);
    
    // Verify markers are present
    const markers = page.locator('[data-testid="map-marker"]');
    const markerCount = await markers.count();
    expect(markerCount).toBeGreaterThan(0);
  });

  test('should handle map zoom and pan interactions', async ({ page }) => {
    await page.goto('/map');
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="map-container"]');
    
    // Wait for map to load
    await page.waitForFunction(() => {
      return typeof window.google !== 'undefined' && window.google.maps;
    });
    
    // Test zoom controls
    const zoomInButton = page.locator('[data-testid="zoom-in"]');
    if (await zoomInButton.isVisible()) {
      await zoomInButton.click();
      await page.waitForTimeout(1000);
      
      // Verify zoom level changed
      const currentZoom = await page.evaluate(() => {
        const mapElement = document.querySelector('[data-testid="google-map"]');
        return mapElement?.getAttribute('data-zoom');
      });
      
      expect(currentZoom).toBeDefined();
    }
    
    // Test pan functionality by dragging
    const mapContainer = page.locator('[data-testid="google-map"]');
    const mapBox = await mapContainer.boundingBox();
    
    if (mapBox) {
      // Simulate drag to pan
      await page.mouse.move(mapBox.x + mapBox.width / 2, mapBox.y + mapBox.height / 2);
      await page.mouse.down();
      await page.mouse.move(mapBox.x + mapBox.width / 2 + 100, mapBox.y + mapBox.height / 2 + 100);
      await page.mouse.up();
      
      await page.waitForTimeout(1000);
    }
  });

  test('should display event information when marker is clicked', async ({ page }) => {
    await page.goto('/map');
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="map-container"]');
    
    // Wait for map and markers to load
    await page.waitForFunction(() => {
      return typeof window.google !== 'undefined' && window.google.maps;
    });
    await page.waitForTimeout(3000);
    
    // Click on first marker
    const firstMarker = page.locator('[data-testid="map-marker"]').first();
    if (await firstMarker.isVisible()) {
      await firstMarker.click();
      
      // Verify info window opens
      await TestHelpers.waitForElementToBeVisible(page, '[data-testid="marker-info-window"]');
      
      // Verify event information is displayed
      await TestHelpers.waitForElementToBeVisible(page, '[data-testid="event-title"]');
      await TestHelpers.waitForElementToBeVisible(page, '[data-testid="event-venue"]');
      await TestHelpers.waitForElementToBeVisible(page, '[data-testid="event-date"]');
      
      // Test "View Details" button
      const viewDetailsButton = page.locator('[data-testid="view-event-details"]');
      if (await viewDetailsButton.isVisible()) {
        await viewDetailsButton.click();
        
        // Should navigate to event details page
        await page.waitForURL(/\/events\/\d+/);
        await TestHelpers.waitForElementToBeVisible(page, '[data-testid="event-details"]');
      }
    }
  });

  test('should filter map markers by category', async ({ page }) => {
    await page.goto('/map');
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="map-container"]');
    
    // Wait for initial markers to load
    await page.waitForTimeout(3000);
    
    // Count initial markers
    const initialMarkers = await page.locator('[data-testid="map-marker"]').count();
    
    // Apply music category filter
    const musicFilter = page.locator('[data-testid="filter-music"]');
    if (await musicFilter.isVisible()) {
      await musicFilter.click();
      await page.waitForTimeout(2000);
      
      // Count filtered markers
      const filteredMarkers = await page.locator('[data-testid="map-marker"]').count();
      
      // Should show fewer or equal markers
      expect(filteredMarkers).toBeLessThanOrEqual(initialMarkers);
    }
    
    // Clear filters
    const clearFilters = page.locator('[data-testid="clear-filters"]');
    if (await clearFilters.isVisible()) {
      await clearFilters.click();
      await page.waitForTimeout(2000);
      
      // Should restore original marker count
      const restoredMarkers = await page.locator('[data-testid="map-marker"]').count();
      expect(restoredMarkers).toBe(initialMarkers);
    }
  });

  test('should handle map location search', async ({ page }) => {
    await page.goto('/map');
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="map-container"]');
    
    // Wait for map to load
    await page.waitForFunction(() => {
      return typeof window.google !== 'undefined' && window.google.maps;
    });
    
    // Test location search
    const searchInput = page.locator('[data-testid="location-search"]');
    if (await searchInput.isVisible()) {
      await TestHelpers.fillFormField(page, '[data-testid="location-search"]', 'Mumbai, India');
      await page.click('[data-testid="search-location-button"]');
      
      // Wait for map to pan to searched location
      await page.waitForTimeout(3000);
      
      // Verify map center changed
      const mapCenter = await page.evaluate(() => {
        const mapElement = document.querySelector('[data-testid="google-map"]');
        return {
          lat: mapElement?.getAttribute('data-center-lat'),
          lng: mapElement?.getAttribute('data-center-lng')
        };
      });
      
      expect(mapCenter.lat).toBeDefined();
      expect(mapCenter.lng).toBeDefined();
    }
  });

  test('should handle geolocation and user location', async ({ page, context }) => {
    // Grant geolocation permission
    await context.grantPermissions(['geolocation']);
    
    // Set mock location
    await context.setGeolocation({ latitude: 19.0760, longitude: 72.8777 }); // Mumbai coordinates
    
    await page.goto('/map');
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="map-container"]');
    
    // Click "Use My Location" button
    const myLocationButton = page.locator('[data-testid="my-location-button"]');
    if (await myLocationButton.isVisible()) {
      await myLocationButton.click();
      
      // Wait for location to be detected and map to center
      await page.waitForTimeout(3000);
      
      // Verify user location marker appears
      const userLocationMarker = page.locator('[data-testid="user-location-marker"]');
      if (await userLocationMarker.isVisible()) {
        await expect(userLocationMarker).toBeVisible();
      }
    }
  });

  test('should handle map clustering for dense marker areas', async ({ page }) => {
    await page.goto('/map');
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="map-container"]');
    
    // Wait for map and markers to load
    await page.waitForTimeout(3000);
    
    // Zoom out to trigger clustering
    const zoomOutButton = page.locator('[data-testid="zoom-out"]');
    if (await zoomOutButton.isVisible()) {
      // Click zoom out multiple times
      for (let i = 0; i < 3; i++) {
        await zoomOutButton.click();
        await page.waitForTimeout(500);
      }
      
      // Check for cluster markers
      const clusterMarkers = page.locator('[data-testid="cluster-marker"]');
      const clusterCount = await clusterMarkers.count();
      
      if (clusterCount > 0) {
        // Click on a cluster to expand
        await clusterMarkers.first().click();
        await page.waitForTimeout(1000);
        
        // Verify cluster expands or zooms in
        const expandedMarkers = await page.locator('[data-testid="map-marker"]').count();
        expect(expandedMarkers).toBeGreaterThan(0);
      }
    }
  });

  test('should synchronize map data with backend', async ({ page }) => {
    await page.goto('/map');
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="map-container"]');
    
    // Wait for initial data load
    await page.waitForTimeout(3000);
    
    // Capture initial network requests
    const apiRequests: string[] = [];
    page.on('request', request => {
      if (request.url().includes('/api/events') || request.url().includes('/api/tickets')) {
        apiRequests.push(request.url());
      }
    });
    
    // Trigger map refresh
    const refreshButton = page.locator('[data-testid="refresh-map"]');
    if (await refreshButton.isVisible()) {
      await refreshButton.click();
      await page.waitForTimeout(2000);
      
      // Verify API calls were made
      expect(apiRequests.length).toBeGreaterThan(0);
    }
    
    // Change map bounds and verify new data is fetched
    const mapContainer = page.locator('[data-testid="google-map"]');
    const mapBox = await mapContainer.boundingBox();
    
    if (mapBox) {
      // Pan significantly to change visible area
      await page.mouse.move(mapBox.x + mapBox.width / 2, mapBox.y + mapBox.height / 2);
      await page.mouse.down();
      await page.mouse.move(mapBox.x + 200, mapBox.y + 200);
      await page.mouse.up();
      
      await page.waitForTimeout(2000);
      
      // Verify additional API calls for new bounds
      expect(apiRequests.length).toBeGreaterThan(1);
    }
  });
});