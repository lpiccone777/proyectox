import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../utils/response';
import { AuthenticationError, ConflictError } from '../utils/errors';
import { generateToken } from '../services/jwtService';
import { Database } from '../models';

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password, firstName, lastName, phone, role } = req.body;
    const { User } = req.app.locals.db as Database;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      phone,
      role,
      verifiedEmail: false,
      verifiedPhone: false
    });

    const token = generateToken(user);

    sendSuccess(res, {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      },
      token
    }, 201);
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;
    const { User } = req.app.locals.db as Database;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new AuthenticationError('Invalid email or password');
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid email or password');
    }

    const token = generateToken(user);

    sendSuccess(res, {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        profilePicture: user.profilePicture
      },
      token
    });
  } catch (error) {
    next(error);
  }
};

export const googleAuth = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // TODO: Implement Google OAuth verification
    // This is a placeholder - you need to verify the idToken with Google
    // const { idToken } = req.body;
    
    // Verify token with Google OAuth2 API
    // Extract user info from verified token
    // Create or update user in database
    
    sendSuccess(res, {
      message: 'Google auth endpoint - implementation pending'
    });
  } catch (error) {
    next(error);
  }
};

export const appleAuth = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // TODO: Implement Apple Sign In verification
    // This is a placeholder - you need to verify the idToken with Apple
    // const { idToken } = req.body;
    
    // Verify token with Apple Sign In API
    // Extract user info from verified token
    // Create or update user in database
    
    sendSuccess(res, {
      message: 'Apple auth endpoint - implementation pending'
    });
  } catch (error) {
    next(error);
  }
};