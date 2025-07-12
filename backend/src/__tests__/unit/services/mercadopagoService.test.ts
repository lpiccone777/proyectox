import { MercadoPagoConfig, Preference, Payment as MPPayment } from 'mercadopago';
import * as mercadopagoService from '../../../services/mercadopagoService';
import { Booking } from '../../../models/Booking';
import { Space } from '../../../models/Space';
import { Payment } from '../../../models/Payment';
import config from '../../../config/config';

// Mock MercadoPago
jest.mock('mercadopago');
jest.mock('../../../models/Booking');
jest.mock('../../../models/Space');
jest.mock('../../../models/Payment');

describe('MercadoPagoService', () => {
  let mockPreference: jest.Mocked<Preference>;
  let mockPayment: jest.Mocked<MPPayment>;

  beforeEach(() => {
    mockPreference = {
      create: jest.fn(),
    } as any;

    mockPayment = {
      get: jest.fn(),
    } as any;

    (MercadoPagoConfig as jest.Mock).mockImplementation(() => ({}));
    (Preference as jest.Mock).mockImplementation(() => mockPreference);
    (MPPayment as jest.Mock).mockImplementation(() => mockPayment);

    jest.clearAllMocks();
  });

  describe('createPaymentPreference', () => {
    it('should create a payment preference successfully', async () => {
      const mockBooking = {
        id: 1,
        spaceId: 1,
        totalPrice: 500,
        space: {
          id: 1,
          title: 'Test Space',
        },
      };

      (Booking.findByPk as jest.Mock).mockResolvedValue(mockBooking);

      const mockPreferenceResponse = {
        id: 'pref_123',
        init_point: 'https://checkout.mercadopago.com/init',
        sandbox_init_point: 'https://sandbox.checkout.mercadopago.com/init',
      };

      mockPreference.create.mockResolvedValue(mockPreferenceResponse as any);

      const result = await mercadopagoService.createPaymentPreference(1);

      expect(mockPreference.create).toHaveBeenCalledWith({
        body: {
          items: [
            {
              id: '1',
              title: 'Reserva: Test Space',
              quantity: 1,
              unit_price: 500,
              currency_id: 'ARS',
            },
          ],
          payer: {
            email: '',
          },
          back_urls: {
            success: `${config.frontend.url}/bookings/1/success`,
            failure: `${config.frontend.url}/bookings/1/failure`,
            pending: `${config.frontend.url}/bookings/1/pending`,
          },
          auto_return: 'approved',
          external_reference: '1',
          notification_url: `${config.api.url}/api/payments/webhook`,
        },
      });

      expect(result).toEqual({
        preferenceId: 'pref_123',
        initPoint: 'https://checkout.mercadopago.com/init',
        sandboxInitPoint: 'https://sandbox.checkout.mercadopago.com/init',
      });
    });

    it('should throw error if booking not found', async () => {
      (Booking.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(
        mercadopagoService.createPaymentPreference(999)
      ).rejects.toThrow('Booking not found');
    });
  });

  describe('handlePaymentNotification', () => {
    it('should process approved payment', async () => {
      const mockPaymentData = {
        id: 12345,
        external_reference: '1',
        status: 'approved',
        status_detail: 'accredited',
        payment_method_id: 'credit_card',
        transaction_amount: 500,
      };

      mockPayment.get.mockResolvedValue({ body: mockPaymentData } as any);

      const mockBooking = {
        id: 1,
        update: jest.fn(),
      };

      const mockPaymentRecord = {
        id: 1,
        update: jest.fn(),
      };

      (Booking.findByPk as jest.Mock).mockResolvedValue(mockBooking);
      (Payment.findOne as jest.Mock).mockResolvedValue(mockPaymentRecord);

      await mercadopagoService.handlePaymentNotification(12345);

      expect(mockPayment.get).toHaveBeenCalledWith({ id: 12345 });
      expect(mockBooking.update).toHaveBeenCalledWith({
        status: 'confirmed',
        paymentStatus: 'completed',
      });
      expect(mockPaymentRecord.update).toHaveBeenCalledWith({
        status: 'completed',
        mercadopagoPaymentId: '12345',
        paymentMethod: 'credit_card',
      });
    });

    it('should handle rejected payment', async () => {
      const mockPaymentData = {
        id: 12345,
        external_reference: '1',
        status: 'rejected',
        status_detail: 'insufficient_funds',
      };

      mockPayment.get.mockResolvedValue({ body: mockPaymentData } as any);

      const mockBooking = {
        id: 1,
        update: jest.fn(),
      };

      const mockPaymentRecord = {
        id: 1,
        update: jest.fn(),
      };

      (Booking.findByPk as jest.Mock).mockResolvedValue(mockBooking);
      (Payment.findOne as jest.Mock).mockResolvedValue(mockPaymentRecord);

      await mercadopagoService.handlePaymentNotification(12345);

      expect(mockBooking.update).toHaveBeenCalledWith({
        paymentStatus: 'failed',
      });
      expect(mockPaymentRecord.update).toHaveBeenCalledWith({
        status: 'failed',
        mercadopagoPaymentId: '12345',
      });
    });

    it('should handle payment not found', async () => {
      mockPayment.get.mockResolvedValue({ body: null } as any);

      await mercadopagoService.handlePaymentNotification(12345);

      expect(Booking.findByPk).not.toHaveBeenCalled();
      expect(Payment.findOne).not.toHaveBeenCalled();
    });
  });
});