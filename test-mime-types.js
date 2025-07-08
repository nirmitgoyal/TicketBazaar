#!/usr/bin/env node
import express from 'express';
import fs from 'fs';
import path from 'path';

const app = express();

// Replicate the setupProduction function locally
const distPath = path.resolve(process.cwd(), "dist", "public");

if (!fs.existsSync(distPath)) {
  console.error(`Could not find the build directory: ${distPath}`);
  process.exit(1);
}

// Configure static file serving with proper MIME types
app.use(express.static(distPath, {
  setHeaders: (res, path) => {
    // Set correct MIME types for JavaScript modules
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    } else if (path.endsWith('.mjs')) {
      res.setHeader('Content-Type', 'application/javascript');
    } else if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
    
    // Set cache headers for static assets
    if (path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable'); // 1 year
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

const server = app.listen(3001, () => {
  console.log('Test server running on port 3001');
  
  // Test requests
  const testPaths = [
    '/assets/index-Cj0Nw6uN.js',
    '/assets/index-DZDHe5G3.css',
    '/assets/vendor-react-C5NW_hoV.js',
    '/',
    '/some-route'
  ];
  
  Promise.all(testPaths.map(async (path) => {
    try {
      const response = await fetch(`http://localhost:3001${path}`);
      const contentType = response.headers.get('content-type');
      console.log(`${path}: ${response.status} - ${contentType}`);
    } catch (error) {
      console.error(`Error testing ${path}:`, error.message);
    }
  })).then(() => {
    server.close();
    console.log('Test complete');
  });
});
