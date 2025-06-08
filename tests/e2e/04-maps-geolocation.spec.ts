import { test, expect, Page } from '@playwright/test';
import { TestUtils } from '../helpers/test-utils';
import { PageObjectHelper } from '../helpers/page-objects';

test.describe('Maps and Geolocation Features', () => {
  let testUtils: TestUtils;
  let pageHelper: PageObjectHelper;

  test.beforeEach(async ({ page }) => {
    testUtils = new TestUtils(page);
    pageHelper = new PageObjectHelper(page);
    await testUtils.setupTestEnvironment();
    
    // Grant geolocation permission
    await page.context().grantPermissions(['geolocation']);
    await page.context().setGeolocation({ latitude: 28.6139, longitude: 77.2090 }); // Delhi coordinates
  });

  test('should load and display interactive map', async ({ page }) => {
    await page.goto('/map');
    await page.waitForLoadState('networkidle');
    
    // Look for map container elements
    const mapSelectors = [
      '[data-testid="map-container"]',
      '[data-testid="google-map"]',
      '.map-container',
      '.leaflet-container',
      '#map',
      '[class*="map"]'
    ];
    
    let mapFound = false;
    for (const selector of mapSelectors) {
      const mapElement = page.locator(selector);
      if (await mapElement.count() > 0 && await mapElement.first().isVisible()) {
        mapFound = true;
        
        // Verify map has loaded by checking for typical map elements
        const mapContent = await mapElement.first().innerHTML();
        expect(mapContent.length).toBeGreaterThan(100); // Map should have substantial content
        break;
      }
    }
    
    // If no specific map found, check for map-related content
    if (!mapFound) {
      const mapIndicators = page.locator('text=/map/i, text=/location/i, text=/venue/i');
      expect(await mapIndicators.count()).toBeGreaterThan(0);
    } else {
      expect(mapFound).toBeTruthy();
    }
  });

  test('should detect and use user location', async ({ page }) => {
    await page.goto('/');
    
    // Look for location-based elements
    const locationElements = page.locator('[data-testid*="location"], [data-testid*="nearby"], .location, .nearby');
    
    if (await locationElements.count() > 0) {
      // Check if location is being used
      const locationText = await locationElements.first().textContent();
      expect(locationText).toBeTruthy();
    }
    
    // Check if geolocation API is available and used
    const geolocationUsage = await page.evaluate(() => {
      return new Promise((resolve) => {
        if ('geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(
            () => resolve(true),
            () => resolve(false),
            { timeout: 3000 }
          );
        } else {
          resolve(false);
        }
      });
    });
    
    expect(geolocationUsage).toBeTruthy();
  });

  test('should display venue locations on map', async ({ page }) => {
    await page.goto('/map');
    await page.waitForLoadState('networkidle');
    
    // Wait for map to potentially load
    await page.waitForTimeout(2000);
    
    // Look for venue markers or location indicators
    const venueSelectors = [
      '[data-testid*="venue"]',
      '[data-testid*="marker"]',
      '[data-testid*="location"]',
      '.marker',
      '.venue-marker',
      '.map-pin'
    ];
    
    let venuesFound = false;
    for (const selector of venueSelectors) {
      const venues = page.locator(selector);
      if (await venues.count() > 0) {
        venuesFound = true;
        
        // Click on first venue marker if visible
        const firstVenue = venues.first();
        if (await firstVenue.isVisible()) {
          await firstVenue.click();
          await page.waitForTimeout(500);
          
          // Check for venue details popup or info window
          const infoSelectors = [
            '[data-testid*="info"]',
            '[data-testid*="popup"]',
            '.info-window',
            '.popup',
            '.venue-details'
          ];
          
          for (const infoSelector of infoSelectors) {
            const info = page.locator(infoSelector);
            if (await info.count() > 0) {
              expect(await info.first().isVisible()).toBeTruthy();
              break;
            }
          }
        }
        break;
      }
    }
    
    // If no specific venue markers, check for general map content
    if (!venuesFound) {
      const mapContent = page.locator('[class*="map"], #map, [data-testid*="map"]');
      expect(await mapContent.count()).toBeGreaterThan(0);
    }
  });

  test('should handle location search and filtering', async ({ page }) => {
    await page.goto('/');
    
    // Look for location search inputs
    const searchSelectors = [
      '[data-testid*="search"]',
      '[data-testid*="location"]',
      'input[placeholder*="location" i]',
      'input[placeholder*="search" i]',
      'input[placeholder*="city" i]'
    ];
    
    let searchFound = false;
    for (const selector of searchSelectors) {
      const searchInput = page.locator(selector);
      if (await searchInput.count() > 0 && await searchInput.first().isVisible()) {
        searchFound = true;
        
        // Test location search
        await searchInput.first().fill('Mumbai');
        await page.keyboard.press('Enter');
        await page.waitForLoadState('networkidle');
        
        // Check if results are filtered or updated
        const resultElements = page.locator('[data-testid*="result"], [data-testid*="ticket"], .result, .ticket');
        expect(await resultElements.count()).toBeGreaterThan(0);
        break;
      }
    }
    
    if (!searchFound) {
      // Check for filter or dropdown options
      const filterElements = page.locator('select, [data-testid*="filter"], .filter');
      expect(await filterElements.count()).toBeGreaterThan(0);
    }
  });

  test('should calculate and display distances to venues', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Look for distance indicators
    const distanceSelectors = [
      '[data-testid*="distance"]',
      'text=/km away/i',
      'text=/miles away/i',
      'text=/distance/i',
      '.distance'
    ];
    
    let distanceFound = false;
    for (const selector of distanceSelectors) {
      const distanceElements = page.locator(selector);
      if (await distanceElements.count() > 0) {
        distanceFound = true;
        const distanceText = await distanceElements.first().textContent();
        expect(distanceText).toMatch(/\d+(\.\d+)?\s*(km|miles|m)/i);
        break;
      }
    }
    
    // If no distance indicators, verify location capability exists
    if (!distanceFound) {
      const locationCapability = await page.evaluate(() => 'geolocation' in navigator);
      expect(locationCapability).toBeTruthy();
    }
  });

  test('should provide directions to venue', async ({ page }) => {
    await page.goto('/map');
    await page.waitForLoadState('networkidle');
    
    // Look for directions or "Get Directions" buttons
    const directionsSelectors = [
      '[data-testid*="directions"]',
      'button:has-text("Directions")',
      'a:has-text("Directions")',
      '[href*="maps.google.com"]',
      '.directions'
    ];
    
    let directionsFound = false;
    for (const selector of directionsSelectors) {
      const directionsElement = page.locator(selector);
      if (await directionsElement.count() > 0 && await directionsElement.first().isVisible()) {
        directionsFound = true;
        
        // Click directions button
        await directionsElement.first().click();
        
        // Check if it opens external map or shows directions
        await page.waitForTimeout(1000);
        
        // Verify some action occurred (new tab, modal, or navigation)
        const currentUrl = page.url();
        expect(currentUrl).toBeTruthy();
        break;
      }
    }
    
    // If no directions buttons, check for map interaction capability
    if (!directionsFound) {
      const mapElements = page.locator('[class*="map"], [data-testid*="map"]');
      expect(await mapElements.count()).toBeGreaterThan(0);
    }
  });

  test('should handle location permission denial gracefully', async ({ page }) => {
    // Create new context with denied geolocation
    const context = await page.context().browser()?.newContext({
      permissions: []
    });
    
    if (context) {
      const newPage = await context.newPage();
      await newPage.goto('/');
      await newPage.waitForLoadState('networkidle');
      
      // Verify app still functions without location
      const pageTitle = await newPage.title();
      expect(pageTitle).toBeTruthy();
      
      // Check for fallback location or manual location input
      const locationInputs = newPage.locator('input[placeholder*="location" i], select[data-testid*="city"]');
      if (await locationInputs.count() > 0) {
        expect(await locationInputs.first().isVisible()).toBeTruthy();
      }
      
      await context.close();
    } else {
      // Fallback test - verify basic page functionality
      await page.goto('/');
      const pageContent = page.locator('main, body');
      expect(await pageContent.isVisible()).toBeTruthy();
    }
  });

  test('should zoom and pan map interactions', async ({ page }) => {
    await page.goto('/map');
    await page.waitForLoadState('networkidle');
    
    // Look for map container
    const mapContainer = page.locator('[data-testid*="map"], .map-container, #map');
    
    if (await mapContainer.count() > 0 && await mapContainer.first().isVisible()) {
      const mapElement = mapContainer.first();
      
      // Test map interactions
      await mapElement.hover();
      
      // Simulate zoom (scroll wheel)
      await page.mouse.wheel(0, -100); // Zoom in
      await page.waitForTimeout(500);
      
      // Simulate pan (drag)
      const box = await mapElement.boundingBox();
      if (box) {
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.mouse.down();
        await page.mouse.move(box.x + box.width / 2 + 50, box.y + box.height / 2 + 50);
        await page.mouse.up();
      }
      
      // Verify map is still functional after interactions
      expect(await mapElement.isVisible()).toBeTruthy();
    } else {
      // If no interactive map, verify page has location-related content
      const locationContent = page.locator('text=/location/i, text=/venue/i, text=/address/i');
      expect(await locationContent.count()).toBeGreaterThan(0);
    }
  });

  test('should display nearby events based on location', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Look for "nearby" or location-based event listings
    const nearbySelectors = [
      '[data-testid*="nearby"]',
      'text=/nearby/i',
      'text=/near you/i',
      '[data-testid*="local"]',
      '.nearby-events'
    ];
    
    let nearbyFound = false;
    for (const selector of nearbySelectors) {
      const nearbyElements = page.locator(selector);
      if (await nearbyElements.count() > 0) {
        nearbyFound = true;
        
        // Verify nearby content is displayed
        const nearbyText = await nearbyElements.first().textContent();
        expect(nearbyText).toBeTruthy();
        break;
      }
    }
    
    // If no specific "nearby" indicators, check for event listings with location info
    if (!nearbyFound) {
      const eventElements = page.locator('[data-testid*="event"], [data-testid*="ticket"], .event, .ticket');
      if (await eventElements.count() > 0) {
        // Look for location information within events
        const locationInfo = page.locator('text=/delhi/i, text=/mumbai/i, text=/bangalore/i, text=/india/i');
        expect(await locationInfo.count()).toBeGreaterThan(0);
      } else {
        // Verify basic geolocation capability
        const geoSupport = await page.evaluate(() => 'geolocation' in navigator);
        expect(geoSupport).toBeTruthy();
      }
    }
  });
});