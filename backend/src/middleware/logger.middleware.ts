import { Request, Response, NextFunction } from 'express';

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const { method, originalUrl } = req;
    const { statusCode } = res;
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const clientIp =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket.remoteAddress ||
      req.ip ||
      '-';

    console.log(`[${timestamp}] ${method} ${originalUrl} ${statusCode} ${duration}ms ${clientIp}`);
  });

  next();
}

