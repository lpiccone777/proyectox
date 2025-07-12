import { 
  AppError, 
  ValidationError, 
  UnauthorizedError, 
  ForbiddenError, 
  NotFoundError 
} from '../../../utils/errors';

describe('Custom Errors', () => {
  describe('AppError', () => {
    it('should create error with message and status code', () => {
      const error = new AppError('Test error', 400);
      
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(400);
      expect(error.isOperational).toBe(true);
      expect(error.name).toBe('AppError');
    });

    it('should default to status 500', () => {
      const error = new AppError('Server error');
      
      expect(error.statusCode).toBe(500);
    });

    it('should capture stack trace', () => {
      const error = new AppError('Test');
      
      expect(error.stack).toBeDefined();
    });
  });

  describe('ValidationError', () => {
    it('should create validation error with status 400', () => {
      const error = new ValidationError('Invalid input');
      
      expect(error.message).toBe('Invalid input');
      expect(error.statusCode).toBe(400);
      expect(error.name).toBe('ValidationError');
    });
  });

  describe('UnauthorizedError', () => {
    it('should create unauthorized error with status 401', () => {
      const error = new UnauthorizedError('Not authenticated');
      
      expect(error.message).toBe('Not authenticated');
      expect(error.statusCode).toBe(401);
      expect(error.name).toBe('UnauthorizedError');
    });

    it('should use default message', () => {
      const error = new UnauthorizedError();
      
      expect(error.message).toBe('Unauthorized');
    });
  });

  describe('ForbiddenError', () => {
    it('should create forbidden error with status 403', () => {
      const error = new ForbiddenError('Access denied');
      
      expect(error.message).toBe('Access denied');
      expect(error.statusCode).toBe(403);
      expect(error.name).toBe('ForbiddenError');
    });

    it('should use default message', () => {
      const error = new ForbiddenError();
      
      expect(error.message).toBe('Forbidden');
    });
  });

  describe('NotFoundError', () => {
    it('should create not found error with status 404', () => {
      const error = new NotFoundError('Resource not found');
      
      expect(error.message).toBe('Resource not found');
      expect(error.statusCode).toBe(404);
      expect(error.name).toBe('NotFoundError');
    });

    it('should use default message', () => {
      const error = new NotFoundError();
      
      expect(error.message).toBe('Not Found');
    });
  });
});