import jwt from 'jsonwebtoken';
import * as jwtService from '../../../services/jwtService';
import config from '../../../config/config';

// Mock jsonwebtoken
jest.mock('jsonwebtoken');

describe('JWT Service', () => {
  const mockUser = {
    id: 1,
    email: 'test@example.com',
    role: 'tenant',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateToken', () => {
    it('should generate a JWT token', () => {
      const mockToken = 'mock.jwt.token';
      (jwt.sign as jest.Mock).mockReturnValue(mockToken);

      const token = jwtService.generateToken(mockUser);

      expect(jwt.sign).toHaveBeenCalledWith(
        mockUser,
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );
      expect(token).toBe(mockToken);
    });
  });

  describe('verifyToken', () => {
    it('should verify and decode a valid token', () => {
      const mockToken = 'valid.jwt.token';
      (jwt.verify as jest.Mock).mockReturnValue(mockUser);

      const decoded = jwtService.verifyToken(mockToken);

      expect(jwt.verify).toHaveBeenCalledWith(mockToken, config.jwt.secret);
      expect(decoded).toEqual(mockUser);
    });

    it('should throw error for invalid token', () => {
      const mockToken = 'invalid.jwt.token';
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      expect(() => jwtService.verifyToken(mockToken)).toThrow('Invalid token');
    });
  });
});