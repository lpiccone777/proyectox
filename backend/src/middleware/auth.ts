import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';
import { AuthenticationError, AuthorizationError } from '../utils/errors';
import { UserInstance } from '../models/User';

export interface AuthRequest extends Request {
  user?: UserInstance;
}

export const authenticate = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      throw new AuthenticationError('No token provided');
    }

    const decoded = jwt.verify(token, config.jwt.secret) as { userId: number };
    
    const { User } = req.app.locals.db;
    const user = await User.findByPk(decoded.userId);
    
    if (!user) {
      throw new AuthenticationError('User not found');
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AuthenticationError());
      return;
    }

    if (roles.length && !roles.includes(req.user.role)) {
      next(new AuthorizationError('Insufficient permissions'));
      return;
    }

    next();
  };
};

export const authorizeHost = (req: AuthRequest, _res: Response, next: NextFunction): void => {
  if (!req.user) {
    next(new AuthenticationError());
    return;
  }

  if (req.user.role !== 'host' && req.user.role !== 'both') {
    next(new AuthorizationError('Host access required'));
    return;
  }

  next();
};

export const authorizeTenant = (req: AuthRequest, _res: Response, next: NextFunction): void => {
  if (!req.user) {
    next(new AuthenticationError());
    return;
  }

  if (req.user.role !== 'tenant' && req.user.role !== 'both') {
    next(new AuthorizationError('Tenant access required'));
    return;
  }

  next();
};