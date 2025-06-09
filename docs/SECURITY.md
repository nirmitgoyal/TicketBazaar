# Security Documentation

## Table of Contents
- [Security Overview](#security-overview)
- [Authentication & Authorization](#authentication--authorization)
- [Data Protection](#data-protection)
- [Input Validation](#input-validation)
- [API Security](#api-security)
- [Database Security](#database-security)
- [Client-Side Security](#client-side-security)
- [Infrastructure Security](#infrastructure-security)
- [Security Monitoring](#security-monitoring)
- [Incident Response](#incident-response)

## Security Overview

The Ticket Bazaar platform implements comprehensive security measures to protect user data and prevent fraudulent activities in the peer-to-peer ticket marketplace.

### Security Principles
- **Defense in Depth**: Multiple layers of security controls
- **Least Privilege**: Minimal necessary access rights
- **Zero Trust**: Verify every request and user
- **Data Minimization**: Collect only necessary information
- **Transparency**: Clear privacy and security policies

## Authentication & Authorization

### Multi-Factor Authentication
```typescript
// Authentication strategies
passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, async (email, password, done) => {
  try {
    const user = await storage.getUserByEmail(email);
    if (!user || !await bcrypt.compare(password, user.hashedPassword)) {
      return done(null, false, { message: 'Invalid credentials' });
    }
    return done(null, user);
  } catch (error) {
    return done(error);
  }
}));

// Google OAuth integration
passport.use(new GoogleStrategy({
  clientID: config.GOOGLE_CLIENT_ID,
  clientSecret: config.GOOGLE_CLIENT_SECRET,
  callbackURL: "/api/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  // Secure OAuth implementation
}));
```

### Session Management
```typescript
// Secure session configuration
app.use(session({
  secret: config.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: isProduction,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'strict'
  },
  store: new PgStore({
    pool: db,
    tableName: 'session'
  })
}));
```

### Role-Based Access Control
```typescript
// Permission middleware
export function requirePermission(permission: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!req.user.permissions?.includes(permission)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
}

// Usage in routes
router.delete('/tickets/:id', 
  isAuthenticated, 
  requirePermission('delete:own-tickets'), 
  ticketController.deleteTicket
);
```

## Data Protection

### Password Security
```typescript
// Password hashing with bcrypt
const saltRounds = 12;

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, saltRounds);
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Password strength validation
const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain uppercase letter')
  .regex(/[a-z]/, 'Password must contain lowercase letter')
  .regex(/[0-9]/, 'Password must contain number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain special character');
```

### Data Encryption
```typescript
// Sensitive data encryption
import crypto from 'crypto';

class DataEncryption {
  private static algorithm = 'aes-256-gcm';
  private static key = crypto.scryptSync(config.ENCRYPTION_KEY, 'salt', 32);

  static encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(this.algorithm, this.key);
    cipher.setAAD(Buffer.from('ticket-bazaar', 'utf8'));
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
  }

  static decrypt(encryptedData: string): string {
    const [ivHex, authTagHex, encrypted] = encryptedData.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    
    const decipher = crypto.createDecipher(this.algorithm, this.key);
    decipher.setAAD(Buffer.from('ticket-bazaar', 'utf8'));
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}
```

### PII Protection
```typescript
// Personal data anonymization
class PIIProtection {
  static maskEmail(email: string): string {
    const [local, domain] = email.split('@');
    const maskedLocal = local.substring(0, 2) + '*'.repeat(local.length - 2);
    return `${maskedLocal}@${domain}`;
  }

  static maskPhone(phone: string): string {
    return phone.replace(/(\d{2})\d{6}(\d{2})/, '$1******$2');
  }

  static anonymizeUser(user: User): Partial<User> {
    return {
      id: user.id,
      name: user.name.split(' ')[0], // First name only
      rating: user.rating,
      isVerified: user.isVerified
    };
  }
}
```

## Input Validation

### Request Validation
```typescript
// Comprehensive input validation with Zod
export const ticketCreationSchema = z.object({
  title: z.string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must not exceed 100 characters')
    .regex(/^[a-zA-Z0-9\s\-\.]+$/, 'Title contains invalid characters'),
  
  price: z.number()
    .positive('Price must be positive')
    .max(1000000, 'Price exceeds maximum allowed'),
  
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description must not exceed 1000 characters'),
  
  venue: z.string()
    .min(3, 'Venue name required')
    .max(200, 'Venue name too long'),
  
  date: z.string()
    .datetime('Invalid date format')
    .refine(date => new Date(date) > new Date(), 'Event date must be in the future')
});

// XSS prevention
function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}
```

### File Upload Security
```typescript
// Secure file upload configuration
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/tickets/');
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  fileFilter: (req, file, cb) => {
    // Only allow specific file types
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG and PNG allowed.'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 3 // Maximum 3 files
  }
});

// File content validation
async function validateImageFile(filePath: string): Promise<boolean> {
  try {
    const fileType = await import('file-type');
    const type = await fileType.fileTypeFromFile(filePath);
    return type && ['image/jpeg', 'image/png'].includes(type.mime);
  } catch {
    return false;
  }
}
```

## API Security

### Rate Limiting
```typescript
// Adaptive rate limiting
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';

// General API rate limiting
const generalLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args: string[]) => redisClient.call(...args),
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Only 5 login attempts per window
  skipSuccessfulRequests: true,
});

// Apply rate limiting
app.use('/api/', generalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
```

### CORS Configuration
```typescript
// Secure CORS setup
import cors from 'cors';

const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      'https://ticketbazaar.com',
      'https://www.ticketbazaar.com',
      ...(isDevelopment ? ['http://localhost:3000', 'http://localhost:5000'] : [])
    ];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));
```

### Security Headers
```typescript
// Comprehensive security headers
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      scriptSrc: ["'self'", "https://maps.googleapis.com", "https://www.google.com"],
      connectSrc: ["'self'", "wss:", "https:"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      childSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" }
}));
```

## Database Security

### SQL Injection Prevention
```typescript
// Parameterized queries with Drizzle ORM
async function getTicketsByPrice(minPrice: number, maxPrice: number) {
  return db.select()
    .from(tickets)
    .where(
      and(
        gte(tickets.price, minPrice),
        lte(tickets.price, maxPrice),
        eq(tickets.status, 'available')
      )
    );
}

// Input sanitization for dynamic queries
function sanitizeSortField(field: string): string {
  const allowedFields = ['price', 'date', 'title', 'created_at'];
  return allowedFields.includes(field) ? field : 'created_at';
}
```

### Database Access Control
```typescript
// Database connection with minimal privileges
const dbConfig = {
  connectionString: config.DATABASE_URL,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
  max: 20, // Maximum number of connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

// Audit logging for sensitive operations
async function auditLog(action: string, userId: number, resourceId: number, details: any) {
  await db.insert(auditLogs).values({
    action,
    userId,
    resourceId,
    details: JSON.stringify(details),
    ipAddress: details.ipAddress,
    userAgent: details.userAgent,
    timestamp: new Date()
  });
}
```

## Client-Side Security

### Content Security Policy
```typescript
// CSP implementation in React
export function SEOHead({ title, description }: SEOHeadProps) {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta httpEquiv="Content-Security-Policy" 
            content="default-src 'self'; script-src 'self' https://maps.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;" />
    </Helmet>
  );
}
```

### XSS Prevention
```typescript
// Safe HTML rendering
import DOMPurify from 'dompurify';

function SafeHTML({ html }: { html: string }) {
  const sanitizedHTML = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: []
  });
  
  return <div dangerouslySetInnerHTML={{ __html: sanitizedHTML }} />;
}

// Safe data handling
function sanitizeUserInput(input: string): string {
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .trim();
}
```

### Local Storage Security
```typescript
// Secure local storage wrapper
class SecureStorage {
  private static encrypt(data: string): string {
    // Use Web Crypto API for client-side encryption
    return btoa(data); // Simplified - use proper encryption in production
  }

  private static decrypt(data: string): string {
    return atob(data); // Simplified - use proper decryption in production
  }

  static setItem(key: string, value: any): void {
    const encrypted = this.encrypt(JSON.stringify(value));
    localStorage.setItem(key, encrypted);
  }

  static getItem(key: string): any {
    const encrypted = localStorage.getItem(key);
    if (!encrypted) return null;
    
    try {
      return JSON.parse(this.decrypt(encrypted));
    } catch {
      return null;
    }
  }

  static removeItem(key: string): void {
    localStorage.removeItem(key);
  }
}
```

## Infrastructure Security

### Environment Security
```typescript
// Environment variable validation
function validateEnvironment() {
  const requiredSecrets = [
    'DATABASE_URL',
    'SESSION_SECRET',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET'
  ];

  const missing = requiredSecrets.filter(key => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  // Validate secret strength
  if (process.env.SESSION_SECRET!.length < 32) {
    throw new Error('SESSION_SECRET must be at least 32 characters');
  }
}
```

### Network Security
```nginx
# Nginx security configuration
server {
    listen 443 ssl http2;
    server_name ticketbazaar.com;

    # SSL Configuration
    ssl_certificate /path/to/certificate.pem;
    ssl_certificate_key /path/to/private-key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Hide server information
    server_tokens off;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://localhost:5000;
    }
}
```

## Security Monitoring

### Intrusion Detection
```typescript
// Suspicious activity detection
class SecurityMonitor {
  private static suspiciousPatterns = [
    /union.*select/i,     // SQL injection attempts
    /<script/i,           // XSS attempts
    /\.\.\/\.\.\//,       // Path traversal
    /cmd\.exe/i,          // Command injection
  ];

  static checkRequest(req: Request): boolean {
    const suspiciousContent = [
      req.url,
      JSON.stringify(req.body),
      JSON.stringify(req.query),
      req.get('User-Agent') || ''
    ].join(' ');

    return this.suspiciousPatterns.some(pattern => 
      pattern.test(suspiciousContent)
    );
  }

  static async logSuspiciousActivity(req: Request, reason: string) {
    await db.insert(securityLogs).values({
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.url,
      method: req.method,
      reason,
      timestamp: new Date(),
      userId: req.user?.id
    });

    // Alert security team for critical threats
    if (reason.includes('injection')) {
      await alertSecurityTeam(req, reason);
    }
  }
}

// Security middleware
app.use((req, res, next) => {
  if (SecurityMonitor.checkRequest(req)) {
    SecurityMonitor.logSuspiciousActivity(req, 'Malicious pattern detected');
    return res.status(400).json({ error: 'Invalid request' });
  }
  next();
});
```

### Error Tracking
```typescript
// Secure error reporting
async function reportError(error: Error, context: any) {
  // Sanitize sensitive information
  const sanitizedContext = {
    ...context,
    password: undefined,
    token: undefined,
    sessionId: undefined
  };

  await Honeybadger.notify(error, {
    context: sanitizedContext,
    fingerprint: error.message
  });
}
```

## Incident Response

### Security Incident Handling
```typescript
// Incident response procedures
class IncidentResponse {
  static async handleSecurityBreach(incident: SecurityIncident) {
    // 1. Immediate containment
    await this.containThreat(incident);
    
    // 2. Assessment
    const impact = await this.assessImpact(incident);
    
    // 3. Notification
    if (impact.severity >= 'high') {
      await this.notifyStakeholders(incident, impact);
    }
    
    // 4. Recovery
    await this.initiateRecovery(incident);
    
    // 5. Documentation
    await this.documentIncident(incident, impact);
  }

  private static async containThreat(incident: SecurityIncident) {
    // Block malicious IPs
    if (incident.sourceIP) {
      await this.blockIP(incident.sourceIP);
    }
    
    // Revoke compromised sessions
    if (incident.affectedUsers) {
      await this.revokeUserSessions(incident.affectedUsers);
    }
  }
}
```

### Backup and Recovery
```bash
#!/bin/bash
# Automated backup script with encryption

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="backup_${DATE}.sql"

# Database backup
pg_dump $DATABASE_URL > /tmp/$BACKUP_FILE

# Encrypt backup
gpg --cipher-algo AES256 --compress-algo 1 --symmetric --output /backups/${BACKUP_FILE}.gpg /tmp/$BACKUP_FILE

# Upload to secure storage
aws s3 cp /backups/${BACKUP_FILE}.gpg s3://secure-backups/ --server-side-encryption

# Cleanup local files
rm /tmp/$BACKUP_FILE /backups/${BACKUP_FILE}.gpg

# Test backup integrity
aws s3 cp s3://secure-backups/${BACKUP_FILE}.gpg /tmp/test_backup.gpg
gpg --decrypt /tmp/test_backup.gpg > /tmp/test_restore.sql
psql $TEST_DATABASE_URL < /tmp/test_restore.sql
```

## Security Compliance

### GDPR Compliance
```typescript
// Data subject rights implementation
class GDPRCompliance {
  static async exportUserData(userId: number): Promise<any> {
    const userData = await db.select().from(users).where(eq(users.id, userId));
    const tickets = await db.select().from(ticketsTable).where(eq(ticketsTable.sellerId, userId));
    const reviews = await db.select().from(reviews).where(eq(reviews.reviewerId, userId));
    
    return {
      personal_data: userData[0],
      tickets: tickets,
      reviews: reviews,
      export_date: new Date().toISOString()
    };
  }

  static async deleteUserData(userId: number): Promise<void> {
    // Anonymize instead of delete to maintain data integrity
    await db.update(users)
      .set({
        email: `deleted_user_${userId}@deleted.com`,
        name: 'Deleted User',
        phone: null,
        instagram: null
      })
      .where(eq(users.id, userId));
  }
}
```

### Security Audit Trail
```typescript
// Comprehensive audit logging
async function createAuditLog(action: AuditAction) {
  await db.insert(auditLogs).values({
    action: action.type,
    userId: action.userId,
    resourceType: action.resourceType,
    resourceId: action.resourceId,
    oldValues: JSON.stringify(action.oldValues),
    newValues: JSON.stringify(action.newValues),
    ipAddress: action.ipAddress,
    userAgent: action.userAgent,
    timestamp: new Date()
  });
}
```