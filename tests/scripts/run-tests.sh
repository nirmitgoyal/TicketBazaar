#!/bin/bash

# Comprehensive E2E Test Runner Script
set -e

echo "🚀 Starting Comprehensive E2E Test Suite"

# Create test results directory
mkdir -p test-results/screenshots test-results/videos test-results/html-report

# Check if server is running
if ! curl -f http://localhost:5000 > /dev/null 2>&1; then
    echo "❌ Server not running on port 5000. Please start the application first."
    exit 1
fi

echo "✅ Server is running"

# Run different test suites based on argument
case "${1:-all}" in
    "quick")
        echo "🏃 Running quick smoke tests"
        npx playwright test tests/e2e/01-navigation-routing.spec.ts --reporter=line
        ;;
    "forms")
        echo "📝 Running form validation tests"
        npx playwright test tests/e2e/02-form-validation.spec.ts --reporter=html
        ;;
    "realtime")
        echo "⚡ Running real-time feature tests"
        npx playwright test tests/e2e/03-websocket-realtime.spec.ts --reporter=html
        ;;
    "maps")
        echo "🗺️ Running interactive map tests"
        npx playwright test tests/e2e/04-interactive-map.spec.ts --reporter=html
        ;;
    "ui")
        echo "🎨 Running UI animation tests"
        npx playwright test tests/e2e/05-ui-animations.spec.ts --reporter=html
        ;;
    "errors")
        echo "⚠️ Running error handling tests"
        npx playwright test tests/e2e/06-error-handling.spec.ts --reporter=html
        ;;
    "journeys")
        echo "🛤️ Running user journey tests"
        npx playwright test tests/e2e/07-user-journeys.spec.ts --reporter=html
        ;;
    "all")
        echo "🔄 Running complete test suite"
        npx playwright test --reporter=html
        ;;
    *)
        echo "Usage: $0 [quick|forms|realtime|maps|ui|errors|journeys|all]"
        exit 1
        ;;
esac

echo "✅ Test execution completed"
echo "📊 View detailed report: test-results/html-report/index.html"