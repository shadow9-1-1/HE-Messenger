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

// ── Conversation Key Management ──────────────────────────────────────────────

/**
 * Generates a deterministic Redis key for a 1-on-1 private conversation.
 * 
 * Naming Convention:
 * - Prefix: `chat:`
 * - Suffix: Two user UIDs sorted alphabetically and separated by an underscore (`_`).
 * 
 * Example:
 * If user A has UID "alice123" and user B has UID "bob456", 
 * the resulting key is always "chat:alice123_bob456" regardless of who initiates.
 * 
 * @param uid1 The UID of the first user
 * @param uid2 The UID of the second user
 * @returns A deterministic conversation key like `chat:UID1_UID2`
 */
export function getConversationKey(uid1: string, uid2: string): string {
  if (!uid1 || !uid2) {
    throw new Error('Both UIDs are required to generate a conversation key');
  }
  const [sortedUid1, sortedUid2] = [uid1, uid2].sort();
  return `chat:${sortedUid1}_${sortedUid2}`;
}

// ── Read-Once Burn Messages ──────────────────────────────────────────────────

/**
 * Creates a standalone read-once burn message.
 */
export async function createBurnMessage(burnId: string, payload: string): Promise<void> {
  const ttl = getDefaultTTL();
  await redis.setex(`burn:${burnId}`, ttl, payload);
}

/**
 * Atomically consumes a burn message using MULTI/EXEC.
 * Returns the payload if it existed, otherwise null.
 */
export async function consumeBurnMessage(burnId: string): Promise<string | null> {
  const key = `burn:${burnId}`;
  const results = await redis.multi().get(key).del(key).exec();
  
  if (!results) return null;
  
  const [getRes, delRes] = results;
  if (getRes[0]) throw getRes[0]; // Error from GET
  if (delRes[0]) throw delRes[0]; // Error from DEL
  
  return getRes[1] as string | null;
}

// ── Presence Management ──────────────────────────────────────────────────────

const PRESENCE_KEY = 'online_users';

/**
 * Tracks a new socket connection for a user.
 * @returns true if the user transitioned from offline to online.
 */
export async function trackConnection(uid: string): Promise<boolean> {
  const count = await redis.hincrby(PRESENCE_KEY, uid, 1);
  return count === 1;
}

/**
 * Tracks a socket disconnection for a user.
 * Removes the user from presence state if count drops to 0.
 * @returns true if the user transitioned from online to offline.
 */
export async function trackDisconnection(uid: string): Promise<boolean> {
  const count = await redis.hincrby(PRESENCE_KEY, uid, -1);
  if (count <= 0) {
    await redis.hdel(PRESENCE_KEY, uid);
    return true;
  }
  return false;
}

/**
 * Retrieves the list of currently online UIDs.
 */
export async function getOnlineUsers(): Promise<string[]> {
  return await redis.hkeys(PRESENCE_KEY);
}
