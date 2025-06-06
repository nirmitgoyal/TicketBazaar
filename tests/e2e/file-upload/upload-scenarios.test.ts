import { test, expect, TestHelpers } from '../setup/test-setup';
import path from 'path';

test.describe('File Upload Scenarios', () => {
  
  test('should handle ticket verification document uploads', async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    await page.goto('/sell');
    
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="sell-form"]');
    
    // Fill basic ticket information first
    await TestHelpers.fillFormField(page, '[data-testid="title-input"]', 'Concert Tickets');
    await TestHelpers.fillFormField(page, '[data-testid="event-title-input"]', 'Amazing Concert');
    await TestHelpers.fillFormField(page, '[data-testid="venue-input"]', 'Mumbai Arena');
    await TestHelpers.fillFormField(page, '[data-testid="price-input"]', '2500');
    
    // Test valid image upload
    const fileInput = page.locator('[data-testid="ticket-image-upload"]');
    
    // Create a test image file (1x1 pixel PNG)
    const validImageBuffer = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
      0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0xD7, 0x63, 0xF8, 0x00, 0x00, 0x00,
      0x01, 0x00, 0x01, 0x5C, 0xC2, 0x5D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49,
      0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ]);
    
    await fileInput.setInputFiles({
      name: 'ticket.png',
      mimeType: 'image/png',
      buffer: validImageBuffer
    });
    
    // Verify upload success indicator
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="upload-success"]');
    
    // Verify preview is shown
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="image-preview"]');
  });

  test('should reject invalid file formats', async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    await page.goto('/sell');
    
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="sell-form"]');
    
    // Test invalid file format (text file)
    const fileInput = page.locator('[data-testid="ticket-image-upload"]');
    
    await fileInput.setInputFiles({
      name: 'document.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('This is not an image')
    });
    
    // Verify error message for invalid format
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="invalid-format-error"]');
    
    // Test executable file
    await fileInput.setInputFiles({
      name: 'malicious.exe',
      mimeType: 'application/x-msdownload',
      buffer: Buffer.from('MZ')
    });
    
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="invalid-format-error"]');
  });

  test('should handle oversized file uploads', async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    await page.goto('/sell');
    
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="sell-form"]');
    
    // Create a large file (simulate 10MB+ image)
    const largeBuffer = Buffer.alloc(11 * 1024 * 1024, 0x89); // 11MB
    
    const fileInput = page.locator('[data-testid="ticket-image-upload"]');
    
    await fileInput.setInputFiles({
      name: 'large-image.jpg',
      mimeType: 'image/jpeg',
      buffer: largeBuffer
    });
    
    // Verify file size error
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="file-size-error"]');
    
    // Verify upload was rejected
    const uploadSuccess = page.locator('[data-testid="upload-success"]');
    await expect(uploadSuccess).not.toBeVisible();
  });

  test('should support drag and drop file upload', async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    await page.goto('/sell');
    
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="sell-form"]');
    
    // Create valid image file
    const imageBuffer = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE
    ]);
    
    // Create DataTransfer with file
    const dataTransfer = await page.evaluateHandle(() => new DataTransfer());
    
    // Simulate drag and drop
    const dropZone = page.locator('[data-testid="file-drop-zone"]');
    
    await dropZone.dispatchEvent('dragenter');
    await dropZone.dispatchEvent('dragover');
    
    // Verify drop zone visual feedback
    await expect(dropZone).toHaveClass(/drag-over|dropping/);
    
    // Simulate file drop
    await page.setInputFiles('[data-testid="ticket-image-upload"]', {
      name: 'dropped-image.png',
      mimeType: 'image/png',
      buffer: imageBuffer
    });
    
    await dropZone.dispatchEvent('drop');
    
    // Verify upload success
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="upload-success"]');
  });

  test('should handle multiple file uploads for ticket verification', async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    await page.goto('/sell');
    
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="sell-form"]');
    
    // Check if multiple file upload is supported
    const multiFileInput = page.locator('[data-testid="verification-documents-upload"]');
    
    if (await multiFileInput.isVisible()) {
      // Create multiple valid files
      const file1 = {
        name: 'ticket-front.jpg',
        mimeType: 'image/jpeg',
        buffer: Buffer.from('fake-jpeg-data')
      };
      
      const file2 = {
        name: 'ticket-back.jpg',
        mimeType: 'image/jpeg',
        buffer: Buffer.from('fake-jpeg-data-2')
      };
      
      await multiFileInput.setInputFiles([file1, file2]);
      
      // Verify multiple files are listed
      await TestHelpers.waitForElementToBeVisible(page, '[data-testid="file-list"]');
      
      const fileItems = page.locator('[data-testid="file-item"]');
      const fileCount = await fileItems.count();
      expect(fileCount).toBe(2);
      
      // Test individual file removal
      const firstRemoveButton = page.locator('[data-testid="remove-file"]:first-child');
      await firstRemoveButton.click();
      
      // Verify file was removed
      const updatedFileCount = await fileItems.count();
      expect(updatedFileCount).toBe(1);
    }
  });

  test('should handle file upload progress and cancellation', async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    await page.goto('/sell');
    
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="sell-form"]');
    
    // Create moderately large file to see progress
    const mediumBuffer = Buffer.alloc(2 * 1024 * 1024); // 2MB
    
    // Intercept upload request to slow it down
    await page.route('**/upload', async route => {
      // Delay the response to simulate slow upload
      await new Promise(resolve => setTimeout(resolve, 2000));
      route.continue();
    });
    
    const fileInput = page.locator('[data-testid="ticket-image-upload"]');
    
    await fileInput.setInputFiles({
      name: 'medium-image.jpg',
      mimeType: 'image/jpeg',
      buffer: mediumBuffer
    });
    
    // Verify progress indicator appears
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="upload-progress"]');
    
    // Test cancellation
    const cancelButton = page.locator('[data-testid="cancel-upload"]');
    if (await cancelButton.isVisible()) {
      await cancelButton.click();
      
      // Verify upload was cancelled
      await TestHelpers.waitForElementToBeVisible(page, '[data-testid="upload-cancelled"]');
      
      // Verify progress indicator is hidden
      const progressIndicator = page.locator('[data-testid="upload-progress"]');
      await expect(progressIndicator).not.toBeVisible();
    }
  });

  test('should validate image dimensions and quality', async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    await page.goto('/sell');
    
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="sell-form"]');
    
    // Test very small image (below minimum requirements)
    const tinyImageBuffer = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01
    ]);
    
    const fileInput = page.locator('[data-testid="ticket-image-upload"]');
    
    await fileInput.setInputFiles({
      name: 'tiny-image.png',
      mimeType: 'image/png',
      buffer: tinyImageBuffer
    });
    
    // Verify dimension validation error
    const dimensionError = page.locator('[data-testid="image-dimension-error"]');
    if (await dimensionError.isVisible()) {
      await expect(dimensionError).toContainText(/minimum.*resolution|too small/i);
    }
  });

  test('should handle network errors during upload', async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    await page.goto('/sell');
    
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="sell-form"]');
    
    // Simulate network failure during upload
    await page.route('**/upload', route => {
      route.abort('failed');
    });
    
    const validImageBuffer = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01
    ]);
    
    const fileInput = page.locator('[data-testid="ticket-image-upload"]');
    
    await fileInput.setInputFiles({
      name: 'test-image.png',
      mimeType: 'image/png',
      buffer: validImageBuffer
    });
    
    // Verify network error message
    await TestHelpers.waitForElementToBeVisible(page, '[data-testid="upload-network-error"]');
    
    // Test retry functionality
    const retryButton = page.locator('[data-testid="retry-upload"]');
    if (await retryButton.isVisible()) {
      // Remove network error simulation
      await page.unroute('**/upload');
      
      await retryButton.click();
      
      // Verify successful upload after retry
      await TestHelpers.waitForElementToBeVisible(page, '[data-testid="upload-success"]');
    }
  });
});