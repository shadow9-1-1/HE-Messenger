# Hybrid Ephemeral Messenger (HE-Messenger)

A real-time messaging application featuring ephemeral messages, Firebase authentication, and multi-user conversations.

## Project Overview

This project is structured as a monorepo with separate frontend and backend applications that run independently.

```
TheCode/
├── client/              # Next.js frontend
├── server/              # Express backend
├── docs/                # Documentation
└── README.md            # This file
```

## Technology Stack

### Frontend (Next.js)
- **Framework**: Next.js 14+
- **Authentication**: Firebase Auth
- **Real-time**: Socket.io
- **HTTP**: Axios
- **Language**: TypeScript
- **Styling**: CSS/Tailwind (configurable)

### Backend (Express)
- **Framework**: Express.js
- **Database**: MongoDB
- **Cache**: Redis
- **Real-time**: Socket.io
- **Authentication**: Firebase Admin SDK
- **Language**: JavaScript (Node.js)

## Quick Start

### Prerequisites
- Node.js 16+
- npm or yarn
- MongoDB running locally or remote URI
- Redis running locally or remote URI
- Firebase project setup

### Installation & Running

**Terminal 1 - Frontend:**
```bash
cd client
npm install
cp .env.local.example .env.local
# Edit .env.local with your Firebase credentials
npm run dev
```
Frontend runs on `http://localhost:3000`

**Terminal 2 - Backend:**
```bash
cd server
npm install
cp .env.example .env
# Edit .env with your MongoDB, Redis, and Firebase Admin credentials
npm run dev
```
Backend runs on `http://localhost:3001`

### Verify Setup
- Frontend: Visit `http://localhost:3000`
- Backend: Visit `http://localhost:3001/health`

## Project Structure

### Frontend (`client/`)
See [client/README.md](client/README.md) for detailed frontend documentation.

**Key Directories:**
- `src/pages/` - Next.js pages (routes)
- `src/components/` - Reusable React components
- `src/lib/` - Utilities (Firebase, Socket.io, API)
- `src/types/` - TypeScript definitions
- `public/` - Static assets

### Backend (`server/`)
See [server/README.md](server/README.md) for detailed backend documentation.

**Key Directories:**
- `src/server.js` - Main Express app
- `src/routes/` - API route definitions
- `src/controllers/` - Route handlers
- `src/models/` - MongoDB schemas
- `src/services/` - Business logic
- `src/socket/` - Socket.io handlers
- `src/middleware/` - Custom middleware
- `src/config/` - Configuration files

## Configuration

Both applications require environment variables. Copy the example files and fill in your credentials:

**Frontend:**
```bash
cp client/.env.local.example client/.env.local
```
Add Firebase credentials and API URLs.

**Backend:**
```bash
cp server/.env.example server/.env
```
Add MongoDB, Redis, and Firebase Admin credentials.

### Environment Variables

**Frontend (.env.local):**
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_SOCKET_URL` - Socket.io server URL
- Firebase configuration (API key, auth domain, project ID, etc.)

**Backend (.env):**
- `PORT` - Server port (default: 3001)
- `MONGODB_URI` - MongoDB connection string
- `REDIS_HOST` / `REDIS_PORT` - Redis connection details
- `FIREBASE_*` - Firebase Admin SDK credentials
- `CORS_ORIGIN` - Frontend URL for CORS

## Available Scripts

### Frontend
```bash
cd client
npm run dev          # Development server with hot reload
npm run build        # Production build
npm start            # Start production server
npm run lint         # Run ESLint
npm test             # Run tests
npm run test:watch   # Run tests in watch mode
```

### Backend
```bash
cd server
npm run dev          # Development server with auto-reload
npm start            # Start production server
npm run lint         # Run ESLint
npm test             # Run tests
npm run test:watch   # Run tests in watch mode
```

## Features

### Current Implementation
- ✅ Project structure initialized
- ✅ Base server setup with Socket.io
- ✅ Environment configuration templates
- ✅ Development scripts

### To Be Implemented
- User authentication (Firebase)
- Message CRUD operations
- Ephemeral message functionality
- Real-time messaging with Socket.io
- User presence tracking
- Conversation management
- Message search and filtering

## Development Workflow

1. **Create Feature Branches**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Development**
   - Frontend and backend run independently in separate terminals
   - Changes trigger hot-reload on save
   - Use `npm run lint` to check code quality
   - Write tests for new features

3. **Testing**
   - Frontend: `npm run test` in `client/`
   - Backend: `npm run test` in `server/`

4. **Push & Create PR**
   - Commit changes with clear messages
   - Push to remote
   - Open Pull Request with description

## Production Deployment

### Frontend Build
```bash
cd client
npm run build
npm start
```

### Backend Deployment
```bash
cd server
NODE_ENV=production npm start
```

**Production Configuration:**
- Set `NODE_ENV=production`
- Use production MongoDB URI
- Use production Redis instance
- Configure real Firebase credentials
- Update `CORS_ORIGIN` for your domain
- Enable HTTPS

## Troubleshooting

### Frontend Issues
- **Port 3000 in use**: `PORT=3002 npm run dev`
- **Module not found**: `rm -rf node_modules .next && npm install`
- **Firebase errors**: Verify `.env.local` has all credentials
- **Can't connect to backend**: Check `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_SOCKET_URL`

### Backend Issues
- **MongoDB connection failed**: Ensure MongoDB is running and `MONGODB_URI` is correct
- **Redis connection failed**: Verify Redis is running on configured host/port
- **Port 3001 in use**: `PORT=3002 npm run dev`
- **Socket.io won't connect**: Check `CORS_ORIGIN` matches frontend URL
- **Firebase errors**: Verify service account key environment variables

### Database Issues
- MongoDB connection: Test with `mongosh "mongodb://localhost:27017"`
- Redis connection: Test with `redis-cli ping`
- Connection pools: Check `MONGODB_POOL_SIZE` in server config

## Team Guidelines

- Follow branch naming: `feature/`, `bugfix/`, `docs/`
- Write meaningful commit messages
- Test locally before pushing
- Add TypeScript types (frontend) and validation (backend)
- Document new endpoints and components
- Keep dependencies updated
- Review code before merging

## Documentation

- [Frontend Documentation](client/README.md)
- [Backend Documentation](server/README.md)
- [Project Documentation](docs/)

## Support

For issues or questions:
1. Check the relevant README in `client/` or `server/`
2. Review error messages and logs carefully
3. Verify all environment variables are set correctly
4. Confirm MongoDB and Redis are running
5. Check network connectivity between frontend and backend

---

**Version**: 1.0.0
**Last Updated**: May 2026
