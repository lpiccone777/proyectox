import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { config } from '../config/config';

export const processImage = async (
  buffer: Buffer,
  filename: string,
  width: number = 800
): Promise<string> => {
  const uploadPath = config.upload.uploadPath;
  await fs.mkdir(uploadPath, { recursive: true });

  const processedFilename = `${Date.now()}-${filename}`;
  const filepath = path.join(uploadPath, processedFilename);

  await sharp(buffer)
    .resize(width, null, {
      withoutEnlargement: true,
      fit: 'inside'
    })
    .jpeg({ quality: 80 })
    .toFile(filepath);

  return processedFilename;
};

export const deleteImage = async (filename: string): Promise<void> => {
  const filepath = path.join(config.upload.uploadPath, filename);
  try {
    await fs.unlink(filepath);
  } catch (error) {
    // File might not exist, ignore error
  }
};