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
    
    // Emit system pulse (will only arrive if the user already has a live socket)
    emitSystemPulse(decodedToken.uid, 'AUTH', 'Token verified securely');
    
    next();
  } catch (error) {
    next(new ApiError(401, 'Unauthorized: Invalid token'));
  }
}
