import { MercadoPagoConfig, Preference, Payment as MPPayment } from 'mercadopago';
import { config } from '../config/config';
import { PaymentError } from '../utils/errors';

// Configure MercadoPago
const client = new MercadoPagoConfig({ 
  accessToken: config.mercadopago.accessToken 
});

const preference = new Preference(client);
const payment = new MPPayment(client);

export interface PaymentPreference {
  items: Array<{
    id?: string;
    title: string;
    quantity: number;
    unit_price: number;
    currency_id?: string;
  }>;
  payer?: {
    email: string;
    name?: string;
    phone?: {
      number: string;
    };
  };
  external_reference: string;
  notification_url?: string;
  back_urls?: {
    success: string;
    failure: string;
    pending: string;
  };
}

export const createPaymentPreference = async (
  preferenceData: PaymentPreference
): Promise<any> => {
  try {
    const response = await preference.create({
      body: {
        ...preferenceData,
        items: preferenceData.items.map(item => ({
          id: item.id || `item-${Date.now()}`,
          title: item.title,
          quantity: item.quantity,
          unit_price: item.unit_price,
          currency_id: item.currency_id || 'ARS'
        })),
        auto_return: 'approved',
        statement_descriptor: 'DEPOSITO URBANO',
        payment_methods: {
          excluded_payment_types: [
            { id: 'ticket' },
            { id: 'atm' }
          ],
          installments: 1
        }
      }
    });

    return response;
  } catch (error: any) {
    throw new PaymentError(
      'Failed to create payment preference',
      error.response?.body || error.message
    );
  }
};

export const getPaymentInfo = async (paymentId: string): Promise<any> => {
  try {
    const response = await payment.get({ id: paymentId });
    return response;
  } catch (error: any) {
    throw new PaymentError(
      'Failed to get payment info',
      error.response?.body || error.message
    );
  }
};

export const createRefund = async (
  paymentId: string,
  amount?: number
): Promise<any> => {
  try {
    const refundData: any = {
      payment_id: paymentId
    };
    if (amount) {
      refundData.amount = amount;
    }

    // TODO: Implement refund with new SDK
    // The new SDK doesn't have a direct refund method
    return { message: 'Refund implementation pending' };
  } catch (error: any) {
    throw new PaymentError(
      'Failed to create refund',
      error.response?.body || error.message
    );
  }
};

export const validateWebhookSignature = (
  _signature: string | undefined,
  _payload: any,
  _secret: string
): boolean => {
  // TODO: Implement webhook signature validation
  // For now, return true to allow webhook processing
  return true;
};