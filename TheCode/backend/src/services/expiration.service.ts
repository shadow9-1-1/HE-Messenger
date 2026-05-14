import Redis from 'ioredis';
import { getRedis } from '../config/redis';
import { getIO } from '../config/socket';

let subscriber: Redis;

export async function initExpirationService(): Promise<void> {
  // 1. Attempt to enable Keyspace Events on the main Redis connection.
  //    'Ex' enables Expired events.
  try {
    const redis = getRedis();
    await redis.config('SET', 'notify-keyspace-events', 'Ex');
    console.log('✅ Redis Keyspace events enabled (notify-keyspace-events: Ex)');
  } catch (error: any) {
    console.warn(
      '⚠️ Could not run CONFIG SET to enable Keyspace events. ' +
      'If using a managed Redis provider (like ElastiCache), ensure "notify-keyspace-events" is set to "Ex" in your parameter group.',
    );
    console.warn(`Reason: ${error.message}`);
  }

  // 2. Create a dedicated Redis subscriber connection
  subscriber = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
  });

  // 3. Subscribe to expired events on database 0
  const EVENT_CHANNEL = '__keyevent@0__:expired';
  await subscriber.subscribe(EVENT_CHANNEL);

  // 4. Listen for expiration events
  subscriber.on('message', (channel, key) => {
    if (channel === EVENT_CHANNEL && key.startsWith('chat:')) {
      const parts = key.split(':');
      if (parts.length === 2) {
        const uids = parts[1].split('_');
        
        if (uids.length === 2) {
          const [uid1, uid2] = uids;
          
          // Emit 'chat_wiped' system event to both connected users
          const io = getIO();
          io.to(uid1).emit('chat_wiped', { conversationKey: key, counterpartUid: uid2 });
          io.to(uid2).emit('chat_wiped', { conversationKey: key, counterpartUid: uid1 });
          
          console.log(`🧹 Ghost Wipe Triggered: Conversation ${key} expired. Notified connected users.`);
        }
      }
    }
  });

  console.log('✅ Redis Expiration Service listening for ghost wipes');
}
