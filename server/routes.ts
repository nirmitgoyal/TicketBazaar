import express, { type Express, Router } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware";
import {
  generalApiLimiter,
  authLimiter,
  ticketCreationLimiter,
  contactRequestLimiter,
  reviewLimiter,
  searchLimiter,
  uploadLimiter,
  strictLimiter
} from "./middleware/rate-limit.middleware";
import {
  authRoutes,
  eventRoutes,
  ticketRoutes,
  reviewRoutes,
} from "./routes/index";
import contactRequestRoutes from "./routes/contact-requests";
import searchHintsRoutes from "./routes/search-hints";
import dataPrivacyRoutes from "./routes/data-privacy";
import { WebSocketService } from "./services/websocket.service";
import { logger } from "./utils/logger";
import { cleanupService } from "./services/cleanup.service";
import path from "path";
import { fileURLToPath } from "url";

// Get the directory name equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function registerRoutes(app: Express): Promise<Server> {
  logger.info('SERVER', 'Starting route registration and middleware setup');
  
  // Request logging is handled by individual route handlers
  
  // Setup authentication
  setupAuth(app);
  logger.info('SERVER', 'Authentication middleware configured');

  // Create API Router
  const apiRouter = Router();

  // Apply general rate limiting to all API routes
  apiRouter.use(generalApiLimiter);

  // Register route modules with specific rate limiters
  apiRouter.use("/auth", authLimiter, authRoutes);
  apiRouter.use("/events", eventRoutes);
  apiRouter.use("/tickets", ticketRoutes);
  apiRouter.use("/reviews", reviewLimiter, reviewRoutes);
  apiRouter.use("/contact-requests", contactRequestLimiter, contactRequestRoutes);
  apiRouter.use("/search", searchLimiter, searchHintsRoutes);
  apiRouter.use("/data-privacy", dataPrivacyRoutes);

  // Import and register ticket views routes
  const ticketViewsRoutes = (await import("./routes/ticket-views")).default;
  apiRouter.use("/ticket-views", ticketViewsRoutes);

  // Import and register health routes (no rate limiting for health checks)
  const healthRoutes = (await import("./routes/health.routes")).default;
  apiRouter.use("/health", healthRoutes);

  // Import and register verification routes
  const verificationRoutes = (await import("./routes/verification.routes")).default;
  apiRouter.use("/verification", strictLimiter, verificationRoutes);

  // Import and register fraud detection routes
  const fraudDetectionRoutes = (await import("./routes/fraud-detection.routes")).default;
  apiRouter.use("/fraud-detection", strictLimiter, fraudDetectionRoutes);

  // Import and register user routes
  const userRoutes = (await import("./routes/user.routes")).default;
  apiRouter.use("/users", userRoutes);

  // Import and register autocomplete routes
  const autocompleteRoutes = (await import("./routes/autocomplete")).default;
  apiRouter.use("/autocomplete", searchLimiter, autocompleteRoutes);

  // Import and register sitemap routes
  const { generateSitemap, generateRobotsTxt } = await import("./routes/sitemap");
  
  logger.info('SERVER', 'All API routes registered successfully');

  // Serve uploaded files statically
  app.use("/uploads", express.static("uploads"));

  // Register API router
  app.use("/api", apiRouter);

  // Add dynamic sitemap.xml route
  app.get("/sitemap.xml", generateSitemap);

  // Add dynamic robots.txt route
  app.get("/robots.txt", generateRobotsTxt);

  // IMPORTANT: Don't add notFoundHandler here
  // The frontend routes will be handled by the Vite middleware
  // or serveStatic which will be added after this function returns

  // Global error handler for API routes
  app.use("/api", errorHandler);

  // Create HTTP server
  const httpServer = createServer(app);

  // Set up WebSocket service
  const wsService = new WebSocketService(httpServer);

  // Make WebSocket service available globally
  (global as any).wsService = wsService;

  // Initialize cleanup service for automated expired ticket removal
  logger.info('SERVER', 'Initializing automated cleanup service');
  
  return httpServer;
}