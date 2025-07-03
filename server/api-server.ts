import express from "express";
import { registerRoutes } from "./routes";
import { initHoneybadger, getMiddleware } from "./honeybadger";

/**
 * Standalone API server to bypass Vite development server issues
 * This ensures API routes return proper JSON responses
 */
async function startApiServer() {
  // Initialize Honeybadger
  await initHoneybadger();
  const { requestHandler, errorHandler } = await getMiddleware();
  
  const app = express();
  
  // Add CORS for development
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:5000');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // Add Honeybadger request handler
  app.use(requestHandler);

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  // Register all API routes
  const server = await registerRoutes(app);

  // Add error handler
  app.use(errorHandler);

  // Start on port 
  const port = 500;
  server.listen(port, '0.0.0.0', () => {
    console.log(`🔧 API Server running on port ${port}`);
  });

  return server;
}

// Start the API server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  startApiServer().catch(console.error);
}

export { startApiServer };