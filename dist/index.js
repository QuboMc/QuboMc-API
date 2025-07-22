"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const compression_1 = __importDefault(require("compression"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const logger_1 = __importDefault(require("./utils/logger"));
const rateLimiter_1 = __importDefault(require("./utils/rateLimiter"));
const performance_1 = require("./utils/performance");
const cache_1 = require("./utils/cache");
const webhookService_1 = require("./services/webhookService");
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Security and compression middleware
app.use((0, helmet_1.default)());
app.use((0, compression_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: '10mb' }));
// Performance monitoring middleware
app.use(performance_1.performanceMonitor.middleware());
// Request logging middleware
app.use((req, res, next) => {
    logger_1.default.http(`${req.method} ${req.url} - ${req.ip}`);
    next();
});
// Rate limiting with optimized memory management
const rateLimiter = new rateLimiter_1.default({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60,
    keyGenerator: (req) => req.ip || 'unknown'
});
app.use(rateLimiter.middleware());
// Set global webhook trigger function
global.triggerWebhooks = webhookService_1.triggerWebhooks;
// Import routes (lazy loading for better startup performance)
const loadRoutes = async () => {
    const [{ default: minecraftRoutes }, { default: discordRoutes }, { default: modRoutes }, { default: healthRoutes }, { default: webhookRoutes }] = await Promise.all([
        Promise.resolve().then(() => __importStar(require('./routes/minecraft'))),
        Promise.resolve().then(() => __importStar(require('./routes/discord'))),
        Promise.resolve().then(() => __importStar(require('./routes/mod'))),
        Promise.resolve().then(() => __importStar(require('./routes/health'))),
        Promise.resolve().then(() => __importStar(require('./routes/webhook')))
    ]);
    app.use('/minecraft', cache_1.cache.middleware(30000), minecraftRoutes); // 30s cache for minecraft status
    app.use('/discord', cache_1.cache.middleware(15000), discordRoutes); // 15s cache for discord status
    app.use('/mod', modRoutes);
    app.use('/health', healthRoutes);
    app.use('/webhook', webhookRoutes);
};
// Root endpoint
app.get('/', (req, res) => {
    res.json({
        name: 'QuboMc-API',
        version: '1.2.0',
        status: 'running',
        timestamp: new Date().toISOString()
    });
});
// Health check endpoint
app.get('/ping', (req, res) => {
    res.json({ status: 'ok', timestamp: Date.now() });
});
// Performance metrics endpoint
app.get('/metrics', (req, res) => {
    const metrics = performance_1.performanceMonitor.getMetrics();
    const slowestEndpoints = performance_1.performanceMonitor.getSlowestEndpoints();
    const averageResponseTime = performance_1.performanceMonitor.getAverageResponseTime();
    const cacheStats = cache_1.cache.getStats();
    res.json({
        totalRequests: metrics.length,
        averageResponseTime: Math.round(averageResponseTime * 100) / 100,
        slowestEndpoints,
        cache: cacheStats,
        memoryUsage: process.memoryUsage(),
        uptime: process.uptime()
    });
});
// Centralized error handler
app.use((err, req, res, next) => {
    logger_1.default.error(`Error: ${err.message}`, { stack: err.stack, url: req.url, method: req.method });
    res.status(err.status || 500).json({
        error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message
    });
});
// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});
// Graceful shutdown
process.on('SIGTERM', () => {
    logger_1.default.info('SIGTERM received, shutting down gracefully');
    rateLimiter.destroy();
    cache_1.cache.destroy();
    process.exit(0);
});
process.on('SIGINT', () => {
    logger_1.default.info('SIGINT received, shutting down gracefully');
    rateLimiter.destroy();
    cache_1.cache.destroy();
    process.exit(0);
});
// Start server
const startServer = async () => {
    try {
        await loadRoutes();
        app.listen(PORT, () => {
            logger_1.default.info(`QuboMc-API server running on port ${PORT}`);
            logger_1.default.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
        });
    }
    catch (error) {
        logger_1.default.error('Failed to start server:', error);
        process.exit(1);
    }
};
startServer();
//# sourceMappingURL=index.js.map