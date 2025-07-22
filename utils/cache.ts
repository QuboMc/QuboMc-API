import logger from './logger';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class MemoryCache {
  private cache = new Map<string, CacheItem<any>>();
  private defaultTTL = 60000; // 1 minute default
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Cleanup expired items every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000);
  }

  set<T>(key: string, data: T, ttl?: number): void {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL
    };
    this.cache.set(key, item);
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  private cleanup(): void {
    const now = Date.now();
    let expiredCount = 0;

    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
        expiredCount++;
      }
    }

    if (expiredCount > 0) {
      logger.debug(`Cleaned up ${expiredCount} expired cache items`);
    }
  }

  getStats() {
    return {
      size: this.cache.size,
      memoryUsage: JSON.stringify([...this.cache.entries()]).length
    };
  }

  // Cache middleware for Express
  middleware(ttl?: number) {
    return (req: any, res: any, next: any) => {
      if (req.method !== 'GET') {
        return next();
      }

      const key = `${req.method}:${req.originalUrl}`;
      const cached = this.get(key);

      if (cached) {
        logger.debug(`Cache hit for ${key}`);
        return res.json(cached);
      }

      const originalJson = res.json;
      res.json = (data: any) => {
        this.set(key, data, ttl);
        logger.debug(`Cached response for ${key}`);
        return originalJson.call(res, data);
      };

      next();
    };
  }

  destroy() {
    clearInterval(this.cleanupInterval);
    this.clear();
  }
}

export const cache = new MemoryCache();
export default MemoryCache;