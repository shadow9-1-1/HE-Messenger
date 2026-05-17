# Setup Guide

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | ≥ 18.x |
| npm | ≥ 9.x |
| MongoDB | ≥ 6.x (local or Atlas) |
| Redis | ≥ 7.x (local or Redis Cloud) |
| Firebase Project | Any plan |

---

## 1. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/) → Create project
2. **Authentication**: Enable *Email/Password* and *Google* providers
3. **Frontend keys**: Project Settings → General → Add web app → copy config
4. **Backend keys**: Project Settings → Service Accounts → Generate new private key

---

## 2. MongoDB Setup (local)

```bash
# Windows — start MongoDB service
net start MongoDB

# Or use Docker
docker run -d -p 27017:27017 --name mongo mongo:7
```

---

## 3. Redis Setup (local)

```bash
# Windows — use WSL or Docker
docker run -d -p 6379:6379 --name redis redis:7-alpine
```

---

## 4. Backend

```bash
cd backend
cp .env.example .env        # Fill in all values
npm install                 # Already done if scaffolded
npm run dev                 # Starts on http://localhost:5000
```

---

## 5. Frontend

```bash
cd frontend
cp .env.local.example .env.local   # Fill in Firebase + API URLs
npm install                        # Already done if scaffolded
npm run dev                        # Starts on http://localhost:3000
```

---

## Verify Everything Is Running

| Service | URL | Expected |
|---------|-----|---------|
| Backend health | http://localhost:5000/health | `{ "status": "ok" }` |
| Frontend | http://localhost:3000 | Landing page |
| MongoDB | localhost:27017 | Connected (see backend logs) |
| Redis | localhost:6379 | Connected (see backend logs) |
