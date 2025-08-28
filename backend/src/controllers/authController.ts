import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../utils/response';
import { AuthenticationError, ConflictError } from '../utils/errors';
import { generateToken } from '../services/jwtService';
import { Database } from '../models';
import { OAuth2Client } from 'google-auth-library';

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
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { credential } = req.body;
    const { User } = req.app.locals.db as Database;
    
    if (!credential) {
      throw new AuthenticationError('No credential provided');
    }
    
    // Initialize Google OAuth client
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    
    // Verify the token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    
    const payload = ticket.getPayload();
    
    if (!payload) {
      throw new AuthenticationError('Invalid token');
    }
    
    const { email, given_name, family_name, sub: googleId, picture } = payload;
    
    // Check if user exists
    let user = await User.findOne({ where: { email } });
    
    if (!user) {
      // Create new user
      user = await User.create({
        email,
        firstName: given_name || '',
        lastName: family_name || '',
        googleId,
        profilePicture: picture,
        password: `google_${googleId}_${Date.now()}`, // Random password for OAuth users
        phone: '',
        role: 'tenant', // Default role
        verifiedEmail: true // Google emails are pre-verified
      });
    } else if (!user.googleId) {
      // Link existing account with Google
      user.googleId = googleId;
      if (!user.profilePicture && picture) {
        user.profilePicture = picture;
      }
      user.verifiedEmail = true;
      await user.save();
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

export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Temporary: get user from token directly
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new AuthenticationError('No token provided');
    }
    
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { userId: number };
    
    const { User } = req.app.locals.db as Database;
    
    const user = await User.findByPk(decoded.userId, {
      attributes: ['id', 'email', 'firstName', 'lastName', 'phone', 'role', 'profilePicture', 'verifiedEmail', 'verifiedPhone']
    });
    
    if (!user) {
      throw new AuthenticationError('User not found');
    }
    
    sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
};