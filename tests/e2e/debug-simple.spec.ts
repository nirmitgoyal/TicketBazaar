import { test, expect } from '@playwright/test';

test('Debug list-ticket page', async ({ page }) => {
  // Set test environment marker on the document
  await page.addInitScript(() => {
    document.documentElement.setAttribute('data-test-env', 'true');
    window.__isTestEnvironment = true;
  });
  
  await page.goto('/list-ticket');
  
  // Wait a bit for the page to load
  await page.waitForTimeout(5000);
  
  // Take a screenshot
  await page.screenshot({ path: '/tmp/debug-list-ticket.png', fullPage: true });
  
  // Check what's on the page
  const title = await page.title();
  console.log('Page title:', title);
  
  const url = page.url();
  console.log('Page URL:', url);
  
  // Check if we're redirected to login
  if (url.includes('/login')) {
    console.log('Redirected to login page');
    return;
  }
  
  // Look for any text on the page
  const bodyText = await page.locator('body').textContent();
  console.log('Body text length:', bodyText?.length || 0);
  console.log('First 500 chars:', bodyText?.substring(0, 500) || 'No text found');
  
  // Look for form elements
  const forms = await page.locator('form').count();
  console.log('Forms found:', forms);
  
  const buttons = await page.locator('button').count();
  console.log('Buttons found:', buttons);
  
  const inputs = await page.locator('input').count();
  console.log('Inputs found:', inputs);
  
  // Try to find our specific elements
  const submitButton = await page.locator('[data-testid="submit-button"]').count();
  console.log('Submit button found:', submitButton);
  
  // Check for loading elements
  const loadingElements = await page.locator('text=Loading').count();
  console.log('Loading elements found:', loadingElements);
  
  // Check for error messages
  const errorElements = await page.locator('text=Error').count();
  console.log('Error elements found:', errorElements);
});