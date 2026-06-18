import { Request, Response, NextFunction } from 'express';

export const logger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();
  const { method, originalUrl } = req;

  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;

    let color = '\x1b[32m'; // green for 2xx
    if (statusCode >= 400 && statusCode < 500) {
      color = '\x1b[33m'; // yellow for 4xx
    } else if (statusCode >= 500) {
      color = '\x1b[31m'; // red for 5xx
    } else if (statusCode >= 300 && statusCode < 400) {
      color = '\x1b[36m'; // cyan for 3xx
    }

    const methodColor = '\x1b[35m'; // Magenta for methods
    const resetColor = '\x1b[0m';

    console.log(
      `[${new Date().toISOString()}] ${methodColor}${method}${resetColor} ${originalUrl} -> ${color}${statusCode}${resetColor} (${duration}ms)`
    );
  });

  next();
};
