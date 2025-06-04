import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request, Response } from "express";
import session from "express-session";
import bcrypt from "bcrypt";
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

  // Configure Local authentication strategy
  passport.use(
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
      },
      async (email, password, done) => {
        try {
          // Find user by email
          const user = await storage.getUserByEmail(email);
          if (!user) {
            return done(null, false, { message: "Invalid email or password" });
          }

          // Check password
          const isValidPassword = await bcrypt.compare(password, user.password);
          if (!isValidPassword) {
            return done(null, false, { message: "Invalid email or password" });
          }

          // Remove password from user object for security
          const { password: _, ...userWithoutPassword } = user;
          return done(null, userWithoutPassword as any);
        } catch (error) {
          return done(error, false);
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
  res.status(401).json({ message: "Unauthorized" });
}
