import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/response';
import { ZodError } from 'zod';

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error('⚠️ [API Error Handler]:', err);

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors || null,
    });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: err.flatten().fieldErrors,
    });
  }

  // Generic fallback
  return res.status(500).json({
    success: false,
    message: err?.message || 'Internal Server Error',
  });
}
