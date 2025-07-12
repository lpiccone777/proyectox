import * as imageService from '../../../services/imageService';
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

// Mock dependencies
jest.mock('sharp');
jest.mock('fs/promises');

describe('Image Service', () => {
  const mockFile = {
    filename: 'test.jpg',
    path: '/tmp/test.jpg',
    mimetype: 'image/jpeg',
  } as Express.Multer.File;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('processAndSaveImage', () => {
    it('should process and save image successfully', async () => {
      const mockSharpInstance = {
        resize: jest.fn().mockReturnThis(),
        jpeg: jest.fn().mockReturnThis(),
        toFile: jest.fn().mockResolvedValue({}),
      };

      (sharp as unknown as jest.Mock).mockReturnValue(mockSharpInstance);
      (fs.unlink as jest.Mock).mockResolvedValue(undefined);

      const result = await imageService.processAndSaveImage(mockFile, 'spaces');

      expect(sharp).toHaveBeenCalledWith(mockFile.path);
      expect(mockSharpInstance.resize).toHaveBeenCalledWith(800, 600, {
        fit: 'inside',
        withoutEnlargement: true,
      });
      expect(mockSharpInstance.jpeg).toHaveBeenCalledWith({ quality: 80 });
      expect(result).toMatch(/^spaces\/\d{4}\/\d{2}\/\d+-[a-z0-9]+\.jpg$/);
      expect(fs.unlink).toHaveBeenCalledWith(mockFile.path);
    });

    it('should handle processing errors', async () => {
      (sharp as unknown as jest.Mock).mockImplementation(() => {
        throw new Error('Sharp error');
      });

      await expect(
        imageService.processAndSaveImage(mockFile, 'spaces')
      ).rejects.toThrow('Sharp error');
    });
  });

  describe('deleteImage', () => {
    it('should delete image file', async () => {
      const imagePath = 'spaces/2024/01/test.jpg';
      (fs.unlink as jest.Mock).mockResolvedValue(undefined);

      await imageService.deleteImage(imagePath);

      expect(fs.unlink).toHaveBeenCalledWith(
        path.join(process.cwd(), 'uploads', imagePath)
      );
    });

    it('should handle deletion errors silently', async () => {
      const imagePath = 'spaces/2024/01/nonexistent.jpg';
      (fs.unlink as jest.Mock).mockRejectedValue(new Error('File not found'));

      // Should not throw
      await expect(imageService.deleteImage(imagePath)).resolves.toBeUndefined();
    });
  });
});