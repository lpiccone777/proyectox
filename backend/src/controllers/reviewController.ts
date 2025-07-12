import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { sendSuccess, sendPaginated } from '../utils/response';
import { NotFoundError, AuthorizationError, ConflictError, ValidationError } from '../utils/errors';
import { Database } from '../models';

export const getSpaceReviews = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const { Review, User } = req.app.locals.db as Database;
    const offset = (Number(page) - 1) * Number(limit);

    const { count, rows: reviews } = await Review.findAndCountAll({
      where: { 
        spaceId: id,
        reviewType: 'tenant_to_space'
      },
      include: [
        {
          model: User,
          as: 'reviewer',
          attributes: ['id', 'firstName', 'lastName', 'profilePicture']
        }
      ],
      offset,
      limit: Number(limit),
      order: [['created_at', 'DESC']]
    });

    sendPaginated(res, reviews, Number(page), Number(limit), count);
  } catch (error) {
    next(error);
  }
};

export const getUserReviews = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { type, page = 1, limit = 20 } = req.query;
    const { Review, User, Space } = req.app.locals.db as Database;
    const offset = (Number(page) - 1) * Number(limit);

    const where: any = { reviewedId: id };
    if (type) {
      where.reviewType = type;
    }

    const { count, rows: reviews } = await Review.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'reviewer',
          attributes: ['id', 'firstName', 'lastName', 'profilePicture']
        },
        {
          model: Space,
          as: 'space',
          attributes: ['id', 'title']
        }
      ],
      offset,
      limit: Number(limit),
      order: [['created_at', 'DESC']]
    });

    sendPaginated(res, reviews, Number(page), Number(limit), count);
  } catch (error) {
    next(error);
  }
};

export const createReview = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AuthorizationError();
    }

    const { bookingId, reviewType, rating, comment } = req.body;
    const { Review, Booking, Space } = req.app.locals.db as Database;

    // Get booking with related data
    const booking = await Booking.findByPk(bookingId, {
      include: [{
        model: Space,
        as: 'space'
      }]
    });

    if (!booking) {
      throw new NotFoundError('Booking');
    }

    const space = (booking as any).space;

    // Validate booking status
    if (booking.status !== 'completed') {
      throw new ValidationError('Can only review completed bookings');
    }

    // Validate review authorization based on type
    let reviewerId: number;
    let reviewedId: number;

    switch (reviewType) {
      case 'tenant_to_space':
      case 'tenant_to_host':
        if (booking.tenantId !== req.user.id) {
          throw new AuthorizationError('Only tenant can leave this type of review');
        }
        reviewerId = req.user.id;
        reviewedId = reviewType === 'tenant_to_space' ? space.hostId : space.hostId;
        break;

      case 'host_to_tenant':
        if (space.hostId !== req.user.id) {
          throw new AuthorizationError('Only host can leave this type of review');
        }
        reviewerId = req.user.id;
        reviewedId = booking.tenantId;
        break;

      default:
        throw new ValidationError('Invalid review type');
    }

    // Check if review already exists
    const existingReview = await Review.findOne({
      where: {
        bookingId,
        reviewType
      }
    });

    if (existingReview) {
      throw new ConflictError('Review already exists for this booking');
    }

    // Create review
    const review = await Review.create({
      id: 0, // Auto-generated
      bookingId,
      spaceId: booking.spaceId,
      reviewerId,
      reviewedId,
      reviewType,
      rating,
      comment
    } as any);

    sendSuccess(res, review, 201);
  } catch (error) {
    next(error);
  }
};