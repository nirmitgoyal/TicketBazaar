import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Express, Request, Response } from "express";
import session from "express-session";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import MemoryStore from "memorystore";

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
  // Use memory store for development to avoid SSL certificate issues
  const SessionStore = MemoryStore(session);

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
    store: new SessionStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
    cookie: {
      secure: false, // Set to false for development
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      httpOnly: true
    },
  };

  // Set up session middleware
  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure Google OAuth2 strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        callbackURL: "/api/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user exists with this Google ID
          let user = await storage.getUserByGoogleId(profile.id);

          if (!user) {
            // Check if user exists with this email
            user = await storage.getUserByEmail(profile.emails?.[0]?.value || '');

            if (user) {
              // Update existing user with Google ID
              user = await storage.updateUserGoogleId(user.id, profile.id);
            } else {
              // Create new user
              user = await storage.createUser({
                googleId: profile.id,
                email: profile.emails?.[0]?.value || '',
                fullName: profile.displayName || 'User',
                rating: 5.0,
                ratingsCount: 0,
                preferredContactMethod: "whatsapp",
              });
            }
          }

          // Remove password from user object for security
          const { password, ...userWithoutPassword } = user;
          return done(null, userWithoutPassword as any);
        } catch (error) {
          return done(error as Error, false);
        }
      }
    )
  );

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
