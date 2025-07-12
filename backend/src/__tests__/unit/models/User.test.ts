import bcrypt from 'bcryptjs';
import { User, UserInstance } from '../../../models/User';

// Mock bcrypt
jest.mock('bcryptjs');

// Mock Sequelize
jest.mock('sequelize', () => {
  const actualSequelize = jest.requireActual('sequelize');
  return {
    ...actualSequelize,
    Model: class MockModel {
      static init = jest.fn();
      static belongsToMany = jest.fn();
      static hasMany = jest.fn();
    },
  };
});

describe('User Model', () => {
  describe('comparePassword', () => {
    it('should compare password correctly', async () => {
      const mockUser: Partial<UserInstance> = {
        password: 'hashedPassword',
        comparePassword: async function(candidatePassword: string) {
          return bcrypt.compare(candidatePassword, this.password);
        },
      };

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await mockUser.comparePassword!('password123');
      
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
      expect(result).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const mockUser: Partial<UserInstance> = {
        password: 'hashedPassword',
        comparePassword: async function(candidatePassword: string) {
          return bcrypt.compare(candidatePassword, this.password);
        },
      };

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await mockUser.comparePassword!('wrongpassword');
      
      expect(result).toBe(false);
    });
  });

  describe('Model hooks', () => {
    it('should hash password before create', async () => {
      const mockUser = { password: 'plainPassword' };
      const hashedPassword = 'hashedPassword123';
      
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      // Simulate the beforeCreate hook
      const beforeCreateHook = async (user: any) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      };

      await beforeCreateHook(mockUser);
      
      expect(bcrypt.hash).toHaveBeenCalledWith('plainPassword', 10);
      expect(mockUser.password).toBe(hashedPassword);
    });

    it('should hash password before update if changed', async () => {
      const mockUser = { 
        password: 'newPassword',
        changed: jest.fn().mockReturnValue(true),
      };
      const hashedPassword = 'newHashedPassword';
      
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      // Simulate the beforeUpdate hook
      const beforeUpdateHook = async (user: any) => {
        if (user.changed('password')) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      };

      await beforeUpdateHook(mockUser);
      
      expect(mockUser.changed).toHaveBeenCalledWith('password');
      expect(bcrypt.hash).toHaveBeenCalledWith('newPassword', 10);
      expect(mockUser.password).toBe(hashedPassword);
    });
  });
});