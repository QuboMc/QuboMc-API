"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.performanceMonitor = void 0;
const logger_1 = __importDefault(require("./logger"));
class PerformanceMonitor {
    constructor() {
        this.metrics = [];
        this.maxMetrics = 1000; // Keep last 1000 requests
    }
    middleware() {
        return (req, res, next) => {
            const startTime = process.hrtime.bigint();
            const startMemory = process.memoryUsage();
            res.on('finish', () => {
                const endTime = process.hrtime.bigint();
                const responseTime = Number(endTime - startTime) / 1000000; // Convert to milliseconds
                const endMemory = process.memoryUsage();
                const metric = {
                    responseTime,
                    memoryUsage: endMemory,
                    timestamp: Date.now(),
                    endpoint: req.path,
                    method: req.method
                };
                this.addMetric(metric);
                // Log slow requests (>1000ms)
                if (responseTime > 1000) {
                    logger_1.default.warn(`Slow request detected: ${req.method} ${req.path} took ${responseTime.toFixed(2)}ms`);
                }
                // Log high memory usage (>100MB heap used)
                if (endMemory.heapUsed > 100 * 1024 * 1024) {
                    logger_1.default.warn(`High memory usage: ${(endMemory.heapUsed / 1024 / 1024).toFixed(2)}MB heap used`);
                }
            });
            next();
        };
    }
    addMetric(metric) {
        this.metrics.push(metric);
        if (this.metrics.length > this.maxMetrics) {
            this.metrics.shift(); // Remove oldest metric
        }
    }
    getMetrics() {
        return [...this.metrics];
    }
    getAverageResponseTime(endpoint) {
        const filteredMetrics = endpoint
            ? this.metrics.filter(m => m.endpoint === endpoint)
            : this.metrics;
        if (filteredMetrics.length === 0)
            return 0;
        const total = filteredMetrics.reduce((sum, m) => sum + m.responseTime, 0);
        return total / filteredMetrics.length;
    }
    getSlowestEndpoints(limit = 5) {
        const endpointTimes = new Map();
        this.metrics.forEach(metric => {
            if (!endpointTimes.has(metric.endpoint)) {
                endpointTimes.set(metric.endpoint, []);
            }
            endpointTimes.get(metric.endpoint).push(metric.responseTime);
        });
        const averages = Array.from(endpointTimes.entries()).map(([endpoint, times]) => ({
            endpoint,
            avgTime: times.reduce((a, b) => a + b, 0) / times.length
        }));
        return averages.sort((a, b) => b.avgTime - a.avgTime).slice(0, limit);
    }
    clearMetrics() {
        this.metrics = [];
    }
}
exports.performanceMonitor = new PerformanceMonitor();
exports.default = PerformanceMonitor;
//# sourceMappingURL=performance.js.map