import { Response, NextFunction } from 'express';
import { Op } from 'sequelize';
import { AuthRequest } from '../middleware/auth';
import { sendSuccess } from '../utils/response';
import { AuthorizationError } from '../utils/errors';
import { Database } from '../models';

export const getDashboardStats = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AuthorizationError();
    }

    const { Space, Booking, Payment, Review } = req.app.locals.db as Database;
    
    // Get current date info
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Total spaces
    const totalSpaces = await Space.count({
      where: { hostId: req.user.id }
    });

    // Active spaces
    const activeSpaces = await Space.count({
      where: { 
        hostId: req.user.id,
        available: true
      }
    });

    // Active bookings
    const activeBookings = await Booking.count({
      where: {
        '$space.hostId$': req.user.id,
        status: ['pending', 'confirmed'],
        endDate: { [Op.gte]: now }
      },
      include: [{
        model: Space,
        as: 'space',
        attributes: []
      }]
    });

    // Monthly revenue
    const monthlyRevenue = await Payment.findAll({
      attributes: [
        [Payment.sequelize!.fn('SUM', Payment.sequelize!.col('amount')), 'total']
      ],
      where: {
        status: 'approved',
        processedAt: {
          [Op.between]: [firstDayOfMonth, lastDayOfMonth]
        }
      },
      include: [{
        model: Booking,
        as: 'booking',
        attributes: [],
        include: [{
          model: Space,
          as: 'space',
          attributes: [],
          where: { hostId: req.user.id }
        }]
      }],
      raw: true
    }).then(result => (result[0] as any)?.total || 0);

    // Total revenue
    const totalRevenue = await Payment.findAll({
      attributes: [
        [Payment.sequelize!.fn('SUM', Payment.sequelize!.col('amount')), 'total']
      ],
      where: {
        status: 'approved'
      },
      include: [{
        model: Booking,
        as: 'booking',
        attributes: [],
        include: [{
          model: Space,
          as: 'space',
          attributes: [],
          where: { hostId: req.user.id }
        }]
      }],
      raw: true
    }).then(result => (result[0] as any)?.total || 0);

    // Occupancy rate calculation
    const totalBookingDays = await Booking.findAll({
      attributes: [
        [Booking.sequelize!.literal(
          `SUM(DATE_PART('day', "endDate"::timestamp - "startDate"::timestamp))`
        ), 'totalDays']
      ],
      where: {
        '$space.hostId$': req.user.id,
        status: 'confirmed',
        startDate: { [Op.lte]: lastDayOfMonth },
        endDate: { [Op.gte]: firstDayOfMonth }
      },
      include: [{
        model: Space,
        as: 'space',
        attributes: []
      }],
      raw: true
    }).then(result => (result[0] as any)?.totalDays || 0);

    const daysInMonth = lastDayOfMonth.getDate();
    const occupancyRate = totalSpaces > 0 
      ? (totalBookingDays / (totalSpaces * daysInMonth)) 
      : 0;

    // Average rating
    const ratingStats = await Review.findOne({
      attributes: [
        [Review.sequelize!.fn('AVG', Review.sequelize!.col('rating')), 'averageRating'],
        [Review.sequelize!.fn('COUNT', Review.sequelize!.col('id')), 'totalReviews']
      ],
      where: {
        '$space.hostId$': req.user.id
      },
      include: [{
        model: Space,
        as: 'space',
        attributes: []
      }],
      raw: true
    });

    // Recent bookings
    const recentBookings = await Booking.findAll({
      where: {
        '$space.hostId$': req.user.id
      },
      include: [
        {
          model: Space,
          as: 'space',
          attributes: ['id', 'title']
        },
        {
          model: req.app.locals.db.User,
          as: 'tenant',
          attributes: ['id', 'firstName', 'lastName']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: 5
    });

    sendSuccess(res, {
      totalSpaces,
      activeSpaces,
      activeBookings,
      monthlyRevenue,
      totalRevenue,
      occupancyRate: Math.round(occupancyRate * 100) / 100,
      averageRating: Number((ratingStats as any)?.averageRating || 0).toFixed(1),
      totalReviews: Number((ratingStats as any)?.totalReviews || 0),
      recentBookings
    });
  } catch (error) {
    next(error);
  }
};