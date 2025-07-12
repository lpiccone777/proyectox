import { Router } from 'express';
import * as paymentController from '../controllers/paymentController';
import { authenticate } from '../middleware/auth';
import { body, param } from 'express-validator';
import { handleValidationErrors } from '../middleware/validation';

const router = Router();

// Webhook endpoint (no auth required)
router.post(
  '/webhook',
  paymentController.processWebhook
);

// Protected routes
router.get(
  '/:bookingId',
  authenticate,
  [
    param('bookingId').isInt({ min: 1 }).withMessage('Invalid booking ID')
  ],
  handleValidationErrors,
  paymentController.getPaymentDetails
);

router.post(
  '/preference',
  authenticate,
  [
    body('bookingId').isInt({ min: 1 }).withMessage('Invalid booking ID')
  ],
  handleValidationErrors,
  paymentController.createPaymentPreference
);

export default router;