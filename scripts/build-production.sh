#!/bin/bash

# Production build script with asset validation
# This script ensures all assets are properly built and validates the build output

set -e  # Exit on any error

echo "🚀 Starting TicketBazaar production build..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist/

# Build the application
echo "🏗️ Building application..."
npm run build

# Validate build output
echo "🔍 Validating build output..."

BUILD_DIR="dist/public"

if [ ! -d "$BUILD_DIR" ]; then
    echo "❌ Build directory does not exist: $BUILD_DIR"
    exit 1
fi

# Check for required files
REQUIRED_FILES=(
    "index.html"
    "assets"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -e "$BUILD_DIR/$file" ]; then
        echo "❌ Required file/directory missing: $file"
        exit 1
    fi
done

# Check for JavaScript files
JS_FILES=$(find "$BUILD_DIR/assets" -name "*.js" | wc -l)
if [ "$JS_FILES" -eq 0 ]; then
    echo "❌ No JavaScript files found in assets directory"
    exit 1
fi

# Check for CSS files
CSS_FILES=$(find "$BUILD_DIR/assets" -name "*.css" | wc -l)
if [ "$CSS_FILES" -eq 0 ]; then
    echo "❌ No CSS files found in assets directory"
    exit 1
fi

# Check if index.html contains asset references
if ! grep -q "assets/" "$BUILD_DIR/index.html"; then
    echo "❌ index.html does not contain asset references"
    exit 1
fi

# Calculate build size
BUILD_SIZE=$(du -sh "$BUILD_DIR" | cut -f1)
echo "📊 Build size: $BUILD_SIZE"

# List generated assets
echo "📁 Generated assets:"
find "$BUILD_DIR/assets" -type f -name "*.js" -o -name "*.css" | sort

# Check for potential issues
echo "🔍 Checking for potential issues..."

# Check for very large files (> 1MB)
LARGE_FILES=$(find "$BUILD_DIR" -type f -size +1M)
if [ ! -z "$LARGE_FILES" ]; then
    echo "⚠️ Large files detected (>1MB):"
    echo "$LARGE_FILES"
fi

# Check for missing source maps in development
if [ "$NODE_ENV" != "production" ]; then
    MAP_FILES=$(find "$BUILD_DIR/assets" -name "*.map" | wc -l)
    if [ "$MAP_FILES" -eq 0 ]; then
        echo "⚠️ No source maps found (expected in development)"
    fi
fi

# Create a simple asset manifest
echo "📋 Creating asset manifest..."
MANIFEST_FILE="$BUILD_DIR/asset-manifest.json"
cat > "$MANIFEST_FILE" << EOF
{
  "buildTime": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "assets": {
    "js": [
$(find "$BUILD_DIR/assets" -name "*.js" | sed 's|'"$BUILD_DIR"'/||' | sed 's/.*/"&"/' | paste -sd, -)
    ],
    "css": [
$(find "$BUILD_DIR/assets" -name "*.css" | sed 's|'"$BUILD_DIR"'/||' | sed 's/.*/"&"/' | paste -sd, -)
    ]
  }
}
EOF

echo "✅ Build validation completed successfully!"
echo "🎉 Production build ready in: $BUILD_DIR"

# Optional: Run a quick smoke test
if command -v node &> /dev/null; then
    echo "🧪 Running smoke test..."
    node -e "
    const fs = require('fs');
    const path = require('path');
    
    // Check if index.html can be parsed
    const indexPath = path.join('$BUILD_DIR', 'index.html');
    const indexContent = fs.readFileSync(indexPath, 'utf8');
    
    if (!indexContent.includes('<!doctype html>') && !indexContent.includes('<!DOCTYPE html>')) {
        console.error('❌ index.html is not valid HTML');
        process.exit(1);
    }
    
    if (!indexContent.includes('<div id=\"root\">')) {
        console.error('❌ index.html missing root element');
        process.exit(1);
    }
    
    // Check for WebSocket prevention in production builds
    const jsFiles = fs.readdirSync(path.join('$BUILD_DIR', 'assets')).filter(f => f.endsWith('.js'));
    let foundWebSocketCode = false;
    
    for (const jsFile of jsFiles) {
        const jsContent = fs.readFileSync(path.join('$BUILD_DIR', 'assets', jsFile), 'utf8');
        if (jsContent.includes('WebSocket disabled in production')) {
            foundWebSocketCode = true;
            break;
        }
    }
    
    if (foundWebSocketCode) {
        console.log('✅ WebSocket production safety check passed');
    }
    
    console.log('✅ Smoke test passed');
    "
fi

echo "🚀 Build completed successfully!"
