import { body, query, param } from 'express-validator';

export const createSpaceValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 255 })
    .withMessage('Title too long'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required'),
  body('type')
    .isIn(['room', 'garage', 'warehouse', 'locker', 'other'])
    .withMessage('Invalid space type'),
  body('address')
    .trim()
    .notEmpty()
    .withMessage('Address is required'),
  body('city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  body('province')
    .trim()
    .notEmpty()
    .withMessage('Province is required'),
  body('postalCode')
    .trim()
    .notEmpty()
    .withMessage('Postal code is required'),
  body('latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Invalid latitude'),
  body('longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Invalid longitude'),
  body('size')
    .isFloat({ min: 0.1 })
    .withMessage('Size must be greater than 0'),
  body('pricePerMonth')
    .isFloat({ min: 0 })
    .withMessage('Price must be positive'),
  body('pricePerDay')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be positive'),
  body('features')
    .optional()
    .isArray()
    .withMessage('Features must be an array'),
  body('minBookingDays')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Minimum booking days must be at least 1'),
  body('maxBookingDays')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Maximum booking days must be at least 1')
];

export const updateSpaceValidator = createSpaceValidator;

export const searchSpacesValidator = [
  query('lat')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Invalid latitude'),
  query('lng')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Invalid longitude'),
  query('radius')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Radius must be between 1 and 100 km'),
  query('type')
    .optional()
    .isIn(['room', 'garage', 'warehouse', 'locker', 'other'])
    .withMessage('Invalid space type'),
  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum price must be positive'),
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum price must be positive'),
  query('minSize')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum size must be positive'),
  query('city')
    .optional()
    .trim(),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be positive'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

export const spaceIdValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Invalid space ID')
];