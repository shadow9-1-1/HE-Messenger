# HE Messenger - Backend (Express)

## Overview
Express.js backend for the Hybrid Ephemeral Messenger. Provides REST API, real-time messaging via Socket.io, MongoDB persistence, and Redis caching.

## Prerequisites
- Node.js 16+
- npm or yarn
- MongoDB 4.4+
- Redis 6.0+

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**
   - Copy `.env.example` to `.env`
   - Set MongoDB URI
   - Set Redis connection details
   - Add Firebase Admin SDK credentials
   - Configure CORS origin

3. **Start development server**
   ```bash
   npm run dev
   ```
   - Server runs on `http://localhost:3001`
   - Auto-restart on file changes with nodemon

4. **Verify server is running**
   ```bash
   curl http://localhost:3001/health
   ```

## Available Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start development server with auto-reload |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint checks |
| `npm test` | Run tests |
| `npm run test:watch` | Run tests in watch mode |

## Project Structure

```
src/
├── server.js           # Main Express app setup
├── config/             # Configuration (DB, Redis, Firebase)
├── routes/             # API route definitions
├── middleware/         # Custom middleware
├── controllers/        # Route logic
├── models/             # MongoDB schemas
├── services/           # Business logic
├── socket/             # Socket.io event handlers
├── utils/              # Utility functions
└── validators/         # Request validation
```

## Key Dependencies

- **Express**: Web server framework
- **Socket.io**: Real-time bidirectional communication
- **Mongoose**: MongoDB object modeling
- **Redis**: In-memory caching
- **Firebase Admin**: Authentication verification
- **CORS**: Cross-origin resource sharing

## Database

### MongoDB
Store messages, users, conversations, and other persistent data.

**Models:**
- Users
- Messages
- Conversations
- Sessions

### Redis
Cache frequently accessed data and manage real-time session data.

**Uses:**
- User sessions
- Online status
- Message caching
- Rate limiting

## API Endpoints

Base URL: `http://localhost:3001/api`

### Health Check
- `GET /health` - Server status

Additional endpoints to be implemented:
- Authentication endpoints
- Message CRUD operations
- User management
- Conversation endpoints

## Socket.io Events

Real-time communication events for messaging:

**Client → Server:**
- `message:send` - Send a message
- `user:typing` - Typing indicator
- `user:online` - User connected
- `conversation:join` - Join conversation room

**Server → Client:**
- `message:new` - New message received
- `user:typing` - User is typing
- `user:online` - User came online
- `user:offline` - User went offline

## Development

### Adding Routes
Create new route files in `src/routes/` and import in `server.js`:
```javascript
import messagesRouter from './routes/messages.js'
app.use('/api/messages', messagesRouter)
```

### Adding Models
Define MongoDB schemas in `src/models/`:
```javascript
import mongoose from 'mongoose'
const schema = new mongoose.Schema({ /* ... */ })
export default mongoose.model('Message', schema)
```

### Socket Events
Add new socket handlers in `src/socket/`:
```javascript
io.on('connection', (socket) => {
  socket.on('custom:event', (data) => { /* ... */ })
})
```

## Building for Production

```bash
npm run build
NODE_ENV=production npm start
```

**Environment Setup:**
- Set `NODE_ENV=production`
- Configure real MongoDB URI
- Configure real Redis instance
- Set production Firebase credentials
- Update CORS_ORIGIN for production domain

## Troubleshooting

- **MongoDB connection failed**: Ensure MongoDB is running and URI is correct
- **Redis connection failed**: Verify Redis is running on configured host/port
- **Socket.io won't connect**: Check CORS_ORIGIN matches frontend URL
- **Firebase errors**: Verify service account key is properly loaded from .env

## Team Collaboration

- Use feature branches: `feature/feature-name`
- Follow RESTful API conventions
- Add error handling for all endpoints
- Test locally with curl or Postman before pushing
- Document new API endpoints in this README

## Deployment

See deployment guide in `/docs` for:
- Docker containerization
- Environment configuration
- Production database setup
- Monitoring and logging
