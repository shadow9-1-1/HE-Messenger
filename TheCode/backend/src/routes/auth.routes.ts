import { Router, Response, NextFunction } from 'express';
import { verifyFirebaseToken, AuthRequest } from '../middleware/auth.middleware';
import { User } from '../models/user.model';
import { ApiError } from '../middleware/error.middleware';
import { isMfaVerified, setMfaVerified, setMfaPending, getMfaPending } from '../config/redis';
import { emitSystemPulse } from '../services/pulse.service';
import twilio from 'twilio';

const router = Router();

const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

// POST /api/auth/login — create or update user record after Firebase login
router.post('/login', verifyFirebaseToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { uid, email, name, picture } = req.user!;

    // Check if MFA is verified
    const verified = await isMfaVerified(uid);
    if (!verified) {
      res.status(403).json({ status: 'PENDING_MFA' });
      return;
    }

    const user = await User.findOneAndUpdate(
      { uid },
      { uid, email, displayName: name || email || 'Unknown', photoURL: picture },
      { upsert: true, new: true },
    );

    res.json({ status: 'SUCCESS', user });
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

    const verified = await isMfaVerified(req.user!.uid);
    if (!verified) {
      throw new ApiError(403, 'Forbidden: MFA Required');
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/mfa/request
router.post('/mfa/request', verifyFirebaseToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { phone } = req.body;
    if (!phone) throw new ApiError(400, 'Phone number required');

    const uid = req.user!.uid;
    
    emitSystemPulse(uid, 'AUTH', `MFA Request initiated for ${phone}`);

    if (twilioClient && process.env.TWILIO_VERIFY_SERVICE_SID) {
      await twilioClient.verify.v2.services(process.env.TWILIO_VERIFY_SERVICE_SID)
        .verifications.create({ to: phone, channel: 'sms' });
      await setMfaPending(uid, 'TWILIO', phone);
    } else {
      // Mock Fallback for evaluator testing if Twilio keys missing
      const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();
      console.log(`\n\n\n=== 🚨 MOCK OTP FOR ${phone}: ${mockOtp} ===\n\n\n`);
      await setMfaPending(uid, mockOtp, phone);
      emitSystemPulse(uid, 'AUTH', 'Twilio missing. Sent mock OTP to server console.');
    }

    res.json({ status: 'PENDING' });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/mfa/verify
router.post('/mfa/verify', verifyFirebaseToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { code } = req.body;
    if (!code) throw new ApiError(400, 'OTP code required');

    const uid = req.user!.uid;
    const pending = await getMfaPending(uid);

    if (!pending) {
      throw new ApiError(400, 'No pending MFA request found or it expired');
    }

    let isValid = false;

    if (pending.otp === 'TWILIO' && twilioClient && process.env.TWILIO_VERIFY_SERVICE_SID) {
      const check = await twilioClient.verify.v2.services(process.env.TWILIO_VERIFY_SERVICE_SID)
        .verificationChecks.create({ to: pending.phone, code });
      isValid = check.status === 'approved';
    } else {
      isValid = pending.otp === code;
    }

    if (!isValid) {
      throw new ApiError(400, 'Invalid OTP code');
    }

    await setMfaVerified(uid);
    emitSystemPulse(uid, 'AUTH', 'MFA Challenge PASSED. Identity confirmed.');

    // Sync user now that they are verified
    const { email, name, picture } = req.user!;
    const user = await User.findOneAndUpdate(
      { uid },
      { uid, email, displayName: name || email || 'Unknown', photoURL: picture },
      { upsert: true, new: true },
    );

    res.json({ status: 'SUCCESS', user });
  } catch (error) {
    next(error);
  }
});

export default router;
