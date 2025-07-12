import request from 'supertest';
import express from 'express';
import { User } from '../../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import authRouter from '../../routes/authRoutes';
import { authMiddleware } from '../../middlewares/auth';
import bodyParser from 'body-parser';

// Create test app
const app = express();
app.use(bodyParser.json());
app.use('/api/auth', authRouter);

// Mock models
jest.mock('../../models/User');
jest.mock('bcryptjs');

describe('Auth Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const newUser = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        phone: '+1234567890',
        role: 'tenant',
      };

      (User.findOne as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      (User.create as jest.Mock).mockResolvedValue({
        id: 1,
        ...newUser,
        password: 'hashedPassword',
        toJSON: () => ({
          id: 1,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          role: newUser.role,
        }),
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send(newUser)
        .expect(201);

      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toEqual({
        id: 1,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role,
      });
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: '123',
        })
        .expect(400);

      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors).toBeInstanceOf(Array);
    });

    it('should prevent duplicate registrations', async () => {
      (User.findOne as jest.Mock).mockResolvedValue({ id: 1 });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'existing@example.com',
          password: 'password123',
          firstName: 'Test',
          lastName: 'User',
          phone: '+1234567890',
          role: 'tenant',
        })
        .expect(400);

      expect(response.body.error).toBe('El usuario ya existe');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
        firstName: 'Test',
        lastName: 'User',
        role: 'tenant',
        comparePassword: jest.fn().mockResolvedValue(true),
        toJSON: () => ({
          id: 1,
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          role: 'tenant',
        }),
      };

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toEqual({
        id: 1,
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'tenant',
      });
    });

    it('should reject invalid credentials', async () => {
      const mockUser = {
        comparePassword: jest.fn().mockResolvedValue(false),
      };

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        })
        .expect(401);

      expect(response.body.error).toBe('Credenciales inválidas');
    });

    it('should handle non-existent user', async () => {
      (User.findOne as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        })
        .expect(401);

      expect(response.body.error).toBe('Credenciales inválidas');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return current user data', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'tenant',
        toJSON: () => ({
          id: 1,
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          role: 'tenant',
        }),
      };

      (User.findByPk as jest.Mock).mockResolvedValue(mockUser);

      // Create protected route for testing
      const protectedApp = express();
      protectedApp.use(bodyParser.json());
      protectedApp.use((req, res, next) => {
        req.user = { id: 1 };
        next();
      });
      protectedApp.get('/api/auth/me', authMiddleware, async (req, res) => {
        const user = await User.findByPk(req.user.id);
        res.json(user.toJSON());
      });

      const response = await request(protectedApp)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toEqual({
        id: 1,
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'tenant',
      });
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.message).toBe('Sesión cerrada exitosamente');
    });
  });
});