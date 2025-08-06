/**
 * Integration test to verify API access restriction works in a simulated server environment
 */

import express from 'express';
import { apiBypassMiddleware } from '../../server/middleware/api-bypass.middleware';

async function testIntegration() {
  console.log('🧪 Running Integration Test for API Access Restriction...\n');
  
  let testsPassed = 0;
  let testsTotal = 0;
  
  // Helper function to simulate request handling
  function simulateRequest(path: string, host: string, nodeEnv: string): Promise<{ status: number; data?: any }> {
    return new Promise((resolve) => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = nodeEnv;
      process.env.DEBUG_API_ACCESS = 'true';
      
      // Mock Express request object
      const req = {
        path,
        get: (header: string) => header === 'host' ? host : undefined
      } as any;
      
      // Mock Express response object
      let responseStatus = 200;
      let responseData: any = null;
      let responseSent = false;
      
      const res = {
        status: (code: number) => {
          responseStatus = code;
          return {
            json: (data: any) => {
              responseData = data;
              responseSent = true;
              resolve({ status: responseStatus, data: responseData });
              return res;
            }
          };
        },
        setHeader: () => res,
        json: (data: any) => {
          responseData = data;
          responseSent = true;
          resolve({ status: responseStatus, data: responseData });
          return res;
        }
      } as any;
      
      // Mock next function
      const next = () => {
        if (!responseSent) {
          // Simulate successful API response if middleware calls next()
          resolve({ status: 200, data: { message: 'API access allowed' } });
        }
      };
      
      try {
        // Run the middleware
        apiBypassMiddleware(req, res, next);
        
        // If we reach here and no response was sent, call next
        if (!responseSent) {
          setTimeout(() => {
            if (!responseSent) {
              resolve({ status: 200, data: { message: 'API access allowed' } });
            }
          }, 10);
        }
      } catch (error) {
        resolve({ status: 500, data: { error: 'Internal server error' } });
      } finally {
        process.env.NODE_ENV = originalEnv;
        delete process.env.DEBUG_API_ACCESS;
      }
    });
  }
  
  // Test 1: Production + ticketbazaar.co.in + API route = BLOCKED (403)
  testsTotal++;
  console.log('Test 1: Production + ticketbazaar.co.in + /api/test → Should return 403');
  try {
    const result = await simulateRequest('/api/test', 'ticketbazaar.co.in', 'production');
    if (result.status === 403) {
      console.log('   ✅ PASS: API correctly blocked (403)');
      testsPassed++;
    } else {
      console.log(`   ❌ FAIL: Expected 403, got ${result.status}`);
      console.log(`   Response:`, result);
    }
  } catch (error: any) {
    console.log(`   ❌ FAIL: Error - ${error.message}`);
  }
  
  // Test 2: Development + ticketbazaar.co.in + API route = ALLOWED (200)
  testsTotal++;
  console.log('Test 2: Development + ticketbazaar.co.in + /api/test → Should return 200');
  try {
    const result = await simulateRequest('/api/test', 'ticketbazaar.co.in', 'development');
    if (result.status === 200) {
      console.log('   ✅ PASS: API correctly allowed in development (200)');
      testsPassed++;
    } else {
      console.log(`   ❌ FAIL: Expected 200, got ${result.status}`);
      console.log(`   Response:`, result);
    }
  } catch (error: any) {
    console.log(`   ❌ FAIL: Error - ${error.message}`);
  }
  
  // Test 3: Production + other domain + API route = ALLOWED (200)
  testsTotal++;
  console.log('Test 3: Production + localhost + /api/test → Should return 200');
  try {
    const result = await simulateRequest('/api/test', 'localhost:5000', 'production');
    if (result.status === 200) {
      console.log('   ✅ PASS: API correctly allowed on other domains (200)');
      testsPassed++;
    } else {
      console.log(`   ❌ FAIL: Expected 200, got ${result.status}`);
      console.log(`   Response:`, result);
    }
  } catch (error: any) {
    console.log(`   ❌ FAIL: Error - ${error.message}`);
  }
  
  // Test 4: Production + ticketbazaar.co.in + non-API route = ALLOWED (200)
  testsTotal++;
  console.log('Test 4: Production + ticketbazaar.co.in + /test → Should return 200');
  try {
    const result = await simulateRequest('/test', 'ticketbazaar.co.in', 'production');
    if (result.status === 200) {
      console.log('   ✅ PASS: Non-API routes correctly allowed (200)');
      testsPassed++;
    } else {
      console.log(`   ❌ FAIL: Expected 200, got ${result.status}`);
      console.log(`   Response:`, result);
    }
  } catch (error: any) {
    console.log(`   ❌ FAIL: Error - ${error.message}`);
  }
  
  console.log(`\n📊 Integration Test Results: ${testsPassed}/${testsTotal} tests passed`);
  
  if (testsPassed === testsTotal) {
    console.log('🎉 All integration tests passed! API access restriction is working correctly in server context.');
    process.exit(0);
  } else {
    console.log('❌ Some integration tests failed. Please check the implementation.');
    process.exit(1);
  }
}

// Run the integration test
testIntegration().catch(console.error);