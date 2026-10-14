import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Booking routes placeholder
router.get('/', (req, res) => {
  res.json({ message: 'Booking routes - Coming soon' });
});

export default router;
