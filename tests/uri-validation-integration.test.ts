/**
 * Integration test to verify URI validation middleware works with the full application
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import { uriValidationMiddleware } from '../server/middleware/uri-validation.middleware';

describe('URI Validation Middleware Integration', () => {
  let app: express.Express;

  beforeAll(() => {
    // Create a test app similar to the main application
    app = express();
    
    // Add the URI validation middleware first
    app.use(uriValidationMiddleware);
    
    // Add JSON middleware like the main app
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    
    // Add some test routes similar to the main app
    app.get('/api/health', (req, res) => {
      res.json({ status: 'OK', timestamp: new Date().toISOString() });
    });
    
    app.get('/api/tickets', (req, res) => {
      res.json({ tickets: [] });
    });
    
    app.post('/api/tickets', (req, res) => {
      res.json({ success: true, message: 'Ticket created' });
    });
    
    // Add a catch-all route for testing
    app.get('*', (req, res) => {
      res.status(404).json({ error: 'Not found' });
    });
  });

  it('should allow normal API requests to pass through', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect(200);
    
    expect(response.body.status).toBe('OK');
    expect(response.body.timestamp).toBeDefined();
  });

  it('should handle API requests with query parameters', async () => {
    const response = await request(app)
      .get('/api/tickets?limit=10&page=1')
      .expect(200);
    
    expect(response.body.tickets).toEqual([]);
  });

  it('should handle POST requests with body', async () => {
    const response = await request(app)
      .post('/api/tickets')
      .send({ title: 'Test Ticket', price: 100 })
      .expect(200);
    
    expect(response.body.success).toBe(true);
  });

  it('should handle encoded characters in valid URLs', async () => {
    const response = await request(app)
      .get('/api/tickets?search=hello%20world')
      .expect(200);
    
    expect(response.body.tickets).toEqual([]);
  });

  it('should reject malformed URI with %c0 without crashing', async () => {
    const response = await request(app)
      .get('/%c0')
      .expect(400);
    
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Invalid URL encoding');
  });

  it('should reject malformed URI with incomplete percent encoding', async () => {
    const response = await request(app)
      .get('/test%')
      .expect(400);
    
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Invalid URL encoding');
  });

  it('should handle multiple malformed requests without affecting subsequent valid requests', async () => {
    // Make several malformed requests
    await request(app).get('/%c0').expect(400);
    await request(app).get('/%ff').expect(400);
    await request(app).get('/test%').expect(400);
    
    // Verify normal requests still work
    const response = await request(app)
      .get('/api/health')
      .expect(200);
    
    expect(response.body.status).toBe('OK');
  });
});