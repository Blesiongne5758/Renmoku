import { Request, Response } from 'express';
import { z } from 'zod';
import vehicleService from '../services/vehicleService';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

// Validation schemas
const createVehicleSchema = z.object({
  brand: z.string().min(1),
  model: z.string().min(1),
  year: z.number().int().min(1900).max(2030),
  transmission: z.enum(['MANUAL', 'AUTOMATIC']),
  capacity: z.number().int().min(1).max(50),
  fuelType: z.string(),
  features: z.array(z.string()),
  priceDaily: z.number().positive(),
  priceWeekly: z.number().positive(),
  priceMonthly: z.number().positive(),
  hasDriverOption: z.boolean(),
  driverPriceDaily: z.number().positive().optional(),
  location: z.string().min(1),
  images: z.array(z.string().url()),
  model3D: z.string().url().optional(),
});

const updateVehicleSchema = createVehicleSchema.partial().extend({
  status: z.enum(['AVAILABLE', 'RENTED', 'MAINTENANCE', 'INACTIVE']).optional(),
});

// Get all vehicles
export const getVehicles = asyncHandler(async (req: Request, res: Response) => {
  const filters = {
    status: req.query.status as string,
    location: req.query.location as string,
    brand: req.query.brand as string,
    transmission: req.query.transmission as string,
    minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
    maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
    page: req.query.page ? parseInt(req.query.page as string) : 1,
    limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
  };

  const result = await vehicleService.getVehicles(filters);

  res.status(200).json({
    success: true,
    data: result.data,
    pagination: result.pagination,
  });
});

// Get vehicle by ID
export const getVehicleById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const vehicle = await vehicleService.getVehicleById(id);

  res.status(200).json({
    success: true,
    data: vehicle,
  });
});

// Create vehicle
export const createVehicle = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not authenticated', 401);
  }

  const validatedData = createVehicleSchema.parse(req.body);

  // Get owner ID from user
  const owner = await (await import('../config/database')).default.fleetOwner.findUnique({
    where: { userId: req.user.id },
  });

  if (!owner) {
    throw new AppError('Owner profile not found', 404);
  }

  const vehicle = await vehicleService.createVehicle({
    ...validatedData,
    ownerId: owner.id,
  });

  res.status(201).json({
    success: true,
    message: 'Vehicle created successfully',
    data: vehicle,
  });
});

// Update vehicle
export const updateVehicle = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not authenticated', 401);
  }

  const { id } = req.params;
  const validatedData = updateVehicleSchema.parse(req.body);

  const vehicle = await vehicleService.updateVehicle(
    id,
    validatedData,
    req.user.id,
    req.user.role
  );

  res.status(200).json({
    success: true,
    message: 'Vehicle updated successfully',
    data: vehicle,
  });
});

// Delete vehicle
export const deleteVehicle = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not authenticated', 401);
  }

  const { id } = req.params;

  const result = await vehicleService.deleteVehicle(id, req.user.id, req.user.role);

  res.status(200).json({
    success: true,
    message: result.message,
  });
});

// Get my vehicles (for owner)
export const getMyVehicles = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not authenticated', 401);
  }

  const owner = await (await import('../config/database')).default.fleetOwner.findUnique({
    where: { userId: req.user.id },
  });

  if (!owner) {
    throw new AppError('Owner profile not found', 404);
  }

  const page = req.query.page ? parseInt(req.query.page as string) : 1;
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

  const result = await vehicleService.getVehiclesByOwner(owner.id, page, limit);

  res.status(200).json({
    success: true,
    data: result.data,
    pagination: result.pagination,
  });
});

export default {
  getVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getMyVehicles,
};
