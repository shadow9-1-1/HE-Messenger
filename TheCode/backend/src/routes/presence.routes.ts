import { Router, Response, Request } from 'express';
import { verifyFirebaseToken } from '../middleware/auth.middleware';
import { getOnlineUsers } from '../config/redis';

const router = Router();

// GET /api/presence — fetch list of online UIDs
router.get('/', verifyFirebaseToken, async (_req: Request, res: Response) => {
  try {
    const onlineUids = await getOnlineUsers();
    res.json({ onlineUids });
  } catch (error) {
    console.error('Fetch presence error:', error);
    res.status(500).json({ error: 'Failed to fetch online users' });
  }
});

export default router;
