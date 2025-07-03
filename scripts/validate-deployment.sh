#!/bin/bash

# 🎟 TicketBazaar CI Deployment Validation Script
# Lightweight validation for CI environments

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
  echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
  echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_info "🎟 TicketBazaar CI Deployment Validation"
log_info "Environment: ${NODE_ENV:-development}"
log_info "CI: ${CI:-false}"

# Validate build artifacts
if [ -d "dist" ] && [ "$(ls -A dist 2>/dev/null)" ]; then
  log_success "Build artifacts validated"
  log_info "Build contents:"
  ls -la dist/
else
  echo "❌ No build artifacts found"
  exit 1
fi

# Validate package.json and dependencies
if [ -f "package.json" ]; then
  log_success "Package.json found"
else
  echo "❌ Package.json not found"
  exit 1
fi

# Validate Procfile for Heroku
if [ -f "Procfile" ]; then
  log_success "Procfile found"
  log_info "Procfile contents:"
  cat Procfile
else
  echo "❌ Procfile not found"
  exit 1
fi

# Check if main server file exists
if [ -f "dist/index.js" ]; then
  log_success "Main server file (dist/index.js) found"
else
  echo "❌ Main server file not found"
  exit 1
fi

log_success "🎟 CI deployment validation completed successfully!"
echo "Ready for Heroku deployment"
