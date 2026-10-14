import { Request, Response } from 'express';
import { z } from 'zod';
import authService from '../services/authService';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import logger from '../utils/logger';

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  role: z.enum(['RENTER', 'OWNER', 'ADMIN']),
  fullName: z.string().optional(),
  ktpNumber: z.string().optional(),
  simNumber: z.string().optional(),
  address: z.string().optional(),
  companyName: z.string().optional(),
  nib: z.string().optional(),
  npwp: z.string().optional(),
  picName: z.string().optional(),
  businessName: z.string().optional(),
  bankAccount: z.string().optional(),
  bankName: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

// Register controller
export const register = asyncHandler(async (req: Request, res: Response) => {
  const validatedData = registerSchema.parse(req.body);

  const result = await authService.register(validatedData);

  logger.info('User registered', { email: validatedData.email, role: validatedData.role });

  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: result,
  });
});

// Login controller
export const login = asyncHandler(async (req: Request, res: Response) => {
  const validatedData = loginSchema.parse(req.body);

  const result = await authService.login(validatedData);

  logger.info('User logged in', { email: validatedData.email });

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: result,
  });
});

// Get current user controller
export const getCurrentUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not authenticated', 401);
  }

  const user = await authService.getCurrentUser(req.user.id);

  res.status(200).json({
    success: true,
    data: user,
  });
});

// Refresh token controller
export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new AppError('Refresh token is required', 400);
  }

  const result = await authService.refreshToken(refreshToken);

  res.status(200).json({
    success: true,
    message: 'Token refreshed successfully',
    data: result,
  });
});

// Logout controller
export const logout = asyncHandler(async (req: AuthRequest, res: Response) => {
  // In a real application, you might want to blacklist the token
  // For now, we'll just send a success response
  
  logger.info('User logged out', { userId: req.user?.id });

  res.status(200).json({
    success: true,
    message: 'Logout successful',
  });
});
