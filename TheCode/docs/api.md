# API Reference

Base URL: `http://localhost:5000/api`

> All endpoints (except `/health`) require `Authorization: Bearer <Firebase ID Token>` header.

---

## Auth

### POST `/auth/sync`
Upserts the authenticated user into MongoDB after Firebase login.

**Response**
```json
{ "user": { "uid": "...", "email": "...", "displayName": "..." } }
```

### GET `/auth/me`
Returns the current authenticated user's profile.

---

## Rooms

### GET `/rooms`
Returns all rooms the current user is a member of.

### POST `/rooms`
Creates a new room.

**Body**
```json
{
  "name": "string",
  "description": "string (optional)",
  "isEphemeral": true,
  "ttlSeconds": 3600
}
```

### POST `/rooms/:roomId/join`
Adds the current user to a room.

### DELETE `/rooms/:roomId`
Deletes a room (creator only).

---

## Messages

### GET `/messages/:roomId`
Returns all non-expired, non-deleted messages for a room.

### POST `/messages/:roomId`
Sends a new message.

**Body**
```json
{
  "content": "string",
  "type": "text | image | file"
}
```

### DELETE `/messages/:messageId`
Soft-deletes a message (sender only).

---

## WebSocket Events (Socket.IO)

| Event | Direction | Payload |
|-------|-----------|---------|
| `join_room` | Client → Server | `roomId: string` |
| `leave_room` | Client → Server | `roomId: string` |
| `send_message` | Client → Server | `{ roomId, message }` |
| `receive_message` | Server → Client | `message object` |
