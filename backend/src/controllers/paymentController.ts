import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { sendSuccess } from '../utils/response';
import { NotFoundError, AuthorizationError, PaymentError } from '../utils/errors';
import { Database } from '../models';
import * as mercadopagoService from '../services/mercadopagoService';
import logger from '../utils/logger';

export const processWebhook = async (
  req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> => {
  try {
    const { type, data } = req.body;
    const { Payment, Booking } = req.app.locals.db as Database;

    logger.info('MercadoPago webhook received', { type, data });

    if (type === 'payment') {
      const paymentId = data.id;
      
      // Get payment info from MercadoPago
      const paymentInfo = await mercadopagoService.getPaymentInfo(paymentId);
      
      // Find booking by external reference
      const bookingId = paymentInfo.external_reference;
      const booking = await Booking.findByPk(bookingId);
      
      if (!booking) {
        logger.error('Booking not found for payment', { bookingId, paymentId });
        res.status(200).send('OK'); // Always return 200 to MercadoPago
        return;
      }

      // Check if payment already exists
      let payment = await Payment.findOne({
        where: { bookingId: booking.id }
      });

      if (!payment) {
        // Create payment record
        payment = await Payment.create({
          id: 0, // Auto-generated
          bookingId: booking.id,
          mercadopagoPaymentId: paymentId.toString(),
          amount: paymentInfo.transaction_amount,
          currency: paymentInfo.currency_id,
          status: paymentInfo.status,
          paymentMethod: paymentInfo.payment_method_id,
          payerEmail: paymentInfo.payer?.email,
          processedAt: paymentInfo.date_approved || null
        } as any);
      } else {
        // Update payment status
        await payment.update({
          status: paymentInfo.status,
          processedAt: paymentInfo.date_approved || null
        });
      }

      // Update booking based on payment status
      if (paymentInfo.status === 'approved') {
        await booking.update({
          status: 'confirmed',
          paymentStatus: 'paid'
        });
      } else if (paymentInfo.status === 'rejected' || paymentInfo.status === 'cancelled') {
        await booking.update({
          paymentStatus: 'pending'
        });
      }
    }

    res.status(200).send('OK');
  } catch (error) {
    logger.error('Webhook processing error', error);
    res.status(200).send('OK'); // Always return 200 to avoid retries
  }
};

export const getPaymentDetails = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AuthorizationError();
    }

    const { bookingId } = req.params;
    const { Payment, Booking, Space } = req.app.locals.db as Database;

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

    // Check authorization
    if (booking.tenantId !== req.user.id && space.hostId !== req.user.id) {
      throw new AuthorizationError('You can only view payments for your own bookings');
    }

    const payment = await Payment.findOne({
      where: { bookingId }
    });

    if (!payment) {
      throw new NotFoundError('Payment');
    }

    sendSuccess(res, payment);
  } catch (error) {
    next(error);
  }
};

export const createPaymentPreference = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AuthorizationError();
    }

    const { bookingId } = req.body;
    const { Booking, Space } = req.app.locals.db as Database;

    const booking = await Booking.findByPk(bookingId, {
      include: [{
        model: Space,
        as: 'space'
      }]
    });

    if (!booking) {
      throw new NotFoundError('Booking');
    }

    if (booking.tenantId !== req.user.id) {
      throw new AuthorizationError('You can only pay for your own bookings');
    }

    if (booking.paymentStatus === 'paid') {
      throw new PaymentError('Booking is already paid');
    }

    const space = (booking as any).space;

    // Create MercadoPago preference
    const preference = await mercadopagoService.createPaymentPreference({
      items: [{
        title: `${space.title} - ${space.type}`,
        quantity: 1,
        unit_price: Number(booking.totalPrice)
      }],
      payer: {
        email: req.user.email,
        name: `${req.user.firstName} ${req.user.lastName}`,
        phone: {
          number: req.user.phone
        }
      },
      external_reference: booking.id.toString(),
      notification_url: `${process.env.API_URL}/api/v1/payments/webhook`,
      back_urls: {
        success: `${process.env.FRONTEND_URL}/bookings/${booking.id}/success`,
        failure: `${process.env.FRONTEND_URL}/bookings/${booking.id}/failure`,
        pending: `${process.env.FRONTEND_URL}/bookings/${booking.id}/pending`
      }
    });

    sendSuccess(res, {
      id: preference.id,
      init_point: preference.init_point,
      sandbox_init_point: preference.sandbox_init_point
    });
  } catch (error) {
    next(error);
  }
};