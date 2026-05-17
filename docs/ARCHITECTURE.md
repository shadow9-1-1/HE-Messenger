# Architecture Overview

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 (App Router, TypeScript) |
| Backend | Express.js + TypeScript |
| Realtime | Socket.IO |
| Database | MongoDB (Mongoose ODM) |
| Cache / TTL | Redis (ioredis) |
| Auth | Firebase Authentication |

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Next.js Frontend                     │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │  Firebase    │  │  Axios API   │  │  Socket.IO    │  │
│  │  Auth Client │  │  Client      │  │  Client       │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬────────┘  │
└─────────┼────────────────┼────────────────┼─────────────┘
          │ ID Token        │ REST /api       │ WebSocket
          ▼                 ▼                 ▼
┌─────────────────────────────────────────────────────────┐
│                   Express Backend                        │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │  Firebase    │  │  REST Routes │  │  Socket.IO    │  │
│  │  Admin (verify)│ │  /auth /msgs │  │  Server       │  │
│  └──────────────┘  └──────┬───────┘  └──────┬────────┘  │
└─────────────────────────┼────────────────────┼───────────┘
                           ▼                    ▼
              ┌────────────────────┐  ┌─────────────────┐
              │     MongoDB        │  │     Redis        │
              │  Users/Messages    │  │  Sessions/Cache  │
              │  Rooms (TTL index) │  │  Presence data   │
              └────────────────────┘  └─────────────────┘
```

## Ephemeral Message Flow

1. Client sends message via Socket.IO → backend `send_message` event
2. Backend stores message in MongoDB with `expiresAt = now + room.ttlSeconds`
3. MongoDB TTL index automatically deletes expired documents
4. Redis caches active room members and online presence

## Data Flow for Authentication

1. User signs in via Firebase (Google / Email)
2. Frontend obtains Firebase ID Token
3. Every API request carries `Authorization: Bearer <idToken>`
4. Backend middleware verifies token with Firebase Admin SDK
5. On first login, `/api/auth/sync` upserts user into MongoDB
