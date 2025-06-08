import { test, expect } from '@playwright/test';
import { TestUtils } from '../helpers/test-utils';

test.describe('Interactive Map Features', () => {
  let utils: TestUtils;

  test.beforeEach(async ({ page }) => {
    utils = new TestUtils(page);
    await utils.navigateToMap();
  });

  test('should render map with event markers', async ({ page }) => {
    // Wait for map to load
    await expect(page.locator('[data-testid="google-map"]')).toBeVisible();
    
    // Verify markers are present
    const markers = page.locator('[data-testid="map-marker"]');
    await expect(markers.first()).toBeVisible();
    
    // Count markers and validate against event data
    const markerCount = await markers.count();
    expect(markerCount).toBeGreaterThan(0);
  });

  test('should handle map interactions (zoom, pan)', async ({ page }) => {
    await utils.interactWithMap();
    
    // Verify map responds to interactions
    await page.mouse.wheel(0, -100); // Zoom in
    await page.waitForTimeout(500);
    
    await page.mouse.wheel(0, 100); // Zoom out
    await page.waitForTimeout(500);
    
    // Pan the map
    await page.mouse.move(300, 300);
    await page.mouse.down();
    await page.mouse.move(350, 350);
    await page.mouse.up();
    
    // Map should still be functional
    await expect(page.locator('[data-testid="google-map"]')).toBeVisible();
  });

  test('should display event details when clicking markers', async ({ page }) => {
    await utils.clickMapMarker(0);
    
    // Event details modal should appear
    await expect(page.locator('[data-testid="event-modal"]')).toBeVisible();
    await expect(page.locator('[data-testid="event-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="event-venue"]')).toBeVisible();
    await expect(page.locator('[data-testid="event-price"]')).toBeVisible();
  });

  test('should filter events by location bounds', async ({ page }) => {
    // Get initial marker count
    const initialMarkers = await page.locator('[data-testid="map-marker"]').count();
    
    // Apply location filter
    await page.click('[data-testid="location-filter"]');
    await page.selectOption('[data-testid="city-filter"]', 'Mumbai');
    await page.click('[data-testid="apply-filter"]');
    
    // Wait for map to update
    await page.waitForTimeout(1000);
    
    // Verify filtered results
    const filteredMarkers = await page.locator('[data-testid="map-marker"]').count();
    expect(filteredMarkers).toBeLessThanOrEqual(initialMarkers);
  });

  test('should sync map view with event list', async ({ page }) => {
    // Click on event in list
    await page.click('[data-testid="event-list-item"]');
    
    // Map should center on selected event
    await page.waitForTimeout(1000);
    
    // Verify map has updated
    await expect(page.locator('[data-testid="selected-marker"]')).toBeVisible();
  });

  test('should handle map loading errors gracefully', async ({ page }) => {
    // Simulate network issues for map tiles
    await page.route('**/maps.googleapis.com/**', route => route.abort());
    
    await page.reload();
    await page.waitForTimeout(2000);
    
    // Should show error state or fallback
    const mapError = page.locator('[data-testid="map-error"]');
    const mapFallback = page.locator('[data-testid="map-fallback"]');
    
    const hasErrorHandling = await mapError.isVisible() || await mapFallback.isVisible();
    expect(hasErrorHandling).toBeTruthy();
  });
});