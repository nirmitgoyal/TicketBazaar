/**
 * Modernized Server Index
 * 
 * This file demonstrates the new architecture with dependency injection,
 * domain modules, and centralized error handling.
 */

import express from 'express';
import { configureServices, initializeServices, shutdownServices } from './core/service-config';
import { errorHandler, notFoundHandler } from './core/error-handler';
import { logger } from './core/logger';
import { createAuthRoutes } from './domains/auth/routes/auth.routes';
import { webSocketService } from './services/websocket.service';
import { Server } from 'http';

/**
 * Create and configure the Express application
 */
export function createApp(): express.Application {
  const app = express();

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(logger.requestLogger());

  // API Routes
  app.use('/api/auth', createAuthRoutes());

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.env.npm_package_version || '1.0.0',
    });
  });

  // Static files (for production)
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static('dist/public'));
    
    // SPA fallback
    app.get('*', (req, res) => {
      res.sendFile('dist/public/index.html', { root: process.cwd() });
    });
  }

  // Error handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

/**
 * Start the server
 */
export async function startServer(): Promise<Server> {
  try {
    logger.info('Starting TicketBazaar server...');

    // Configure services
    configureServices();

    // Initialize services
    await initializeServices();

    // Create Express app
    const app = createApp();

    // Start HTTP server
    const port = process.env.PORT || 3000;
    const server = app.listen(port, () => {
      logger.info(`Server running on port ${port}`);
    });

    // Initialize WebSocket service
    webSocketService.initialize(server);

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      logger.info('SIGTERM received, shutting down gracefully...');
      
      server.close(() => {
        logger.info('HTTP server closed');
      });

      await shutdownServices();
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      logger.info('SIGINT received, shutting down gracefully...');
      
      server.close(() => {
        logger.info('HTTP server closed');
      });

      await shutdownServices();
      process.exit(0);
    });

    return server;
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  startServer().catch((error) => {
    logger.error('Server startup failed:', error);
    process.exit(1);
  });
}