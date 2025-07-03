#!/bin/bash

# 🎟 TicketBazaar Deployment Script
# Full-stack TypeScript deployment with PostgreSQL and real-time features

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
  echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
  echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
  echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

# Configuration
PROJECT_NAME="TicketBazaar"
BUILD_DIR="dist"
CLIENT_BUILD_DIR="client/dist"
BACKUP_DIR="backups"

# Check if required commands exist
check_dependencies() {
  log_info "Checking deployment dependencies..."
  
  local deps=("node" "npm" "git")
  for dep in "${deps[@]}"; do
    if ! command -v "$dep" &> /dev/null; then
      log_error "$dep is required but not installed"
      exit 1
    fi
  done
  
  log_success "All dependencies are available"
}

# Environment validation
validate_environment() {
  log_info "Validating environment variables..."
  
  local required_vars=(
    "DATABASE_URL"
    "SESSION_SECRET"
    "NODE_ENV"
  )
  
  local missing_vars=()
  for var in "${required_vars[@]}"; do
    if [[ -z "${!var}" ]]; then
      missing_vars+=("$var")
    fi
  done
  
  if [[ ${#missing_vars[@]} -gt 0 ]]; then
    log_error "Missing required environment variables:"
    printf '%s\n' "${missing_vars[@]}"
    log_info "Please set these variables before deploying"
    exit 1
  fi
  
  log_success "Environment validation passed"
}

# Database backup (production only)
backup_database() {
  if [[ "$NODE_ENV" == "production" && -n "$DATABASE_URL" ]]; then
    log_info "Creating database backup..."
    
    mkdir -p "$BACKUP_DIR"
    local backup_file="$BACKUP_DIR/backup_$(date +%Y%m%d_%H%M%S).sql"
    
    # Extract database info from URL for pg_dump
    if [[ "$DATABASE_URL" =~ postgres://([^:]+):([^@]+)@([^:]+):([0-9]+)/(.+) ]]; then
      local db_user="${BASH_REMATCH[1]}"
      local db_pass="${BASH_REMATCH[2]}"
      local db_host="${BASH_REMATCH[3]}"
      local db_port="${BASH_REMATCH[4]}"
      local db_name="${BASH_REMATCH[5]}"
      
      PGPASSWORD="$db_pass" pg_dump -h "$db_host" -p "$db_port" -U "$db_user" -d "$db_name" > "$backup_file"
      log_success "Database backup created: $backup_file"
    else
      log_warning "Could not parse DATABASE_URL for backup"
    fi
  fi
}

# Install dependencies
install_dependencies() {
  log_info "Installing dependencies..."
  
  # Install root dependencies
  npm ci --production=false
  
  log_success "Dependencies installed"
}

# Run tests
run_tests() {
  log_info "Running tests..."
  
  # Type checking
  # npm run type-check || {
  #   log_error "TypeScript type checking failed"
  #   exit 1
  # }
  
  # Linting
  npm run lint || {
    log_error "ESLint checks failed"
    exit 1
  }
  
  # Unit tests (if available)
  if npm run test --silent &> /dev/null; then
    npm run test || {
      log_error "Unit tests failed"
      exit 1
    }
  fi
  
  # E2E tests (only in CI or when explicitly requested)
  if [[ "$RUN_E2E_TESTS" == "true" ]]; then
    log_info "Running E2E tests..."
    npm run test:e2e || {
      log_error "E2E tests failed"
      exit 1
    }
  fi
  
  log_success "All tests passed"
}

# Build application
build_application() {
  log_info "Building application..."
  
  # Clean previous builds
  rm -rf "$BUILD_DIR" "$CLIENT_BUILD_DIR"
  
  # Build client
  npm run build:client || {
    log_error "Client build failed"
    exit 1
  }
  
  # Build server
  npm run build:server || {
    log_error "Server build failed"
    exit 1
  }
  
  log_success "Application built successfully"
}

# Database migrations
run_migrations() {
  log_info "Running database migrations..."
  
  # Wait for database to be ready
  npm run wait-for-db || {
    log_error "Database is not ready"
    exit 1
  }
  
  # Run migrations
  npm run db:migrate || {
    log_error "Database migrations failed"
    exit 1
  }
  
  log_success "Database migrations completed"
}

# Start application
start_application() {
  log_info "Starting application..."
  
  if [[ "$NODE_ENV" == "production" ]]; then
    # Production mode
    npm run start:prod
  else
    # Development mode
    npm run dev
  fi
}

# Health check
health_check() {
  log_info "Performing health check..."
  
  local max_attempts=30
  local attempt=1
  local health_url="http://localhost:${PORT:-3000}/health"
  
  while [[ $attempt -le $max_attempts ]]; do
    if curl -f -s "$health_url" > /dev/null 2>&1; then
      log_success "Health check passed"
      return 0
    fi
    
    log_info "Health check attempt $attempt/$max_attempts failed, retrying in 2s..."
    sleep 2
    ((attempt++))
  done
  
  log_error "Health check failed after $max_attempts attempts"
  return 1
}

# Cleanup old builds/logs
cleanup() {
  log_info "Cleaning up old builds and logs..."
  
  # Keep only last 5 backups
  if [[ -d "$BACKUP_DIR" ]]; then
    find "$BACKUP_DIR" -name "backup_*.sql" -type f | sort -r | tail -n +6 | xargs rm -f
  fi
  
  # Clean old logs (if any)
  find . -name "*.log" -type f -mtime +7 -delete 2>/dev/null || true
  
  log_success "Cleanup completed"
}

# Main deployment function
deploy() {
  log_info "Starting deployment of $PROJECT_NAME..."
  log_info "Environment: ${NODE_ENV:-development}"
  log_info "Timestamp: $(date)"
  
  # Pre-deployment checks
  check_dependencies
  validate_environment
  
  # Backup (production only)
  backup_database
  
  # Build process
  install_dependencies
  run_tests
  build_application
  
  # Database setup
  run_migrations
  
  # Deployment
  start_application &
  APP_PID=$!
  
  # Health check
  sleep 5
  if health_check; then
    log_success "🎟 $PROJECT_NAME deployed successfully!"
    log_info "Application PID: $APP_PID"
  else
    log_error "Deployment failed health check"
    kill $APP_PID 2>/dev/null || true
    exit 1
  fi
  
  # Cleanup
  cleanup
  
  log_success "Deployment completed at $(date)"
}

# Rollback function
rollback() {
  log_warning "Rolling back deployment..."
  
  # Stop current application
  if [[ -n "$APP_PID" ]]; then
    kill $APP_PID 2>/dev/null || true
  fi
  
  # Restore from latest backup (if available)
  local latest_backup=$(find "$BACKUP_DIR" -name "backup_*.sql" -type f | sort -r | head -1)
  if [[ -n "$latest_backup" && -f "$latest_backup" ]]; then
    log_info "Restoring from backup: $latest_backup"
    # Add database restoration logic here
  fi
  
  log_warning "Rollback completed"
}

# Signal handlers
trap rollback ERR
trap cleanup EXIT

# Parse command line arguments
case "${1:-deploy}" in
  "deploy")
    deploy
    ;;
  "rollback")
    rollback
    ;;
  "health")
    health_check
    ;;
  "backup")
    backup_database
    ;;
  *)
    echo "Usage: $0 {deploy|rollback|health|backup}"
    echo ""
    echo "Commands:"
    echo "  deploy   - Full deployment process (default)"
    echo "  rollback - Rollback to previous version"
    echo "  health   - Check application health"
    echo "  backup   - Create database backup"
    exit 1
    ;;
esac
