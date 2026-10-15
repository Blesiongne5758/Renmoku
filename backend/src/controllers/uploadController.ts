import { Request, Response } from 'express';
import { z } from 'zod';
import storageService from '../services/storageService';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import logger from '../utils/logger';
import prisma from '../config/database';

// Validation schemas
const generateUploadUrlSchema = z.object({
  bucket: z.enum(['public', 'private']),
  folder: z.string().min(1),
  fileName: z.string().min(1),
  contentType: z.string().min(1),
  fileSize: z.number().positive(),
});

const generateDownloadUrlSchema = z.object({
  key: z.string().min(1),
});

// Generate pre-signed URL for upload
export const generateUploadUrl = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not authenticated', 401);
  }

  const validatedData = generateUploadUrlSchema.parse(req.body);

  const result = await storageService.generatePresignedUploadUrl(validatedData);

  // Log upload request
  logger.info('Upload URL generated', {
    userId: req.user.id,
    bucket: validatedData.bucket,
    folder: validatedData.folder,
    fileName: validatedData.fileName,
    contentType: validatedData.contentType,
    fileSize: validatedData.fileSize,
  });

  res.status(200).json({
    success: true,
    data: result,
  });
});

// Generate pre-signed URL for download (private files only)
export const generateDownloadUrl = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not authenticated', 401);
  }

  const validatedData = generateDownloadUrlSchema.parse(req.body);

  // Check if user has access to this file
  const downloadUrl = await storageService.generatePresignedDownloadUrl(
    validatedData.key,
    req.user.id,
    true // verification required
  );

  // Log download request
  logger.info('Download URL generated', {
    userId: req.user.id,
    key: validatedData.key,
  });

  res.status(200).json({
    success: true,
    data: {
      downloadUrl,
      expiresIn: 900, // 15 minutes
    },
  });
});

// Upload KYC document
export const uploadKycDocument = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not authenticated', 401);
  }

  if (!req.file) {
    throw new AppError('No file uploaded', 400);
  }

  const { documentType } = req.body;

  // Generate upload URL for private bucket
  const uploadResult = await storageService.generatePresignedUploadUrl({
    bucket: 'private',
    folder: `kyc/${req.user.id}`,
    fileName: `${documentType}-${req.file.originalname}`,
    contentType: req.file.mimetype,
    fileSize: req.file.size,
  });

  // Update user's KYC document reference in database
  if (req.user.role === 'RENTER') {
    const renterIndividual = await prisma.renterIndividual.findUnique({
      where: { userId: req.user.id },
    });

    if (renterIndividual) {
      await prisma.renterIndividual.update({
        where: { userId: req.user.id },
        data: {
          [documentType === 'ktp' ? 'ktpScan' : 
           documentType === 'sim' ? 'simScan' : 
           documentType === 'kk' ? 'kkScan' : '']: uploadResult.key,
        },
      });
    }
  }

  logger.info('KYC document uploaded', {
    userId: req.user.id,
    documentType,
    key: uploadResult.key,
  });

  res.status(200).json({
    success: true,
    message: 'Document uploaded successfully',
    data: {
      key: uploadResult.key,
      uploadUrl: uploadResult.uploadUrl,
      expiresIn: uploadResult.expiresIn,
    },
  });
});

// Upload vehicle images
export const uploadVehicleImages = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not authenticated', 401);
  }

  const files = req.files as Express.Multer.File[];
  const { vehicleId } = req.params;

  if (!files || files.length === 0) {
    throw new AppError('No files uploaded', 400);
  }

  // Verify vehicle ownership
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: vehicleId },
    include: { owner: true },
  });

  if (!vehicle) {
    throw new AppError('Vehicle not found', 404);
  }

  if (vehicle.owner.userId !== req.user.id && req.user.role !== 'ADMIN') {
    throw new AppError('Access denied', 403);
  }

  // Generate upload URLs for each image
  const uploadUrls = await Promise.all(
    files.map(async (file) => {
      const result = await storageService.generatePresignedUploadUrl({
        bucket: 'public',
        folder: `vehicles/${vehicleId}`,
        fileName: file.originalname,
        contentType: file.mimetype,
        fileSize: file.size,
      });

      return {
        key: result.key,
        uploadUrl: result.uploadUrl,
        fileUrl: result.fileUrl,
      };
    })
  );

  // Update vehicle images in database
  const existingImages = vehicle.images || [];
  const newImages = uploadUrls.map((url) => url.fileUrl);

  await prisma.vehicle.update({
    where: { id: vehicleId },
    data: {
      images: [...existingImages, ...newImages],
    },
  });

  logger.info('Vehicle images uploaded', {
    userId: req.user.id,
    vehicleId,
    imageCount: files.length,
  });

  res.status(200).json({
    success: true,
    message: 'Images uploaded successfully',
    data: uploadUrls,
  });
});

// Upload profile picture
export const uploadProfilePicture = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not authenticated', 401);
  }

  if (!req.file) {
    throw new AppError('No file uploaded', 400);
  }

  // Generate upload URL for public bucket
  const uploadResult = await storageService.generatePresignedUploadUrl({
    bucket: 'public',
    folder: `profiles/${req.user.id}`,
    fileName: `avatar-${req.file.originalname}`,
    contentType: req.file.mimetype,
    fileSize: req.file.size,
  });

  // Update user avatar in database
  await prisma.user.update({
    where: { id: req.user.id },
    data: {
      avatar: uploadResult.fileUrl,
    },
  });

  logger.info('Profile picture uploaded', {
    userId: req.user.id,
    key: uploadResult.key,
  });

  res.status(200).json({
    success: true,
    message: 'Profile picture uploaded successfully',
    data: {
      key: uploadResult.key,
      fileUrl: uploadResult.fileUrl,
      uploadUrl: uploadResult.uploadUrl,
    },
  });
});

// Delete file
export const deleteFile = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not authenticated', 401);
  }

  const { key, bucket } = req.body;

  if (!key || !bucket) {
    throw new AppError('Key and bucket are required', 400);
  }

  // Verify ownership (user can only delete their own files)
  // TODO: Implement ownership verification

  await storageService.deleteFile(key, bucket);

  logger.info('File deleted', {
    userId: req.user.id,
    key,
    bucket,
  });

  res.status(200).json({
    success: true,
    message: 'File deleted successfully',
  });
});
