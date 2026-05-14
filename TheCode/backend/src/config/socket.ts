import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { admin } from './firebase';

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
      const decodedToken = await admin.auth().verifyIdToken(token);
      socket.data.user = decodedToken;
      next();
    } catch (err) {
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const user = socket.data.user;
    console.log(`🔌 Socket connected: ${socket.id} (User: ${user?.uid})`);

    socket.on('join_room', (roomId: string) => {
      socket.join(roomId);
      console.log(`  ↳ ${socket.id} joined room ${roomId}`);
    });

    socket.on('leave_room', (roomId: string) => {
      socket.leave(roomId);
    });

    socket.on('send_message', (data: { roomId: string; message: unknown }) => {
      // In a real app, you might want to verify if the user is in the room
      socket.to(data.roomId).emit('receive_message', data.message);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });

  console.log('✅ Socket.IO initialized');
  return io;
}

export function getIO(): SocketIOServer {
  if (!io) throw new Error('Socket.IO not initialized. Call initSocketIO() first.');
  return io;
}
