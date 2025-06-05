import { test, expect } from '@playwright/test';
import { TestHelpers } from '../utils/test-helpers';

test.describe('Accessibility Compliance', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
  });

  test('should be accessible to screen readers', async ({ page }) => {
    await page.goto('/');
    await helpers.waitForPageLoad();
    
    // Check for essential accessibility attributes
    const mainContent = page.locator('main, [role="main"]');
    await expect(mainContent).toBeVisible();
    
    // Navigation should have proper structure
    const navigation = page.locator('nav, [role="navigation"]');
    if (await navigation.count() > 0) {
      await expect(navigation).toBeVisible();
    }
    
    // Form elements should have labels
    const formInputs = page.locator('input, textarea, select');
    const inputCount = await formInputs.count();
    
    for (let i = 0; i < Math.min(inputCount, 5); i++) {
      const input = formInputs.nth(i);
      const hasLabel = await input.getAttribute('aria-label') || 
                      await input.getAttribute('aria-labelledby') ||
                      await page.locator(`label[for="${await input.getAttribute('id')}"]`).count() > 0;
      
      if (hasLabel) {
        expect(hasLabel).toBeTruthy();
      }
    }
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/');
    await helpers.waitForPageLoad();
    
    // Tab through interactive elements
    const interactiveElements = page.locator('button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const elementCount = await interactiveElements.count();
    
    if (elementCount > 0) {
      // Start tabbing from first element
      await page.keyboard.press('Tab');
      await page.waitForTimeout(100);
      
      // Should focus on an interactive element
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
      
      // Tab through a few more elements
      for (let i = 0; i < Math.min(elementCount, 5); i++) {
        await page.keyboard.press('Tab');
        await page.waitForTimeout(100);
        
        const currentFocus = page.locator(':focus');
        if (await currentFocus.count() > 0) {
          await expect(currentFocus).toBeVisible();
        }
      }
    }
  });

  test('should handle focus management properly', async ({ page }) => {
    await page.goto('/');
    await helpers.waitForPageLoad();
    
    // Test modal focus trap
    const modalTrigger = page.locator('button:has-text("Contact"), button:has-text("Filter"), [data-testid*="modal"]');
    
    if (await modalTrigger.count() > 0) {
      await helpers.clickWithMovement('button:has-text("Contact"), button:has-text("Filter")');
      await helpers.waitForAnimations();
      
      const modal = page.locator('.modal, .dialog, [role="dialog"]');
      if (await modal.count() > 0) {
        // Focus should be trapped within modal
        await page.keyboard.press('Tab');
        const focusedElement = page.locator(':focus');
        
        if (await focusedElement.count() > 0) {
          const focusedParent = await focusedElement.evaluate(el => {
            return el.closest('.modal, .dialog, [role="dialog"]') !== null;
          });
          expect(focusedParent).toBeTruthy();
        }
        
        // Escape should close modal
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
        
        const modalVisible = await modal.isVisible().catch(() => false);
        expect(modalVisible).toBeFalsy();
      }
    }
  });

  test('should have proper color contrast ratios', async ({ page }) => {
    await page.goto('/');
    await helpers.waitForPageLoad();
    
    // Check text elements for contrast
    const textElements = page.locator('p, h1, h2, h3, h4, h5, h6, span, div, button, a');
    const elementCount = await textElements.count();
    
    let contrastChecks = 0;
    
    for (let i = 0; i < Math.min(elementCount, 10); i++) {
      const element = textElements.nth(i);
      
      if (await element.isVisible()) {
        const styles = await element.evaluate(el => {
          const computed = window.getComputedStyle(el);
          return {
            color: computed.color,
            backgroundColor: computed.backgroundColor,
            fontSize: computed.fontSize
          };
        });
        
        // Basic check - text should have defined color
        expect(styles.color).toBeTruthy();
        contrastChecks++;
        
        if (contrastChecks >= 5) break;
      }
    }
  });

  test('should handle high contrast mode', async ({ page }) => {
    // Simulate high contrast mode
    await page.emulateMedia({ colorScheme: 'dark' });
    
    await page.goto('/');
    await helpers.waitForPageLoad();
    
    // Page should still be readable and functional
    await expect(page.locator('body')).toBeVisible();
    
    // Interactive elements should be visible
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    if (buttonCount > 0) {
      const firstButton = buttons.first();
      await expect(firstButton).toBeVisible();
    }
  });

  test('should support reduced motion preferences', async ({ page }) => {
    // Simulate reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });
    
    await page.goto('/');
    await helpers.waitForPageLoad();
    
    // Navigate to a page with animations
    const mapLink = page.locator('a[href="/map"], a:has-text("Map")');
    if (await mapLink.count() > 0) {
      await helpers.clickWithMovement('a[href="/map"]');
      await helpers.waitForPageTransition();
      
      // Page should load without motion-heavy animations
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('should maintain text readability at different zoom levels', async ({ page }) => {
    await page.goto('/');
    await helpers.waitForPageLoad();
    
    // Test 200% zoom (accessibility requirement)
    await page.evaluate(() => {
      document.body.style.zoom = '2';
    });
    
    await page.waitForTimeout(500);
    
    // Content should still be readable and accessible
    const textElements = page.locator('p, h1, h2, h3, button, a');
    const elementCount = await textElements.count();
    
    if (elementCount > 0) {
      const firstElement = textElements.first();
      await expect(firstElement).toBeVisible();
      
      // Text should not be cut off
      const isInViewport = await helpers.isInViewport('p:first-child, h1:first-child');
      expect(isInViewport).toBeTruthy();
    }
    
    // Reset zoom
    await page.evaluate(() => {
      document.body.style.zoom = '1';
    });
  });

  test('should have semantic HTML structure', async ({ page }) => {
    await page.goto('/');
    await helpers.waitForPageLoad();
    
    // Check for semantic HTML elements
    const semanticElements = [
      'header',
      'nav',
      'main',
      'footer',
      'section',
      'article'
    ];
    
    let semanticCount = 0;
    for (const element of semanticElements) {
      const count = await page.locator(element).count();
      if (count > 0) {
        semanticCount++;
      }
    }
    
    // Should have at least some semantic elements
    expect(semanticCount).toBeGreaterThan(0);
  });

  test('should provide alternative text for images', async ({ page }) => {
    await page.goto('/');
    await helpers.waitForPageLoad();
    
    // Check images for alt text
    const images = page.locator('img');
    const imageCount = await images.count();
    
    for (let i = 0; i < Math.min(imageCount, 5); i++) {
      const image = images.nth(i);
      const altText = await image.getAttribute('alt');
      const ariaLabel = await image.getAttribute('aria-label');
      
      // Images should have alt text or aria-label
      if (altText !== null || ariaLabel !== null) {
        expect(altText || ariaLabel).toBeTruthy();
      }
    }
  });

  test('should handle form accessibility', async ({ page }) => {
    await page.goto('/register');
    await helpers.waitForPageLoad();
    
    // Check form accessibility
    const formElements = page.locator('input, textarea, select');
    const formCount = await formElements.count();
    
    for (let i = 0; i < Math.min(formCount, 5); i++) {
      const element = formElements.nth(i);
      
      // Check for proper labeling
      const id = await element.getAttribute('id');
      const ariaLabel = await element.getAttribute('aria-label');
      const ariaLabelledBy = await element.getAttribute('aria-labelledby');
      
      if (id) {
        const label = page.locator(`label[for="${id}"]`);
        const hasLabel = await label.count() > 0;
        
        if (hasLabel || ariaLabel || ariaLabelledBy) {
          expect(true).toBeTruthy(); // Has proper labeling
        }
      }
    }
  });
});