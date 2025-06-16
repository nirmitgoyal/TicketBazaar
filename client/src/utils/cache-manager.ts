/**
 * Advanced client-side cache management
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  version: string;
}

interface CacheStats {
  hits: number;
  misses: number;
  evictions: number;
  size: number;
}

export class CacheManager<T = any> {
  private cache = new Map<string, CacheEntry<T>>();
  private stats: CacheStats = { hits: 0, misses: 0, evictions: 0, size: 0 };
  private maxSize: number;
  private defaultTTL: number;
  private version: string;

  constructor(options: {
    maxSize?: number;
    defaultTTL?: number;
    version?: string;
  } = {}) {
    this.maxSize = options.maxSize || 100;
    this.defaultTTL = options.defaultTTL || 300000; // 5 minutes
    this.version = options.version || '1.0';
  }

  set(key: string, data: T, ttl?: number): void {
    // Evict if at capacity
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
      version: this.version,
    };

    this.cache.set(key, entry);
    this.stats.size = this.cache.size;
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // Check version compatibility
    if (entry.version !== this.version) {
      this.cache.delete(key);
      this.stats.evictions++;
      this.stats.misses++;
      return null;
    }

    // Check TTL
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.stats.evictions++;
      this.stats.misses++;
      return null;
    }

    this.stats.hits++;
    return entry.data;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.stats.size = this.cache.size;
    }
    return deleted;
  }

  clear(): void {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0, evictions: 0, size: 0 };
  }

  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();

    // Convert to array to avoid iterator issues
    const entries = Array.from(this.cache.entries());
    for (const [key, entry] of entries) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.stats.evictions++;
    }
  }

  getStats(): CacheStats {
    return { ...this.stats };
  }

  getHitRate(): number {
    const total = this.stats.hits + this.stats.misses;
    return total > 0 ? this.stats.hits / total : 0;
  }

  // Batch operations
  setMany(entries: Array<{ key: string; data: T; ttl?: number }>): void {
    entries.forEach(({ key, data, ttl }) => {
      this.set(key, data, ttl);
    });
  }

  getMany(keys: string[]): Array<{ key: string; data: T | null }> {
    return keys.map(key => ({ key, data: this.get(key) }));
  }

  // Async operations with fallback
  async getOrSet(
    key: string,
    factory: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = this.get(key);
    if (cached !== null) {
      return cached;
    }

    const data = await factory();
    this.set(key, data, ttl);
    return data;
  }

  // Cache warming
  warmup(entries: Array<{ key: string; data: T; ttl?: number }>): void {
    entries.forEach(({ key, data, ttl }) => {
      if (!this.has(key)) {
        this.set(key, data, ttl);
      }
    });
  }
}

// Global cache instances
export const queryCache = new CacheManager<any>({
  maxSize: 200,
  defaultTTL: 300000, // 5 minutes
  version: '1.0',
});

export const imageCache = new CacheManager<string>({
  maxSize: 50,
  defaultTTL: 600000, // 10 minutes
  version: '1.0',
});

export const userCache = new CacheManager<any>({
  maxSize: 100,
  defaultTTL: 180000, // 3 minutes
  version: '1.0',
});