# Multi-stage build for optimal production image
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig*.json ./

# Install all dependencies (including dev)
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build:prod

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S qubomc -u 1001

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/logs ./logs

# Create logs directory and set permissions
RUN mkdir -p logs && chown -R qubomc:nodejs /app

USER qubomc

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "const http = require('http'); \
  const options = {hostname: 'localhost', port: 3000, path: '/ping', timeout: 2000}; \
  const req = http.request(options, (res) => {res.statusCode === 200 ? process.exit(0) : process.exit(1)}); \
  req.on('error', () => process.exit(1)); \
  req.end();"

CMD ["node", "dist/index.js"]