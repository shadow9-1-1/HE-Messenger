import { Router, Response } from 'express';
import { verifyFirebaseToken, AuthRequest } from '../middleware/auth.middleware';
import { User } from '../models/user.model';

const router = Router();

// GET /api/users — fetch list of all registered users
router.get('/', verifyFirebaseToken, async (req: AuthRequest, res: Response) => {
  try {
    const currentUid = req.user!.uid;
    // Fetch all users except the currently authenticated one
    const users = await User.find({ uid: { $ne: currentUid } })
      .select('uid displayName photoURL')
      .lean();

    res.json({ users });
  } catch (error) {
    console.error('Fetch users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

export default router;
