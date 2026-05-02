import { Router, Response } from 'express';
import { verifyFirebaseToken, AuthRequest } from '../middleware/auth.middleware';
import { User } from '../models/user.model';

const router = Router();

// POST /api/auth/sync — create or update user record after Firebase login
router.post('/sync', verifyFirebaseToken, async (req: AuthRequest, res: Response) => {
  try {
    const { uid, email, name, picture } = req.user!;

    const user = await User.findOneAndUpdate(
      { uid },
      { uid, email, displayName: name || email, photoURL: picture, lastSeen: new Date() },
      { upsert: true, new: true },
    );

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to sync user' });
  }
});

// GET /api/auth/me
router.get('/me', verifyFirebaseToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findOne({ uid: req.user!.uid });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

export default router;
