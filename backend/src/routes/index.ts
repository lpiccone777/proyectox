import { Router } from 'express';
import authRoutes from './auth';
import userRoutes from './users';
import spaceRoutes from './spaces';
import bookingRoutes from './bookings';
import reviewRoutes from './reviews';
import paymentRoutes from './payments';
import statsRoutes from './stats';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/spaces', spaceRoutes);
router.use('/bookings', bookingRoutes);
router.use('/reviews', reviewRoutes);
router.use('/payments', paymentRoutes);
router.use('/stats', statsRoutes);

// Health check endpoint
router.get('/health', (_req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString() 
  });
});

export default router;