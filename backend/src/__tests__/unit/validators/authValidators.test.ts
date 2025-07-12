import { validationResult } from 'express-validator';
import { validateRegister, validateLogin } from '../../../validators/authValidators';
import { Request, Response, NextFunction } from 'express';

// Mock express-validator
jest.mock('express-validator', () => ({
  body: jest.fn().mockReturnThis(),
  validationResult: jest.fn(),
  check: {
    isEmail: jest.fn().mockReturnThis(),
    normalizeEmail: jest.fn().mockReturnThis(),
    isLength: jest.fn().mockReturnThis(),
    isIn: jest.fn().mockReturnThis(),
    isMobilePhone: jest.fn().mockReturnThis(),
  },
  withMessage: jest.fn().mockReturnThis(),
}));

describe('Auth Validators', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      body: {},
    };
    mockResponse = {};
    mockNext = jest.fn();
  });

  describe('validateRegister', () => {
    it('should validate registration fields', async () => {
      const validators = validateRegister;
      expect(Array.isArray(validators)).toBe(true);
      expect(validators.length).toBeGreaterThan(0);
    });
  });

  describe('validateLogin', () => {
    it('should validate login fields', async () => {
      const validators = validateLogin;
      expect(Array.isArray(validators)).toBe(true);
      expect(validators.length).toBe(2); // email and password
    });
  });
});