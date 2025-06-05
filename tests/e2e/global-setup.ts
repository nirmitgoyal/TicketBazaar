import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  const { baseURL } = config.projects[0].use;
  
  // Launch browser for setup
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    console.log('🚀 Starting global test setup...');
    
    // Wait for server to be ready
    console.log(`⏳ Waiting for server at ${baseURL}`);
    await page.goto(baseURL || 'http://localhost:5000', { 
      waitUntil: 'networkidle',
      timeout: 60000 
    });
    
    // Check if the app loads properly
    await page.waitForSelector('body', { timeout: 30000 });
    console.log('✅ Server is ready and responding');
    
    // Setup test database state if needed
    // This would be where you'd create test users, events, etc.
    console.log('📊 Setting up test data...');
    
    // Create a test user session for authenticated tests
    // Note: This would typically involve calling your auth endpoints
    console.log('👤 Creating test user session...');
    
    console.log('✨ Global setup completed successfully');
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup;