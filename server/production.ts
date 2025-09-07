import express, { type Express, type Request, type Response, type NextFunction } from "express";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { log } from "./utils";
import { dynamicMetaTagsMiddleware } from "./middleware/dynamic-meta-tags.middleware";

// Build identifier (content hash or timestamp + short random). Allows client to detect new deploys.
// Prefer an env override if provided (e.g. set at CI build time).
const BUILD_ID = process.env.BUILD_ID || `${Date.now().toString(36)}-${crypto.randomBytes(3).toString('hex')}`;
const BUILD_HEADER = 'x-app-build-id';

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

  // Expose build id endpoint for runtime checks
  app.get('/__version', (_req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.json({ buildId: BUILD_ID });
  });

  // Middleware to tag all responses with build id for debugging / cache tracing
  app.use((req, res, next) => {
    res.setHeader(BUILD_HEADER, BUILD_ID);
    next();
  });

  // Maintain an in-memory set of known asset filenames (populated lazily)
  const knownAssets = new Set<string>();
  try {
    const assetsDir = path.join(distPath, 'assets');
    if (fs.existsSync(assetsDir)) {
      for (const f of fs.readdirSync(assetsDir)) {
        knownAssets.add(`/assets/${f}`);
      }
    }
  } catch {}

  // Configure static file serving with proper MIME types, cache headers, and stale asset handling
  app.use(express.static(distPath, {
    setHeaders: (res, filePath) => {
      // Set correct MIME types for JavaScript modules
      if (filePath.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      } else if (filePath.endsWith('.mjs')) {
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      } else if (filePath.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css; charset=utf-8');
      } else if (filePath.endsWith('.json')) {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
      } else if (filePath.endsWith('.svg')) {
        res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
      } else if (filePath.endsWith('.png')) {
        res.setHeader('Content-Type', 'image/png');
      } else if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
        res.setHeader('Content-Type', 'image/jpeg');
      } else if (filePath.endsWith('.gif')) {
        res.setHeader('Content-Type', 'image/gif');
      } else if (filePath.endsWith('.ico')) {
        res.setHeader('Content-Type', 'image/x-icon');
      } else if (filePath.match(/\.(woff|woff2|ttf|eot)$/)) {
        res.setHeader('Content-Type', 'application/font-woff');
      }
      
      // Set cache headers for static assets
      if (filePath.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable'); // 1 year for hashed assets
      }
      
      // Ensure proper headers for ES modules
      if (filePath.endsWith('.js') || filePath.endsWith('.mjs')) {
        res.setHeader('X-Content-Type-Options', 'nosniff');
      }

      // Track served asset path (used to detect stale requests later)
      try {
        const rel = filePath.replace(distPath, '').replace(/\\/g, '/');
        if (rel.startsWith('/assets/')) knownAssets.add(rel);
      } catch {}
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

  // Handle missing/stale assets: if filename has a hash-like pattern and isn't known, respond 410 to force cache bust
  app.use('/assets/:file', (req, res) => {
    const requestPath = `/assets/${req.params.file}`;
    const looksHashed = /\.[a-f0-9]{8,}\./i.test(requestPath) || /-[A-Z0-9]{6,}\./i.test(requestPath);
    if (looksHashed && !knownAssets.has(requestPath)) {
      log(`Stale asset requested (410): ${requestPath}`);
      return res.status(410).json({ error: 'Asset gone', action: 'reload', buildId: BUILD_ID });
    }
    log(`Missing asset requested (404): ${requestPath}`);
    return res.status(404).json({ error: 'Asset not found' });
  });

  // Only serve index.html for routes that don't match static assets
  app.get("*", (req, res) => {
    // Don't serve index.html for static asset requests
    if (req.path.startsWith('/assets/') || 
        req.path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
      return res.status(404).send('Asset not found');
    }
    const indexFile = path.resolve(distPath, "index.html");
    // Set aggressive no-store so HTML always revalidates, picking up new asset hashes
    res.setHeader('Cache-Control', 'no-store, max-age=0');
    res.setHeader(BUILD_HEADER, BUILD_ID);
    // Small security & diagnostic headers
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), camera=(), microphone=()');
    res.sendFile(indexFile);
  });
}