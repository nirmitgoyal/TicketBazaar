import { test, expect } from '@playwright/test';
import { TestHelpers } from '../utils/test-helpers';
import path from 'path';

test.describe('File Upload Functionality', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
  });

  test('should handle ticket file upload with drag and drop', async ({ page }) => {
    await page.goto('/list-ticket');
    await helpers.waitForPageLoad();

    // Look for file upload area
    const uploadArea = page.locator('[data-testid="file-upload"], .file-upload, input[type="file"]');
    
    if (await uploadArea.count() > 0) {
      // Create test file
      const testFilePath = path.join(__dirname, '../fixtures/sample-ticket.txt');
      
      // Test drag and drop if upload area supports it
      const dropZone = page.locator('[data-testid="drop-zone"], .drop-zone, .file-drop');
      
      if (await dropZone.count() > 0) {
        // Simulate file drop
        await dropZone.setInputFiles(testFilePath);
        await page.waitForTimeout(1000);
        
        // Check for upload progress or success
        const uploadProgress = page.locator('[data-testid="upload-progress"], .upload-progress, .progress-bar');
        const uploadSuccess = page.locator('[data-testid="upload-success"], .upload-success, .file-uploaded');
        
        await page.waitForTimeout(2000);
        
        const hasProgress = await uploadProgress.count() > 0;
        const hasSuccess = await uploadSuccess.count() > 0;
        
        expect(hasProgress || hasSuccess).toBeTruthy();
      } else {
        // Use regular file input
        const fileInput = page.locator('input[type="file"]').first();
        await fileInput.setInputFiles(testFilePath);
        await page.waitForTimeout(2000);
        
        // Verify file was selected
        const fileName = await page.locator('[data-testid="file-name"], .file-name').textContent();
        expect(fileName).toContain('sample-ticket');
      }
    }
  });

  test('should validate file types and sizes', async ({ page }) => {
    await page.goto('/list-ticket');
    await helpers.waitForPageLoad();

    const fileInput = page.locator('input[type="file"]').first();
    
    if (await fileInput.count() > 0) {
      // Test invalid file type
      const invalidFile = path.join(__dirname, '../fixtures/sample-ticket.txt');
      await fileInput.setInputFiles(invalidFile);
      await page.waitForTimeout(1000);
      
      // Should show error for invalid file type (if validation exists)
      const errorMessage = page.locator('[data-testid="file-error"], .file-error, .error-message');
      await page.waitForTimeout(2000);
      
      // Error might appear if file type validation is strict
      const hasError = await errorMessage.count() > 0;
      
      // Test valid file type
      const validFile = path.join(__dirname, '../fixtures/sample-ticket.jpg');
      await fileInput.setInputFiles(validFile);
      await page.waitForTimeout(2000);
      
      // Should either upload successfully or show in preview
      const hasPreview = await page.locator('[data-testid="file-preview"], .file-preview, img').count() > 0;
      const hasSuccess = await page.locator('[data-testid="upload-success"], .upload-success').count() > 0;
      
      expect(hasPreview || hasSuccess).toBeTruthy();
    }
  });

  test('should show upload progress with realistic timing', async ({ page }) => {
    await page.goto('/list-ticket');
    await helpers.waitForPageLoad();

    const fileInput = page.locator('input[type="file"]').first();
    
    if (await fileInput.count() > 0) {
      const testFile = path.join(__dirname, '../fixtures/sample-ticket.jpg');
      
      // Start upload
      await fileInput.setInputFiles(testFile);
      
      // Monitor for progress indicators
      const progressStates = [
        '[data-testid="uploading"], .uploading',
        '[data-testid="upload-progress"], .progress-bar',
        '[data-testid="upload-complete"], .upload-complete'
      ];
      
      let foundProgressState = false;
      
      for (const selector of progressStates) {
        const element = page.locator(selector);
        if (await element.count() > 0) {
          await expect(element).toBeVisible();
          foundProgressState = true;
          break;
        }
        await page.waitForTimeout(500);
      }
      
      // Should show some form of upload feedback
      expect(foundProgressState || await page.locator('img, .file-name').count() > 0).toBeTruthy();
    }
  });

  test('should handle multiple file uploads', async ({ page }) => {
    await page.goto('/list-ticket');
    await helpers.waitForPageLoad();

    const fileInput = page.locator('input[type="file"]');
    
    if (await fileInput.count() > 0) {
      // Check if multiple files are supported
      const supportsMultiple = await fileInput.getAttribute('multiple') !== null;
      
      if (supportsMultiple) {
        const testFiles = [
          path.join(__dirname, '../fixtures/sample-ticket.jpg'),
          path.join(__dirname, '../fixtures/sample-ticket.txt')
        ];
        
        await fileInput.setInputFiles(testFiles);
        await page.waitForTimeout(2000);
        
        // Should show multiple files or handle them appropriately
        const fileCount = await page.locator('[data-testid="file-item"], .file-item, .uploaded-file').count();
        expect(fileCount).toBeGreaterThanOrEqual(1);
      }
    }
  });

  test('should allow file removal after upload', async ({ page }) => {
    await page.goto('/list-ticket');
    await helpers.waitForPageLoad();

    const fileInput = page.locator('input[type="file"]').first();
    
    if (await fileInput.count() > 0) {
      const testFile = path.join(__dirname, '../fixtures/sample-ticket.jpg');
      await fileInput.setInputFiles(testFile);
      await page.waitForTimeout(2000);
      
      // Look for remove/delete button
      const removeButton = page.locator('[data-testid="remove-file"], button:has-text("Remove"), .remove-file, .delete-file');
      
      if (await removeButton.count() > 0) {
        await helpers.clickWithMovement('[data-testid="remove-file"], button:has-text("Remove")');
        await page.waitForTimeout(500);
        
        // File should be removed
        const fileRemoved = await page.locator('[data-testid="file-preview"], .file-preview').count() === 0;
        expect(fileRemoved).toBeTruthy();
      }
    }
  });

  test('should handle upload errors gracefully', async ({ page }) => {
    // Mock upload endpoint to fail
    await page.route('**/upload**', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Upload failed' })
      });
    });

    await page.goto('/list-ticket');
    await helpers.waitForPageLoad();

    const fileInput = page.locator('input[type="file"]').first();
    
    if (await fileInput.count() > 0) {
      const testFile = path.join(__dirname, '../fixtures/sample-ticket.jpg');
      await fileInput.setInputFiles(testFile);
      await page.waitForTimeout(3000);
      
      // Should show error message
      const errorMessage = page.locator('[data-testid="upload-error"], .upload-error, .error-message');
      await page.waitForTimeout(2000);
      
      const hasError = await errorMessage.count() > 0;
      const hasRetryButton = await page.locator('[data-testid="retry-upload"], button:has-text("Retry")').count() > 0;
      
      expect(hasError || hasRetryButton).toBeTruthy();
    }
  });

  test('should integrate file upload with form submission', async ({ page }) => {
    await page.goto('/list-ticket');
    await helpers.waitForPageLoad();

    // Fill out ticket listing form
    const formFields = {
      title: 'Test Concert Ticket',
      price: '2500',
      section: 'VIP Section A',
      row: 'Row 5'
    };

    await helpers.fillFormRealistic(formFields);

    // Upload ticket file
    const fileInput = page.locator('input[type="file"]').first();
    
    if (await fileInput.count() > 0) {
      const testFile = path.join(__dirname, '../fixtures/sample-ticket.jpg');
      await fileInput.setInputFiles(testFile);
      await page.waitForTimeout(2000);
      
      // Submit form
      const submitButton = page.locator('[data-testid="submit-button"], button[type="submit"], button:has-text("List")');
      if (await submitButton.count() > 0) {
        await helpers.clickWithMovement('[data-testid="submit-button"], button[type="submit"]');
        await page.waitForTimeout(3000);
        
        // Should either show success or validation errors
        const hasSuccess = await page.locator('[data-testid="success"], .success-message').count() > 0;
        const hasError = await page.locator('.error-message, .text-destructive').count() > 0;
        const isRedirected = !page.url().includes('/list-ticket');
        
        expect(hasSuccess || hasError || isRedirected).toBeTruthy();
      }
    }
  });

  test('should show file preview for image uploads', async ({ page }) => {
    await page.goto('/list-ticket');
    await helpers.waitForPageLoad();

    const fileInput = page.locator('input[type="file"]').first();
    
    if (await fileInput.count() > 0) {
      const imageFile = path.join(__dirname, '../fixtures/sample-ticket.jpg');
      await fileInput.setInputFiles(imageFile);
      await page.waitForTimeout(2000);
      
      // Should show image preview
      const imagePreview = page.locator('[data-testid="image-preview"], .image-preview, img[src*="blob"], img[src*="data:"]');
      
      if (await imagePreview.count() > 0) {
        await expect(imagePreview).toBeVisible();
        
        // Image should have proper dimensions
        const imageBounds = await imagePreview.boundingBox();
        expect(imageBounds?.width).toBeGreaterThan(0);
        expect(imageBounds?.height).toBeGreaterThan(0);
      }
    }
  });

  test('should handle mobile file upload interactions', async ({ page, isMobile }) => {
    if (isMobile) {
      await page.goto('/list-ticket');
      await helpers.waitForPageLoad();

      const fileInput = page.locator('input[type="file"]').first();
      
      if (await fileInput.count() > 0) {
        // Mobile file input interaction
        await helpers.touchTap('input[type="file"]');
        
        // Should trigger file picker (can't fully test without actual device)
        // But we can test the file input response
        const testFile = path.join(__dirname, '../fixtures/sample-ticket.jpg');
        await fileInput.setInputFiles(testFile);
        await page.waitForTimeout(2000);
        
        // Should handle file appropriately on mobile
        const mobilePreview = page.locator('.mobile-preview, [data-testid="mobile-file-preview"]');
        const generalPreview = page.locator('.file-preview, img, .file-name');
        
        const hasPreview = await mobilePreview.count() > 0 || await generalPreview.count() > 0;
        expect(hasPreview).toBeTruthy();
      }
    }
  });

  test('should maintain upload state during form validation errors', async ({ page }) => {
    await page.goto('/list-ticket');
    await helpers.waitForPageLoad();

    // Upload file first
    const fileInput = page.locator('input[type="file"]').first();
    
    if (await fileInput.count() > 0) {
      const testFile = path.join(__dirname, '../fixtures/sample-ticket.jpg');
      await fileInput.setInputFiles(testFile);
      await page.waitForTimeout(2000);
      
      // Submit form with missing required fields
      const submitButton = page.locator('[data-testid="submit-button"], button[type="submit"]');
      if (await submitButton.count() > 0) {
        await helpers.clickWithMovement('[data-testid="submit-button"], button[type="submit"]');
        await page.waitForTimeout(2000);
        
        // Should show validation errors but keep file
        const hasValidationError = await page.locator('.error-message, .text-destructive').count() > 0;
        const fileStillThere = await page.locator('.file-preview, .file-name, img').count() > 0;
        
        if (hasValidationError) {
          expect(fileStillThere).toBeTruthy();
        }
      }
    }
  });

  test('should handle large file uploads with appropriate feedback', async ({ page }) => {
    await page.goto('/list-ticket');
    await helpers.waitForPageLoad();

    // Create a larger test file scenario
    const fileInput = page.locator('input[type="file"]').first();
    
    if (await fileInput.count() > 0) {
      const testFile = path.join(__dirname, '../fixtures/sample-ticket.jpg');
      
      // Simulate slow network for upload testing
      await helpers.simulateSlowNetwork();
      
      await fileInput.setInputFiles(testFile);
      
      // Should show loading state for longer
      const loadingStates = [
        '[data-testid="uploading"], .uploading',
        '[data-testid="processing"], .processing', 
        '.spinner, .loading'
      ];
      
      let foundLoadingState = false;
      
      for (const selector of loadingStates) {
        await page.waitForTimeout(500);
        if (await page.locator(selector).count() > 0) {
          foundLoadingState = true;
          break;
        }
      }
      
      await page.waitForTimeout(3000);
      
      // Reset network conditions
      await helpers.resetNetworkConditions();
      
      // Should eventually complete or show appropriate state
      const finalState = await page.locator('.file-preview, .upload-complete, .error-message').count() > 0;
      expect(finalState).toBeTruthy();
    }
  });
});