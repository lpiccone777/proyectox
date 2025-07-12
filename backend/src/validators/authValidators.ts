import { body } from 'express-validator';

export const registerValidator = [
  body('email')
    .isEmail()
    .withMessage('Invalid email address')
    .trim()
    .toLowerCase(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ max: 100 })
    .withMessage('First name too long'),
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ max: 100 })
    .withMessage('Last name too long'),
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone is required')
    .matches(/^[+]?[0-9\s-()]+$/)
    .withMessage('Invalid phone number'),
  body('role')
    .isIn(['host', 'tenant', 'both'])
    .withMessage('Invalid role')
];

export const loginValidator = [
  body('email')
    .isEmail()
    .withMessage('Invalid email address')
    .trim()
    .toLowerCase(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

export const googleAuthValidator = [
  body('idToken')
    .notEmpty()
    .withMessage('ID token is required')
];

export const appleAuthValidator = [
  body('idToken')
    .notEmpty()
    .withMessage('ID token is required')
];