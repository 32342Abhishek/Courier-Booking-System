import { Request, Response, NextFunction } from 'express';

interface AppError extends Error {
  statusCode?: number;
  code?: number;
}

const errorHandler = (err: AppError, req: Request, res: Response, next: NextFunction): void => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  if (err.code === 11000) { statusCode = 400; message = 'A user with this email already exists.'; }
  if (err.name === 'ValidationError') { statusCode = 400; message = err.message; }
  if (err.name === 'JsonWebTokenError') { statusCode = 401; message = 'Invalid token.'; }
  if (err.name === 'TokenExpiredError') { statusCode = 401; message = 'Token has expired.'; }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export default errorHandler;
