/**
 * Test to verify that the auth setup works without Google OAuth credentials
 */
import { strict as assert } from 'assert';

// Test auth setup without Google OAuth credentials
async function testAuthSetupWithoutGoogleOAuth() {
  console.log('Testing auth setup without Google OAuth credentials...');
  
  // Clear Google OAuth environment variables to simulate CI environment
  delete process.env.GOOGLE_CLIENT_ID;
  delete process.env.GOOGLE_CLIENT_SECRET;
  
  // Set required environment variables
  process.env.SESSION_SECRET = 'test-session-secret-for-testing';
  process.env.NODE_ENV = 'test';
  
  try {
    // Import and test auth setup
    const { setupAuth } = await import('./server/auth.js');
    
    // Create a mock Express app
    const mockApp = {
      set: () => {},
      use: () => {},
      middleware: []
    } as any;
    
    // This should not throw an error
    setupAuth(mockApp);
    
    console.log('✅ Auth setup completed successfully without Google OAuth credentials');
    return true;
  } catch (error) {
    console.error('❌ Auth setup failed:', error);
    return false;
  }
}

// Run the test
testAuthSetupWithoutGoogleOAuth()
  .then(success => {
    if (success) {
      console.log('✅ All auth tests passed!');
      process.exit(0);
    } else {
      console.error('❌ Auth tests failed!');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  });
