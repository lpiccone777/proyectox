import { Request, Response } from 'express';
import * as spaceController from '../../../controllers/spaceController';
import { Space } from '../../../models/Space';
import { SpaceImage } from '../../../models/SpaceImage';
import { User } from '../../../models/User';
import { Review } from '../../../models/Review';
import { Op } from 'sequelize';
import { validationResult } from 'express-validator';

// Mock dependencies
jest.mock('../../../models/Space');
jest.mock('../../../models/SpaceImage');
jest.mock('../../../models/User');
jest.mock('../../../models/Review');
jest.mock('express-validator');

describe('SpaceController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      body: {},
      query: {},
      params: {},
      user: { id: 1, role: 'host' },
    };
    mockResponse = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('searchSpaces', () => {
    it('should search spaces with filters', async () => {
      mockRequest.query = {
        lat: '40.7128',
        lng: '-74.0060',
        radius: '10',
        type: 'garage',
        minPrice: '100',
        maxPrice: '500',
      };

      const mockSpaces = [
        {
          id: 1,
          title: 'Test Space',
          type: 'garage',
          pricePerMonth: 200,
          latitude: 40.7128,
          longitude: -74.0060,
        },
      ];

      (Space.findAll as jest.Mock).mockResolvedValue(mockSpaces);

      await spaceController.searchSpaces(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(Space.findAll).toHaveBeenCalledWith({
        where: expect.objectContaining({
          isActive: true,
          type: 'garage',
          pricePerMonth: {
            [Op.between]: [100, 500],
          },
        }),
        include: expect.any(Array),
      });

      expect(mockResponse.json).toHaveBeenCalledWith(mockSpaces);
    });

    it('should return all active spaces without filters', async () => {
      const mockSpaces = [
        { id: 1, title: 'Space 1' },
        { id: 2, title: 'Space 2' },
      ];

      (Space.findAll as jest.Mock).mockResolvedValue(mockSpaces);

      await spaceController.searchSpaces(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(Space.findAll).toHaveBeenCalledWith({
        where: { isActive: true },
        include: expect.any(Array),
      });

      expect(mockResponse.json).toHaveBeenCalledWith(mockSpaces);
    });
  });

  describe('getSpace', () => {
    it('should return space details', async () => {
      mockRequest.params = { id: '1' };

      const mockSpace = {
        id: 1,
        title: 'Test Space',
        hostId: 2,
        host: { id: 2, firstName: 'Host', lastName: 'User' },
        images: [{ url: 'image.jpg' }],
        reviewCount: 5,
        averageRating: 4.5,
      };

      (Space.findOne as jest.Mock).mockResolvedValue(mockSpace);

      await spaceController.getSpace(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(Space.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        include: expect.any(Array),
      });

      expect(mockResponse.json).toHaveBeenCalledWith(mockSpace);
    });

    it('should return 404 if space not found', async () => {
      mockRequest.params = { id: '999' };

      (Space.findOne as jest.Mock).mockResolvedValue(null);

      await spaceController.getSpace(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Espacio no encontrado',
      });
    });
  });

  describe('createSpace', () => {
    it('should create a new space', async () => {
      mockRequest.body = {
        title: 'New Space',
        description: 'Test description',
        type: 'garage',
        size: 20,
        pricePerMonth: 300,
        latitude: 40.7128,
        longitude: -74.0060,
        address: '123 Test St',
        city: 'New York',
        province: 'NY',
        postalCode: '10001',
      };

      (validationResult as unknown as jest.Mock).mockReturnValue({
        isEmpty: () => true,
      });

      const mockCreatedSpace = {
        id: 1,
        ...mockRequest.body,
        hostId: 1,
      };

      (Space.create as jest.Mock).mockResolvedValue(mockCreatedSpace);

      await spaceController.createSpace(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(Space.create).toHaveBeenCalledWith({
        ...mockRequest.body,
        hostId: 1,
        features: undefined,
        rules: undefined,
      });

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(mockCreatedSpace);
    });

    it('should handle validation errors', async () => {
      const mockErrors = [{ msg: 'Title is required' }];
      
      (validationResult as unknown as jest.Mock).mockReturnValue({
        isEmpty: () => false,
        array: () => mockErrors,
      });

      await spaceController.createSpace(
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

  describe('updateSpace', () => {
    it('should update a space', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = {
        title: 'Updated Space',
        pricePerMonth: 400,
      };

      const mockSpace = {
        id: 1,
        hostId: 1,
        update: jest.fn().mockResolvedValue(true),
      };

      (Space.findOne as jest.Mock).mockResolvedValue(mockSpace);

      await spaceController.updateSpace(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockSpace.update).toHaveBeenCalledWith(mockRequest.body);
      expect(mockResponse.json).toHaveBeenCalledWith(mockSpace);
    });

    it('should return 403 if user is not the owner', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.user = { id: 2, role: 'host' };

      const mockSpace = {
        id: 1,
        hostId: 1,
      };

      (Space.findOne as jest.Mock).mockResolvedValue(mockSpace);

      await spaceController.updateSpace(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'No autorizado',
      });
    });
  });

  describe('deleteSpace', () => {
    it('should soft delete a space', async () => {
      mockRequest.params = { id: '1' };

      const mockSpace = {
        id: 1,
        hostId: 1,
        update: jest.fn().mockResolvedValue(true),
      };

      (Space.findOne as jest.Mock).mockResolvedValue(mockSpace);

      await spaceController.deleteSpace(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockSpace.update).toHaveBeenCalledWith({ isActive: false });
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Espacio eliminado exitosamente',
      });
    });
  });
});