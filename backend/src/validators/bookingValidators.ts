import { body, query, param } from 'express-validator';

export const createBookingValidator = [
  body('spaceId')
    .isInt({ min: 1 })
    .withMessage('Invalid space ID'),
  body('startDate')
    .isISO8601()
    .toDate()
    .custom((value) => {
      if (value <= new Date()) {
        throw new Error('Start date must be in the future');
      }
      return true;
    }),
  body('endDate')
    .isISO8601()
    .toDate()
    .custom((value, { req }) => {
      if (value <= req.body.startDate) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  body('specialInstructions')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Special instructions too long')
];

export const getUserBookingsValidator = [
  query('role')
    .optional()
    .isIn(['tenant', 'host'])
    .withMessage('Invalid role'),
  query('status')
    .optional()
    .isIn(['pending', 'confirmed', 'cancelled', 'completed'])
    .withMessage('Invalid status'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be positive'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

export const updateBookingStatusValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Invalid booking ID'),
  body('status')
    .isIn(['confirmed', 'cancelled'])
    .withMessage('Invalid status'),
  body('cancellationReason')
    .if(body('status').equals('cancelled'))
    .notEmpty()
    .withMessage('Cancellation reason is required')
    .isLength({ max: 500 })
    .withMessage('Cancellation reason too long')
];

export const bookingIdValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Invalid booking ID')
];