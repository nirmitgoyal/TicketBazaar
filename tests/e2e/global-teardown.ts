import { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Running global teardown...');
  
  // Clean up any test data if needed
  // Reset database state
  // Clean up uploaded files
  
  console.log('✅ Global teardown completed');
}

export default globalTeardown;