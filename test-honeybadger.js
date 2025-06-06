// Test script to verify Honeybadger integration
import { notifyError } from './server/honeybadger.js';

async function testHoneybadger() {
  try {
    console.log('Testing Honeybadger error reporting...');
    
    // Create a test error
    const testError = new Error('Test error from Honeybadger integration');
    
    // Report the error with context
    await notifyError(testError, {
      test: true,
      environment: 'development',
      feature: 'honeybadger-setup',
      timestamp: new Date().toISOString()
    });
    
    console.log('Test error sent to Honeybadger successfully!');
    console.log('Check your Honeybadger dashboard for the test error.');
    
  } catch (error) {
    console.error('Failed to send test error:', error);
  }
}

testHoneybadger();