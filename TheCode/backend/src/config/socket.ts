import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { verifyToken } from '../middleware/auth.middleware';
import { trackConnection, trackDisconnection } from './redis';
import { emitSystemPulse } from '../services/pulse.service';

/**
 * Socket.IO Real-Time Event Documentation
 * ---------------------------------------
 * 
 * Server-to-Client Events:
 * - `receive_message`: Emitted when a new private message is received. Payload contains the message object.
 * - `chat_wiped`: Emitted when a conversation's Redis TTL expires. Payload contains { conversationKey, counterpartUid }.
 * - `system_pulse`: Emitted for system-level diagnostic logs (e.g., successful private room join).
 * - `presence_update`: Emitted globally when a user comes online or goes offline. Payload: { uid, status: 'online' | 'offline' }.
 * 
 * Architecture:
 * - Clients automatically join a private room matching their Firebase `uid` upon connection.
 * - All message sending is handled via the REST API (`POST /api/messages`) to ensure strict validation,
 *   Redis persistence, and TTL refreshing before emitting via Socket.IO.
 */

let io: SocketIOServer;

export function initSocketIO(server: HttpServer): SocketIOServer {
  io = new SocketIOServer(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Middleware to authenticate socket connections via Firebase ID token
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }
      const decodedToken = await verifyToken(token);
      socket.data.user = decodedToken;
      next();
    } catch (err) {
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', async (socket: Socket) => {
    const user = socket.data.user;
    console.log(`🔌 Socket connected: ${socket.id} (User: ${user?.uid})`);
    
    // Automatically join a private room matching the user's UID for 1-on-1 messaging
    if (user?.uid) {
      socket.join(user.uid);
      
      // Track presence in Redis
      try {
        const isNewlyOnline = await trackConnection(user.uid);
        if (isNewlyOnline) {
          io.emit('presence_update', { uid: user.uid, status: 'online' });
        }
      } catch (err) {
        console.error('Failed to track connection presence:', err);
      }
      
      // Emit a structured system pulse
      emitSystemPulse(user.uid, 'SOCKET', `Joined private room`);
    }

    socket.on('disconnect', async (reason) => {
      console.log(`🔌 Socket disconnected: ${socket.id} - Reason: ${reason}`);
      if (user?.uid) {
        // Emit pulse before cleaning up (may reach other open tabs)
        emitSystemPulse(user.uid, 'SOCKET', `Socket disconnected (${reason})`);
        
        try {
          const isNewlyOffline = await trackDisconnection(user.uid);
          if (isNewlyOffline) {
            io.emit('presence_update', { uid: user.uid, status: 'offline' });
          }
        } catch (err) {
          console.error('Failed to track disconnection presence:', err);
        }
      }
    });
  });

  console.log('✅ Socket.IO initialized');
  return io;
}

export function getIO(): SocketIOServer {
  if (!io) throw new Error('Socket.IO not initialized. Call initSocketIO() first.');
  return io;
}
