import { Request, Response, NextFunction } from 'express';
import { admin } from '../config/firebase';
import { emitSystemPulse } from '../services/pulse.service';
import { ApiError } from './error.middleware';

export interface AuthRequest extends Request {
  user?: admin.auth.DecodedIdToken;
}

export async function verifyToken(token: string): Promise<admin.auth.DecodedIdToken> {
  return await admin.auth().verifyIdToken(token);
}

export async function verifyFirebaseToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return next(new ApiError(401, 'Unauthorized: No token provided'));
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await verifyToken(idToken);
    req.user = decodedToken;
    
    next();
  } catch (error) {
    next(new ApiError(401, 'Unauthorized: Invalid token'));
  }
}

/**
 * Express middleware to strictly enforce that a valid Firebase user
 * has ALSO successfully completed the Twilio MFA challenge.
 * Must be used AFTER verifyFirebaseToken.
 */
export const requireMfa = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Unauthorized: No valid user session');
    }

    const { isMfaVerified } = await import('../config/redis');
    const verified = await isMfaVerified(req.user.uid);

    if (!verified) {
      throw new ApiError(403, 'Forbidden: MFA Required');
    }

    next();
  } catch (error) {
    next(error);
  }
};
