import { Router } from 'express';
import * as bookingController from '../controllers/bookingController';
import { authenticate, authorizeTenant } from '../middleware/auth';
import { 
  createBookingValidator, 
  getUserBookingsValidator,
  updateBookingStatusValidator,
  bookingIdValidator 
} from '../validators/bookingValidators';
import { handleValidationErrors } from '../middleware/validation';

const router = Router();

// All booking routes require authentication
router.use(authenticate);

router.get(
  '/',
  getUserBookingsValidator,
  handleValidationErrors,
  bookingController.getUserBookings
);

router.get(
  '/:id',
  bookingIdValidator,
  handleValidationErrors,
  bookingController.getBookingById
);

router.post(
  '/',
  authorizeTenant,
  createBookingValidator,
  handleValidationErrors,
  bookingController.createBooking
);

router.put(
  '/:id/status',
  updateBookingStatusValidator,
  handleValidationErrors,
  bookingController.updateBookingStatus
);

export default router;