import { Response } from 'express';
import { 
  successResponse, 
  errorResponse, 
  validationErrorResponse 
} from '../../../utils/response';

describe('Response Utils', () => {
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  describe('successResponse', () => {
    it('should send success response with data', () => {
      const data = { id: 1, name: 'Test' };
      const message = 'Success';
      
      successResponse(mockResponse as Response, data, message, 200);
      
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message,
        data,
      });
    });

    it('should use default status code 200', () => {
      const data = { test: true };
      
      successResponse(mockResponse as Response, data);
      
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Success',
        data,
      });
    });
  });

  describe('errorResponse', () => {
    it('should send error response', () => {
      const message = 'Error occurred';
      
      errorResponse(mockResponse as Response, message, 400);
      
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message,
      });
    });

    it('should use default status code 500', () => {
      const message = 'Internal error';
      
      errorResponse(mockResponse as Response, message);
      
      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });
  });

  describe('validationErrorResponse', () => {
    it('should send validation error response', () => {
      const errors = [
        { field: 'email', message: 'Invalid email' },
        { field: 'password', message: 'Too short' },
      ];
      
      validationErrorResponse(mockResponse as Response, errors);
      
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Validation failed',
        errors,
      });
    });
  });
});