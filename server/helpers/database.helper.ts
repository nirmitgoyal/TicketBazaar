/**
 * Database helper utilities for improved code organization
 * Centralizes common database operations and error handling
 */

import { eq, and, or, desc, asc, like, between, inArray } from 'drizzle-orm';
import { db } from '../db';
import { users, tickets, contactRequests, userReviews, ticketViews } from '../../shared/schema';
import type { SearchFilters, SortOptions, PaginatedResult } from '../types';

/**
 * Generic database error handler
 */
export function handleDatabaseError(error: any, operation: string): never {
  console.error(`Database error in ${operation}:`, error);
  throw new Error(`Failed to ${operation}: ${error.message}`);
}

/**
 * Build search conditions for tickets based on filters
 */
export function buildTicketSearchConditions(filters: SearchFilters) {
  const conditions = [];

  if (filters.category) {
    conditions.push(eq(tickets.category, filters.category));
  }

  if (filters.city) {
    conditions.push(eq(tickets.city, filters.city));
  }

  if (filters.trending) {
    conditions.push(eq(tickets.trending, true));
  }

  if (filters.sellingFast) {
    conditions.push(eq(tickets.sellingFast, true));
  }

  if (filters.date) {
    const startOfDay = new Date(filters.date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(filters.date);
    endOfDay.setHours(23, 59, 59, 999);
    
    conditions.push(between(tickets.eventDate, startOfDay, endOfDay));
  }

  if (filters.bounds) {
    const { north, south, east, west } = filters.bounds;
    conditions.push(
      and(
        between(tickets.latitude, south, north),
        between(tickets.longitude, west, east)
      )
    );
  }

  return conditions.length > 0 ? and(...conditions) : undefined;
}

/**
 * Build sort conditions based on sort options
 */
export function buildSortConditions(sortOptions?: SortOptions) {
  if (!sortOptions) {
    return [desc(tickets.trending), desc(tickets.sellingFast), desc(tickets.id)];
  }

  const direction = sortOptions.direction === 'asc' ? asc : desc;
  
  // Handle sorting by specific fields
  switch (sortOptions.field) {
    case 'eventDate':
      return [direction(tickets.eventDate)];
    case 'price':
      return [direction(tickets.price)];
    case 'createdAt':
      return [direction(tickets.createdAt)];
    case 'title':
      return [direction(tickets.title)];
    default:
      return [desc(tickets.id)];
  }
}

/**
 * Calculate pagination offset and limit
 */
export function calculatePagination(page: number = 1, limit: number = 20) {
  const normalizedPage = Math.max(1, page);
  const normalizedLimit = Math.min(100, Math.max(1, limit));
  const offset = (normalizedPage - 1) * normalizedLimit;

  return { offset, limit: normalizedLimit, page: normalizedPage };
}

/**
 * Create paginated result object
 */
export function createPaginatedResult<T>(
  data: T[],
  page: number,
  limit: number,
  total: number
): PaginatedResult<T> {
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
}

/**
 * Sanitize search query for SQL LIKE operations
 */
export function sanitizeSearchQuery(query: string): string {
  return query
    .replace(/[%_]/g, '\\$&') // Escape SQL LIKE special characters
    .trim()
    .toLowerCase();
}

/**
 * Build text search conditions
 */
export function buildTextSearchConditions(query: string) {
  const sanitizedQuery = `%${sanitizeSearchQuery(query)}%`;
  
  return or(
    like(tickets.title, sanitizedQuery),
    like(tickets.eventTitle, sanitizedQuery),
    like(tickets.eventDescription, sanitizedQuery),
    like(tickets.venue, sanitizedQuery),
    like(tickets.venueAddress, sanitizedQuery),
    like(tickets.city, sanitizedQuery)
  );
}

/**
 * Cache management utilities
 */
export class CacheManager {
  private static caches = new Map<string, Map<string, { data: any; timestamp: number }>>();
  private static readonly TTL = 5 * 60 * 1000; // 5 minutes

  static get<T>(cacheKey: string, itemKey: string): T | undefined {
    const cache = this.caches.get(cacheKey);
    if (!cache) return undefined;

    const item = cache.get(itemKey);
    if (!item) return undefined;

    if (Date.now() - item.timestamp > this.TTL) {
      cache.delete(itemKey);
      return undefined;
    }

    return item.data;
  }

  static set(cacheKey: string, itemKey: string, data: any): void {
    let cache = this.caches.get(cacheKey);
    if (!cache) {
      cache = new Map();
      this.caches.set(cacheKey, cache);
    }

    cache.set(itemKey, { data, timestamp: Date.now() });
  }

  static delete(cacheKey: string, itemKey: string): void {
    const cache = this.caches.get(cacheKey);
    if (cache) {
      cache.delete(itemKey);
    }
  }

  static clear(cacheKey: string): void {
    this.caches.delete(cacheKey);
  }

  static clearAll(): void {
    this.caches.clear();
  }
}

/**
 * Database connection health check
 */
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await db.select().from(users).limit(1);
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

/**
 * Batch operations utility
 */
export class BatchProcessor {
  static async processBatch<T, R>(
    items: T[],
    processor: (item: T) => Promise<R>,
    batchSize: number = 10
  ): Promise<R[]> {
    const results: R[] = [];
    
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch.map(processor));
      results.push(...batchResults);
    }
    
    return results;
  }
}