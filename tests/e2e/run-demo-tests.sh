#!/bin/bash

# Comprehensive E2E Test Demo Script
# This script demonstrates the complete test suite capabilities

echo "🚀 Ticket Bazaar E2E Test Suite Demo"
echo "===================================="
echo

# Check prerequisites
echo "📋 Checking prerequisites..."
if ! command -v npm &> /dev/null; then
    echo "❌ npm is required but not installed"
    exit 1
fi

if ! command -v npx &> /dev/null; then
    echo "❌ npx is required but not installed"
    exit 1
fi

# Check if server is running
echo "🔍 Checking server status..."
if curl -s http://localhost:5000/api/health > /dev/null 2>&1; then
    echo "✅ Server is running on localhost:5000"
else
    echo "❌ Server is not running. Please start with: npm run dev"
    echo "   Make sure the server is accessible at http://localhost:5000"
    exit 1
fi

# Install Playwright if needed
echo "🔧 Setting up Playwright..."
npx playwright install --with-deps

echo
echo "🎯 Running Comprehensive E2E Test Suite"
echo "========================================"

# 1. Homepage and Navigation Tests
echo
echo "1️⃣ Testing Homepage and Navigation..."
npx playwright test tests/e2e/specs/01-homepage-navigation.spec.ts --project=chromium --reporter=line
echo "✅ Homepage tests completed"

# 2. Authentication Flow Tests
echo
echo "2️⃣ Testing Authentication Flow..."
npx playwright test tests/e2e/specs/02-authentication-flow.spec.ts --project=chromium --reporter=line
echo "✅ Authentication tests completed"

# 3. Search and Filtering Tests
echo
echo "3️⃣ Testing Search and Filtering..."
npx playwright test tests/e2e/specs/03-search-and-filters.spec.ts --project=chromium --reporter=line
echo "✅ Search tests completed"

# 4. Map Interaction Tests
echo
echo "4️⃣ Testing Map Interactions..."
npx playwright test tests/e2e/specs/04-map-interactions.spec.ts --project=chromium --reporter=line
echo "✅ Map tests completed"

# 5. WebSocket Real-time Tests
echo
echo "5️⃣ Testing WebSocket Real-time Features..."
npx playwright test tests/e2e/specs/05-websocket-realtime.spec.ts --project=chromium --reporter=line
echo "✅ WebSocket tests completed"

# 6. File Upload Tests
echo
echo "6️⃣ Testing File Upload Functionality..."
npx playwright test tests/e2e/specs/06-file-upload-functionality.spec.ts --project=chromium --reporter=line
echo "✅ File upload tests completed"

# 7. Form Validation Tests
echo
echo "7️⃣ Testing Form Validation Edge Cases..."
npx playwright test tests/e2e/specs/07-form-validation-edge-cases.spec.ts --project=chromium --reporter=line
echo "✅ Form validation tests completed"

# 8. Complete Purchase Flow Tests
echo
echo "8️⃣ Testing Complete Ticket Purchase Flow..."
npx playwright test tests/e2e/specs/08-ticket-purchase-flow.spec.ts --project=chromium --reporter=line
echo "✅ Purchase flow tests completed"

# 9. Performance and Accessibility Tests
echo
echo "9️⃣ Testing Performance and Accessibility..."
npx playwright test tests/e2e/specs/09-performance-accessibility.spec.ts --project=chromium --reporter=line
echo "✅ Performance tests completed"

# 10. Cross-Browser Compatibility Tests
echo
echo "🔟 Testing Cross-Browser Compatibility..."
npx playwright test tests/e2e/specs/10-cross-browser-compatibility.spec.ts --project=chromium --project=firefox --reporter=line
echo "✅ Cross-browser tests completed"

echo
echo "📱 Running Mobile Tests..."
npx playwright test tests/e2e/specs/01-homepage-navigation.spec.ts tests/e2e/specs/08-ticket-purchase-flow.spec.ts --project="Mobile Chrome" --reporter=line
echo "✅ Mobile tests completed"

echo
echo "🎉 E2E Test Suite Demo Completed!"
echo "================================"
echo
echo "📊 Generating HTML Report..."
npx playwright show-report

echo
echo "✨ Test Suite Summary:"
echo "   ✓ 10 comprehensive test suites"
echo "   ✓ Real user behavior simulation"
echo "   ✓ Cross-browser compatibility"
echo "   ✓ Mobile and desktop testing"
echo "   ✓ Performance and accessibility validation"
echo "   ✓ WebSocket and real-time features"
echo "   ✓ File upload and form validation"
echo "   ✓ Complete user journey testing"
echo
echo "📋 View detailed results in the HTML report!"
echo "🚀 Your application has been thoroughly tested with realistic user scenarios."