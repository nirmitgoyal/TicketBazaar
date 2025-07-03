#!/usr/bin/env tsx

/**
 * Test script to verify that the session auth works correctly in test mode
 */

// Set test environment before importing
process.env.NODE_ENV = 'test';

// Remove SESSION_SECRET to test fallback
delete process.env.SESSION_SECRET;

async function testSessionAuth() {
  console.log('Testing session auth in test mode...');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('SESSION_SECRET:', process.env.SESSION_SECRET ? 'SET' : 'NOT SET');

  try {
    // This should work without throwing an error
    const { setupAuth } = await import('./server/auth.js');
    
    console.log('✅ Auth module imported successfully');
    
    // Test calling setupAuth function - this should use the test fallback
    const mockApp = {
      use: (middleware: any) => {
        console.log('✅ Middleware registered:', middleware.name || 'anonymous middleware');
      }
    } as any;
    
    setupAuth(mockApp);
    console.log('✅ Session auth setup completed with test mode fallback');
    
    console.log('🎉 Session auth test mode works correctly!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testSessionAuth();

export {}; // Make this a module
