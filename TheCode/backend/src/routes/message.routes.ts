import { Router, Response } from 'express';
import { verifyFirebaseToken, AuthRequest } from '../middleware/auth.middleware';
import { listPush, listRead, getConversationKey, getExpiration } from '../config/redis';
import { getIO } from '../config/socket';
import { emitSystemPulse } from '../services/pulse.service';

const router = Router();

// GET /api/messages/:recipientUid — fetch messages for a private conversation
router.get('/:recipientUid', verifyFirebaseToken, async (req: AuthRequest, res: Response) => {
  try {
    const { recipientUid } = req.params;
    const senderUid = req.user!.uid;

    if (!recipientUid) {
      res.status(400).json({ error: 'recipientUid is required' });
      return;
    }

    const conversationKey = getConversationKey(senderUid, recipientUid);
    const rawMessages = await listRead(conversationKey);
    const messages = rawMessages.map(m => JSON.parse(m));
    const ttl = await getExpiration(conversationKey);

    res.json({ messages, ttl });
  } catch (error) {
    console.error('Fetch messages error:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// POST /api/messages — send a message
router.post('/', verifyFirebaseToken, async (req: AuthRequest, res: Response) => {
  try {
    const { recipientUid, content, type: messageType = 'text' } = req.body;
    const senderUid = req.user!.uid;

    if (!recipientUid || !content) {
      res.status(400).json({ error: 'recipientUid and content are required' });
      return;
    }

    const conversationKey = getConversationKey(senderUid, recipientUid);

    const message = {
      _id: Date.now().toString() + Math.random().toString(36).substring(7),
      conversationKey,
      senderUid,
      recipientUid,
      content,
      type: messageType,
      createdAt: new Date().toISOString(),
    };

    // Push the message to the Redis list and set/update its TTL
    await listPush(conversationKey, JSON.stringify(message));
    const currentTtl = await getExpiration(conversationKey);

    // Emit system pulses to both parties
    emitSystemPulse(senderUid, 'REDIS', `Key updated (TTL: ${currentTtl}s)`);
    emitSystemPulse(recipientUid, 'REDIS', `Key updated (TTL: ${currentTtl}s)`);

    // Emit to recipient via Socket.IO private room (their UID)
    const io = getIO();
    io.to(recipientUid).emit('receive_message', message);
    
    // Emit to sender as well to update their own client synchronously
    io.to(senderUid).emit('receive_message', message);

    res.status(201).json({ message });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

export default router;
