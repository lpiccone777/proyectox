import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as authController from '../../../controllers/authController';
import { validationResult } from 'express-validator';

// Mock dependencies
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('express-validator');

// Mock User model directly
const User = {
  findOne: jest.fn(),
  create: jest.fn(),
  findByPk: jest.fn(),
};
jest.mock('../../../models/User', () => ({
  User,
}));

describe('AuthController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      body: {},
      user: { id: 1, email: 'test@test.com' },
    };
    mockResponse = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      mockRequest.body = {
        email: 'new@test.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        phone: '+1234567890',
        role: 'tenant',
      };

      (validationResult as unknown as jest.Mock).mockReturnValue({
        isEmpty: () => true,
      });

      (User.findOne as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      (User.create as jest.Mock).mockResolvedValue({
        id: 1,
        email: 'new@test.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'tenant',
        toJSON: () => ({
          id: 1,
          email: 'new@test.com',
          firstName: 'Test',
          lastName: 'User',
          role: 'tenant',
        }),
      });
      (jwt.sign as jest.Mock).mockReturnValue('mockToken');

      await authController.register(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        user: {
          id: 1,
          email: 'new@test.com',
          firstName: 'Test',
          lastName: 'User',
          role: 'tenant',
        },
        token: 'mockToken',
      });
    });

    it('should return error if user already exists', async () => {
      mockRequest.body = {
        email: 'existing@test.com',
        password: 'password123',
      };

      (validationResult as unknown as jest.Mock).mockReturnValue({
        isEmpty: () => true,
      });

      (User.findOne as jest.Mock).mockResolvedValue({ id: 1 });

      await authController.register(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'El usuario ya existe',
      });
    });

    it('should handle validation errors', async () => {
      const mockErrors = [{ msg: 'Invalid email' }];
      (validationResult as unknown as jest.Mock).mockReturnValue({
        isEmpty: () => false,
        array: () => mockErrors,
      });

      await authController.register(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        errors: mockErrors,
      });
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      mockRequest.body = {
        email: 'test@test.com',
        password: 'password123',
      };

      const mockUser = {
        id: 1,
        email: 'test@test.com',
        password: 'hashedPassword',
        firstName: 'Test',
        lastName: 'User',
        role: 'tenant',
        comparePassword: jest.fn().mockResolvedValue(true),
        toJSON: () => ({
          id: 1,
          email: 'test@test.com',
          firstName: 'Test',
          lastName: 'User',
          role: 'tenant',
        }),
      };

      (validationResult as unknown as jest.Mock).mockReturnValue({
        isEmpty: () => true,
      });

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (jwt.sign as jest.Mock).mockReturnValue('mockToken');

      await authController.login(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.json).toHaveBeenCalledWith({
        user: {
          id: 1,
          email: 'test@test.com',
          firstName: 'Test',
          lastName: 'User',
          role: 'tenant',
        },
        token: 'mockToken',
      });
    });

    it('should return error for invalid credentials', async () => {
      mockRequest.body = {
        email: 'test@test.com',
        password: 'wrongpassword',
      };

      const mockUser = {
        comparePassword: jest.fn().mockResolvedValue(false),
      };

      (validationResult as unknown as jest.Mock).mockReturnValue({
        isEmpty: () => true,
      });

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);

      await authController.login(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Credenciales inválidas',
      });
    });
  });

  describe('getMe', () => {
    it('should return current user data', async () => {
      const mockUser = {
        id: 1,
        email: 'test@test.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'tenant',
        toJSON: () => ({
          id: 1,
          email: 'test@test.com',
          firstName: 'Test',
          lastName: 'User',
          role: 'tenant',
        }),
      };

      (User.findByPk as jest.Mock).mockResolvedValue(mockUser);

      await authController.getMe(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.json).toHaveBeenCalledWith({
        id: 1,
        email: 'test@test.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'tenant',
      });
    });

    it('should return 404 if user not found', async () => {
      (User.findByPk as jest.Mock).mockResolvedValue(null);

      await authController.getMe(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Usuario no encontrado',
      });
    });
  });
});