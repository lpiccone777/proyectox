import { Response, NextFunction } from 'express';
import { Op } from 'sequelize';
import { AuthRequest } from '../middleware/auth';
import { sendSuccess, sendPaginated } from '../utils/response';
import { NotFoundError, AuthorizationError, ConflictError, ValidationError } from '../utils/errors';
import { Database } from '../models';

export const getUserBookings = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AuthorizationError();
    }

    const { role, status, page = 1, limit = 20 } = req.query;
    const { Booking, Space, User } = req.app.locals.db as Database;
    const offset = (Number(page) - 1) * Number(limit);

    const where: any = {};

    // Filter by user role
    if (role === 'tenant') {
      where.tenantId = req.user.id;
    } else if (role === 'host') {
      where['$space.hostId$'] = req.user.id;
    } else {
      where[Op.or] = [
        { tenantId: req.user.id },
        { '$space.hostId$': req.user.id }
      ];
    }

    // Filter by status
    if (status) {
      where.status = status;
    }

    const { count, rows: bookings } = await Booking.findAndCountAll({
      where,
      include: [
        {
          model: Space,
          as: 'space',
          attributes: ['id', 'title', 'address', 'city', 'type', 'pricePerMonth', 'pricePerDay'],
          include: [
            {
              model: User,
              as: 'host',
              attributes: ['id', 'firstName', 'lastName', 'profilePicture']
            }
          ]
        },
        {
          model: User,
          as: 'tenant',
          attributes: ['id', 'firstName', 'lastName', 'profilePicture']
        }
      ],
      offset,
      limit: Number(limit),
      order: [['created_at', 'DESC']]
    });

    sendPaginated(res, bookings, Number(page), Number(limit), count);
  } catch (error) {
    next(error);
  }
};

export const getBookingById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AuthorizationError();
    }

    const { id } = req.params;
    const { Booking, Space, User, Payment } = req.app.locals.db as Database;

    const booking = await Booking.findByPk(id, {
      include: [
        {
          model: Space,
          as: 'space',
          include: [
            {
              model: User,
              as: 'host',
              attributes: ['id', 'firstName', 'lastName', 'phone', 'email']
            }
          ]
        },
        {
          model: User,
          as: 'tenant',
          attributes: ['id', 'firstName', 'lastName', 'phone', 'email']
        },
        {
          model: Payment,
          as: 'payment'
        }
      ]
    });

    if (!booking) {
      throw new NotFoundError('Booking');
    }

    // Check authorization
    const space = (booking as any).space;
    if (booking.tenantId !== req.user.id && space.hostId !== req.user.id) {
      throw new AuthorizationError('You can only view your own bookings');
    }

    sendSuccess(res, booking);
  } catch (error) {
    next(error);
  }
};

export const createBooking = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AuthorizationError();
    }

    const { spaceId, startDate, endDate, specialInstructions } = req.body;
    const { Booking, Space } = req.app.locals.db as Database;

    // Verify space exists and is available
    const space = await Space.findByPk(spaceId);
    if (!space) {
      throw new NotFoundError('Space');
    }

    if (!space.available) {
      throw new ValidationError('Space is not available');
    }

    // Check if user is not booking their own space
    if (space.hostId === req.user.id) {
      throw new ValidationError('You cannot book your own space');
    }

    // Calculate days and validate minimum/maximum booking
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    if (days < space.minBookingDays) {
      throw new ValidationError(`Minimum booking is ${space.minBookingDays} days`);
    }

    if (space.maxBookingDays && days > space.maxBookingDays) {
      throw new ValidationError(`Maximum booking is ${space.maxBookingDays} days`);
    }

    // Check for overlapping bookings
    const overlappingBooking = await Booking.findOne({
      where: {
        spaceId,
        status: ['pending', 'confirmed'],
        [Op.or]: [
          {
            startDate: { [Op.between]: [startDate, endDate] }
          },
          {
            endDate: { [Op.between]: [startDate, endDate] }
          },
          {
            [Op.and]: [
              { startDate: { [Op.lte]: startDate } },
              { endDate: { [Op.gte]: endDate } }
            ]
          }
        ]
      }
    });

    if (overlappingBooking) {
      throw new ConflictError('Space is already booked for these dates', 'BOOKING_CONFLICT');
    }

    // Calculate total price
    const totalPrice = space.pricePerDay 
      ? Number(space.pricePerDay) * days
      : (Number(space.pricePerMonth) / 30) * days;

    // Create booking
    const booking = await Booking.create({
      id: 0, // Auto-generated
      spaceId,
      tenantId: req.user.id,
      startDate,
      endDate,
      totalPrice,
      specialInstructions,
      status: 'pending',
      paymentStatus: 'pending'
    } as any);

    // TODO: Create MercadoPago preference for payment
    const paymentPreference = {
      items: [{
        title: space.title,
        quantity: 1,
        unit_price: totalPrice
      }],
      external_reference: booking.id.toString(),
      notification_url: `${process.env.API_URL}/api/v1/payments/webhook`
    };

    sendSuccess(res, {
      booking,
      paymentPreference
    }, 201);
  } catch (error) {
    next(error);
  }
};

export const updateBookingStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AuthorizationError();
    }

    const { id } = req.params;
    const { status, cancellationReason } = req.body;
    const { Booking, Space } = req.app.locals.db as Database;

    const booking = await Booking.findByPk(id, {
      include: [{
        model: Space,
        as: 'space'
      }]
    });

    if (!booking) {
      throw new NotFoundError('Booking');
    }

    const space = (booking as any).space;

    // Check authorization
    const isHost = space.hostId === req.user.id;
    const isTenant = booking.tenantId === req.user.id;

    if (!isHost && !isTenant) {
      throw new AuthorizationError('You can only update your own bookings');
    }

    // Validate status transitions
    if (booking.status === 'completed' || booking.status === 'cancelled') {
      throw new ValidationError('Cannot update completed or cancelled bookings');
    }

    if (status === 'confirmed' && !isHost) {
      throw new AuthorizationError('Only host can confirm bookings');
    }

    if (status === 'cancelled' && !cancellationReason) {
      throw new ValidationError('Cancellation reason is required');
    }

    // Update booking
    await booking.update({
      status,
      cancellationReason: status === 'cancelled' ? cancellationReason : undefined
    });

    // TODO: Handle refunds if cancelled after payment

    sendSuccess(res, booking);
  } catch (error) {
    next(error);
  }
};