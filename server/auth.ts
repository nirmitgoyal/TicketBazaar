import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Express, Request, Response } from "express";
import session from "express-session";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import connectPgSimple from "connect-pg-simple";
import { db } from "./db";

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
  
  // Create session store with database connection
  const sessionStore = new PgSessionStore({
    conString: process.env.DATABASE_URL,
    tableName: 'session',
    createTableIfMissing: true,
    pruneSessionInterval: 24 * 60 * 60, // Prune expired sessions every 24 hours
    errorLog: console.error.bind(console)
  });

  // Configure session settings
  let sessionSecret = process.env.SESSION_SECRET;
  
  // In test mode, provide a default session secret if none is provided
  if (!sessionSecret && process.env.NODE_ENV === 'test') {
    console.log('Test mode: Using default session secret for testing');
    sessionSecret = 'test-session-secret-for-testing-only-not-secure';
  }
  
  if (!sessionSecret) {
    throw new Error("SESSION_SECRET environment variable is required for security");
  }
  
  const sessionSettings: session.SessionOptions = {
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      httpOnly: true,
      domain: process.env.NODE_ENV === 'production' ? '.ticketbazaar.co.in' : undefined
    },
    name: 'tb.sid', // Custom session cookie name
  };

  // Set up session middleware
  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure Google OAuth2 strategy only if credentials are provided
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
  
  if (googleClientId && googleClientSecret) {
    console.log('Setting up Google OAuth strategy');
    passport.use(
      new GoogleStrategy(
        {
          clientID: googleClientId,
          clientSecret: googleClientSecret,
          callbackURL: "/api/auth/google/callback",
          proxy: true,
          passReqToCallback: true
        },
        async (req, accessToken, refreshToken, profile, done) => {
          try {
            // Extract profile picture URL from Google profile
            const profilePicture = profile._json?.picture || profile.photos?.[0]?.value || '';
            
            // Check if user exists with this Google ID
            let user = await storage.getUserByGoogleId(profile.id);

            if (!user) {
              // Check if user exists with this email
              user = await storage.getUserByEmail(profile.emails?.[0]?.value || '');

              if (user) {
                // Update existing user with Google ID
                user = await storage.updateUserGoogleId(user.id, profile.id);
                // Update profile picture if available
                if (profilePicture) {
                  user = await storage.updateUserProfilePicture(user.id, profilePicture) || user;
                }
              } else {
                // Create new user
                console.log('Creating new user with Google profile:', {
                  googleId: profile.id,
                  email: profile.emails?.[0]?.value || '',
                  fullName: profile.displayName || 'User',
                  profilePicture: profilePicture,
                });
                
                user = await storage.createUser({
                  googleId: profile.id,
                  email: profile.emails?.[0]?.value || '',
                  fullName: profile.displayName || 'User',
                  country: "IN", // Default to India since it's an Indian platform
                  profilePicture: profilePicture,
                });
              }
            } else {
              // Update profile picture for existing Google users on each login
              if (profilePicture && user.profilePicture !== profilePicture) {
                user = await storage.updateUserProfilePicture(user.id, profilePicture) || user;
              }
            }

            // Remove password from user object for security
            const { password, ...userWithoutPassword } = user;
            return done(null, userWithoutPassword as any);
          } catch (error) {
            console.error('Google OAuth error:', error);
            console.error('Error details:', JSON.stringify(error, null, 2));
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
