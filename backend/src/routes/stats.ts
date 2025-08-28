import { Router } from 'express';
// import * as statsController from '../controllers/statsController';
// import { authenticate, authorizeHost } from '../middleware/auth';

const router = Router();

// All stats routes require host authentication
// Temporarily disabled - auth middleware needs fixing
// router.use(authenticate as any);
// router.use(authorizeHost);

// Temporarily disabled - auth middleware needs fixing
// router.get(
//   '/dashboard',
//   statsController.getDashboardStats
// );

export default router;