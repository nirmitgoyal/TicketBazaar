import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import { uriValidationMiddleware } from '../server/middleware/uri-validation.middleware';

describe('URI Validation Middleware', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(uriValidationMiddleware);
    
    // Add a simple test route
    app.get('/test', (req, res) => {
      res.json({ message: 'Test route works' });
    });
  });

  it('should handle valid URIs normally', async () => {
    const response = await request(app)
      .get('/test')
      .expect(200);
    
    expect(response.body.message).toBe('Test route works');
  });

  it('should handle malformed URI with %c0 encoding', async () => {
    // Create a direct request with malformed URI
    const response = await request(app)
      .get('/%c0')
      .expect(400);
    
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Invalid URL encoding');
    expect(response.body.status).toBe(400);
  });

  it('should handle other malformed URI encodings', async () => {
    const response = await request(app)
      .get('/%ff')
      .expect(400);
    
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Invalid URL encoding');
    expect(response.body.status).toBe(400);
  });

  it('should handle valid encoded URIs', async () => {
    const response = await request(app)
      .get('/test?param=hello%20world')
      .expect(200);
    
    expect(response.body.message).toBe('Test route works');
  });
});