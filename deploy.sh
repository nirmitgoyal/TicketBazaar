#!/bin/bash

# Deploy script for ticket resale platform
set -e

echo "🚀 Starting deployment build process..."

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --production=false

# Run database migrations
echo "🗄️ Pushing database schema..."
npm run db:push

# Build the application
echo "🔨 Building application..."
npm run build

# Run pre-deployment tests
echo "🧪 Running pre-deployment tests..."
node pre-deploy-tests.js

echo "✅ Build completed successfully!"
echo "🎉 Application is ready for deployment!"