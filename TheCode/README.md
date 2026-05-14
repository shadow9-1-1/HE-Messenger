# HE-Messenger — High-Security Hybrid Ephemeral Messenger

> A real-time, terminal-themed secure chat application designed for pure ephemerality. 
> Messages exist only in memory, have a strict Time-to-Live (TTL), and self-destruct across the entire network instantly upon expiration.

---

## 🌟 Feature Summary

- **Ghost Chat Terminal UI**: A high-contrast, command-line styled messaging dashboard designed for zero-clutter communication.
- **Strict Ephemerality**: Conversations live entirely in RAM (Redis). When the TTL expires, the memory block self-destructs, instantly clearing the UI for both users.
- **System Pulse Monitor**: A live telemetry dashboard that visually streams real-time backend events (Socket Handshakes, Auth Verifications, Redis TTL Wipes, User Presence) directly into the frontend.
- **Live Presence Detection**: See exactly who is online or offline in real-time without refreshing.
- **Robust Security**: Fully authenticated Socket connections utilizing Firebase ID Tokens. No anonymous websocket handshakes allowed.

---

## 🏛 Hybrid Architecture Explained

HE-Messenger utilizes a "Hybrid" approach, decoupling durable identity storage from volatile, ephemeral message storage.

| Technology | Role in Architecture |
|------------|----------------------|
| **Firebase** | **Identity & Auth Handshake**. Manages Google OAuth logins and issues secure JWTs to the client. The Express backend uses the Firebase Admin SDK to cryptographically verify every HTTP request and Websocket connection. |
| **MongoDB** | **Durable Persistence**. Stores non-sensitive, permanent data such as User Profiles (`uid`, `displayName`, `photoURL`) and long-lived configurations. No message data is ever written to disk. |
| **Redis** | **Volatile Memory & Pub/Sub**. The absolute core of the ephemeral engine. Redis stores the actual chat messages using `LPUSH` into RAM-only lists. It enforces the TTL expirations via keyspace notifications (`notify-keyspace-events "Ex"`), ensuring that when the clock runs out, the data vanishes permanently. |
| **Socket.IO** | **Real-Time Telemetry & Transport**. Maintains a duplex connection between the client and server. It broadcasts incoming messages, presence updates, and the `GHOST` wipe signals directly to the exact clients that need them via private UUID-scoped rooms. |
| **Express.js** | **The Orchestrator**. Serves as the secured API Gateway. It intercepts Firebase tokens, validates payloads, interfaces with MongoDB/Redis, and manages the Socket.io lifecycle. |
| **Next.js** | **The Presentation Layer**. React 19 frontend utilizing the App Router and a pure, un-styled CSS framework to achieve a minimal vintage terminal aesthetic. |

---

## 📁 Team-Friendly Folder Overview

```
TheCode/
├── frontend/               # Next.js 15 Client-Side Terminal
│   ├── src/
│   │   ├── app/            # App Router pages (chat, login, layout)
│   │   ├── context/        # React context providers (AuthContext)
│   │   ├── components/     # Reusable UI components
│   │   └── lib/            # Utilities (firebase.ts, api.ts, socket.ts)
│   ├── .env.local.example  # Frontend environment template
│   └── package.json        # Frontend dependencies
│
├── backend/                # Express + Socket.IO API Engine
│   ├── src/
│   │   ├── config/         # Connections (mongodb, redis, firebase, socket)
│   │   ├── middleware/     # Security (error.middleware, auth.middleware)
│   │   ├── models/         # Mongoose schemas (user.model)
│   │   ├── routes/         # API Endpoints (auth, message, presence, users)
│   │   └── services/       # Background tasks (expiration, pulse)
│   ├── .env.example        # Backend environment template
│   └── package.json        # Backend dependencies
```

> **Note for Contributors**: The frontend and backend are completely decoupled. They maintain their own `package.json` files and run on separate ports during development.

---

## 🔐 Environment Variables & Setup

Secure configuration is required. **Sensitive credentials must never be hardcoded into the source files.**

You must create local `.env` files using the provided templates:

### Backend Configuration (`backend/.env`)
Copy the template: `cd backend && cp .env.example .env`

| Variable | Description |
|----------|-------------|
| `PORT` & `FRONTEND_URL` | Express server port (5000) and CORS origin (3000) |
| `MONGODB_URI` | MongoDB connection string (e.g., `mongodb://localhost:27017/he-messenger`) |
| `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD` | Redis connection details |
| `CONVERSATION_TTL_SECONDS` | Time-to-live for ephemeral Ghost Chats (e.g., `30` for rapid testing) |
| `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` | Firebase Admin Service Account credentials for auth verification |
| `TWILIO_*` | *(Optional)* Credentials for SMS/MFA if enabled |

### Frontend Configuration (`frontend/.env.local`)
Copy the template: `cd frontend && cp .env.example .env.local`

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | The HTTP endpoint of the backend (`http://localhost:5000/api`) |
| `NEXT_PUBLIC_SOCKET_URL` | The Websocket endpoint of the backend (`http://localhost:5000`) |
| `NEXT_PUBLIC_FIREBASE_*` | Your Firebase Client SDK web configuration keys |

> **IMPORTANT**: Never commit `.env` or `.env.local` files to version control. They are securely git-ignored to prevent credential leaks.

---

## 🧪 Evaluator QA: Ghost Wipe Test Flow

The core requirement of this assignment is to verify that conversations permanently vanish across the network when the Redis TTL expires. 

We have set the default `CONVERSATION_TTL_SECONDS=15` in the `.env.example` specifically to make this fast and easy to evaluate.

### Test Steps
1. **Ensure Keyspace Notifications are active**: Your Redis server *must* have expiration events enabled. 
   Run: `redis-cli config set notify-keyspace-events Ex`
2. **Start the Frontend & Backend**: Run both instances locally.
3. **Open Two Browsers**: Open `http://localhost:3000` in a standard window and an Incognito window. Log into two different Google accounts.
4. **Connect the Chat**: In Browser A, click Browser B's username in the left Directory pane. Do the same in Browser B.
5. **Send a Message**: Type "This is a highly classified secret." and hit enter.
6. **Observe the Pulse Monitor**: On the right pane, you will instantly see: `[REDIS] Key created/updated (TTL: 15s)`.
7. **Wait 15 Seconds**: Do not send any more messages. Watch the Pulse Monitor.
8. **Verify the Purge**:
   - Exactly at 15 seconds, Redis will fire the keyspace expiration notification.
   - You will see a new Pulse event: `[GHOST] TTL reached 0. Redis memory purged...`
   - Simultaneously, **both** browser windows will instantly clear their middle chat panes, erasing all evidence of the conversation.

---

## 🚀 Local Run Instructions

### Prerequisites
- **Node.js** ≥ 18
- **MongoDB** local instance running on default port (`27017`)
- **Redis** local instance running on default port (`6379`)
  - *Crucial: Redis must have keyspace notifications enabled for TTL wipes to function. Run `redis-cli config set notify-keyspace-events Ex`.*

### 1. Booting the Backend Server

```bash
cd backend
npm install
npm run dev
```
The server will start on `http://localhost:5000`. If you see `🚀 Backend running` along with successful MongoDB and Redis connection logs, you are good to go.

### 2. Booting the Frontend Terminal

Open a second terminal window:

```bash
cd frontend
npm install
npm run dev
```
The client will start on `http://localhost:3000`. Navigate there in your browser.

### 3. Usage
1. Click "Login with Google" on the splash screen.
2. Observe the right-hand **System Pulse** monitor instantly stream your `AUTH` and `SOCKET` connection telemetry.
3. Select a user from the left-hand **Directories** pane.
4. Type a message and hit enter. Watch the `REDIS` pulse update the TTL limit. Wait for the TTL to expire, and watch the UI automatically wipe the Ghost Chat.
