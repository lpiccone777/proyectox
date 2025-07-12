import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authMiddleware, checkRole } from '../../../middlewares/auth';
import config from '../../../config/config';

jest.mock('jsonwebtoken');

describe('Auth Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('authMiddleware', () => {
    it('should authenticate valid token', () => {
      const mockUser = { id: 1, email: 'test@test.com' };
      mockRequest.headers = {
        authorization: 'Bearer validtoken',
      };

      (jwt.verify as jest.Mock).mockReturnValue(mockUser);

      authMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      expect(jwt.verify).toHaveBeenCalledWith('validtoken', config.jwt.secret);
      expect(mockRequest.user).toEqual(mockUser);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should reject request without token', () => {
      authMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Token no proporcionado',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject invalid token', () => {
      mockRequest.headers = {
        authorization: 'Bearer invalidtoken',
      };

      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      authMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Token inválido',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle malformed authorization header', () => {
      mockRequest.headers = {
        authorization: 'InvalidFormat',
      };

      authMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Token no proporcionado',
      });
    });
  });

  describe('checkRole', () => {
    it('should allow user with correct role', () => {
      mockRequest.user = {
        id: 1,
        role: 'host',
      };

      const middleware = checkRole(['host', 'admin']);
      middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should allow user with "both" role for any requirement', () => {
      mockRequest.user = {
        id: 1,
        role: 'both',
      };

      const middleware = checkRole(['host']);
      middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      expect(mockNext).toHaveBeenCalled();
    });

    it('should reject user without required role', () => {
      mockRequest.user = {
        id: 1,
        role: 'tenant',
      };

      const middleware = checkRole(['host', 'admin']);
      middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Acceso denegado',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle missing user', () => {
      const middleware = checkRole(['host']);
      middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Acceso denegado',
      });
    });
  });
});