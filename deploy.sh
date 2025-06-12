#!/bin/bash

# Production deployment script for Ticket Bazaar
# This script builds the application for production deployment

set -e

echo "Starting production build..."

# Install dependencies
echo "Installing dependencies..."
npm ci

# Build application (client + server)
echo "Building application..."
npm run build

# Push database schema
echo "Pushing database schema..."
npm run db:push

echo "Production build completed successfully!"