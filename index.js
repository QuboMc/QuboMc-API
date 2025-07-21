const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

import logger from './utils/logger';

app.use(express.json());

// --- Request Logger Middleware ---
app.use((req, res, next) => {
  logger.http(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// --- Simple In-Memory Rate Limiter Middleware ---
const rateLimitWindowMs = 60 * 1000; // 1 minute
const rateLimitMax = 60; // 60 requests per window per IP
const ipHits = {};
app.use((req, res, next) => {
  const ip = req.ip;
  const now = Date.now();
  if (!ipHits[ip]) ipHits[ip] = [];
  ipHits[ip] = ipHits[ip].filter(ts => now - ts < rateLimitWindowMs);
  if (ipHits[ip].length >= rateLimitMax) {
    return res.status(429).json({ error: 'Too many requests, slow down!' });
  }
  ipHits[ip].push(now);
  next();
});

// --- In-Memory Webhook Store ---
const webhooks = [];

// Register a webhook
app.post('/webhook/register', (req, res) => {
  const { url, event } = req.body;
  if (!url || !event) return res.status(400).json({ error: 'Missing url or event' });
  webhooks.push({ url, event });
  res.json({ success: true, registered: { url, event } });
});

// Receive a webhook (for testing)
app.post('/webhook/receive', (req, res) => {
  console.log('Received webhook:', req.body);
  res.json({ received: true });
});

// Helper to trigger webhooks for an event
// This should be moved to the webhookService
// global.triggerWebhooks = async function(event, data) { ... }

// Import routes
const minecraftRoutes = require('./routes/minecraft');
const discordRoutes = require('./routes/discord');
const modRoutes = require('./routes/mod');
const healthRoutes = require('./routes/health'); // Assuming TS is compiled
const webhookRoutes = require('./routes/webhook');

app.use('/minecraft', minecraftRoutes);
app.use('/discord', discordRoutes);
app.use('/mod', modRoutes);
app.use('/health', healthRoutes.default); // Use .default for ES module exports from TS
app.use('/webhook', webhookRoutes.default);

// Root endpoint
app.get('/', (req, res) => {
  res.send('Welcome to QuboMc-API!');
});

// --- Centralized Error Handler ---
app.use((err, req, res, next) => {
  logger.error(err.stack); // Log the full stack trace
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => {
  logger.info(`QuboMc-API server running on port ${PORT}`);
}); 