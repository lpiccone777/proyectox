import { Router } from 'express';
import * as paymentController from '../controllers/paymentController';
// import { authenticate } from '../middleware/auth';
// import { body, param } from 'express-validator';
// import { handleValidationErrors } from '../middleware/validation';

const router = Router();

// Webhook endpoint (no auth required)
router.post(
  '/webhook',
  paymentController.processWebhook
);

// Protected routes
// Temporarily disabled - auth middleware needs fixing
// router.get(
//   '/:bookingId',
//   authenticate as any,
//   [
//     param('bookingId').isInt({ min: 1 }).withMessage('Invalid booking ID')
//   ],
//   handleValidationErrors,
//   paymentController.getPaymentDetails
// );

// Temporarily disabled - auth middleware needs fixing
// router.post(
//   '/preference',
//   authenticate as any,
//   [
//     body('bookingId').isInt({ min: 1 }).withMessage('Invalid booking ID')
//   ],
//   handleValidationErrors,
//   paymentController.createPaymentPreference
// );

export default router;