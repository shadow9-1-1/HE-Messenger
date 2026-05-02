# Hybrid Ephemeral Messenger

Monorepo for the Hybrid Ephemeral Messenger assignment with a Next.js frontend and Express backend.

## Structure
- client/ - Next.js app
- server/ - Express API + Socket.io
- docs/ - Project documentation

## Quick start
### Frontend (Next.js)
1) cd client
2) npm install
3) copy .env.example to .env.local
4) npm run dev

### Backend (Express)
1) cd server
2) npm install
3) copy .env.example to .env
4) npm run dev

## Production
### Frontend
1) cd client
2) npm run build
3) npm run start

### Backend
1) cd server
2) npm run start

## Services
- MongoDB: set MONGODB_URI in server/.env
- Redis: set REDIS_URL in server/.env
- Firebase Auth: set FIREBASE_* values in server/.env and NEXT_PUBLIC_FIREBASE_* in client/.env.local
- Socket.io: server exposes WebSocket on the same host/port as the API

## Notes
- Update CLIENT_ORIGIN in server/.env for CORS.
- The server uses placeholders for external services; add credentials before deploying.
