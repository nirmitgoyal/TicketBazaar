#!/bin/bash

# Simplified deploy script for production
set -e

echo "🚀 Starting simplified deployment build..."

# Build frontend and backend
echo "🔨 Building application..."
vite build
esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

echo "✅ Build completed successfully!"
echo "🎉 Application is ready for deployment!"