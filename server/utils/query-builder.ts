import { eq, or, and, like, desc, sql, ilike, gt, lt, gte, lte, inArray } from "drizzle-orm";
import { tickets, users, contactRequests, ticketViews, ticketPopularity } from "@shared/schema";

/**
 * Centralized query builders for common database operations
 * Reduces code duplication and improves maintainability
 */

export class QueryBuilder {
  
  /**
   * Build search filters for tickets with optimized conditions
   */
  static buildTicketSearchFilters(filters: {
    category?: string;
    location?: string;
    date?: Date;
    trending?: boolean;
    sellingFast?: boolean;
    dateRange?: string;
    city?: string;
    bounds?: {
      north: number;
      south: number;
      east: number;
      west: number;
    };
    query?: string;
  }) {
    const conditions = [];
    
    // Only available tickets
    conditions.push(eq(tickets.status, "available"));
    
    if (filters.category && filters.category !== "all") {
      conditions.push(ilike(tickets.category, `%${filters.category}%`));
    }
    
    if (filters.city) {
      conditions.push(ilike(tickets.city, `%${filters.city}%`));
    }
    
    if (filters.trending) {
      conditions.push(eq(tickets.trending, true));
    }
    
    if (filters.sellingFast) {
      conditions.push(eq(tickets.trending, true));
    }
    
    if (filters.date) {
      const startDate = new Date(filters.date);
      const endDate = new Date(filters.date);
      endDate.setDate(endDate.getDate() + 1);
      conditions.push(
        and(
          gte(tickets.eventDate, startDate),
          lt(tickets.eventDate, endDate)
        )
      );
    }
    
    if (filters.dateRange) {
      const now = new Date();
      let startDate: Date;
      
      switch (filters.dateRange) {
        case "today":
          startDate = now;
          break;
        case "this-week":
          startDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
          break;
        case "this-month":
          startDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = now;
      }
      
      conditions.push(
        and(
          gte(tickets.eventDate, now),
          lte(tickets.eventDate, startDate)
        )
      );
    }
    
    if (filters.bounds) {
      conditions.push(
        and(
          gte(tickets.latitude, filters.bounds.south),
          lte(tickets.latitude, filters.bounds.north),
          gte(tickets.longitude, filters.bounds.west),
          lte(tickets.longitude, filters.bounds.east)
        )
      );
    }
    
    if (filters.query) {
      const searchConditions = or(
        ilike(tickets.title, `%${filters.query}%`),
        ilike(tickets.eventTitle, `%${filters.query}%`),
        ilike(tickets.venue, `%${filters.query}%`),
        ilike(tickets.city, `%${filters.query}%`),
        ilike(tickets.eventDescription, `%${filters.query}%`)
      );
      if (searchConditions) conditions.push(searchConditions);
    }
    
    return conditions.length > 0 ? and(...conditions) : undefined;
  }
  

  
  /**
   * Build contact request filters with status optimization
   */
  static buildContactRequestFilters(filters: {
    sellerId?: number;
    requesterId?: number;
    status?: string;
    ticketId?: number;
  }) {
    const conditions = [];
    
    if (filters.sellerId) {
      conditions.push(eq(contactRequests.sellerId, filters.sellerId));
    }
    
    if (filters.requesterId) {
      conditions.push(eq(contactRequests.requesterId, filters.requesterId));
    }
    
    if (filters.status) {
      conditions.push(eq(contactRequests.status, filters.status));
    }
    
    if (filters.ticketId) {
      conditions.push(eq(contactRequests.ticketId, filters.ticketId));
    }
    
    return conditions.length > 0 ? and(...conditions) : undefined;
  }
  
  /**
   * Build popularity metrics aggregation query
   */
  static buildPopularityQuery(ticketId: number) {
    return {
      viewsCondition: eq(ticketViews.ticketId, ticketId),
      popularityCondition: eq(ticketPopularity.ticketId, ticketId),
      aggregations: {
        totalViews: sql<number>`COUNT(${ticketViews.id})`,
        uniqueViews: sql<number>`COUNT(DISTINCT COALESCE(${ticketViews.userId}::text, ${ticketViews.ipAddress}))`,
        dailyViews: sql<number>`COUNT(CASE WHEN ${ticketViews.viewedAt} >= CURRENT_DATE THEN 1 END)`,
      }
    };
  }
  
  /**
   * Build batch operations for performance optimization
   */
  static buildBatchInsert<T>(table: any, records: T[], batchSize = 100) {
    const batches = [];
    for (let i = 0; i < records.length; i += batchSize) {
      batches.push(records.slice(i, i + batchSize));
    }
    return batches;
  }
  
  /**
   * Build optimized joins for complex queries
   */
  static buildTicketWithUserJoin() {
    return {
      seller: {
        id: users.id,
        fullName: users.fullName,

        verificationStatus: users.verificationStatus,
        preferredContactMethod: users.preferredContactMethod,
      }
    };
  }
  
  /**
   * Build date range filters with timezone support
   */
  static buildDateRangeFilter(
    startDate: Date | string, 
    endDate: Date | string, 
    timezone?: string
  ) {
    const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
    const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
    
    return and(
      gte(tickets.eventDate, start),
      lte(tickets.eventDate, end)
    );
  }
}

/**
 * Cache management utilities
 */
export class CacheManager {
  private static caches = new Map<string, Map<any, any>>();
  
  static getCache(cacheName: string) {
    if (!this.caches.has(cacheName)) {
      this.caches.set(cacheName, new Map());
    }
    return this.caches.get(cacheName)!;
  }
  
  static invalidateCache(cacheName: string, key?: any) {
    const cache = this.caches.get(cacheName);
    if (!cache) return;
    
    if (key) {
      cache.delete(key);
    } else {
      cache.clear();
    }
  }
  
  static setCacheWithTTL(cacheName: string, key: any, value: any, ttlMs = 300000) {
    const cache = this.getCache(cacheName);
    const item = {
      value,
      expiry: Date.now() + ttlMs
    };
    cache.set(key, item);
  }
  
  static getCacheValue(cacheName: string, key: any) {
    const cache = this.getCache(cacheName);
    const item = cache.get(key);
    
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      cache.delete(key);
      return null;
    }
    
    return item.value;
  }
}