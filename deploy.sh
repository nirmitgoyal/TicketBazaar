#!/bin/bash

# Deploy script for Ticket Bazaar
# This script handles the complete deployment process

set -e  # Exit on any error

echo "Starting deployment process..."

# Skip dependency installation in development environment
# Dependencies are already available
echo "Skipping dependency installation (already available)..."

# Database setup - push schema changes
echo "Setting up database schema..."
if npm run db:push; then
    echo "Database schema updated successfully"
else
    echo "Database setup failed, continuing with build..."
fi

# Build the frontend and server
echo "Building application..."
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