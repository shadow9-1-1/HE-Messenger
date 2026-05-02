# HE Messenger - Frontend (Next.js)

## Overview
Next.js frontend for the Hybrid Ephemeral Messenger application. Features real-time messaging with Socket.io, Firebase authentication, and ephemeral message functionality.

## Prerequisites
- Node.js 16+ 
- npm or yarn

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**
   - Copy `.env.local.example` to `.env.local`
   - Add your Firebase configuration credentials
   - Set API and Socket.io URLs

3. **Start development server**
   ```bash
   npm run dev
   ```
   - Application runs on `http://localhost:3000`
   - Hot reload enabled

## Available Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint checks |
| `npm test` | Run tests |
| `npm run test:watch` | Run tests in watch mode |

## Project Structure

```
src/
├── pages/              # Next.js pages (routes)
├── components/         # Reusable React components
├── lib/               # Utility functions
│   ├── firebase.ts    # Firebase configuration
│   ├── socket.ts      # Socket.io setup
│   └── api.ts         # API client
├── styles/            # Global and component styles
└── types/             # TypeScript type definitions
public/                # Static assets
```

## Key Features

- **Real-time Messaging**: Socket.io for live chat
- **Authentication**: Firebase Auth integration
- **Ephemeral Messages**: Messages that auto-delete
- **Responsive UI**: Mobile-friendly design

## Development

### Adding Components
Create new components in `src/components/` with TypeScript support.

### API Integration
Use the client in `src/lib/api.ts` for backend communication:
```typescript
import { api } from '@/lib/api'
const messages = await api.get('/messages')
```

### Socket Events
Socket.io events configured in `src/lib/socket.ts`:
```typescript
import { socket } from '@/lib/socket'
socket.emit('message:send', { text: 'Hello' })
socket.on('message:new', (data) => { /* ... */ })
```

## Building for Production

```bash
npm run build
npm start
```

## Troubleshooting

- **Port already in use**: Change port with `PORT=3001 npm run dev`
- **Firebase errors**: Verify `.env.local` has all Firebase credentials
- **Socket connection fails**: Check server is running and `NEXT_PUBLIC_SOCKET_URL` is correct

## Team Collaboration

- Create feature branches: `feature/feature-name`
- Follow component naming conventions
- Add TypeScript types for all props
- Test locally before pushing changes
