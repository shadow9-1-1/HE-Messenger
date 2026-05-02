const http = require("http");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const { createClient } = require("redis");
const { Server } = require("socket.io");
const admin = require("firebase-admin");
require("dotenv").config();

const PORT = process.env.PORT || 4000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:3000";
const SOCKET_CORS_ORIGIN = process.env.SOCKET_CORS_ORIGIN || CLIENT_ORIGIN;

const app = express();
app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: SOCKET_CORS_ORIGIN, credentials: true }
});

io.on("connection", (socket) => {
  socket.emit("connected", { message: "socket connected" });
});

async function initFirebase() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    console.warn("Firebase credentials are missing; skipping Firebase init.");
    return;
  }

  if (admin.apps.length === 0) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, "\n")
      })
    });
  }
}

async function connectMongo() {
  if (!process.env.MONGODB_URI) {
    console.warn("MONGODB_URI not set; skipping MongoDB connection.");
    return;
  }

  await mongoose.connect(process.env.MONGODB_URI);
}

async function connectRedis() {
  if (!process.env.REDIS_URL) {
    console.warn("REDIS_URL not set; skipping Redis connection.");
    return null;
  }

  const client = createClient({ url: process.env.REDIS_URL });
  client.on("error", (err) => console.error("Redis error:", err));
  await client.connect();
  return client;
}

async function start() {
  await initFirebase();
  await connectMongo();
  await connectRedis();

  server.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
  });
}

start().catch((err) => {
  console.error("Server failed to start", err);
  process.exit(1);
});
