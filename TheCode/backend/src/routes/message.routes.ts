import { Router, Response, Request } from 'express';
import { verifyFirebaseToken, AuthRequest } from '../middleware/auth.middleware';
import { Message, IMessage } from '../models/message.model';
import { Room } from '../models/room.model';

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
    const messages = await Message.find({
      roomId,
      isDeleted: false,
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: 1 });

    res.json({ messages });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// POST /api/messages/:roomId — send a message
router.post('/:roomId', verifyFirebaseToken, async (req: Request<RoomParams> & AuthRequest, res: Response) => {
  try {
    const { roomId } = req.params;
    const { content, type: messageType = 'text' } = req.body as { content: string; type?: IMessage['type'] };

    const room = await Room.findById(roomId);
    if (!room) {
      res.status(404).json({ error: 'Room not found' });
      return;
    }

    const expiresAt = new Date(Date.now() + room.ttlSeconds * 1000);

    const message = await Message.create({
      roomId,
      senderUid: (req as AuthRequest).user!.uid,
      content,
      type: messageType as IMessage['type'],
      expiresAt,
    });

    res.status(201).json({ message });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// DELETE /api/messages/:messageId — soft delete
router.delete('/:messageId', verifyFirebaseToken, async (req: Request<MessageParams> & AuthRequest, res: Response) => {
  try {
    const { messageId } = req.params;
    const message = await Message.findOneAndUpdate(
      { _id: messageId, senderUid: req.user!.uid },
      { isDeleted: true },
      { new: true },
    );

    if (!message) {
      res.status(404).json({ error: 'Message not found or unauthorized' });
      return;
    }

    res.json({ message });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

export default router;
