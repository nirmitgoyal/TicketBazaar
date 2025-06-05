#!/bin/bash

# Deploy script for Ticket Bazaar
# This script handles the complete deployment process

set -e  # Exit on any error

echo "Starting deployment process..."

# Use the existing package.json build script which works correctly
echo "Building application using npm build script..."
npm run build

# Verify build output exists
echo "Verifying build output..."
if [ ! -d "dist" ]; then
    echo "Build output directory 'dist' not found"
    exit 1
fi

if [ ! -f "dist/index.js" ]; then
    echo "Server build output 'dist/index.js' not found"
    exit 1
fi

echo "Build contents:"
ls -la dist/

echo "Deployment build completed successfully!"
echo "Application is ready to be deployed"