import { z } from "zod";

/**
 * Environment variables schema for validation
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('5000'),
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid PostgreSQL connection string").optional(),
  SESSION_SECRET: z.string().min(32, "SESSION_SECRET must be at least 32 characters for security").optional(),
  NEON_AUTH_URL: z.string().url("NEON_AUTH_URL must be a valid URL").optional(),
  VITE_NEON_AUTH_URL: z.string().url("VITE_NEON_AUTH_URL must be a valid URL").optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  
  // Optional but recommended
  GOOGLE_MAPS_API_KEY: z.string().optional(),
  HONEYBADGER_API_KEY: z.string().optional(),
  CLIENT_URL: z.string().url().optional(),
  
  // Security settings
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('100'),
  DISABLE_RATE_LIMITING: z.string().transform(val => val === 'true').default('false'), // Disable all rate limiting
  
  // File upload settings
  MAX_FILE_SIZE: z.string().transform(Number).default('5242880'), // 5MB
  UPLOAD_DIR: z.string().default('uploads'),
}).superRefine((env, ctx) => {
  if (env.NODE_ENV !== 'production') {
    return;
  }

  const neonAuthConfigured = Boolean(
    env.NEON_AUTH_URL ||
      env.VITE_NEON_AUTH_URL ||
      env.DATABASE_URL?.includes("neon.tech"),
  );
  const legacyGoogleOAuthConfigured = Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET);
  const legacyGoogleOAuthMode = legacyGoogleOAuthConfigured && !neonAuthConfigured;

  if (!env.DATABASE_URL && legacyGoogleOAuthMode) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['DATABASE_URL'],
      message: 'DATABASE_URL is required in production when legacy Google OAuth is enabled',
    });
  }

  if (!env.SESSION_SECRET && legacyGoogleOAuthMode) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['SESSION_SECRET'],
      message: 'SESSION_SECRET is required in production when legacy Google OAuth is enabled',
    });
  }
});

/**
 * Validate and parse environment variables
 */
export function validateEnvironment() {
  try {
    const env = envSchema.parse(process.env);
    return env;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment validation failed:');
      error.errors.forEach(err => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
      process.exit(1);
    }
    throw error;
  }
}

/**
 * Get validated environment configuration
 */
export const config = validateEnvironment();

/**
 * Security configuration based on environment
 */
export const securityConfig = {
  session: {
    secret: config.SESSION_SECRET || 'neon-auth-stateless-session-secret-do-not-use-for-passport',
    secure: config.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  },
  
  rateLimit: {
    windowMs: config.RATE_LIMIT_WINDOW_MS,
    max: config.RATE_LIMIT_MAX_REQUESTS,
    disabled: config.DISABLE_RATE_LIMITING,
  },
  
  upload: {
    maxFileSize: config.MAX_FILE_SIZE,
    uploadDir: config.UPLOAD_DIR,
    allowedMimeTypes: [
      'application/pdf',
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/webp'
    ]
  },
  
  cors: {
    origin: config.NODE_ENV === 'production' 
      ? [config.CLIENT_URL].filter(Boolean)
      : ['http://localhost:3000', 'http://localhost:5000'],
    credentials: true,
  }
};
