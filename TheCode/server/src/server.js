import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { createServer } from 'http'
import { Server } from 'socket.io'

// Load environment variables
dotenv.config()

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
  pingInterval: parseInt(process.env.SOCKET_PING_INTERVAL) || 25000,
  pingTimeout: parseInt(process.env.SOCKET_PING_TIMEOUT) || 60000,
})

const PORT = process.env.PORT || 3001
const NODE_ENV = process.env.NODE_ENV || 'development'

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
  })
})

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`)

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`)
  })

  // Add more socket event handlers here
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// Error handler
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({
    error: NODE_ENV === 'production' ? 'Internal server error' : err.message,
  })
})

httpServer.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT} in ${NODE_ENV} mode`)
  console.log(`📍 Health check: http://localhost:${PORT}/health`)
})
