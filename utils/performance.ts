import { Request, Response, NextFunction } from 'express';
import logger from './logger';

interface PerformanceMetrics {
  responseTime: number;
  memoryUsage: NodeJS.MemoryUsage;
  timestamp: number;
  endpoint: string;
  method: string;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private maxMetrics = 1000; // Keep last 1000 requests

  middleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      const startTime = process.hrtime.bigint();
      const startMemory = process.memoryUsage();

      res.on('finish', () => {
        const endTime = process.hrtime.bigint();
        const responseTime = Number(endTime - startTime) / 1000000; // Convert to milliseconds
        const endMemory = process.memoryUsage();

        const metric: PerformanceMetrics = {
          responseTime,
          memoryUsage: endMemory,
          timestamp: Date.now(),
          endpoint: req.path,
          method: req.method
        };

        this.addMetric(metric);

        // Log slow requests (>1000ms)
        if (responseTime > 1000) {
          logger.warn(`Slow request detected: ${req.method} ${req.path} took ${responseTime.toFixed(2)}ms`);
        }

        // Log high memory usage (>100MB heap used)
        if (endMemory.heapUsed > 100 * 1024 * 1024) {
          logger.warn(`High memory usage: ${(endMemory.heapUsed / 1024 / 1024).toFixed(2)}MB heap used`);
        }
      });

      next();
    };
  }

  private addMetric(metric: PerformanceMetrics) {
    this.metrics.push(metric);
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift(); // Remove oldest metric
    }
  }

  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  getAverageResponseTime(endpoint?: string): number {
    const filteredMetrics = endpoint 
      ? this.metrics.filter(m => m.endpoint === endpoint)
      : this.metrics;

    if (filteredMetrics.length === 0) return 0;

    const total = filteredMetrics.reduce((sum, m) => sum + m.responseTime, 0);
    return total / filteredMetrics.length;
  }

  getSlowestEndpoints(limit = 5): Array<{endpoint: string, avgTime: number}> {
    const endpointTimes = new Map<string, number[]>();

    this.metrics.forEach(metric => {
      if (!endpointTimes.has(metric.endpoint)) {
        endpointTimes.set(metric.endpoint, []);
      }
      endpointTimes.get(metric.endpoint)!.push(metric.responseTime);
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

export const performanceMonitor = new PerformanceMonitor();
export default PerformanceMonitor;