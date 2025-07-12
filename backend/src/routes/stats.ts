import { Router } from 'express';
import * as statsController from '../controllers/statsController';
import { authenticate, authorizeHost } from '../middleware/auth';

const router = Router();

// All stats routes require host authentication
router.use(authenticate);
router.use(authorizeHost);

router.get(
  '/dashboard',
  statsController.getDashboardStats
);

export default router;