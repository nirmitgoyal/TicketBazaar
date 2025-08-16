import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { validateSearchQuery } from '../../server/middleware/search-validation.middleware';

// Mock Request and Response objects
const createMockRequest = (query: string = ''): Partial<Request> => ({
  query: { q: query }
});

const createMockResponse = (): Partial<Response> => ({
  status: vi.fn().mockReturnThis(),
  json: vi.fn().mockReturnThis(),
});

const createMockNext = (): NextFunction => vi.fn();

describe('Enhanced Search Validation Middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Empty or missing queries', () => {
    it('should pass through when no query is provided', () => {
      const req = createMockRequest();
      const res = createMockResponse();
      const next = createMockNext();

      validateSearchQuery(req as Request, res as Response, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should pass through when query is empty string', () => {
      const req = createMockRequest('');
      const res = createMockResponse();
      const next = createMockNext();

      validateSearchQuery(req as Request, res as Response, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe('Normal queries', () => {
    it('should sanitize and pass normal queries', () => {
      const req = createMockRequest('concert tickets');
      const res = createMockResponse();
      const next = createMockNext();

      validateSearchQuery(req as Request, res as Response, next);

      expect(next).toHaveBeenCalled();
      expect(req.query.q).toBe('concert tickets');
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should normalize whitespace in queries', () => {
      const req = createMockRequest('  multiple   spaces  ');
      const res = createMockResponse();
      const next = createMockNext();

      validateSearchQuery(req as Request, res as Response, next);

      expect(next).toHaveBeenCalled();
      expect(req.query.q).toBe('multiple spaces');
    });
  });

  describe('XSS-like queries', () => {
    it('should block script tags with helpful message', () => {
      const req = createMockRequest('<script>alert("xss")</script>');
      const res = createMockResponse();
      const next = createMockNext();

      validateSearchQuery(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Special characters are not required in your search. Try simple keywords like event names or cities.',
        suggestions: ['concert tickets', 'sports events', 'theater shows', 'comedy nights'],
        queryType: 'xss_like'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should block javascript: protocol', () => {
      const req = createMockRequest('javascript:alert(1)');
      const res = createMockResponse();
      const next = createMockNext();

      validateSearchQuery(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          queryType: 'xss_like',
          suggestions: expect.arrayContaining(['concert tickets'])
        })
      );
    });

    it('should block iframe tags', () => {
      const req = createMockRequest('<iframe src="evil.com"></iframe>');
      const res = createMockResponse();
      const next = createMockNext();

      validateSearchQuery(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          queryType: 'xss_like'
        })
      );
    });
  });

  describe('SQL injection queries', () => {
    it('should block UNION SELECT attacks', () => {
      const req = createMockRequest("' UNION SELECT * FROM users --");
      const res = createMockResponse();
      const next = createMockNext();

      validateSearchQuery(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid characters detected. Please search using simple keywords like event names, artists, or cities.',
        suggestions: ['concert tickets', 'sports events', 'theater shows', 'comedy nights'],
        queryType: 'sql_like'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should block DROP TABLE attacks', () => {
      const req = createMockRequest('DROP TABLE users');
      const res = createMockResponse();
      const next = createMockNext();

      validateSearchQuery(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          queryType: 'sql_like'
        })
      );
    });
  });

  describe('Special character queries', () => {
    it('should pass queries with moderate special characters', () => {
      const req = createMockRequest('U2 concert @mumbai');
      const res = createMockResponse();
      const next = createMockNext();

      validateSearchQuery(req as Request, res as Response, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should provide guidance for excessive special characters', () => {
      const req = createMockRequest('!@#$%^&*()');
      const res = createMockResponse();
      const next = createMockNext();

      validateSearchQuery(req as Request, res as Response, next);

      expect(next).toHaveBeenCalled();
      expect((req as any).searchAnalysis).toEqual(
        expect.objectContaining({
          queryType: 'special_chars',
          originalQuery: '!@#$%^&*()',
          suggestions: expect.arrayContaining(['Try searching for event names'])
        })
      );
    });
  });

  describe('Length validation', () => {
    it('should reject queries longer than 200 characters', () => {
      const longQuery = 'a'.repeat(201);
      const req = createMockRequest(longQuery);
      const res = createMockResponse();
      const next = createMockNext();

      validateSearchQuery(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Search query too long (maximum 200 characters)'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should accept queries at exactly 200 characters', () => {
      const maxQuery = 'a'.repeat(200);
      const req = createMockRequest(maxQuery);
      const res = createMockResponse();
      const next = createMockNext();

      validateSearchQuery(req as Request, res as Response, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe('Search analysis attachment', () => {
    it('should attach analysis for special character queries', () => {
      const req = createMockRequest('###concerts###');
      const res = createMockResponse();
      const next = createMockNext();

      validateSearchQuery(req as Request, res as Response, next);

      expect((req as any).searchAnalysis).toBeDefined();
      expect((req as any).searchAnalysis.queryType).toBe('special_chars');
      expect((req as any).searchAnalysis.originalQuery).toBe('###concerts###');
      expect((req as any).searchAnalysis.sanitizedQuery).toBe('concerts');
    });

    it('should not attach analysis for normal queries', () => {
      const req = createMockRequest('normal concert search');
      const res = createMockResponse();
      const next = createMockNext();

      validateSearchQuery(req as Request, res as Response, next);

      expect((req as any).searchAnalysis).toBeDefined();
      expect((req as any).searchAnalysis.queryType).toBe('normal');
    });
  });
});