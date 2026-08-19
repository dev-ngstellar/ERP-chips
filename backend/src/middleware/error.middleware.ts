import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/response';
import { ZodError } from 'zod';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const status = err instanceof ApiError ? err.statusCode : err instanceof ZodError ? 400 : 500;
  const message = err?.message || 'Internal Server Error';

  console.error(
    `[${timestamp}] [ERROR] ${req.method} ${req.originalUrl} ${status} - ${message}`
  );
  if (status === 500 && err?.stack) {
    console.error(err.stack);
  }

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
    message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : message,
  });
}

