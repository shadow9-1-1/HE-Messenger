import { Router, Response, Request } from 'express';
import { verifyFirebaseToken, AuthRequest } from '../middleware/auth.middleware';
import { Room } from '../models/room.model';
import { listPush, listRead } from '../config/redis';

interface RoomParams extends Record<string, string> {
  roomId: string;
}

interface MessageParams extends Record<string, string> {
  messageId: string;
}

const router = Router();

// GET /api/messages/:roomId — fetch messages for a room
router.get('/:roomId', verifyFirebaseToken, async (req: Request<RoomParams>, res: Response) => {
  try {
    const { roomId } = req.params;
    const rawMessages = await listRead(`messages:${roomId}`);
    const messages = rawMessages.map(m => JSON.parse(m));

    res.json({ messages });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// POST /api/messages/:roomId — send a message
router.post('/:roomId', verifyFirebaseToken, async (req: Request<RoomParams> & AuthRequest, res: Response) => {
  try {
    const { roomId } = req.params;
    const { content, type: messageType = 'text' } = req.body as { content: string; type?: string };

    const room = await Room.findById(roomId);
    if (!room) {
      res.status(404).json({ error: 'Room not found' });
      return;
    }

    const message = {
      _id: Date.now().toString() + Math.random().toString(36).substring(7),
      roomId,
      senderUid: req.user!.uid,
      content,
      type: messageType,
      createdAt: new Date().toISOString(),
    };

    // Push the message to the Redis list and set/update its TTL
    await listPush(`messages:${roomId}`, JSON.stringify(message), room.ttlSeconds);

    res.status(201).json({ message });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// DELETE /api/messages/:messageId — soft delete
router.delete('/:messageId', verifyFirebaseToken, async (req: Request<MessageParams> & AuthRequest, res: Response) => {
  res.json({ message: 'Message deletion not fully supported in Redis yet' });
});

export default router;
