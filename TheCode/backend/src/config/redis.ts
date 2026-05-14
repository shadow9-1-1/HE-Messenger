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

// ── Reusable Redis Helper Utilities ──────────────────────────────────────────

/**
 * Gets the default TTL in seconds from the environment.
 */
function getDefaultTTL(): number {
  return parseInt(process.env.CONVERSATION_TTL_SECONDS || '3600', 10);
}

/**
 * Pushes an item to the end of a Redis list and sets/refreshes its TTL.
 */
export async function listPush(key: string, value: string, ttlSeconds?: number): Promise<number> {
  const ttl = ttlSeconds ?? getDefaultTTL();
  const length = await redis.rpush(key, value);
  await redis.expire(key, ttl);
  return length;
}

/**
 * Reads all items from a Redis list.
 */
export async function listRead(key: string): Promise<string[]> {
  return await redis.lrange(key, 0, -1);
}

/**
 * Sets or updates the TTL for a specific key.
 */
export async function setTTL(key: string, ttlSeconds?: number): Promise<number> {
  const ttl = ttlSeconds ?? getDefaultTTL();
  return await redis.expire(key, ttl);
}

/**
 * Checks if a key exists in Redis.
 */
export async function keyExists(key: string): Promise<boolean> {
  const result = await redis.exists(key);
  return result > 0;
}

/**
 * Gets the remaining TTL for a key in seconds.
 */
export async function getExpiration(key: string): Promise<number> {
  return await redis.ttl(key);
}
