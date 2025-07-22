import express from 'express';
import compression from 'compression';
import helmet from 'helmet';
import cors from 'cors';
import dotenv from 'dotenv';
import logger from './utils/logger';
import MemoryRateLimiter from './utils/rateLimiter';
import { triggerWebhooks } from './services/webhookService';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security and compression middleware
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  logger.http(`${req.method} ${req.url} - ${req.ip}`);
  next();
});

// Rate limiting with optimized memory management
const rateLimiter = new MemoryRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 60,
  keyGenerator: (req) => req.ip
});
app.use(rateLimiter.middleware());

// Set global webhook trigger function
global.triggerWebhooks = triggerWebhooks;

// Import routes (lazy loading for better startup performance)
const loadRoutes = async () => {
  const [
    { default: minecraftRoutes },
    { default: discordRoutes },
    { default: modRoutes },
    { default: healthRoutes },
    { default: webhookRoutes }
  ] = await Promise.all([
    import('./routes/minecraft'),
    import('./routes/discord'),
    import('./routes/mod'),
    import('./routes/health'),
    import('./routes/webhook')
  ]);

  app.use('/minecraft', minecraftRoutes);
  app.use('/discord', discordRoutes);
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

// Centralized error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error(`Error: ${err.message}`, { stack: err.stack, url: req.url, method: req.method });
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
  logger.info('SIGTERM received, shutting down gracefully');
  rateLimiter.destroy();
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  rateLimiter.destroy();
  process.exit(0);
});

// Start server
const startServer = async () => {
  try {
    await loadRoutes();
    app.listen(PORT, () => {
      logger.info(`QuboMc-API server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();