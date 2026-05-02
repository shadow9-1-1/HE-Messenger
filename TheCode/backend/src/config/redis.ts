import Redis from 'ioredis';

let redis: Redis;

export async function connectRedis(): Promise<Redis> {
  redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    retryStrategy: (times) => Math.min(times * 50, 2000),
  });

  redis.on('connect', () => console.log('✅ Redis connected'));
  redis.on('error', (err) => console.error('❌ Redis error:', err));

  return redis;
}

export function getRedis(): Redis {
  if (!redis) throw new Error('Redis client not initialized. Call connectRedis() first.');
  return redis;
}
