// Production environment setup MUST come first
import "./production-setup";

import express, { type Request, Response, NextFunction } from "express";
import { config } from "dotenv";
import { createServer } from "http";
import { registerRoutes } from "./routes";
import { log } from "./utils";
import { initHoneybadger, extractUserContext, getMiddleware, notifyError } from "./honeybadger";
import { apiBypassMiddleware, apiNotFoundMiddleware } from "./middleware/api-bypass.middleware";
import { uriValidationMiddleware } from "./middleware/uri-validation.middleware";

// Load environment variables
config();

(async () => {
  // Initialize Honeybadger first
  await initHoneybadger();
  const { requestHandler, errorHandler } = await getMiddleware();
  
  const app = express();

  // Add Honeybadger request handler BEFORE all other middleware
  app.use(requestHandler);

  // Add URI validation middleware as the first middleware to catch malformed URIs
  app.use(uriValidationMiddleware);

  // Add API bypass middleware before other middleware
  app.use(apiBypassMiddleware);

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

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
        
        // Skip logging response body for ticket endpoints to avoid huge logs
        if (capturedJsonResponse && !path.includes("/api/ticket")) {
          logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
        } else if (capturedJsonResponse && path.includes("/api/ticket")) {
          // For ticket endpoints, only log summary info to avoid massive logs
          const responseSize = JSON.stringify(capturedJsonResponse).length;
          const itemCount = Array.isArray(capturedJsonResponse) ? capturedJsonResponse.length : 1;
          logLine += ` :: [Response: ${itemCount} items, ${responseSize} bytes]`;
        }

        log(logLine);
        console.log(); // Add extra blank line for readability
      }
    });

    next();
  });

  // Register API routes directly on the main app
  const httpServer = await registerRoutes(app);

  // Create main server
  const server = createServer(app);

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "development") {
    // Dynamically import setupVite only in development
    const { setupVite } = await import("./vite");
    await setupVite(app, server);
  } else {
    // In production and test, use a completely separate module to avoid Vite imports
    const { setupProduction } = await import("./production");
    setupProduction(app);
  }

  // Add Honeybadger error handler AFTER all middleware and routes
  app.use(errorHandler);

  // Add general 404 handler for any non-matching routes (both API and frontend)
  // This will be reached only if the Vite middleware doesn't handle the request
  // In production and test, static assets are handled by the production setup
  app.use((req: Request, res: Response) => {
    // In production/test, don't interfere with static asset 404s - let production.ts handle them
    if (process.env.NODE_ENV !== "development" && 
        (req.path.startsWith('/assets/') || 
         req.path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/))) {
      return res.status(404).send('Asset not found');
    }
    
    res.status(404).json({
      success: false,
      message: "Route not found",
      status: 404,
    });
  });

  // Global error handler for all other routes (after Vite)
  app.use(async (err: any, req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // Report error to Honeybadger with request context
    await notifyError(err, extractUserContext(req));

    res.status(status).json({
      success: false,
      message,
      status,
    });

    // Log errors but don't throw to prevent server crash
    console.error("Server error:", err);
  });

  // Use environment port or fallback to 5000 for local development
  const port = parseInt(process.env.PORT || "5000", 10);
  const host = "0.0.0.0"; // Always bind to 0.0.0.0 for deployment compatibility

  server.listen(
    {
      port,
      host,
    },
    () => {
      log(
        `🚀 Server serving on port ${port} in ${process.env.NODE_ENV || "development"} mode`,
      );
    },
  );
})();