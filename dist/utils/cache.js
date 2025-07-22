"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cache = void 0;
const logger_1 = __importDefault(require("./logger"));
class MemoryCache {
    constructor() {
        this.cache = new Map();
        this.defaultTTL = 60000; // 1 minute default
        // Cleanup expired items every minute
        this.cleanupInterval = setInterval(() => {
            this.cleanup();
        }, 60000);
    }
    set(key, data, ttl) {
        const item = {
            data,
            timestamp: Date.now(),
            ttl: ttl || this.defaultTTL
        };
        this.cache.set(key, item);
    }
    get(key) {
        const item = this.cache.get(key);
        if (!item)
            return null;
        if (Date.now() - item.timestamp > item.ttl) {
            this.cache.delete(key);
            return null;
        }
        return item.data;
    }
    has(key) {
        const item = this.cache.get(key);
        if (!item)
            return false;
        if (Date.now() - item.timestamp > item.ttl) {
            this.cache.delete(key);
            return false;
        }
        return true;
    }
    delete(key) {
        return this.cache.delete(key);
    }
    clear() {
        this.cache.clear();
    }
    cleanup() {
        const now = Date.now();
        let expiredCount = 0;
        for (const [key, item] of this.cache.entries()) {
            if (now - item.timestamp > item.ttl) {
                this.cache.delete(key);
                expiredCount++;
            }
        }
        if (expiredCount > 0) {
            logger_1.default.debug(`Cleaned up ${expiredCount} expired cache items`);
        }
    }
    getStats() {
        return {
            size: this.cache.size,
            memoryUsage: JSON.stringify([...this.cache.entries()]).length
        };
    }
    // Cache middleware for Express
    middleware(ttl) {
        return (req, res, next) => {
            if (req.method !== 'GET') {
                return next();
            }
            const key = `${req.method}:${req.originalUrl}`;
            const cached = this.get(key);
            if (cached) {
                logger_1.default.debug(`Cache hit for ${key}`);
                return res.json(cached);
            }
            const originalJson = res.json;
            res.json = (data) => {
                this.set(key, data, ttl);
                logger_1.default.debug(`Cached response for ${key}`);
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
exports.cache = new MemoryCache();
exports.default = MemoryCache;
//# sourceMappingURL=cache.js.map