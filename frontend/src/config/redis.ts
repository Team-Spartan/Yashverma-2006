import Redis from 'ioredis';
import { env } from './env';
import { logger } from '../utils/logger';

let hasLoggedRedisError = false;

export const redis = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: 1,
  enableOfflineQueue: false,
  retryStrategy(times: number) {
    if (times > 3) return null; // Stop retrying if Redis server is not running
    return Math.min(times * 500, 2000);
  },
});

redis.on('connect', () => {
  logger.info('Redis connected successfully');
  hasLoggedRedisError = false;
});

redis.on('error', (err) => {
  if (!hasLoggedRedisError) {
    const errorDetails = err?.message && err.message.trim().length > 0 ? err.message : 'Connection refused / offline';
    logger.warn({ error: errorDetails }, 'Redis server unavailable - running with degraded cache state');
    hasLoggedRedisError = true;
  }
});

export default redis;
