import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';

let io: SocketIOServer;

export function initSocketIO(server: HttpServer): SocketIOServer {
  io = new SocketIOServer(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    socket.on('join_room', (roomId: string) => {
      socket.join(roomId);
      console.log(`  ↳ ${socket.id} joined room ${roomId}`);
    });

    socket.on('leave_room', (roomId: string) => {
      socket.leave(roomId);
    });

    socket.on('send_message', (data: { roomId: string; message: unknown }) => {
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
