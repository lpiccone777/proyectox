import { Router } from 'express';
import * as spaceController from '../controllers/spaceController';
import { authenticate, authorizeHost } from '../middleware/auth';
import { uploadMultiple } from '../middleware/upload';
import { 
  createSpaceValidator, 
  updateSpaceValidator, 
  searchSpacesValidator,
  spaceIdValidator 
} from '../validators/spaceValidators';
import { handleValidationErrors } from '../middleware/validation';

const router = Router();

// Public routes
router.get(
  '/search',
  searchSpacesValidator,
  handleValidationErrors,
  spaceController.searchSpaces
);

// Protected routes
router.get(
  '/my-spaces',
  authenticate,
  spaceController.getMySpaces
);

router.get(
  '/:id',
  spaceIdValidator,
  handleValidationErrors,
  spaceController.getSpaceById
);

// Protected routes (Host only)
router.post(
  '/',
  authenticate,
  authorizeHost,
  createSpaceValidator,
  handleValidationErrors,
  spaceController.createSpace
);

router.put(
  '/:id',
  authenticate,
  authorizeHost,
  spaceIdValidator,
  updateSpaceValidator,
  handleValidationErrors,
  spaceController.updateSpace
);

router.delete(
  '/:id',
  authenticate,
  authorizeHost,
  spaceIdValidator,
  handleValidationErrors,
  spaceController.deleteSpace
);

router.post(
  '/:id/images',
  authenticate,
  authorizeHost,
  spaceIdValidator,
  handleValidationErrors,
  uploadMultiple,
  spaceController.uploadSpaceImages
);

router.delete(
  '/:id/images/:imageId',
  authenticate,
  authorizeHost,
  spaceIdValidator,
  handleValidationErrors,
  spaceController.deleteSpaceImage
);

export default router;