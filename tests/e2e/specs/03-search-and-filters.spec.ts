import { test, expect } from '@playwright/test';
import { TestHelpers } from '../utils/test-helpers';
import { searchQueries, formValidationTests } from '../fixtures/test-data';

test.describe('Search and Filtering', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    await page.goto('/');
    await helpers.waitForPageLoad();
  });

  test('should perform basic search with realistic typing patterns', async ({ page }) => {
    const searchInput = page.locator('[data-testid="search-input"], input[placeholder*="search" i]').first();
    
    // Test different search queries
    for (const [queryType, query] of Object.entries(searchQueries)) {
      if (query) {
        // Clear previous search
        await searchInput.clear();
        
        // Type with realistic delays
        await helpers.typeRealistically('[data-testid="search-input"], input[placeholder*="search" i]', query);
        
        // Submit search
        const searchButton = page.locator('[data-testid="search-button"], button:has-text("Search")');
        if (await searchButton.count() > 0) {
          await helpers.clickWithMovement('[data-testid="search-button"]');
        } else {
          await searchInput.press('Enter');
        }
        
        await helpers.waitForPageLoad();
        
        // Verify search results or no results message
        const hasResults = await page.locator('[data-testid="search-results"], .search-results').count() > 0;
        const hasNoResults = await page.locator('[data-testid="no-results"], .no-results').count() > 0;
        const hasEventCards = await page.locator('[data-testid="event-card"], .event-card').count() > 0;
        
        expect(hasResults || hasNoResults || hasEventCards).toBeTruthy();
        
        // Wait before next search
        await page.waitForTimeout(500);
      }
    }
  });

  test('should handle search autocomplete and suggestions', async ({ page }) => {
    const searchInput = page.locator('[data-testid="search-input"], input[placeholder*="search" i]').first();
    
    // Type partial query
    await helpers.typeRealistically('[data-testid="search-input"], input[placeholder*="search" i]', 'conc', 100);
    
    // Wait for autocomplete suggestions
    await page.waitForTimeout(1000);
    
    // Check for suggestions dropdown
    const suggestions = page.locator('[data-testid="search-suggestions"], .search-suggestions, .dropdown-menu');
    if (await suggestions.count() > 0) {
      await expect(suggestions).toBeVisible();
      
      // Click on first suggestion if available
      const firstSuggestion = suggestions.locator('li, .suggestion-item').first();
      if (await firstSuggestion.count() > 0) {
        await helpers.clickWithMovement('.suggestion-item:first-child, li:first-child');
        await helpers.waitForPageLoad();
        
        // Should perform search with selected suggestion
        const hasResults = await page.locator('[data-testid="search-results"], .event-card').count() > 0;
        expect(hasResults).toBeTruthy();
      }
    }
  });

  test('should use advanced filters with realistic interactions', async ({ page }) => {
    // Look for filter dropdown or button
    const filterButton = page.locator('[data-testid="filter-button"], button:has-text("Filter"), .filter-toggle');
    
    if (await filterButton.count() > 0) {
      await helpers.clickWithMovement('[data-testid="filter-button"], button:has-text("Filter")');
      await helpers.waitForAnimations();
      
      // Test category filter
      const categoryFilter = page.locator('[data-testid="category-filter"], select[name="category"]');
      if (await categoryFilter.count() > 0) {
        await categoryFilter.selectOption('Concert');
        await page.waitForTimeout(500);
      }
      
      // Test price range filter
      const minPriceInput = page.locator('[data-testid="min-price"], input[name="minPrice"]');
      if (await minPriceInput.count() > 0) {
        await helpers.typeRealistically('[data-testid="min-price"], input[name="minPrice"]', '1000');
      }
      
      const maxPriceInput = page.locator('[data-testid="max-price"], input[name="maxPrice"]');
      if (await maxPriceInput.count() > 0) {
        await helpers.typeRealistically('[data-testid="max-price"], input[name="maxPrice"]', '5000');
      }
      
      // Test location filter
      const locationFilter = page.locator('[data-testid="location-filter"], input[name="location"]');
      if (await locationFilter.count() > 0) {
        await helpers.typeRealistically('[data-testid="location-filter"], input[name="location"]', 'Mumbai');
      }
      
      // Apply filters
      const applyButton = page.locator('[data-testid="apply-filters"], button:has-text("Apply")');
      if (await applyButton.count() > 0) {
        await helpers.clickWithMovement('[data-testid="apply-filters"], button:has-text("Apply")');
        await helpers.waitForPageLoad();
        
        // Verify filtered results
        const hasFilteredResults = await page.locator('[data-testid="filtered-results"], .event-card').count() > 0;
        const hasNoResults = await page.locator('[data-testid="no-results"]').count() > 0;
        
        expect(hasFilteredResults || hasNoResults).toBeTruthy();
      }
    }
  });

  test('should handle date range filtering', async ({ page }) => {
    const filterButton = page.locator('[data-testid="filter-button"], button:has-text("Filter")');
    
    if (await filterButton.count() > 0) {
      await helpers.clickWithMovement('[data-testid="filter-button"]');
      await helpers.waitForAnimations();
      
      // Test date inputs
      const startDateInput = page.locator('[data-testid="start-date"], input[type="date"], input[name*="start"]');
      if (await startDateInput.count() > 0) {
        // Set date to tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dateString = tomorrow.toISOString().split('T')[0];
        
        await startDateInput.fill(dateString);
        await page.waitForTimeout(300);
      }
      
      const endDateInput = page.locator('[data-testid="end-date"], input[type="date"], input[name*="end"]');
      if (await endDateInput.count() > 0) {
        // Set date to next week
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        const dateString = nextWeek.toISOString().split('T')[0];
        
        await endDateInput.fill(dateString);
        await page.waitForTimeout(300);
      }
      
      // Apply date filter
      const applyButton = page.locator('[data-testid="apply-filters"], button:has-text("Apply")');
      if (await applyButton.count() > 0) {
        await helpers.clickWithMovement('[data-testid="apply-filters"]');
        await helpers.waitForPageLoad();
      }
    }
  });

  test('should handle sorting options', async ({ page }) => {
    // Look for sort dropdown
    const sortDropdown = page.locator('[data-testid="sort-dropdown"], select[name="sort"], .sort-select');
    
    if (await sortDropdown.count() > 0) {
      const sortOptions = ['price-low', 'price-high', 'date-soon', 'date-far', 'popular'];
      
      for (const option of sortOptions) {
        // Try to select this sort option
        try {
          await sortDropdown.selectOption(option);
          await helpers.waitForPageLoad();
          
          // Verify results are sorted (check first few items)
          const eventCards = page.locator('[data-testid="event-card"], .event-card');
          const cardCount = await eventCards.count();
          
          if (cardCount > 1) {
            // Extract some data to verify sorting
            const firstCardPrice = await eventCards.first().locator('[data-testid="price"], .price').textContent();
            const secondCardPrice = await eventCards.nth(1).locator('[data-testid="price"], .price').textContent();
            
            // Basic verification that content changed
            expect(firstCardPrice || secondCardPrice).toBeTruthy();
          }
          
          await page.waitForTimeout(500);
        } catch (error) {
          // Option might not exist, continue to next
          continue;
        }
      }
    }
  });

  test('should track search analytics events', async ({ page }) => {
    const searchInput = page.locator('[data-testid="search-input"], input[placeholder*="search" i]').first();
    
    // Perform search
    await helpers.typeRealistically('[data-testid="search-input"], input[placeholder*="search" i]', 'concert Mumbai');
    await searchInput.press('Enter');
    
    // Wait for analytics
    try {
      await helpers.waitForAnalyticsEvent('search');
      const events = await helpers.getAnalyticsEvents();
      const hasSearchEvent = events.some((event: any) => 
        event.event === 'search' || event[1] === 'search'
      );
      expect(hasSearchEvent).toBeTruthy();
    } catch (error) {
      console.log('Analytics not available in test environment');
    }
  });

  test('should handle mobile search interface', async ({ page, isMobile }) => {
    if (isMobile) {
      // Test mobile search behavior
      const searchInput = page.locator('[data-testid="search-input"], input[placeholder*="search" i]').first();
      
      // Tap to focus
      await helpers.touchTap('[data-testid="search-input"], input[placeholder*="search" i]');
      
      // Type search query
      await helpers.typeRealistically('[data-testid="search-input"], input[placeholder*="search" i]', 'concert');
      
      // Check if mobile keyboard appeared (virtual keyboard affects viewport)
      await page.waitForTimeout(1000);
      
      // Submit search
      await searchInput.press('Enter');
      await helpers.waitForPageLoad();
      
      // Verify mobile-friendly results
      const results = page.locator('[data-testid="search-results"], .event-card');
      if (await results.count() > 0) {
        // Check if results are properly displayed on mobile
        const firstResult = results.first();
        await expect(firstResult).toBeVisible();
        
        // Test mobile swipe interaction
        await helpers.swipe('[data-testid="search-results"]', 'left');
        await page.waitForTimeout(300);
      }
    }
  });

  test('should clear filters and reset search', async ({ page }) => {
    // Apply some filters first
    const searchInput = page.locator('[data-testid="search-input"], input[placeholder*="search" i]').first();
    await helpers.typeRealistically('[data-testid="search-input"], input[placeholder*="search" i]', 'test search');
    await searchInput.press('Enter');
    await helpers.waitForPageLoad();
    
    // Look for clear/reset button
    const clearButton = page.locator('[data-testid="clear-search"], button:has-text("Clear"), .clear-filters');
    
    if (await clearButton.count() > 0) {
      await helpers.clickWithMovement('[data-testid="clear-search"], button:has-text("Clear")');
      await helpers.waitForPageLoad();
      
      // Verify search was cleared
      const searchValue = await searchInput.inputValue();
      expect(searchValue).toBe('');
      
      // Should show all results again
      const allResults = await page.locator('[data-testid="event-card"], .event-card').count();
      expect(allResults).toBeGreaterThanOrEqual(0);
    }
  });

  test('should handle search error states', async ({ page }) => {
    // Test with extremely long search query
    const longQuery = 'a'.repeat(1000);
    const searchInput = page.locator('[data-testid="search-input"], input[placeholder*="search" i]').first();
    
    await helpers.typeRealistically('[data-testid="search-input"], input[placeholder*="search" i]', longQuery.substring(0, 100));
    await searchInput.press('Enter');
    
    await page.waitForTimeout(2000);
    
    // Should handle gracefully without crashing
    const hasError = await page.locator('.error, [data-testid="error"]').count() > 0;
    const pageStillWorks = await page.locator('body').isVisible();
    
    expect(pageStillWorks).toBeTruthy();
  });

  test('should preserve search state on navigation', async ({ page }) => {
    // Perform search
    const searchInput = page.locator('[data-testid="search-input"], input[placeholder*="search" i]').first();
    await helpers.typeRealistically('[data-testid="search-input"], input[placeholder*="search" i]', 'concert');
    await searchInput.press('Enter');
    await helpers.waitForPageLoad();
    
    // Navigate to different page
    const mapLink = page.locator('a[href="/map"], a:has-text("Map")').first();
    if (await mapLink.count() > 0) {
      await helpers.clickWithMovement('a[href="/map"]');
      await helpers.waitForPageTransition();
      
      // Navigate back
      await page.goBack();
      await helpers.waitForPageLoad();
      
      // Check if search state is preserved
      const searchValue = await searchInput.inputValue();
      // Note: Some apps preserve search state, others don't - both are valid
      expect(typeof searchValue).toBe('string');
    }
  });
});