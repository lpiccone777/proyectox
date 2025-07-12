import multer from 'multer';
import path from 'path';
import { Request } from 'express';
import { config } from '../config/config';
import { ValidationError } from '../utils/errors';

const storage = multer.memoryStorage();

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new ValidationError('Only image files are allowed'));
  }
};

export const upload = multer({
  storage,
  limits: {
    fileSize: config.upload.maxFileSize,
    files: 10
  },
  fileFilter
});

export const uploadSingle = upload.single('image');
export const uploadMultiple = upload.array('images', 10);