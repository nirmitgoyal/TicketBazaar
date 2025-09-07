/**
 * Test script to validate API access restriction in production
 * This test verifies that /api/** routes are blocked on ticketbazaar.co.in in production
 */

import { apiBypassMiddleware } from '../../server/middleware/api-bypass.middleware';

// Mock Express request and response objects
function createMockReq(path: string, host: string, nodeEnv = 'production') {
  // Temporarily set NODE_ENV for the test
  const originalEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = nodeEnv;
  
  return {
    path,
    get: (header: string) => header === 'host' ? host : undefined,
    originalEnv // Store to restore later
  } as any;
}

function createMockRes() {
  let statusCode = 200;
  let jsonResponse: any = null;
  const headers: any = {};
  let statusCalled = false;
  
  return {
    status: (code: number) => {
      statusCode = code;
      statusCalled = true;
      return {
        json: (data: any) => {
          jsonResponse = data;
          return { statusCode, jsonResponse };
        }
      };
    },
    setHeader: (key: string, value: string) => {
      headers[key] = value;
    },
    getHeaders: () => headers,
    getStatus: () => statusCode,
    getJsonResponse: () => jsonResponse,
    wasStatusCalled: () => statusCalled
  } as any;
}

function createMockNext() {
  let called = false;
  return {
    next: () => { called = true; },
    wasCalled: () => called
  };
}

// Test cases
function runTests() {
  console.log('🧪 Testing API Access Restriction Middleware...\n');
  
  let testsPassed = 0;
  let testsTotal = 0;
  
  // Test 1: Production + ticketbazaar.co.in domain + API route = BLOCKED
  testsTotal++;
  console.log('Test 1: Production + ticketbazaar.co.in + /api/tickets → Should be BLOCKED');
  try {
    const req = createMockReq('/api/tickets', 'ticketbazaar.co.in', 'production');
    const res = createMockRes();
    const next = createMockNext();
    
    apiBypassMiddleware(req, res, next.next);
    
    // Should NOT call next() and should call status(403)
    if (!next.wasCalled() && res.wasStatusCalled()) {
      console.log('   ✅ PASS: API access correctly blocked (403)');
      testsPassed++;
    } else {
      console.log('   ❌ FAIL: API access was not blocked');
      console.log(`      next() called: ${next.wasCalled()}, status called: ${res.wasStatusCalled()}`);
    }
    
    // Restore environment
    process.env.NODE_ENV = req.originalEnv;
  } catch (error: any) {
    console.log(`   ❌ FAIL: Error during test - ${error.message}`);
  }
  
  // Test 2: Development + ticketbazaar.co.in domain + API route = ALLOWED
  testsTotal++;
  console.log('Test 2: Development + ticketbazaar.co.in + /api/tickets → Should be ALLOWED');
  try {
    const req = createMockReq('/api/tickets', 'ticketbazaar.co.in', 'development');
    const res = createMockRes();
    const next = createMockNext();
    
    apiBypassMiddleware(req, res, next.next);
    
    // Should call next() and not return error response
    if (next.wasCalled() && !res.wasStatusCalled()) {
      console.log('   ✅ PASS: API access correctly allowed in development');
      testsPassed++;
    } else {
      console.log('   ❌ FAIL: API access was incorrectly blocked in development');
      console.log(`      next() called: ${next.wasCalled()}, status called: ${res.wasStatusCalled()}`);
    }
    
    // Restore environment
    process.env.NODE_ENV = req.originalEnv;
  } catch (error: any) {
    console.log(`   ❌ FAIL: Error during test - ${error.message}`);
  }
  
  // Test 3: Production + other domain + API route = ALLOWED
  testsTotal++;
  console.log('Test 3: Production + localhost:5000 + /api/tickets → Should be ALLOWED');
  try {
    const req = createMockReq('/api/tickets', 'localhost:5000', 'production');
    const res = createMockRes();
    const next = createMockNext();
    
    apiBypassMiddleware(req, res, next.next);
    
    // Should call next() for other domains even in production
    if (next.wasCalled() && !res.wasStatusCalled()) {
      console.log('   ✅ PASS: API access correctly allowed on other domains');
      testsPassed++;
    } else {
      console.log('   ❌ FAIL: API access was incorrectly blocked on other domains');
      console.log(`      next() called: ${next.wasCalled()}, status called: ${res.wasStatusCalled()}`);
    }
    
    // Restore environment
    process.env.NODE_ENV = req.originalEnv;
  } catch (error: any) {
    console.log(`   ❌ FAIL: Error during test - ${error.message}`);
  }
  
  // Test 4: Production + ticketbazaar.co.in + /api/auth/google = ALLOWED (Exception)
  testsTotal++;
  console.log('Test 4: Production + ticketbazaar.co.in + /api/auth/google → Should be ALLOWED');
  try {
    const req = createMockReq('/api/auth/google', 'ticketbazaar.co.in', 'production');
    const res = createMockRes();
    const next = createMockNext();
    
    apiBypassMiddleware(req, res, next.next);
    
    // Should call next() for Google OAuth routes even in production
    if (next.wasCalled() && !res.wasStatusCalled()) {
      console.log('   ✅ PASS: Google OAuth route correctly allowed');
      testsPassed++;
    } else {
      console.log('   ❌ FAIL: Google OAuth route was incorrectly blocked');
      console.log(`      next() called: ${next.wasCalled()}, status called: ${res.wasStatusCalled()}`);
    }
    
    // Restore environment
    process.env.NODE_ENV = req.originalEnv;
  } catch (error: any) {
    console.log(`   ❌ FAIL: Error during test - ${error.message}`);
  }
  
  // Test 5: Production + ticketbazaar.co.in + /api/auth/google/callback = ALLOWED (Exception)
  testsTotal++;
  console.log('Test 5: Production + ticketbazaar.co.in + /api/auth/google/callback → Should be ALLOWED');
  try {
    const req = createMockReq('/api/auth/google/callback', 'ticketbazaar.co.in', 'production');
    const res = createMockRes();
    const next = createMockNext();
    
    apiBypassMiddleware(req, res, next.next);
    
    // Should call next() for Google OAuth callback routes even in production
    if (next.wasCalled() && !res.wasStatusCalled()) {
      console.log('   ✅ PASS: Google OAuth callback route correctly allowed');
      testsPassed++;
    } else {
      console.log('   ❌ FAIL: Google OAuth callback route was incorrectly blocked');
      console.log(`      next() called: ${next.wasCalled()}, status called: ${res.wasStatusCalled()}`);
    }
    
    // Restore environment
    process.env.NODE_ENV = req.originalEnv;
  } catch (error: any) {
    console.log(`   ❌ FAIL: Error during test - ${error.message}`);
  }
  
  // Test 6: Production + ticketbazaar.co.in + non-API route = ALLOWED
  testsTotal++;
  console.log('Test 6: Production + ticketbazaar.co.in + /dashboard → Should be ALLOWED');
  try {
    const req = createMockReq('/dashboard', 'ticketbazaar.co.in', 'production');
    const res = createMockRes();
    const next = createMockNext();
    
    apiBypassMiddleware(req, res, next.next);
    
    // Should call next() for non-API routes
    if (next.wasCalled() && !res.wasStatusCalled()) {
      console.log('   ✅ PASS: Non-API routes correctly allowed');
      testsPassed++;
    } else {
      console.log('   ❌ FAIL: Non-API routes were incorrectly blocked');
      console.log(`      next() called: ${next.wasCalled()}, status called: ${res.wasStatusCalled()}`);
    }
    
    // Restore environment
    process.env.NODE_ENV = req.originalEnv;
  } catch (error: any) {
    console.log(`   ❌ FAIL: Error during test - ${error.message}`);
  }
  
  console.log(`\n📊 Test Results: ${testsPassed}/${testsTotal} tests passed`);
  
  if (testsPassed === testsTotal) {
    console.log('🎉 All tests passed! API access restriction is working correctly.');
    process.exit(0);
  } else {
    console.error('❌ Some tests failed. Please check the implementation.');
    process.exit(1);
  }
}

// Run the tests
runTests();