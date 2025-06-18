import { logger } from "../utils/logger";

interface CacheItem {
  data: any;
  timestamp: number;
  expiry: number;
}

class CacheService {
  private cache = new Map<string, CacheItem>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  set(key: string, data: any, ttl: number = this.DEFAULT_TTL): void {
    const expiry = Date.now() + ttl;
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiry
    });
    
    logger.debug('CACHE', `Cached item with key: ${key}, TTL: ${ttl}ms`);
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      logger.debug('CACHE', `Expired and removed cache item: ${key}`);
      return null;
    }
    
    logger.debug('CACHE', `Cache hit for key: ${key}`);
    return item.data;
  }

  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      logger.debug('CACHE', `Manually deleted cache item: ${key}`);
    }
    return deleted;
  }

  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    logger.info('CACHE', `Cleared entire cache, removed ${size} items`);
  }

  invalidatePattern(pattern: string): number {
    let deleted = 0;
    const keys = Array.from(this.cache.keys());
    for (const key of keys) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
        deleted++;
      }
    }
    logger.info('CACHE', `Invalidated ${deleted} items matching pattern: ${pattern}`);
    return deleted;
  }

  getStats(): { size: number; hitRate: number; keys: string[] } {
    return {
      size: this.cache.size,
      hitRate: 0, // Would need hit/miss tracking for accurate rate
      keys: Array.from(this.cache.keys())
    };
  }

  // Cleanup expired items periodically
  cleanup(): number {
    let cleaned = 0;
    const now = Date.now();
    
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      logger.info('CACHE', `Cleaned up ${cleaned} expired cache items`);
    }
    
    return cleaned;
  }
}

export const cacheService = new CacheService();

// Auto-cleanup every 10 minutes
setInterval(() => {
  cacheService.cleanup();
}, 10 * 60 * 1000);