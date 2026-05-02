import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import { connectMongoDB } from './config/mongodb';
import { connectRedis } from './config/redis';
import { initFirebaseAdmin } from './config/firebase';
import { initSocketIO } from './config/socket';

import authRoutes from './routes/auth.routes';
import messageRoutes from './routes/message.routes';
import roomRoutes from './routes/room.routes';

dotenv.config();

const app = express();
const server = http.createServer(app);

// ── Security & Middleware ──────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Rate Limiting ──────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// ── Routes ─────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/rooms', roomRoutes);

// ── Health Check ───────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Bootstrap ──────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

async function bootstrap() {
  await connectMongoDB();
  await connectRedis();
  initFirebaseAdmin();
  initSocketIO(server);

  server.listen(PORT, () => {
    console.log(`🚀 Backend running on http://localhost:${PORT}`);
  });
}

bootstrap().catch(console.error);

export { app, server };
