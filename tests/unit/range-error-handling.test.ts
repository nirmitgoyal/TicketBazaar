// Test to verify Range Not Satisfiable error is properly handled
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import express from 'express';
import request from 'supertest';
import fs from 'fs';
import path from 'path';
import { setupProduction } from '../server/production';

describe('Range Not Satisfiable Error Handling', () => {
  let app: express.Application;
  let testDir: string;
  let testFile: string;

  beforeAll(() => {
    // Create test app
    app = express();
    
    // Create test directory and file
    testDir = path.join(__dirname, 'temp-test-assets');
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
    
    testFile = path.join(testDir, 'test-asset.js');
    const testContent = 'console.log("Test content for range requests");'.repeat(50);
    fs.writeFileSync(testFile, testContent);
    
    // Mock the production setup to use our test directory
    const originalResolve = path.resolve;
    path.resolve = jest.fn((cwd, dir, file) => {
      if (dir === 'dist' && file === 'public') {
        return testDir;
      }
      return originalResolve.call(path, cwd, dir, file);
    }) as any;
    
    // Setup production middleware
    setupProduction(app);
    
    // Restore original resolve
    path.resolve = originalResolve;
  });

  afterAll(() => {
    // Clean up test files
    if (fs.existsSync(testFile)) {
      fs.unlinkSync(testFile);
    }
    if (fs.existsSync(testDir)) {
      fs.rmdirSync(testDir);
    }
  });

  it('should handle valid range requests correctly', async () => {
    const response = await request(app)
      .get('/test-asset.js')
      .set('Range', 'bytes=0-100')
      .expect(206);

    expect(response.headers['accept-ranges']).toBe('bytes');
    expect(response.headers['content-range']).toMatch(/^bytes 0-100\/\d+$/);
    expect(response.headers['content-length']).toBe('101');
  });

  it('should handle invalid range requests gracefully', async () => {
    const response = await request(app)
      .get('/test-asset.js')
      .set('Range', 'bytes=999999-999999')
      .expect(416);

    expect(response.body).toEqual({
      error: 'Range Not Satisfiable',
      message: 'The requested range cannot be satisfied',
      status: 416
    });
  });

  it('should handle normal requests without range headers', async () => {
    const response = await request(app)
      .get('/test-asset.js')
      .expect(200);

    expect(response.headers['content-type']).toBe('application/javascript; charset=utf-8');
    expect(response.headers['cache-control']).toBe('public, max-age=31536000, immutable');
  });

  it('should handle requests with malformed range headers', async () => {
    const response = await request(app)
      .get('/test-asset.js')
      .set('Range', 'invalid-range-header')
      .expect(200); // Should ignore invalid range and serve full file

    expect(response.headers['content-type']).toBe('application/javascript; charset=utf-8');
  });

  it('should handle range requests beyond file size', async () => {
    const response = await request(app)
      .get('/test-asset.js')
      .set('Range', 'bytes=10000-20000')
      .expect(416);

    expect(response.body).toEqual({
      error: 'Range Not Satisfiable',
      message: 'The requested range cannot be satisfied',
      status: 416
    });
  });

  it('should handle range requests with start greater than end', async () => {
    const response = await request(app)
      .get('/test-asset.js')
      .set('Range', 'bytes=500-100')
      .expect(416);

    expect(response.body).toEqual({
      error: 'Range Not Satisfiable',
      message: 'The requested range cannot be satisfied',
      status: 416
    });
  });
});