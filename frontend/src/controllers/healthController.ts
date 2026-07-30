import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { redis } from '../config/redis';
import os from 'os';

export class HealthController {
  async check(_req: Request, res: Response) {
    const checks: Record<string, string> = {};

    try {
      await prisma.$queryRaw`SELECT 1`;
      checks.database = 'healthy';
    } catch {
      checks.database = 'unhealthy';
    }

    try {
      await redis.ping();
      checks.redis = 'healthy';
    } catch {
      checks.redis = 'unhealthy';
    }

    const allHealthy = Object.values(checks).every((v) => v === 'healthy');

    return res.status(allHealthy ? 200 : 503).json({
      success: allHealthy,
      message: allHealthy ? 'All systems operational' : 'Some systems degraded',
      data: {
        status: allHealthy ? 'healthy' : 'degraded',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        checks,
        environment: process.env.NODE_ENV,
        memory: {
          free: os.freemem(),
          total: os.totalmem(),
          usage: (((os.totalmem() - os.freemem()) / os.totalmem()) * 100).toFixed(2) + '%',
        },
        cpu: {
          cores: os.cpus().length,
          model: os.cpus()[0]?.model || 'unknown',
        },
      },
    });
  }
}

export const healthController = new HealthController();
