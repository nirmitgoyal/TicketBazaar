import passport from "passport";
import {
  Strategy as GoogleStrategy,
  type Profile as GoogleProfile,
  type VerifyCallback,
} from "passport-google-oauth20";
import { Express, Request, Response } from "express";
import session from "express-session";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import connectPgSimple from "connect-pg-simple";
import { db } from "./db";
import createMemoryStore from "memorystore";

/**
 * Extend Express User interface with our User type
 */
declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

/**
 * Set up authentication for the application
 * This function configures session management, passport strategies, and serialization
 */
export function setupAuth(app: Express) {
  // Use PostgreSQL for persistent session storage
  const PgSessionStore = connectPgSimple(session);
  
  // For non-production environments, allow self-signed certificates
  if (process.env.NODE_ENV !== 'production') {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  }
  
  // Check if we're on production (ticketbazaar.co.in)
  // In Replit, we should always use development settings
  const isReplit = Boolean(process.env.REPL_ID || process.env.REPLIT_DB_URL);
  const isAWSRDS = Boolean(process.env.DATABASE_URL?.includes('amazonaws.com'));
  const isNeon = Boolean(process.env.DATABASE_URL?.includes('neon.tech'));
  const isProduction = !isReplit && (
                      process.env.NODE_ENV === 'production' || 
                      Boolean(process.env.DYNO) || 
                      isAWSRDS);
  const isNeonAuthMode = Boolean(process.env.NEON_AUTH_URL || process.env.VITE_NEON_AUTH_URL || isNeon);
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const hasLegacyGoogleOAuthCredentials = Boolean(googleClientId && googleClientSecret);
  const shouldEnableLegacyGoogleOAuth = hasLegacyGoogleOAuthCredentials && !isNeonAuthMode;
  const requiresPersistentSessionConfig = isProduction && shouldEnableLegacyGoogleOAuth;
  
  // Create session store with database connection
  // For production environments (like Heroku), we need to configure SSL properly
  console.log('[AUTH] Environment:', process.env.NODE_ENV);
  console.log('[AUTH] Database URL exists:', !!process.env.DATABASE_URL);
  console.log('[AUTH] Is Production:', isProduction);
  console.log('[AUTH] AWS RDS detected:', isAWSRDS);
  console.log('[AUTH] Neon detected:', isNeon);
  console.log('[AUTH] Neon Auth mode:', isNeonAuthMode);
  console.log('[AUTH] Legacy Google OAuth enabled:', shouldEnableLegacyGoogleOAuth);
  
  let sessionStore: session.Store;

  if (!process.env.DATABASE_URL) {
    if (requiresPersistentSessionConfig) {
      throw new Error("DATABASE_URL is required for production session storage when legacy Google OAuth is enabled");
    }

    console.warn('[AUTH] Using in-memory session store because DATABASE_URL is not set; Neon Auth bearer sessions remain stateless');
    const MemoryStore = createMemoryStore(session);
    sessionStore = new MemoryStore({
      checkPeriod: 24 * 60 * 60 * 1000,
    });
  } else if (isProduction || isNeon) {
    // Production and Neon pooled connections require SSL.
    console.log('[AUTH] Using SSL session store configuration');
    
    const connectionConfig = isAWSRDS ? {
      // AWS RDS optimized configuration
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
        // AWS RDS connection optimization
        requestCert: true,
        checkServerIdentity: () => undefined // Skip hostname verification for AWS RDS
      },
      connectionTimeoutMillis: 30000, // 30 second timeout for AWS RDS
      idleTimeoutMillis: 60000, // 1 minute idle timeout
      max: 15, // Larger pool for production
    } : {
      // Heroku and Neon configuration
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      },
      connectionTimeoutMillis: 20000, // 20 second timeout for Heroku
      idleTimeoutMillis: 30000, // 30 second idle timeout
      max: 10,
    };
    
    sessionStore = new PgSessionStore({
      conObject: connectionConfig,
      tableName: 'session',
      createTableIfMissing: true,
      pruneSessionInterval: 24 * 60 * 60, // Prune expired sessions every 24 hours
      errorLog: console.error.bind(console)
    });
  } else {
    // Development configuration without SSL
    console.log('[AUTH] Using development session store configuration');
    sessionStore = new PgSessionStore({
      conString: process.env.DATABASE_URL,
      tableName: 'session',
      createTableIfMissing: true,
      pruneSessionInterval: 24 * 60 * 60, // Prune expired sessions every 24 hours
      errorLog: console.error.bind(console)
    });
  }

  // Configure session settings
  let sessionSecret = process.env.SESSION_SECRET;
  
  // Passport Google sessions need an explicit production secret. Neon Auth uses
  // bearer tokens, so keep Express sessions initialized without failing API boot.
  if (!sessionSecret && !requiresPersistentSessionConfig) {
    console.warn('[AUTH] SESSION_SECRET is not set; using stateless Neon Auth fallback session secret');
    sessionSecret = 'neon-auth-stateless-session-secret-do-not-use-for-passport';
  }
  
  if (!sessionSecret) {
    throw new Error("SESSION_SECRET environment variable is required when legacy Google OAuth is enabled");
  }

  const sessionCookieDomain = process.env.SESSION_COOKIE_DOMAIN;
  
  const sessionSettings: session.SessionOptions = {
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      secure: isProduction && !process.env.REPL_SLUG, // Use secure cookies only in true production (not Replit)
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      httpOnly: true,
      domain: sessionCookieDomain || undefined,
    },
    name: 'tb.sid', // Custom session cookie name
  };

  // Log the final session settings
  console.log('[AUTH] Session cookie settings:', {
    secure: sessionSettings.cookie?.secure,
    domain: sessionSettings.cookie?.domain,
    sameSite: sessionSettings.cookie?.sameSite,
    name: sessionSettings.name
  });
  
  // Set up session middleware
  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  if (hasLegacyGoogleOAuthCredentials && isNeonAuthMode) {
    console.log('Google OAuth credentials found, but legacy Passport Google auth is disabled because Neon Auth is configured');
  }

  // Configure legacy Google OAuth2 strategy only when Neon Auth is not active.
  if (shouldEnableLegacyGoogleOAuth && googleClientId && googleClientSecret) {
    // Determine callback URL based on environment
    let callbackURL;
    
    // Always use Replit domain when running in Replit, regardless of GOOGLE_CALLBACK_URL
    if (isReplit) {
      // In Replit, always use the Replit domain
      const replitDomain = process.env.REPLIT_DEV_DOMAIN || 
                          `${process.env.REPL_SLUG}-${process.env.REPL_OWNER}.repl.co`;
      callbackURL = `https://${replitDomain}/api/auth/google/callback`;
      console.log('[GOOGLE OAUTH] Using Replit development callback URL');
    } else if (process.env.GOOGLE_CALLBACK_URL) {
      // Use the explicitly set callback URL only when NOT in Replit
      callbackURL = process.env.GOOGLE_CALLBACK_URL;
      console.log('[GOOGLE OAUTH] Using callback URL from GOOGLE_CALLBACK_URL env var');
    } else {
      // Fallback to relative URL
      callbackURL = "/api/auth/google/callback";
      console.log('[GOOGLE OAUTH] Using relative callback URL (fallback)');
    }
    
    console.log('Setting up Google OAuth strategy');
    console.log('Is Replit:', isReplit);
    console.log('Google OAuth Callback URL:', callbackURL);
    console.log('Using proxy:', true);
    
    passport.use(
      new GoogleStrategy(
        {
          clientID: googleClientId,
          clientSecret: googleClientSecret,
          callbackURL: callbackURL,
          proxy: true,
          passReqToCallback: true,
          state: true, // Enable state parameter for CSRF protection
          scope: ['profile', 'email'] // Explicitly set required scopes
        },
        async (_req: Request, accessToken: string, _refreshToken: string, profile: GoogleProfile, done: VerifyCallback) => {
          try {
            console.log('[GOOGLE OAUTH] Starting authentication for profile:', profile.id);
            console.log('[GOOGLE OAUTH] Access token received:', accessToken ? 'Yes' : 'No');
            console.log('[GOOGLE OAUTH] Profile data available:', !!profile);
            
            // Extract profile picture URL from Google profile
            const profilePicture = profile._json?.picture || profile.photos?.[0]?.value || '';
            
            console.log('[GOOGLE OAUTH] Profile Data:', {
              id: profile.id,
              displayName: profile.displayName,
              email: profile.emails?.[0]?.value,
              profilePicture: profilePicture,
              photos: profile.photos,
              _json: profile._json
            });
            
            // Check if user exists with this Google ID
            console.log('[GOOGLE OAUTH] Checking for existing user with Google ID:', profile.id);
            let user = await storage.getUserByGoogleId(profile.id);

            if (!user) {
              // Check if user exists with this email
              const email = profile.emails?.[0]?.value || '';
              console.log('[GOOGLE OAUTH] No user found with Google ID, checking email:', email);
              user = await storage.getUserByEmail(email);

              if (user) {
                // Update existing user with Google ID
                console.log('[GOOGLE OAUTH] Updating existing user with Google ID. User ID:', user.id);
                const updatedUser = await storage.updateUserGoogleId(user.id, profile.id);
                if (updatedUser) {
                  user = updatedUser;
                }
                // Update profile picture if available
                if (profilePicture) {
                  console.log('[GOOGLE OAUTH] Updating profile picture for user:', user.id);
                  user = await storage.updateUserProfilePicture(user.id, profilePicture) || user;
                }
              } else {
                // Create new user
                console.log('[GOOGLE OAUTH] Creating new user with Google profile:', {
                  googleId: profile.id,
                  email: profile.emails?.[0]?.value || '',
                  fullName: profile.displayName || 'User',
                  profilePicture: profilePicture,
                });
                
                try {
                  user = await storage.createUser({
                    googleId: profile.id,
                    email: profile.emails?.[0]?.value || '',
                    fullName: profile.displayName || 'User',
                    country: "IN", // Default to India since it's an Indian platform
                    profilePicture: profilePicture,
                  });
                  console.log('[GOOGLE OAUTH] New user created successfully:', user.id);
                } catch (createError) {
                  console.error('[GOOGLE OAUTH] Error creating new user:', createError);
                  throw createError;
                }
              }
            } else {
              // Update profile picture for existing Google users on each login
              console.log('[GOOGLE OAUTH] Existing Google user found:', user.id);
              if (profilePicture && user.profilePicture !== profilePicture) {
                console.log('[GOOGLE OAUTH] Updating profile picture for existing user:', user.id);
                user = await storage.updateUserProfilePicture(user.id, profilePicture) || user;
              }
            }

            if (!user) {
              throw new Error("Google OAuth completed without a user record");
            }

            // Remove password from user object for security
            const { password, ...userWithoutPassword } = user;
            console.log('[GOOGLE OAUTH] Authentication successful for user:', user.id);
            return done(null, userWithoutPassword as any);
          } catch (error) {
            console.error('[GOOGLE OAUTH] Error during authentication:', error);
            console.error('[GOOGLE OAUTH] Error details:', JSON.stringify(error, null, 2));
            console.error('[GOOGLE OAUTH] Error stack:', error instanceof Error ? error.stack : undefined);
            return done(error as Error, false);
          }
        }
      )
    );
  } else {
    console.log('Google OAuth credentials not provided, skipping Google authentication setup');
  }

  // User serialization and deserialization for sessions
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user) {
        return done(null, false);
      }
      // Remove password from the user object for security
      const { password, ...userWithoutPassword } = user;
      done(null, userWithoutPassword as any);
    } catch (error) {
      done(error);
    }
  });
}

/**
 * Middleware to check if user is authenticated
 * Use this to protect routes that require authentication
 */
export function isAuthenticated(req: Request, res: Response, next: Function) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Not authenticated" });
}
