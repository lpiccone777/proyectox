import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { sendError } from '../utils/response';
import logger from '../utils/logger';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  logger.error(`Error: ${err.message}`, { error: err, path: req.path, method: req.method });

  if (err instanceof AppError) {
    sendError(res, err.code, err.message, err.statusCode, err.details);
    return;
  }

  if (err.name === 'SequelizeValidationError') {
    const messages = (err as any).errors.map((e: any) => e.message);
    sendError(res, 'VALIDATION_ERROR', messages.join(', '), 400);
    return;
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    sendError(res, 'DUPLICATE_ERROR', 'Resource already exists', 409);
    return;
  }

  if (err.name === 'JsonWebTokenError') {
    sendError(res, 'AUTH_INVALID_TOKEN', 'Invalid token', 401);
    return;
  }

  if (err.name === 'TokenExpiredError') {
    sendError(res, 'AUTH_TOKEN_EXPIRED', 'Token expired', 401);
    return;
  }

  sendError(res, 'SERVER_ERROR', 'Internal server error', 500);
};