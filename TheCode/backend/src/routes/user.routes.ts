import { Router, Response, NextFunction } from 'express';
import { verifyFirebaseToken, requireMfa, AuthRequest } from '../middleware/auth.middleware';
import { User } from '../models/user.model';

const router = Router();

// GET /api/users — fetch list of all registered users
router.get('/', verifyFirebaseToken, requireMfa, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const currentUid = req.user!.uid;
    // Fetch all users except the currently authenticated one
    const users = await User.find({ uid: { $ne: currentUid } })
      .select('uid displayName photoURL')
      .lean();

    res.json({ users });
  } catch (error) {
    next(error);
  }
});

export default router;
