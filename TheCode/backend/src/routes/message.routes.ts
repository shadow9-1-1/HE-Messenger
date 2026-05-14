import { Router, Response, NextFunction } from 'express';
import { verifyFirebaseToken, requireMfa, AuthRequest } from '../middleware/auth.middleware';
import { listPush, listRead, getConversationKey, getExpiration, createBurnMessage, consumeBurnMessage } from '../config/redis';
import { getIO } from '../config/socket';
import { emitSystemPulse } from '../services/pulse.service';
import { ApiError } from '../middleware/error.middleware';

const router = Router();

// GET /api/messages/:recipientUid — fetch messages for a private conversation
router.get('/:recipientUid', verifyFirebaseToken, requireMfa, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { recipientUid } = req.params;
    const senderUid = req.user!.uid;

    if (!recipientUid || typeof recipientUid !== 'string' || !recipientUid.trim()) {
      throw new ApiError(400, 'Invalid request parameters', { recipientUid: 'recipientUid must be a non-empty string' });
    }

    const conversationKey = getConversationKey(senderUid, recipientUid);
    const rawMessages = await listRead(conversationKey);
    const messages = rawMessages.map(m => JSON.parse(m));
    const ttl = await getExpiration(conversationKey);

    res.json({ messages, ttl });
  } catch (error) {
    next(error);
  }
});

// POST /api/messages — send a message
router.post('/', verifyFirebaseToken, requireMfa, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { recipientUid, content, type: messageType = 'text' } = req.body;
    const senderUid = req.user!.uid;

    if (!recipientUid || typeof recipientUid !== 'string' || !recipientUid.trim()) {
      throw new ApiError(400, 'Invalid request body', { recipientUid: 'recipientUid must be a non-empty string' });
    }

    if (!content || typeof content !== 'string' || !content.trim()) {
      throw new ApiError(400, 'Invalid request body', { content: 'content must be a non-empty string' });
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
    emitSystemPulse(senderUid, 'REDIS', `Key created/updated (TTL: ${currentTtl}s)`);
    emitSystemPulse(recipientUid, 'REDIS', `Key created/updated (TTL: ${currentTtl}s)`);

    // Emit to recipient via Socket.IO private room (their UID)
    const io = getIO();
    io.to(recipientUid).emit('receive_message', message);
    
    // Emit to sender as well to update their own client synchronously
    io.to(senderUid).emit('receive_message', message);

    res.status(201).json({ message });
  } catch (error) {
    next(error);
  }
});

// POST /api/messages/burn — create a read-once message
router.post('/burn', verifyFirebaseToken, requireMfa, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { recipientUid, content } = req.body;
    const senderUid = req.user!.uid;

    if (!recipientUid || typeof recipientUid !== 'string' || !recipientUid.trim()) {
      throw new ApiError(400, 'Invalid request body', { recipientUid: 'recipientUid must be a non-empty string' });
    }
    if (!content || typeof content !== 'string' || !content.trim()) {
      throw new ApiError(400, 'Invalid request body', { content: 'content must be a non-empty string' });
    }

    const burnId = Date.now().toString() + Math.random().toString(36).substring(7);
    
    const message = {
      burnId,
      senderUid,
      recipientUid,
      content,
      createdAt: new Date().toISOString(),
    };

    // Store in standalone key
    await createBurnMessage(burnId, JSON.stringify(message));
    
    // Emit system pulse
    emitSystemPulse(senderUid, 'REDIS', `Burn message created: burn:${burnId}`);

    // Alert recipient via Socket
    const io = getIO();
    io.to(recipientUid).emit('receive_burn_notice', { 
      burnId, 
      senderUid, 
      timestamp: message.createdAt 
    });

    res.status(201).json({ burnId });
  } catch (error) {
    next(error);
  }
});

// GET /api/messages/burn/:burnId — consume a read-once message
router.get('/burn/:burnId', verifyFirebaseToken, requireMfa, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { burnId } = req.params;
    
    // Attempt atomic fetch and delete
    const rawMessage = await consumeBurnMessage(burnId);
    
    if (!rawMessage) {
      throw new ApiError(410, 'Message destroyed or expired');
    }
    
    const message = JSON.parse(rawMessage);
    
    // Ensure the person consuming it is the intended recipient
    if (message.recipientUid !== req.user!.uid) {
      throw new ApiError(403, 'Forbidden: You are not the recipient of this burn message');
    }

    // Emit system pulse
    emitSystemPulse(req.user!.uid, 'REDIS', `Burn message consumed: burn:${burnId}`);
    emitSystemPulse(message.senderUid, 'REDIS', `Burn message read by recipient: burn:${burnId}`);

    res.json({ message });
  } catch (error) {
    next(error);
  }
});

export default router;
