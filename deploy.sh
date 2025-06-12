#!/bin/bash

# Production deployment script for Ticket Bazaar
# This script builds the application for production deployment

set -e
set -o pipefail
set -u

echo "Starting production build..."

# Install dependencies
echo "Installing dependencies..."
npm install --production

# Build application (client + server)
echo "Building application..."
npm run build

# Push database schema
echo "Applying database migrations..."
npm run db:migrate

echo "Production build completed successfully!"