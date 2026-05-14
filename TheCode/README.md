# HE-Messenger — Hybrid Ephemeral Messenger

> Real-time, auto-expiring conversations powered by Next.js, Express, Socket.IO, MongoDB, Redis, and Firebase Authentication.

---

## Project Structure

```
TheCode/
├── frontend/               # Next.js 15 App (TypeScript)
│   ├── src/
│   │   ├── app/            # App Router pages & layouts
│   │   ├── context/        # React context providers (Auth)
│   │   ├── components/     # Reusable UI components
│   │   └── lib/            # firebase.ts · api.ts · socket.ts
│   └── .env.local.example  # Frontend environment template
│
├── backend/                # Express + Socket.IO API (TypeScript)
│   ├── src/
│   │   ├── config/         # mongodb · redis · firebase · socket
│   │   ├── middleware/     # auth.middleware.ts (Firebase verify)
│   │   ├── models/         # user · message · room (Mongoose)
│   │   └── routes/         # auth · message · room routes
│   └── .env.example        # Backend environment template
│
└── docs/                   # Architecture · API · Setup guides
    ├── architecture.md
    ├── api.md
    └── setup.md
```

---

## Quick Start

### Prerequisites
- Node.js ≥ 18 · MongoDB ≥ 6 · Redis ≥ 7 · Firebase project

### 1 — Backend
```bash
cd backend
cp .env.example .env        # Fill in your credentials
npm install
npm run dev                 # → http://localhost:5000
```

### 2 — Frontend
```bash
cd frontend
cp .env.local.example .env.local   # Fill in Firebase + API URLs
npm install
npm run dev                        # → http://localhost:3000
```

### Verify
```bash
curl http://localhost:5000/health
# → { "status": "ok", "timestamp": "..." }
```

---

## Environment Variables

Secure configuration is required for both the frontend and backend. **Sensitive credentials must never be hardcoded into the source files.**

You must create local `.env` files using the provided templates:

### Backend Configuration (`backend/.env`)
Copy the template: `cp .env.example .env`

| Variable | Description |
|----------|-------------|
| `PORT` & `FRONTEND_URL` | Express server port and CORS origin |
| `MONGODB_URI` | MongoDB connection string |
| `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD` | Redis connection details |
| `CONVERSATION_TTL_SECONDS` | Time-to-live for ephemeral Ghost Chats (e.g., `3600`) |
| `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` | Firebase Admin Service Account credentials for auth verification |
| `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_VERIFY_SERVICE_SID` | *(Optional)* Credentials for SMS/MFA if enabled |

### Frontend Configuration (`frontend/.env.local`)
Copy the template: `cp .env.example .env.local`

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | The HTTP endpoint of the backend (e.g., `http://localhost:5000/api`) |
| `NEXT_PUBLIC_SOCKET_URL` | The Websocket endpoint of the backend (e.g., `http://localhost:5000`) |
| `NEXT_PUBLIC_FIREBASE_*` | Your Firebase Client SDK web configuration keys |

> **IMPORTANT**: Never commit `.env` or `.env.local` files to version control. They are securely git-ignored to prevent credential leaks.

---

## Available Scripts

### Backend (`cd backend`)

| Script | Description |
|--------|-------------|
| `npm run dev` | Start with `nodemon` + `ts-node` (hot reload) |
| `npm run build` | Compile TypeScript → `dist/` |
| `npm start` | Run compiled production build |
| `npm run type-check` | Type-check without emitting |

### Frontend (`cd frontend`)

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Next.js dev server with Turbopack |
| `npm run build` | Production bundle |
| `npm start` | Serve production build |
| `npm run lint` | ESLint check |

---

## Tech Stack

| Concern | Technology |
|---------|-----------|
| Frontend | Next.js 15, React 19, TypeScript |
| Backend | Express 5, TypeScript, ts-node |
| Realtime | Socket.IO 4 |
| Database | MongoDB 7 + Mongoose 8 |
| Cache / Presence | Redis 7 + ioredis |
| Authentication | Firebase Auth (client) + Firebase Admin (server) |
| HTTP Client | Axios |
| State (client) | Zustand |
| Security | Helmet, CORS, express-rate-limit |

---

## Documentation

- [Architecture & Data Flow](./docs/architecture.md)
- [API Reference](./docs/api.md)
- [Full Setup Guide](./docs/setup.md)

---

## Team Collaboration Notes

- All feature branches should be named `feature/<short-description>`
- Never push secrets — use `.env.example` templates only
- Backend and frontend are fully independent — each has its own `package.json`
- Run `npm run type-check` before every PR to catch TypeScript errors early
