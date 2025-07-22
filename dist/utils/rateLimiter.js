"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = __importDefault(require("./logger"));
class MemoryRateLimiter {
    constructor(config) {
        this.config = config;
        this.hits = new Map();
        // Cleanup expired entries every minute to prevent memory leaks
        this.cleanup = setInterval(() => {
            this.cleanupExpiredEntries();
        }, 60000);
    }
    cleanupExpiredEntries() {
        const now = Date.now();
        for (const [key, timestamps] of this.hits.entries()) {
            const validTimestamps = timestamps.filter(ts => now - ts < this.config.windowMs);
            if (validTimestamps.length === 0) {
                this.hits.delete(key);
            }
            else {
                this.hits.set(key, validTimestamps);
            }
        }
    }
    middleware() {
        return (req, res, next) => {
            const key = this.config.keyGenerator ? this.config.keyGenerator(req) : (req.ip || 'unknown');
            const now = Date.now();
            if (!this.hits.has(key)) {
                this.hits.set(key, []);
            }
            const userHits = this.hits.get(key);
            const validHits = userHits.filter(ts => now - ts < this.config.windowMs);
            if (validHits.length >= this.config.maxRequests) {
                logger_1.default.warn(`Rate limit exceeded for ${key}`);
                res.status(429).json({
                    error: 'Too many requests, slow down!',
                    retryAfter: Math.ceil(this.config.windowMs / 1000)
                });
                return;
            }
            validHits.push(now);
            this.hits.set(key, validHits);
            next();
        };
    }
    destroy() {
        clearInterval(this.cleanup);
        this.hits.clear();
    }
}
exports.default = MemoryRateLimiter;
//# sourceMappingURL=rateLimiter.js.map