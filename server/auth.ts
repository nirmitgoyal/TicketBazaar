import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Express, Request, Response } from "express";
import session from "express-session";
import { randomBytes } from "crypto";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import connectPg from "connect-pg-simple";

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
  // Create session store with PostgreSQL
  const PostgresSessionStore = connectPg(session);

  // Configure session settings
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "ticket-bazaar-app-secret",
    resave: false,
    saveUninitialized: false,
    store: new PostgresSessionStore({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: true,
      tableName: 'session'
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      httpOnly: true
    },
  };

  // Set up session middleware
  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure Google OAuth strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID || "",
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        // Dynamically determine callback URL based on request
        callbackURL: "/api/auth/google/callback",
        // When proxy is true, trust the X-Forwarded-Proto header
        // which ensures proper protocol (http/https) is used
        proxy: true,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Get email from profile
          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(new Error("No email found in Google profile"), false);
          }

          // Check if user exists by Google ID first
          let user = await storage.getUserByGoogleId(profile.id);

          // If not found by Google ID, try email
          if (!user) {
            user = await storage.getUserByEmail(email);
          }

          // If user doesn't exist, create a new one
          if (!user) {
            const newUser = {
              password: randomBytes(16).toString("hex"), // Random password (not used for login)
              fullName: profile.displayName || "Google User",
              email: email,
              phone: "",
              instagram: "pending_update", // Temporary value, user must update this
              googleId: profile.id,
              rating: 5.0,
              ratingsCount: 0,
            };

            user = await storage.createUser(newUser);
          }
          // If user exists but doesn't have googleId, update it
          else if (!user.googleId) {
            user = await storage.updateUserGoogleId(user.id, profile.id);
          }

          return done(null, user);
        } catch (error) {
          return done(error, false);
        }
      },
    ),
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
  res.status(401).json({ message: "Unauthorized" });
}
