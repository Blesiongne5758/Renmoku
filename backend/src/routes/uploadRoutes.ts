import { Router } from 'express';
import {
  generateUploadUrl,
  generateDownloadUrl,
  uploadKycDocument,
  uploadVehicleImages,
  uploadProfilePicture,
  deleteFile,
} from '../controllers/uploadController';
import { authenticate, authorize } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { uploadImage, uploadDocument, validateMagicBytes } from '../middleware/fileValidation';
import { z } from 'zod';

const router = Router();

// All routes require authentication
router.use(authenticate);

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
router.post(
  '/upload-url',
  validateBody(generateUploadUrlSchema),
  generateUploadUrl
);

// Generate pre-signed URL for download (private files)
router.post(
  '/download-url',
  validateBody(generateDownloadUrlSchema),
  generateDownloadUrl
);

// Upload KYC document
router.post(
  '/kyc',
  uploadDocument.single('document'),
  validateMagicBytes('document'),
  uploadKycDocument
);

// Upload vehicle images (multiple)
router.post(
  '/vehicle/:vehicleId/images',
  uploadImage.array('images', 10), // Max 10 images
  uploadVehicleImages
);

// Upload profile picture
router.post(
  '/profile-picture',
  uploadImage.single('avatar'),
  validateMagicBytes('image'),
  uploadProfilePicture
);

// Delete file
router.delete(
  '/file',
  deleteFile
);

export default router;
