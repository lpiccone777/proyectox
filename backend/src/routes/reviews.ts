import { Router } from 'express';
import * as reviewController from '../controllers/reviewController';
import { authenticate } from '../middleware/auth';
import { 
  createReviewValidator,
  spaceReviewsValidator,
  getUserReviewsValidator 
} from '../validators/reviewValidators';
import { handleValidationErrors } from '../middleware/validation';

const router = Router();

// Public routes
router.get(
  '/spaces/:id',
  spaceReviewsValidator,
  handleValidationErrors,
  reviewController.getSpaceReviews
);

router.get(
  '/users/:id',
  getUserReviewsValidator,
  handleValidationErrors,
  reviewController.getUserReviews
);

// Protected routes
router.post(
  '/',
  authenticate,
  createReviewValidator,
  handleValidationErrors,
  reviewController.createReview
);

export default router;