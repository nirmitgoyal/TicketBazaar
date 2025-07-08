/**
 * Complete Google OAuth 2.0 Example with Express & Passport.js
 * This is a minimal but production-aware implementation
 */

import express from 'express';
import session from 'express-session';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();

// === 1. SESSION CONFIGURATION ===
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-here',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax' // CSRF protection
  }
}));

// === 2. PASSPORT INITIALIZATION ===
app.use(passport.initialize());
app.use(passport.session());

// === 3. GOOGLE OAUTH STRATEGY ===
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || '/auth/google/callback',
    scope: ['profile', 'email']
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      console.log('=== GOOGLE PROFILE RECEIVED ===');
      console.log('ID:', profile.id);
      console.log('Display Name:', profile.displayName);
      console.log('Email:', profile.emails?.[0]?.value);
      console.log('Photo:', profile.photos?.[0]?.value);
      
      // In a real app, you would:
      // 1. Check if user exists in database
      // 2. Create new user if not exists
      // 3. Update user info if needed
      
      const user = {
        id: profile.id,
        email: profile.emails?.[0]?.value,
        name: profile.displayName,
        picture: profile.photos?.[0]?.value,
        provider: 'google'
      };
      
      return done(null, user);
    } catch (error) {
      console.error('Error in Google Strategy:', error);
      return done(error as Error, false);
    }
  }));
} else {
  console.warn('⚠️  Google OAuth credentials not configured!');
  console.warn('Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your .env file');
}

// === 4. SERIALIZATION ===
passport.serializeUser((user: any, done) => {
  console.log('Serializing user:', user.id);
  done(null, user);
});

passport.deserializeUser((user: any, done) => {
  console.log('Deserializing user:', user.id);
  done(null, user);
});

// === 5. MIDDLEWARE ===
// Authentication check middleware
const isAuthenticated = (req: any, res: any, next: any) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
};

// === 6. ROUTES ===

// Home page
app.get('/', (req, res) => {
  res.send(`
    <h1>Google OAuth 2.0 Example</h1>
    ${req.user ? `
      <p>Welcome, ${req.user.name}!</p>
      <p>Email: ${req.user.email}</p>
      <img src="${req.user.picture}" alt="Profile" style="width: 100px; border-radius: 50%;">
      <br><br>
      <a href="/logout">Logout</a>
    ` : `
      <p>You are not logged in.</p>
      <a href="/login">Login with Google</a>
    `}
  `);
});

// Login page
app.get('/login', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Login</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 50px; }
        .google-btn {
          display: inline-flex;
          align-items: center;
          padding: 10px 20px;
          background: white;
          border: 1px solid #dadce0;
          border-radius: 4px;
          color: #3c4043;
          font-size: 14px;
          font-weight: 500;
          text-decoration: none;
          transition: background-color .3s;
        }
        .google-btn:hover {
          background-color: #f8f9fa;
        }
        .google-icon {
          width: 18px;
          height: 18px;
          margin-right: 10px;
        }
      </style>
    </head>
    <body>
      <h1>Login</h1>
      <a href="/auth/google" class="google-btn">
        <svg class="google-icon" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Sign in with Google
      </a>
    </body>
    </html>
  `);
});

// === 7. GOOGLE OAUTH ROUTES ===

// Initiate Google OAuth
app.get('/auth/google', (req, res, next) => {
  console.log('\n=== INITIATING GOOGLE OAUTH ===');
  console.log('Return URL:', req.query.returnTo);
  
  // Store return URL in session if provided
  if (req.query.returnTo) {
    req.session.returnTo = req.query.returnTo as string;
  }
  
  passport.authenticate('google', { 
    scope: ['profile', 'email'] 
  })(req, res, next);
});

// Google OAuth callback
app.get('/auth/google/callback', (req, res, next) => {
  console.log('\n=== GOOGLE OAUTH CALLBACK ===');
  console.log('Query params:', req.query);
  
  passport.authenticate('google', (err: any, user: any, info: any) => {
    if (err) {
      console.error('Authentication error:', err);
      console.error('Error details:', {
        name: err.name,
        message: err.message,
        code: err.code
      });
      
      // Common error types
      if (err.name === 'TokenError') {
        return res.redirect('/login?error=token&message=' + encodeURIComponent('Invalid or expired authorization code'));
      }
      return res.redirect('/login?error=auth&message=' + encodeURIComponent(err.message));
    }
    
    if (!user) {
      console.log('No user returned from authentication');
      return res.redirect('/login?error=nouser');
    }
    
    // Log the user in
    req.logIn(user, (err) => {
      if (err) {
        console.error('Login error:', err);
        return res.redirect('/login?error=login');
      }
      
      console.log('User logged in successfully:', user.email);
      
      // Redirect to original URL or home
      const returnTo = req.session.returnTo || '/';
      delete req.session.returnTo;
      res.redirect(returnTo);
    });
  })(req, res, next);
});

// === 8. LOGOUT ROUTE ===
app.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/');
  });
});

// === 9. PROTECTED ROUTE EXAMPLE ===
app.get('/profile', isAuthenticated, (req, res) => {
  res.json({
    message: 'This is a protected route',
    user: req.user
  });
});

// === 10. ERROR HANDLING ===
app.use((err: any, req: any, res: any, next: any) => {
  console.error('=== ERROR ===');
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

// === 11. COMMON CONSOLE LOGS TO WATCH FOR ===
console.log('\n🔍 CONSOLE LOGS TO WATCH FOR:');
console.log('1. "=== INITIATING GOOGLE OAUTH ===" - When user clicks login');
console.log('2. "=== GOOGLE OAUTH CALLBACK ===" - When Google redirects back');
console.log('3. "=== GOOGLE PROFILE RECEIVED ===" - When user data is received');
console.log('4. "Authentication error:" - When something goes wrong');

// === 12. COMMON PITFALLS ===
console.log('\n⚠️  COMMON PITFALLS:');
console.log('1. REDIRECT URI MISMATCH');
console.log('   - Must match EXACTLY in Google Console');
console.log('   - Check protocol (http/https), domain, port, and path');
console.log('   - Current callback URL:', process.env.GOOGLE_CALLBACK_URL || '/auth/google/callback');

console.log('\n2. MISSING ENVIRONMENT VARIABLES');
console.log('   - GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? '✓ Set' : '✗ Missing');
console.log('   - GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? '✓ Set' : '✗ Missing');
console.log('   - SESSION_SECRET:', process.env.SESSION_SECRET ? '✓ Set' : '✗ Missing');

console.log('\n3. CORS/COOKIE ISSUES');
console.log('   - In production, use HTTPS');
console.log('   - Set secure: true for cookies in production');
console.log('   - Use sameSite: "lax" for CSRF protection');

console.log('\n4. SESSION ISSUES');
console.log('   - Clear browser cookies if login loops');
console.log('   - Ensure session secret is consistent');
console.log('   - Check session store is working');

console.log('\n5. GOOGLE CONSOLE SETUP');
console.log('   - Enable Google+ API');
console.log('   - Add authorized redirect URIs');
console.log('   - Check OAuth consent screen is configured');

// === 13. START SERVER ===
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 Login at http://localhost:${PORT}/login`);
});