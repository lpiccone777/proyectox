import { Request, Response } from 'express';
import * as bookingController from '../../../controllers/bookingController';
import { Booking } from '../../../models/Booking';
import { Space } from '../../../models/Space';
import { Payment } from '../../../models/Payment';
import { User } from '../../../models/User';
import { validationResult } from 'express-validator';

// Mock dependencies
jest.mock('../../../models/Booking');
jest.mock('../../../models/Space');
jest.mock('../../../models/Payment');
jest.mock('../../../models/User');
jest.mock('express-validator');

describe('BookingController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      body: {},
      query: {},
      params: {},
      user: { id: 1, role: 'tenant' },
    };
    mockResponse = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('getMyBookings', () => {
    it('should return bookings for tenant', async () => {
      mockRequest.query = { role: 'tenant' };
      
      const mockBookings = [
        {
          id: 1,
          spaceId: 1,
          tenantId: 1,
          status: 'confirmed',
          space: { title: 'Test Space' },
        },
      ];

      (Booking.findAll as jest.Mock).mockResolvedValue(mockBookings);

      await bookingController.getMyBookings(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(Booking.findAll).toHaveBeenCalledWith({
        where: { tenantId: 1 },
        include: expect.any(Array),
        order: [['createdAt', 'DESC']],
      });

      expect(mockResponse.json).toHaveBeenCalledWith(mockBookings);
    });

    it('should return bookings for host', async () => {
      mockRequest.query = { role: 'host' };
      mockRequest.user = { id: 2, role: 'host' };
      
      const mockBookings = [
        {
          id: 1,
          spaceId: 1,
          status: 'confirmed',
          space: { title: 'Test Space', hostId: 2 },
        },
      ];

      (Booking.findAll as jest.Mock).mockResolvedValue(mockBookings);

      await bookingController.getMyBookings(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(Booking.findAll).toHaveBeenCalledWith({
        include: expect.arrayContaining([
          expect.objectContaining({
            model: Space,
            where: { hostId: 2 },
          }),
        ]),
        order: [['createdAt', 'DESC']],
      });

      expect(mockResponse.json).toHaveBeenCalledWith(mockBookings);
    });
  });

  describe('createBooking', () => {
    it('should create a new booking', async () => {
      mockRequest.body = {
        spaceId: 1,
        startDate: '2024-02-01',
        endDate: '2024-03-01',
        notes: 'Test booking',
      };

      (validationResult as unknown as jest.Mock).mockReturnValue({
        isEmpty: () => true,
      });

      const mockSpace = {
        id: 1,
        hostId: 2,
        pricePerMonth: 300,
        pricePerDay: 15,
        isActive: true,
      };

      const mockBooking = {
        id: 1,
        spaceId: 1,
        tenantId: 1,
        startDate: '2024-02-01',
        endDate: '2024-03-01',
        totalPrice: 300,
        status: 'pending',
        paymentStatus: 'pending',
      };

      const mockPayment = {
        id: 1,
        bookingId: 1,
        amount: 300,
      };

      (Space.findByPk as jest.Mock).mockResolvedValue(mockSpace);
      (Booking.findOne as jest.Mock).mockResolvedValue(null);
      (Booking.create as jest.Mock).mockResolvedValue(mockBooking);
      (Payment.create as jest.Mock).mockResolvedValue(mockPayment);

      await bookingController.createBooking(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(Space.findByPk).toHaveBeenCalledWith(1);
      expect(Booking.create).toHaveBeenCalledWith(expect.objectContaining({
        spaceId: 1,
        tenantId: 1,
        totalPrice: 300,
      }));
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(mockBooking);
    });

    it('should return error if space not found', async () => {
      mockRequest.body = { spaceId: 999 };

      (validationResult as unknown as jest.Mock).mockReturnValue({
        isEmpty: () => true,
      });

      (Space.findByPk as jest.Mock).mockResolvedValue(null);

      await bookingController.createBooking(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Espacio no encontrado',
      });
    });
  });

  describe('updateBookingStatus', () => {
    it('should update booking status as host', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = { status: 'confirmed' };
      mockRequest.user = { id: 2, role: 'host' };

      const mockBooking = {
        id: 1,
        status: 'pending',
        space: { hostId: 2 },
        update: jest.fn().mockResolvedValue(true),
      };

      (Booking.findOne as jest.Mock).mockResolvedValue(mockBooking);

      await bookingController.updateBookingStatus(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockBooking.update).toHaveBeenCalledWith({ status: 'confirmed' });
      expect(mockResponse.json).toHaveBeenCalledWith(mockBooking);
    });

    it('should allow tenant to cancel booking', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = { status: 'cancelled' };
      mockRequest.user = { id: 1, role: 'tenant' };

      const mockBooking = {
        id: 1,
        tenantId: 1,
        status: 'pending',
        space: { hostId: 2 },
        update: jest.fn().mockResolvedValue(true),
      };

      (Booking.findOne as jest.Mock).mockResolvedValue(mockBooking);

      await bookingController.updateBookingStatus(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockBooking.update).toHaveBeenCalledWith({ status: 'cancelled' });
      expect(mockResponse.json).toHaveBeenCalledWith(mockBooking);
    });

    it('should return 403 if not authorized', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = { status: 'confirmed' };
      mockRequest.user = { id: 3, role: 'tenant' };

      const mockBooking = {
        id: 1,
        tenantId: 1,
        space: { hostId: 2 },
      };

      (Booking.findOne as jest.Mock).mockResolvedValue(mockBooking);

      await bookingController.updateBookingStatus(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'No autorizado',
      });
    });
  });
});