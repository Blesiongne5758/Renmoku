import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import logger from '../utils/logger';

interface CreateVehicleInput {
  ownerId: string;
  brand: string;
  model: string;
  year: number;
  transmission: 'MANUAL' | 'AUTOMATIC';
  capacity: number;
  fuelType: string;
  features: string[];
  priceDaily: number;
  priceWeekly: number;
  priceMonthly: number;
  hasDriverOption: boolean;
  driverPriceDaily?: number;
  location: string;
  images: string[];
  model3D?: string;
}

interface UpdateVehicleInput extends Partial<CreateVehicleInput> {
  status?: 'AVAILABLE' | 'RENTED' | 'MAINTENANCE' | 'INACTIVE';
}

interface VehicleFilters {
  status?: string;
  location?: string;
  brand?: string;
  transmission?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}

class VehicleService {
  // Get all vehicles with filters
  async getVehicles(filters: VehicleFilters) {
    try {
      const { status, location, brand, transmission, minPrice, maxPrice, page = 1, limit = 10 } = filters;

      const where: any = {};

      if (status) {
        where.status = status;
      }

      if (location) {
        where.location = { contains: location, mode: 'insensitive' };
      }

      if (brand) {
        where.brand = { contains: brand, mode: 'insensitive' };
      }

      if (transmission) {
        where.transmission = transmission;
      }

      if (minPrice !== undefined || maxPrice !== undefined) {
        where.priceDaily = {};
        if (minPrice !== undefined) {
          where.priceDaily.gte = minPrice;
        }
        if (maxPrice !== undefined) {
          where.priceDaily.lte = maxPrice;
        }
      }

      const [vehicles, total] = await Promise.all([
        prisma.vehicle.findMany({
          where,
          include: {
            owner: {
              include: {
                user: {
                  select: {
                    id: true,
                    email: true,
                  },
                },
              },
            },
          },
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.vehicle.count({ where }),
      ]);

      return {
        data: vehicles,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Get vehicles error', error);
      throw new AppError('Failed to fetch vehicles', 500);
    }
  }

  // Get vehicle by ID
  async getVehicleById(id: string) {
    try {
      const vehicle = await prisma.vehicle.findUnique({
        where: { id },
        include: {
          owner: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                },
              },
            },
          },
          bookings: {
            where: {
              status: {
                in: ['CONFIRMED', 'ACTIVE'],
              },
            },
            take: 5,
            orderBy: { startDate: 'desc' },
          },
        },
      });

      if (!vehicle) {
        throw new AppError('Vehicle not found', 404);
      }

      return vehicle;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Get vehicle by ID error', error);
      throw new AppError('Failed to fetch vehicle', 500);
    }
  }

  // Create vehicle
  async createVehicle(input: CreateVehicleInput) {
    try {
      // Verify owner exists
      const owner = await prisma.fleetOwner.findUnique({
        where: { id: input.ownerId },
      });

      if (!owner) {
        throw new AppError('Owner not found', 404);
      }

      const vehicle = await prisma.vehicle.create({
        data: {
          ...input,
          status: 'AVAILABLE',
        },
        include: {
          owner: true,
        },
      });

      logger.info('Vehicle created', { vehicleId: vehicle.id, ownerId: input.ownerId });

      return vehicle;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Create vehicle error', error);
      throw new AppError('Failed to create vehicle', 500);
    }
  }

  // Update vehicle
  async updateVehicle(id: string, input: UpdateVehicleInput, userId: string, userRole: string) {
    try {
      const vehicle = await prisma.vehicle.findUnique({
        where: { id },
        include: { owner: true },
      });

      if (!vehicle) {
        throw new AppError('Vehicle not found', 404);
      }

      // Check ownership (only owner or admin can update)
      if (userRole !== 'ADMIN' && vehicle.owner.userId !== userId) {
        throw new AppError('Access denied', 403);
      }

      const updatedVehicle = await prisma.vehicle.update({
        where: { id },
        data: input,
        include: {
          owner: true,
        },
      });

      logger.info('Vehicle updated', { vehicleId: id, userId });

      return updatedVehicle;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Update vehicle error', error);
      throw new AppError('Failed to update vehicle', 500);
    }
  }

  // Delete vehicle
  async deleteVehicle(id: string, userId: string, userRole: string) {
    try {
      const vehicle = await prisma.vehicle.findUnique({
        where: { id },
        include: { owner: true },
      });

      if (!vehicle) {
        throw new AppError('Vehicle not found', 404);
      }

      // Check ownership (only owner or admin can delete)
      if (userRole !== 'ADMIN' && vehicle.owner.userId !== userId) {
        throw new AppError('Access denied', 403);
      }

      // Check if vehicle has active bookings
      const activeBookings = await prisma.booking.count({
        where: {
          vehicleId: id,
          status: {
            in: ['CONFIRMED', 'ACTIVE'],
          },
        },
      });

      if (activeBookings > 0) {
        throw new AppError('Cannot delete vehicle with active bookings', 400);
      }

      await prisma.vehicle.delete({
        where: { id },
      });

      logger.info('Vehicle deleted', { vehicleId: id, userId });

      return { message: 'Vehicle deleted successfully' };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Delete vehicle error', error);
      throw new AppError('Failed to delete vehicle', 500);
    }
  }

  // Get vehicles by owner
  async getVehiclesByOwner(ownerId: string, page = 1, limit = 10) {
    try {
      const [vehicles, total] = await Promise.all([
        prisma.vehicle.findMany({
          where: { ownerId },
          include: {
            bookings: {
              where: {
                status: {
                  in: ['CONFIRMED', 'ACTIVE'],
                },
              },
            },
          },
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.vehicle.count({ where: { ownerId } }),
      ]);

      return {
        data: vehicles,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Get vehicles by owner error', error);
      throw new AppError('Failed to fetch vehicles', 500);
    }
  }
}

export default new VehicleService();
