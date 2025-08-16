import { Request, Response, NextFunction } from "express";

export interface SearchQueryAnalysis {
  queryType: 'empty' | 'normal' | 'special_chars' | 'xss_like' | 'sql_like' | 'too_long';
  originalQuery: string;
  sanitizedQuery: string;
  suggestions?: string[];
  message?: string;
}

/**
 * Analyze search query to determine its type and provide contextual feedback
 */
function analyzeSearchQuery(query: string): SearchQueryAnalysis {
  const originalQuery = query;
  
  // Check for empty or whitespace-only query
  if (!query || query.trim().length === 0) {
    return {
      queryType: 'empty',
      originalQuery,
      sanitizedQuery: '',
      suggestions: [
        'IPL matches',
        'Bollywood concerts', 
        'Comedy shows Mumbai',
        'Music festivals',
        'Cricket World Cup'
      ],
      message: 'Try searching by event, artist, or city name'
    };
  }

  // Check length
  if (query.length > 200) {
    return {
      queryType: 'too_long',
      originalQuery,
      sanitizedQuery: query.substring(0, 200),
      message: 'Search query too long (maximum 200 characters)'
    };
  }

  // Remove potentially dangerous characters
  const sanitizedQuery = query
    .replace(/[<>\"';&\\]/g, '') // Remove dangerous characters
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();

  // Check for XSS-like patterns
  const xssPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /vbscript:/i,
    /data:text\/html/i
  ];

  for (const pattern of xssPatterns) {
    if (pattern.test(originalQuery)) {
      return {
        queryType: 'xss_like',
        originalQuery,
        sanitizedQuery,
        suggestions: [
          'concert tickets',
          'sports events',
          'theater shows',
          'comedy nights'
        ],
        message: 'Special characters are not required in your search. Try simple keywords like event names or cities.'
      };
    }
  }

  // Check for SQL injection patterns
  const sqlPatterns = [
    /union\s+select/i,
    /drop\s+table/i,
    /delete\s+from/i,
    /update\s+set/i,
    /insert\s+into/i,
    /exec\s*\(/i,
    /script\s*>/i,
    /--/,
    /\/\*/,
    /\*\//
  ];

  for (const pattern of sqlPatterns) {
    if (pattern.test(sanitizedQuery)) {
      return {
        queryType: 'sql_like',
        originalQuery,
        sanitizedQuery,
        suggestions: [
          'concert tickets',
          'sports events', 
          'theater shows',
          'comedy nights'
        ],
        message: 'Invalid characters detected. Please search using simple keywords like event names, artists, or cities.'
      };
    }
  }

  // Check for excessive special characters
  const specialCharCount = (originalQuery.match(/[^a-zA-Z0-9\s]/g) || []).length;
  const totalLength = originalQuery.length;
  
  if (specialCharCount > 3 && specialCharCount / totalLength > 0.3) {
    return {
      queryType: 'special_chars',
      originalQuery,
      sanitizedQuery,
      suggestions: [
        'Try searching for event names',
        'Search by artist or performer',
        'Look for events in your city',
        'Browse by category like "concerts" or "sports"'
      ],
      message: 'Special characters are not needed. Try searching with simple words like event names or cities.'
    };
  }

  // Normal query
  return {
    queryType: 'normal',
    originalQuery,
    sanitizedQuery,
  };
}

/**
 * Sanitize and validate search queries with enhanced user feedback
 */
export function validateSearchQuery(req: Request, res: Response, next: NextFunction) {
  const query = req.query.q as string;
  
  if (!query) {
    return next();
  }

  const analysis = analyzeSearchQuery(query);

  // For queries that should be blocked (SQL/XSS), return error with helpful message
  if (analysis.queryType === 'sql_like' || analysis.queryType === 'xss_like') {
    return res.status(400).json({
      error: analysis.message,
      suggestions: analysis.suggestions,
      queryType: analysis.queryType
    });
  }

  // For too long queries, return error
  if (analysis.queryType === 'too_long') {
    return res.status(400).json({
      error: analysis.message
    });
  }

  // Update the query with sanitized version and attach analysis for use in search results
  req.query.q = analysis.sanitizedQuery;
  (req as any).searchAnalysis = analysis;
  next();
}