import jwt from 'jsonwebtoken';
import { config } from '../config/config';
import { UserInstance } from '../models/User';

export interface TokenPayload {
  userId: number;
  email: string;
  role: string;
}

export const generateToken = (user: UserInstance): string => {
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role
  };

  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn
  } as jwt.SignOptions);
};

export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, config.jwt.secret) as TokenPayload;
};