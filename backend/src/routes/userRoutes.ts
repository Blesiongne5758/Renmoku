import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// User routes placeholder
router.get('/', authenticate, authorize(['ADMIN']), (req, res) => {
  res.json({ message: 'User routes - Coming soon' });
});

export default router;
