import { body, query, param } from 'express-validator';

export const createReviewValidator = [
  body('bookingId')
    .isInt({ min: 1 })
    .withMessage('Invalid booking ID'),
  body('reviewType')
    .isIn(['tenant_to_space', 'tenant_to_host', 'host_to_tenant'])
    .withMessage('Invalid review type'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .trim()
    .notEmpty()
    .withMessage('Comment is required')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Comment must be between 10 and 1000 characters')
];

export const getReviewsValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be positive'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

export const getUserReviewsValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Invalid user ID'),
  query('type')
    .optional()
    .isIn(['host_to_tenant', 'tenant_to_host'])
    .withMessage('Invalid review type'),
  ...getReviewsValidator
];

export const spaceReviewsValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Invalid space ID'),
  ...getReviewsValidator
];