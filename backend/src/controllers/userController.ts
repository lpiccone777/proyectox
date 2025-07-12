import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { sendSuccess } from '../utils/response';
import { NotFoundError } from '../utils/errors';
import { Database } from '../models';
import { processImage } from '../services/imageService';

export const getProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new NotFoundError('User');
    }

    sendSuccess(res, {
      id: req.user.id,
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      phone: req.user.phone,
      role: req.user.role,
      profilePicture: req.user.profilePicture,
      verifiedEmail: req.user.verifiedEmail,
      verifiedPhone: req.user.verifiedPhone
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new NotFoundError('User');
    }

    const { firstName, lastName, phone } = req.body;
    let profilePicture = req.user.profilePicture;

    if (req.file) {
      profilePicture = await processImage(
        req.file.buffer,
        req.file.originalname,
        400
      );
    }

    await req.user.update({
      firstName,
      lastName,
      phone,
      profilePicture
    });

    sendSuccess(res, {
      id: req.user.id,
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      phone: req.user.phone,
      role: req.user.role,
      profilePicture: req.user.profilePicture
    });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { User, Review } = req.app.locals.db as Database;

    const user = await User.findByPk(id, {
      attributes: ['id', 'firstName', 'lastName', 'profilePicture', 'createdAt']
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    const reviewStats = await Review.findAll({
      where: { reviewedId: id },
      attributes: [
        [Review.sequelize!.fn('AVG', Review.sequelize!.col('rating')), 'averageRating'],
        [Review.sequelize!.fn('COUNT', Review.sequelize!.col('id')), 'totalReviews']
      ],
      raw: true
    });

    sendSuccess(res, {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      profilePicture: user.profilePicture,
      memberSince: user.createdAt,
      rating: reviewStats[0] || { averageRating: 0, totalReviews: 0 }
    });
  } catch (error) {
    next(error);
  }
};