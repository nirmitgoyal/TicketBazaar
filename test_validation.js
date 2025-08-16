// Simple test script for search validation
const { validateSearchQuery } = require('./test_output/middleware/search-validation.middleware.js');

console.log('Testing Enhanced Search Validation...');

// Mock request and response
function createMockReq(query) {
  return { query: { q: query } };
}

function createMockRes() {
  const res = {
    statusCode: 200,
    responseData: null,
    status: function(code) {
      this.statusCode = code;
      return this;
    },
    json: function(data) {
      this.responseData = data;
      console.log(`Response ${this.statusCode}:`, JSON.stringify(data, null, 2));
      return this;
    }
  };
  return res;
}

function mockNext() {
  console.log('✓ Next() called - request passed validation');
}

// Test cases
console.log('\n--- Test 1: Normal query ---');
const req1 = createMockReq('concert tickets');
const res1 = createMockRes();
validateSearchQuery(req1, res1, mockNext);
console.log('Sanitized query:', req1.query.q);

console.log('\n--- Test 2: XSS attempt ---');
const req2 = createMockReq('<script>alert("xss")</script>');
const res2 = createMockRes();
validateSearchQuery(req2, res2, mockNext);

console.log('\n--- Test 3: SQL injection attempt ---');
const req3 = createMockReq("' UNION SELECT * FROM users --");
const res3 = createMockRes();
validateSearchQuery(req3, res3, mockNext);

console.log('\n--- Test 4: Special characters ---');
const req4 = createMockReq('!@#$%^&*()_+concert');
const res4 = createMockRes();
validateSearchQuery(req4, res4, mockNext);

console.log('\n--- Test 5: Empty query ---');
const req5 = createMockReq('');
const res5 = createMockRes();
validateSearchQuery(req5, res5, mockNext);

console.log('\n--- Test 6: Too long query ---');
const req6 = createMockReq('a'.repeat(250));
const res6 = createMockRes();
validateSearchQuery(req6, res6, mockNext);

console.log('\n✓ All tests completed!');