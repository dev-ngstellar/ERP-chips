import { Request, Response, NextFunction } from 'express';

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

  res.on('finish', () => {
    const duration = Date.now() - start;
    const { method, originalUrl } = req;
    const { statusCode } = res;

    let statusColor = '\x1b[32m'; // green for 2xx/3xx
    if (statusCode >= 400 && statusCode < 500) {
      statusColor = '\x1b[33m'; // yellow for 4xx
    } else if (statusCode >= 500) {
      statusColor = '\x1b[31m'; // red for 5xx
    }
    const reset = '\x1b[0m';

    console.log(
      `[${timestamp}] ${method.padEnd(6)} ${originalUrl} -> ${statusColor}${statusCode}${reset} (${duration}ms)`
    );
  });

  next();
}
