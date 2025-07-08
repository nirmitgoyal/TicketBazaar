import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { log } from "./utils";

export function setupProduction(app: Express) {
  // In production, the built files are in dist/public
  const distPath = path.resolve(process.cwd(), "dist", "public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  // Configure static file serving with proper MIME types
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