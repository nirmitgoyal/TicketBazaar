#!/usr/bin/env node

/**
 * Simple health endpoint for deployment validation
 * Used by deploy.sh to verify application is working
 */

import { createServer } from 'http';

const server = createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    }));
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Health server running on port ${port}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Health server shutting down...');
  server.close(() => {
    process.exit(0);
  });
});
