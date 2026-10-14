import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Report routes placeholder
router.get('/', authenticate, authorize(['ADMIN']), (req, res) => {
  res.json({ message: 'Report routes - Coming soon' });
});

export default router;
