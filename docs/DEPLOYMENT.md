# Deployment Guide

## Table of Contents
- [Environment Setup](#environment-setup)
- [Database Configuration](#database-configuration)
- [Replit Deployment](#replit-deployment)
- [Production Deployment](#production-deployment)
- [Environment Variables](#environment-variables)
- [SSL and Security](#ssl-and-security)
- [Monitoring and Logging](#monitoring-and-logging)
- [Backup and Recovery](#backup-and-recovery)

## Environment Setup

### Prerequisites
- Node.js 22.x or higher
- PostgreSQL 15+ database
- Redis (for session storage in production)
- Domain name with SSL certificate

### Development Environment
```bash
# Clone repository
git clone <repository-url>
cd ticket-bazaar

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your configuration

# Initialize database
npm run db:push
npm run db:seed

# Start development server
npm run dev
```

## Database Configuration

### PostgreSQL Setup
The application uses PostgreSQL with Drizzle ORM for database operations.

#### Local Development
```bash
# Install PostgreSQL (Ubuntu/Debian)
sudo apt-get install postgresql postgresql-contrib

# Create database
sudo -u postgres createdb ticket_bazaar

# Create user
sudo -u postgres createuser --interactive
```

#### Production Database (NeonDB)
1. Create account at [neon.tech](https://neon.tech)
2. Create new project
3. Copy connection string to `DATABASE_URL`

#### Database Schema Management
```bash
# Push schema changes to database
npm run db:push

# Generate migration files (if needed)
npm run db:generate

# Apply migrations
npm run db:migrate
```

### Database Connection Pooling
Production deployments should use connection pooling:
```env
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require&pgbouncer=true&connection_limit=20"
```

## Replit Deployment

### Automatic Deployment
The application is optimized for Replit with zero-configuration deployment:

1. Import repository into Replit
2. Configure environment variables in Secrets tab
3. Run the application

### Required Secrets in Replit
```env
DATABASE_URL=postgresql://your-neon-connection-string
SESSION_SECRET=your-secure-session-secret
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-secret
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
HONEYBADGER_API_KEY=your-honeybadger-api-key
```

### Replit Configuration Files
- `replit.nix`: Defines system dependencies
- `.replit`: Specifies run command and environment
- `Procfile`: For production deployment

## Production Deployment

### Docker Deployment
```dockerfile
FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy application code
COPY . .

# Build application
RUN npm run build

# Expose port
EXPOSE 5000

# Start application
CMD ["npm", "start"]
```

### Docker Compose
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - SESSION_SECRET=${SESSION_SECRET}
    depends_on:
      - redis
      
  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
      
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl
```

### Heroku Deployment
```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login

# Create application
heroku create ticket-bazaar-prod

# Add PostgreSQL addon
heroku addons:create heroku-postgresql:mini

# Set environment variables
heroku config:set SESSION_SECRET=your-secret
heroku config:set GOOGLE_CLIENT_ID=your-id
heroku config:set GOOGLE_CLIENT_SECRET=your-secret

# Deploy
git push heroku main
```

### VPS Deployment
```bash
# Install Node.js and PM2
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g pm2

# Clone and setup application
git clone <repository-url>
cd ticket-bazaar
npm install
npm run build

# Start with PM2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

## Environment Variables

### Required Variables
```env
# Database
DATABASE_URL=postgresql://username:password@host:port/database

# Session Management
SESSION_SECRET=cryptographically-secure-random-string

# Authentication
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-secret

# External Services
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
HONEYBADGER_API_KEY=your-honeybadger-api-key

# Application
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-domain.com
```

### Optional Variables
```env
# Payment Processing
STRIPE_SECRET_KEY=your-stripe-secret-key
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_SECRET=your-razorpay-secret

# Analytics
GOOGLE_ANALYTICS_ID=your-ga-tracking-id

# Performance Monitoring
PERFORMANCE_MONITORING_URL=your-monitoring-endpoint
```

### Environment Validation
The application validates all required environment variables at startup:
```typescript
// server/config/environment.ts
function validateEnvironment(): EnvironmentConfig {
  const required = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    DATABASE_URL: process.env.DATABASE_URL,
    SESSION_SECRET: process.env.SESSION_SECRET,
    // ... other required variables
  };

  for (const [key, value] of Object.entries(required)) {
    if (!value) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }

  return required as EnvironmentConfig;
}
```

## SSL and Security

### SSL Certificate Setup
```bash
# Using Certbot for Let's Encrypt
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Security Headers
```javascript
// Security middleware configuration
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'", "https://maps.googleapis.com"],
      connectSrc: ["'self'", "wss:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

## Monitoring and Logging

### Application Monitoring
```javascript
// Honeybadger error tracking
import Honeybadger from '@honeybadger-io/js';

Honeybadger.configure({
  apiKey: process.env.HONEYBADGER_API_KEY,
  environment: process.env.NODE_ENV,
  reportData: true
});
```

### Performance Monitoring
```javascript
// Performance metrics collection
const performance = {
  startTime: Date.now(),
  
  trackPageLoad(page) {
    const loadTime = Date.now() - this.startTime;
    // Send to analytics service
  },
  
  trackAPIResponse(endpoint, duration) {
    // Monitor API response times
  }
};
```

### Log Management
```javascript
// Structured logging
const logger = {
  info: (message, meta = {}) => {
    console.log(JSON.stringify({
      level: 'info',
      message,
      timestamp: new Date().toISOString(),
      ...meta
    }));
  },
  
  error: (message, error, meta = {}) => {
    console.error(JSON.stringify({
      level: 'error',
      message,
      error: error.stack,
      timestamp: new Date().toISOString(),
      ...meta
    }));
  }
};
```

## Backup and Recovery

### Database Backup
```bash
# Automated daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="backup_${DATE}.sql"

pg_dump $DATABASE_URL > /backups/$BACKUP_FILE
gzip /backups/$BACKUP_FILE

# Upload to cloud storage
aws s3 cp /backups/${BACKUP_FILE}.gz s3://your-backup-bucket/

# Keep only last 30 days
find /backups -name "backup_*.sql.gz" -mtime +30 -delete
```

### Application Backup
```bash
# Backup uploaded files
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz uploads/

# Backup configuration
cp .env .env.backup.$(date +%Y%m%d)
```

### Recovery Procedures
```bash
# Database recovery
gunzip -c backup_file.sql.gz | psql $DATABASE_URL

# Application recovery
tar -xzf uploads_backup.tar.gz
cp .env.backup .env
npm install
npm run build
pm2 restart all
```

## Health Checks

### Application Health Endpoint
```javascript
// Health check endpoint
app.get('/api/health', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: 'disconnected',
    memory: process.memoryUsage()
  };

  try {
    await db.query('SELECT 1');
    health.database = 'connected';
  } catch (error) {
    health.status = 'unhealthy';
    health.database = 'error';
  }

  res.status(health.status === 'healthy' ? 200 : 503).json(health);
});
```

### Monitoring Setup
```bash
# Setup monitoring with PM2
pm2 install pm2-server-monit

# Configure alerts
pm2 set pm2-server-monit:server-url https://your-monitoring-server.com
pm2 set pm2-server-monit:secret-key your-secret-key
```

## Performance Optimization

### Caching Strategy
```javascript
// Redis caching
const redis = require('redis');
const client = redis.createClient(process.env.REDIS_URL);

const cache = {
  set: (key, value, ttl = 3600) => {
    client.setex(key, ttl, JSON.stringify(value));
  },
  
  get: async (key) => {
    const value = await client.get(key);
    return value ? JSON.parse(value) : null;
  }
};
```

### CDN Configuration
```javascript
// Static asset optimization
app.use('/static', express.static('public', {
  maxAge: '1y',
  etag: true,
  lastModified: true
}));
```

## Troubleshooting

### Common Issues
1. **Database Connection Errors**
   - Check DATABASE_URL format
   - Verify network connectivity
   - Check connection pool settings

2. **Memory Issues**
   - Monitor memory usage with PM2
   - Implement connection pooling
   - Optimize database queries

3. **Performance Issues**
   - Enable gzip compression
   - Implement caching strategy
   - Optimize database indexes

### Debug Mode
```bash
# Enable debug logging
DEBUG=* npm start

# Database query logging
DEBUG=drizzle:* npm start

# Performance profiling
node --prof app.js
```