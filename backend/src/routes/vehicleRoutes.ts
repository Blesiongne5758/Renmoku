import { Router } from 'express';
import vehicleController from '../controllers/vehicleController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', vehicleController.getVehicles);
router.get('/:id', vehicleController.getVehicleById);

// Protected routes - Owner
router.post('/', authenticate, authorize(['OWNER']), vehicleController.createVehicle);
router.put('/:id', authenticate, authorize(['OWNER', 'ADMIN']), vehicleController.updateVehicle);
router.delete('/:id', authenticate, authorize(['OWNER', 'ADMIN']), vehicleController.deleteVehicle);

// Protected routes - Owner's vehicles
router.get('/owner/my-vehicles', authenticate, authorize(['OWNER']), vehicleController.getMyVehicles);

export default router;
