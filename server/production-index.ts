
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes/index";
import { setupProduction } from "./production";
import { log } from "./utils";
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import session from 'express-session';
import passport from 'passport';
import { errorHandler } from './middleware/error.middleware';
import { setupAuth } from './auth';
import { setupWebSocket } from './services/websocket.service';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Environment validation for production
function validateEnvironment() {
  const required = ['DATABASE_URL'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error(`❌ Missing required environment variables: ${missing.join(', ')}`);
    console.error('Please ensure all required environment variables are set before deployment.');
    process.exit(1);
  }
  
  console.log('✅ Environment validation passed');
}

// Run environment validation in production
if (process.env.NODE_ENV === 'production') {
  validateEnvironment();
}

const app = express();
const server = http.createServer(app);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret-for-development',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Setup authentication
setupAuth(app);

// Trust proxy for Heroku and enable proper HTTPS handling
app.set('trust proxy', 1);

// Force HTTPS in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}

// Add cache control headers to prevent browser caching issues
app.use((req, res, next) => {
  // For HTML files, prevent caching to ensure users get latest updates
  if (req.path === "/" || req.path.endsWith(".html")) {
    res.set({
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    });
  }
  next();
});

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    // Register routes with error handling
    console.log('🔧 Registering routes...');
    await registerRoutes(app);

    // Set up production static file serving
    console.log('📁 Setting up static file serving...');
    setupProduction(app);

    // Global error handler
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      res.status(status).json({
        success: false,
        message,
        status,
      });

      console.error("Server error:", err);
    });

    // Error handling middleware
    app.use(errorHandler);

    // Setup WebSocket with error handling
    console.log('🔌 Setting up WebSocket...');
    try {
      setupWebSocket(server);
    } catch (wsError: unknown) {
      console.warn('⚠️ WebSocket setup failed, continuing without WebSocket support:', wsError instanceof Error ? wsError.message : String(wsError));
    }

    const PORT = parseInt(process.env.PORT || '5000', 10);
    const HOST = process.env.HOST || '0.0.0.0';

    // Add server error handling to prevent crash loops
    server.on('error', (error: any) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use. Trying alternative port...`);
        const altPort = PORT + 1;
        server.listen(altPort, HOST, () => {
          console.log(`🚀 Production server running on ${HOST}:${altPort} (alternative port)`);
        });
      } else {
        console.error('❌ Server error:', error);
        process.exit(1);
      }
    });

    server.listen(PORT, HOST, () => {
      console.log(`🚀 Production server running on ${HOST}:${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Database URL configured: ${process.env.DATABASE_URL ? 'Yes' : 'No'}`);
      
      // Health check endpoint
      app.get('/health', (_req, res) => {
        res.status(200).json({ 
          status: 'healthy', 
          timestamp: new Date().toISOString(),
          port: PORT,
          host: HOST
        });
      });
    });

  } catch (startupError) {
    console.error('❌ Failed to start production server:', startupError);
    console.error('Stack trace:', startupError instanceof Error ? startupError.stack : String(startupError));
    process.exit(1);
  }
})();

// Graceful shutdown handling
function gracefulShutdown(signal: string) {
  console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
  
  server.close((err) => {
    if (err) {
      console.error('❌ Error during server shutdown:', err);
      process.exit(1);
    }
    
    console.log('✅ Server closed successfully');
    process.exit(0);
  });
  
  // Force close after 10 seconds
  setTimeout(() => {
    console.error('⚠️ Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
}

// Handle process signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions and unhandled rejections
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});
