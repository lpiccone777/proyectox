import { Router } from 'express';
import * as authController from '../controllers/authController';
import { 
  registerValidator, 
  loginValidator, 
  googleAuthValidator, 
  appleAuthValidator 
} from '../validators/authValidators';
import { handleValidationErrors } from '../middleware/validation';

const router = Router();

router.post(
  '/register',
  registerValidator,
  handleValidationErrors,
  authController.register
);

router.post(
  '/login',
  loginValidator,
  handleValidationErrors,
  authController.login
);

router.post(
  '/google',
  googleAuthValidator,
  handleValidationErrors,
  authController.googleAuth
);

router.post(
  '/apple',
  appleAuthValidator,
  handleValidationErrors,
  authController.appleAuth
);

export default router;