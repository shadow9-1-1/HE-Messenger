import { Router, Response, NextFunction, Request } from 'express';
import { verifyFirebaseToken, requireMfa } from '../middleware/auth.middleware';
import { getOnlineUsers } from '../config/redis';

const router = Router();

// GET /api/presence — fetch list of online UIDs
router.get('/', verifyFirebaseToken, requireMfa, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const onlineUids = await getOnlineUsers();
    res.json({ onlineUids });
  } catch (error) {
    next(error);
  }
});

export default router;
