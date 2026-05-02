import { Router, Response } from 'express';
import { verifyFirebaseToken, AuthRequest } from '../middleware/auth.middleware';
import { Room } from '../models/room.model';

const router = Router();

// GET /api/rooms — list all rooms the user is a member of
router.get('/', verifyFirebaseToken, async (req: AuthRequest, res: Response) => {
  try {
    const rooms = await Room.find({ members: req.user!.uid });
    res.json({ rooms });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
});

// POST /api/rooms — create a new room
router.post('/', verifyFirebaseToken, async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, isEphemeral = true, ttlSeconds = 3600 } = req.body;
    const uid = req.user!.uid;

    const room = await Room.create({
      name,
      description,
      isEphemeral,
      ttlSeconds,
      members: [uid],
      createdBy: uid,
    });

    res.status(201).json({ room });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create room' });
  }
});

// POST /api/rooms/:roomId/join
router.post('/:roomId/join', verifyFirebaseToken, async (req: AuthRequest, res: Response) => {
  try {
    const room = await Room.findByIdAndUpdate(
      req.params.roomId,
      { $addToSet: { members: req.user!.uid } },
      { new: true },
    );

    if (!room) {
      res.status(404).json({ error: 'Room not found' });
      return;
    }

    res.json({ room });
  } catch (error) {
    res.status(500).json({ error: 'Failed to join room' });
  }
});

// DELETE /api/rooms/:roomId
router.delete('/:roomId', verifyFirebaseToken, async (req: AuthRequest, res: Response) => {
  try {
    const room = await Room.findOneAndDelete({
      _id: req.params.roomId,
      createdBy: req.user!.uid,
    });

    if (!room) {
      res.status(404).json({ error: 'Room not found or unauthorized' });
      return;
    }

    res.json({ message: 'Room deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete room' });
  }
});

export default router;
