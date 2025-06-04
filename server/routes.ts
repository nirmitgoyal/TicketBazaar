import express, { type Express, Router } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware";
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
import { logger, requestLoggingMiddleware } from "./utils/logger";
import path from "path";
import { fileURLToPath } from "url";

// Get the directory name equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function registerRoutes(app: Express): Promise<Server> {
  logger.info('SERVER', 'Starting route registration and middleware setup');
  
  // Add request logging middleware for all requests
  app.use(requestLoggingMiddleware);
  
  // Setup authentication
  setupAuth(app);
  logger.info('SERVER', 'Authentication middleware configured');

  // Create API Router
  const apiRouter = Router();

  // Register route modules
  apiRouter.use("/auth", authRoutes);
  apiRouter.use("/events", eventRoutes);
  apiRouter.use("/tickets", ticketRoutes);
  apiRouter.use("/reviews", reviewRoutes);
  apiRouter.use("/contact-requests", contactRequestRoutes);
  apiRouter.use("/search", searchHintsRoutes);
  apiRouter.use("/data-privacy", dataPrivacyRoutes);

  // Import and register ticket views routes
  const ticketViewsRoutes = (await import("./routes/ticket-views")).default;
  apiRouter.use("/ticket-views", ticketViewsRoutes);
  
  logger.info('SERVER', 'All API routes registered successfully');

  // Serve uploaded files statically
  app.use("/uploads", express.static("uploads"));

  // Register API router
  app.use("/api", apiRouter);

  // Add specific route for sitemap.xml that needs to be accessible at the domain root
  app.get("/sitemap.xml", (req, res) => {
    const sitemapPath = path.resolve(__dirname, "../client/public/sitemap.xml");
    res.setHeader("Content-Type", "application/xml");
    res.sendFile(sitemapPath);
  });

  // Add robots.txt route
  app.get("/robots.txt", (req, res) => {
    const robotsPath = path.resolve(__dirname, "../client/public/robots.txt");
    res.setHeader("Content-Type", "text/plain");
    res.sendFile(robotsPath);
  });

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

  return httpServer;
}