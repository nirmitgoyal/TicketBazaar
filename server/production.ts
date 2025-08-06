import express, { type Express, type Request, type Response, type NextFunction } from "express";
import fs from "fs";
import path from "path";
import { log } from "./utils";
import { dynamicMetaTagsMiddleware } from "./middleware/dynamic-meta-tags.middleware";

export function setupProduction(app: Express) {
  // In production, the built files are in dist/public
  const distPath = path.resolve(process.cwd(), "dist", "public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  // Add dynamic meta tags middleware before static file serving
  app.use(dynamicMetaTagsMiddleware);

  // Configure static file serving with proper MIME types and fallback handling
  app.use(express.static(distPath, {
    setHeaders: (res, path) => {
      // Set correct MIME types for JavaScript modules
      if (path.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      } else if (path.endsWith('.mjs')) {
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      } else if (path.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css; charset=utf-8');
      } else if (path.endsWith('.json')) {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
      } else if (path.endsWith('.svg')) {
        res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
      } else if (path.endsWith('.png')) {
        res.setHeader('Content-Type', 'image/png');
      } else if (path.endsWith('.jpg') || path.endsWith('.jpeg')) {
        res.setHeader('Content-Type', 'image/jpeg');
      } else if (path.endsWith('.gif')) {
        res.setHeader('Content-Type', 'image/gif');
      } else if (path.endsWith('.ico')) {
        res.setHeader('Content-Type', 'image/x-icon');
      } else if (path.match(/\.(woff|woff2|ttf|eot)$/)) {
        res.setHeader('Content-Type', 'application/font-woff');
      }
      
      // Set cache headers for static assets
      if (path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable'); // 1 year
      }
      
      // Ensure proper headers for ES modules
      if (path.endsWith('.js') || path.endsWith('.mjs')) {
        res.setHeader('X-Content-Type-Options', 'nosniff');
      }
    }
  }));

  // Add middleware to handle Range Not Satisfiable errors from static file serving
  app.use((err: Error & { status?: number; name?: string }, req: Request, res: Response, next: NextFunction) => {
    // Handle Range Not Satisfiable errors specifically
    if (err.name === 'RangeNotSatisfiableError' || err.status === 416) {
      log(`Range Not Satisfiable error for ${req.path}: ${err.message}`);
      return res.status(416).json({
        error: 'Range Not Satisfiable',
        message: 'The requested range cannot be satisfied',
        status: 416
      });
    }
    
    // Pass other errors to the next error handler
    next(err);
  });

  // Handle favicon requests specifically
  app.get('/favicon.ico', (req, res) => {
    const faviconPath = path.resolve(distPath, 'favicon.ico');
    if (fs.existsSync(faviconPath)) {
      res.sendFile(faviconPath);
    } else {
      // Send a 204 No Content response instead of 404 to avoid console errors
      res.status(204).end();
    }
  });

  // Handle missing assets gracefully
  app.use('/assets/*', (req, res) => {
    log(`Missing asset requested: ${req.path}`);
    res.status(404).json({ error: 'Asset not found' });
  });

  // Only serve index.html for routes that don't match static assets
  app.get("*", (req, res) => {
    // Don't serve index.html for static asset requests
    if (req.path.startsWith('/assets/') || 
        req.path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
      return res.status(404).send('Asset not found');
    }
    
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}