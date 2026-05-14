import { Router, Response, NextFunction } from 'express';
import { verifyFirebaseToken, AuthRequest } from '../middleware/auth.middleware';
import { User } from '../models/user.model';
import { ApiError } from '../middleware/error.middleware';

const router = Router();

// POST /api/auth/login — create or update user record after Firebase login
router.post('/login', verifyFirebaseToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { uid, email, name, picture } = req.user!;

    const user = await User.findOneAndUpdate(
      { uid },
      { uid, email, displayName: name || email || 'Unknown', photoURL: picture },
      { upsert: true, new: true },
    );

    res.json({ user });
  } catch (error) {
    next(error);
  }
});

// GET /api/auth/me
router.get('/me', verifyFirebaseToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await User.findOne({ uid: req.user!.uid });

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
});

export default router;
