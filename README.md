# 🔐 HE-Messenger

**Hybrid Ephemeral Messenger** — A high-security, real-time terminal-styled chat application where messages self-destruct by design.

![License](https://img.shields.io/badge/license-ISC-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-%3E%3D%2018-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue)

---

## 🎯 Overview

HE-Messenger is a **privacy-first, ephemeral messaging platform** built for users who demand:

- ✅ **Zero Persistence**: Messages exist **only in memory** (Redis). No data written to disk.
- ✅ **Strict TTL Expiration**: Each message has a Time-to-Live. When it expires, it vanishes instantly across the entire network.
- ✅ **Real-Time Sync**: Socket.IO keeps all clients in perfect sync with live presence, typing indicators, and instant message wipes.
- ✅ **Enterprise Security**: Firebase ID Tokens, cryptographic verification, zero anonymous connections.
- ✅ **Terminal Aesthetic**: Minimal, high-contrast command-line UI designed for distraction-free communication.

---

## 🏗️ Architecture at a Glance

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Frontend** | Next.js 16 + React 19 | Lightweight terminal-styled UI |
| **Backend** | Express.js + Socket.IO | Real-time API gateway & message broker |
| **Auth** | Firebase Admin SDK | Secure identity verification |
| **Memory Storage** | Redis (ioredis) | Ephemeral message cache + TTL enforcement |
| **User DB** | MongoDB + Mongoose | Persistent user profiles (non-messages) |

### Data Flow

```
┌──────────────────────────────────────────────────────────────┐
│                   🖥️  Next.js Frontend                        │
│                 (Terminal-Styled React UI)                   │
└────────────┬──────────────────────────────────┬──────────────┘
             │ REST Calls                       │ WebSocket
             │ Authorization: Firebase ID Token │ Real-time events
             ▼                                  ▼
┌──────────────────────────────────────────────────────────────┐
│              🔧 Express.js Backend (Orchestrator)            │
│  ├─ Token Verification  ├─ Message Routing  ├─ TTL Manager  │
└────────┬────────────────────────────────────┬────────────────┘
         │ Read/Write                         │ Read/Write
         ▼                                    ▼
    ┌─────────────┐                    ┌────────────────┐
    │  MongoDB    │                    │     Redis      │
    │  (Durable)  │◄──────────────────►│   (Volatile)   │
    │  • Users    │                    │  • Messages    │
    │  • Rooms    │                    │  • Presence    │
    │  • Profiles │                    │  • Sessions    │
    └─────────────┘                    └────────────────┘
```

**Key Innovation**: Firebase handles *identity*, MongoDB stores *user data*, and Redis manages *ephemeral messages*. This "hybrid" approach gives you the security of persistent auth with the privacy of disappearing data.

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ & **npm** 9+
- **MongoDB** 6+ (local or [Atlas](https://www.mongodb.com/cloud/atlas))
- **Redis** 7+ (local or [Redis Cloud](https://redis.com/try-free/))
- **Firebase Project** (free tier works)

### 1️⃣ Clone & Install

```bash
git clone https://github.com/shadow9-1-1/HE-Messenger.git
cd HE-Messenger

# Backend
cd backend
npm install

# Frontend (in a new terminal)
cd ../frontend
npm install
```

### 2️⃣ Configure Environment Variables

**Backend** (`backend/.env`)
```env
PORT=5000
FRONTEND_URL=http://localhost:3000

# Firebase (download from Firebase Console > Project Settings > Service Account)
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxx@your-project.iam.gserviceaccount.com

# MongoDB
MONGODB_URI=mongodb://localhost:27017/he-messenger
# OR for Atlas: mongodb+srv://user:password@cluster.mongodb.net/he-messenger

# Redis
REDIS_URL=redis://localhost:6379
# OR for Redis Cloud: redis://:password@host:port

# SMS Notifications (optional)
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
```

**Frontend** (`frontend/.env.local`)
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-firebase-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-bucket.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

See [SETUP.md](./docs/SETUP.md) for detailed configuration steps.

### 3️⃣ Start Services

**Terminal 1 — Backend**
```bash
cd backend
npm run dev
# Output: 🚀 Backend running on http://localhost:5000
```

**Terminal 2 — Frontend**
```bash
cd frontend
npm run dev
# Output: ▲ Next.js running on http://localhost:3000
```

**Terminal 3 — Services (if running locally)**
```bash
# MongoDB
mongod

# Redis (in another window)
redis-server
```

### 4️⃣ Verify

| Service | URL | Expected |
|---------|-----|----------|
| Frontend | http://localhost:3000 | Chat UI loads |
| Backend Health | http://localhost:5000/health | `{ "status": "ok" }` |
| Backend Logs | Terminal 1 | "MongoDB connected", "Redis connected" |

---

## 📚 Documentation

- **[SETUP.md](./docs/SETUP.md)** — Detailed setup, Docker, environment configuration
- **[ARCHITECTURE.md](./docs/ARCHITECTURE.md)** — System design, data flow, ephemeral message lifecycle
- **[API.md](./docs/API.md)** — REST endpoints, Socket.IO events, request/response formats

---

## 🎮 Features

### 💬 Ephemeral Messaging
- Messages live only in Redis (memory)
- Configurable TTL per room (e.g., 1 hour, 24 hours)
- Instant wipe signal sent to all clients when TTL expires
- No message history to download or archive

### 👥 Real-Time Presence
- See who's online/offline without refresh
- Live typing indicators
- Join/leave notifications within rooms

### 🔐 Security First
- Every HTTP request & WebSocket connection verified with Firebase ID Tokens
- No anonymous sessions allowed
- CORS locked to frontend origin
- Rate limiting on auth routes

### 🎨 Terminal Aesthetic
- Vintage command-line inspired UI
- High contrast for readability
- Minimal bloat—pure CSS, no frameworks
- Responsive design for mobile & desktop

### 📊 System Pulse Monitor
- Live backend telemetry dashboard
- Real-time event stream: Auth verifications, Socket handshakes, Redis TTL wipes, user presence
- Debug-friendly console for development

---

## 🏃 Development Workflow

### Scripts

**Backend**
```bash
npm run dev          # Nodemon + ts-node (auto-reload)
npm run build        # TypeScript → JavaScript
npm start            # Run compiled backend
npm run lint         # ESLint TypeScript
npm run type-check   # TypeScript without emit
```

**Frontend**
```bash
npm run dev          # Next.js dev server with hot reload
npm run build        # Next.js production build
npm start            # Next.js production server
npm run lint         # ESLint + Next.js rules
```

### Folder Structure

```
HE-Messenger/
├── README.md                    # This file
├── docs/
│   ├── SETUP.md                 # Installation & configuration guide
│   ├── ARCHITECTURE.md          # System design & data flow
│   └── API.md                   # REST & Socket.IO API reference
├── backend/
│   ├── src/
│   │   ├── app.ts               # Express app setup
│   │   ├── config/              # Firebase, MongoDB, Redis, Socket.IO
│   │   ├── middleware/          # Auth, error handling
│   │   ├── models/              # Mongoose schemas
│   │   ├── routes/              # API endpoints
│   │   └── services/            # Pulse monitor, expiration jobs
│   ├── package.json
│   ├── tsconfig.json
│   ├── nodemon.json
│   ├── .env.example
│   └── dist/                    # Compiled JavaScript (after build)
└── frontend/
    ├── src/
    │   ├── app/                 # Next.js 16 App Router pages
    │   ├── context/             # React context (Auth, global state)
    │   ├── lib/                 # Utilities (Firebase, API, Socket)
    │   └── components/          # Reusable React components
    ├── public/                  # Static assets
    ├── package.json
    ├── tsconfig.json
    ├── next.config.ts
    ├── eslint.config.mjs
    ├── .env.local.example
    └── .next/                   # Next.js build output (after build)
```

---

## 🔄 API Overview

All endpoints require `Authorization: Bearer <Firebase ID Token>` except `/health`.

### Core Routes

**Auth**
- `POST /api/auth/sync` — Register/update user after Firebase login
- `GET /api/auth/me` — Get current user profile

**Rooms**
- `GET /api/rooms` — List all rooms user is in
- `POST /api/rooms` — Create new ephemeral room
- `POST /api/rooms/:roomId/join` — Join a room
- `DELETE /api/rooms/:roomId` — Delete room

**Messages** (via Socket.IO)
- `send_message` — Broadcast new message to room
- `message_wipe` — Signal that message TTL expired
- `typing` — Broadcast typing indicator

See [API.md](./docs/API.md) for full reference.

---

## 🐳 Docker Deployment (Optional)

```bash
# Build backend image
docker build -t he-messenger-backend ./backend

# Build frontend image
docker build -t he-messenger-frontend ./frontend

# Run with docker-compose
docker-compose up
```

See [SETUP.md](./docs/SETUP.md) for Docker Compose example.

---

## 🧪 Testing & Quality

```bash
# Backend linting
cd backend && npm run lint

# Frontend linting
cd frontend && npm run lint

# Type checking
cd backend && npm run type-check
cd frontend && npm run type-check
```

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit: `git commit -am 'Add my feature'`
4. Push: `git push origin feature/my-feature`
5. Open a Pull Request

Please follow the existing code style (TypeScript, ESLint) and add tests for new features.

---

## 📋 Roadmap

- [ ] Message search (Ctrl+F within room history)
- [ ] Multi-room notifications
- [ ] Custom TTL per message (not just per room)
- [ ] End-to-end encryption (client-side crypto)
- [ ] Mobile app (React Native)
- [ ] Dark/light theme toggle
- [ ] Audit logs for compliance

---

## ⚠️ Important Notes

### Data Privacy
- **Messages are NEVER stored on disk**. They live only in Redis memory.
- When Redis restarts, all messages are lost (by design).
- User profiles and room metadata are persisted in MongoDB.
- If privacy is critical, run Redis with persistence **disabled**.

### Production Considerations
- Use environment variables (never hardcode secrets)
- Set `NODE_ENV=production` in backend
- Enable HTTPS in frontend (redirect HTTP → HTTPS)
- Lock CORS to specific frontend domain
- Use Firebase reCAPTCHA on login
- Monitor Redis memory usage (messages + sessions)
- Set up automated backups for MongoDB (user data only)

---

## 📄 License

This project is licensed under the **ISC License**. See [LICENSE](./LICENSE) for details.

---

## 🙋 Support & Issues

- **Bug Report**: Open an issue on [GitHub Issues](https://github.com/shadow9-1-1/HE-Messenger/issues)
- **Feature Request**: Start a discussion in [GitHub Discussions](https://github.com/shadow9-1-1/HE-Messenger/discussions)
- **Security Issue**: Email [security@helink.local](mailto:security@example.com) (do not open public issue)


---

## 🔗 Links

- GitHub: https://github.com/shadow9-1-1/HE-Messenger
- Firebase Docs: https://firebase.google.com/docs
- Socket.IO Docs: https://socket.io/docs/v4/
- Redis Docs: https://redis.io/docs/
- Next.js Docs: https://nextjs.org/docs

---
