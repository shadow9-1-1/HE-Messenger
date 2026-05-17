import { Request, Response, NextFunction } from 'express';

export class ApiError extends Error {
  statusCode: number;
  details?: any;

  constructor(statusCode: number, message: string, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export function errorHandler(
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error('[API Error]:', err);

  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      error: err.message,
      ...(err.details && { details: err.details }),
    });
    return;
  }

  // Handle generic Mongo/Redis/Unexpected errors
  res.status(500).json({
    error: 'Internal Server Error',
  });
}
