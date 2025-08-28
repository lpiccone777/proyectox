import { Router } from 'express';
// import * as userController from '../controllers/userController';
// import { authenticate } from '../middleware/auth';
// import { uploadSingle } from '../middleware/upload';
// import { body, param } from 'express-validator';
// import { handleValidationErrors } from '../middleware/validation';

const router = Router();

// Temporarily disabled - auth middleware needs fixing
// router.get(
//   '/profile',
//   authenticate as any,
//   userController.getProfile
// );

// Temporarily disabled - auth middleware needs fixing
// router.put(
//   '/profile',
//   authenticate as any,
//   uploadSingle,
//   [
//     body('firstName').optional().trim().notEmpty(),
//     body('lastName').optional().trim().notEmpty(),
//     body('phone').optional().matches(/^[+]?[0-9\s-()]+$/)
//   ],
//   handleValidationErrors,
//   userController.updateProfile
// );

// Temporarily disabled - needs type fixing
// router.get(
//   '/:id',
//   [
//     param('id').isInt({ min: 1 }).withMessage('Invalid user ID')
//   ],
//   handleValidationErrors,
//   userController.getUserById
// );

export default router;