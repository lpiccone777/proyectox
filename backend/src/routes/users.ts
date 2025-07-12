import { Router } from 'express';
import * as userController from '../controllers/userController';
import { authenticate } from '../middleware/auth';
import { uploadSingle } from '../middleware/upload';
import { body, param } from 'express-validator';
import { handleValidationErrors } from '../middleware/validation';

const router = Router();

router.get(
  '/profile',
  authenticate,
  userController.getProfile
);

router.put(
  '/profile',
  authenticate,
  uploadSingle,
  [
    body('firstName').optional().trim().notEmpty(),
    body('lastName').optional().trim().notEmpty(),
    body('phone').optional().matches(/^[+]?[0-9\s-()]+$/)
  ],
  handleValidationErrors,
  userController.updateProfile
);

router.get(
  '/:id',
  [
    param('id').isInt({ min: 1 }).withMessage('Invalid user ID')
  ],
  handleValidationErrors,
  userController.getUserById
);

export default router;