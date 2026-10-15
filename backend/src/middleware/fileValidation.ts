import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import { AppError } from './errorHandler';
import logger from '../utils/logger';

// File type validation using magic bytes
const VALIDATION_RULES = {
  image: {
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    maxFileSize: 5 * 1024 * 1024, // 5MB
    magicBytes: {
      'image/jpeg': [0xFF, 0xD8, 0xFF],
      'image/png': [0x89, 0x50, 0x4E, 0x47],
      'image/webp': [0x52, 0x49, 0x46, 0x46],
      'image/gif': [0x47, 0x49, 0x46, 0x38],
    },
  },
  document: {
    mimeTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    maxFileSize: 10 * 1024 * 1024, // 10MB
    magicBytes: {
      'application/pdf': [0x25, 0x50, 0x44, 0x46], // %PDF
      'image/jpeg': [0xFF, 0xD8, 0xFF],
      'image/png': [0x89, 0x50, 0x4E, 0x47],
    },
  },
};

// Configure multer for memory storage (for validation)
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (fileType: 'image' | 'document') => {
  return (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const rules = VALIDATION_RULES[fileType];
    
    // Check MIME type
    if (!rules.mimeTypes.includes(file.mimetype)) {
      cb(new AppError(`Invalid file type. Allowed: ${rules.mimeTypes.join(', ')}`, 400));
      return;
    }
    
    cb(null, true);
  };
};

// Multer configurations
export const uploadImage = multer({
  storage,
  fileFilter: fileFilter('image'),
  limits: {
    fileSize: VALIDATION_RULES.image.maxFileSize,
  },
});

export const uploadDocument = multer({
  storage,
  fileFilter: fileFilter('document'),
  limits: {
    fileSize: VALIDATION_RULES.document.maxFileSize,
  },
});

/**
 * Validate file magic bytes to prevent malicious uploads
 */
export const validateMagicBytes = (fileType: 'image' | 'document') => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        return next();
      }

      const rules = VALIDATION_RULES[fileType];
      const buffer = req.file.buffer;
      
      // Check if buffer is large enough
      if (buffer.length < 4) {
        throw new AppError('File is too small or corrupted', 400);
      }

      // Check magic bytes
      const detectedMimeType = Object.entries(rules.magicBytes).find(([_, magicBytes]) => {
        return magicBytes.every((byte, index) => buffer[index] === byte);
      });

      if (!detectedMimeType) {
        throw new AppError('File content does not match declared type. Possible malicious file.', 400);
      }

      const [actualMimeType] = detectedMimeType;

      // Verify MIME type matches magic bytes
      if (actualMimeType !== req.file.mimetype) {
        logger.warn('MIME type mismatch', {
          declared: req.file.mimetype,
          actual: actualMimeType,
          fileName: req.file.originalname,
        });
        throw new AppError('File type mismatch. Declared type does not match actual content.', 400);
      }

      next();
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          error: error.message,
        });
      }
      next(error);
    }
  };
};

/**
 * Validate multiple files
 */
export const validateMultipleFiles = (fileType: 'image' | 'document', maxCount: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const files = req.files as Express.Multer.File[];
      
      if (!files || files.length === 0) {
        return next();
      }

      if (files.length > maxCount) {
        throw new AppError(`Maximum ${maxCount} files allowed`, 400);
      }

      const rules = VALIDATION_RULES[fileType];

      // Validate each file
      for (const file of files) {
        // Check MIME type
        if (!rules.mimeTypes.includes(file.mimetype)) {
          throw new AppError(`Invalid file type for ${file.originalname}`, 400);
        }

        // Check file size
        if (file.size > rules.maxFileSize) {
          throw new AppError(`File ${file.originalname} exceeds maximum size`, 400);
        }

        // Check magic bytes
        const buffer = file.buffer;
        if (buffer.length < 4) {
          throw new AppError(`File ${file.originalname} is too small or corrupted`, 400);
        }

        const detectedMimeType = Object.entries(rules.magicBytes).find(([_, magicBytes]) => {
          return magicBytes.every((byte, index) => buffer[index] === byte);
        });

        if (!detectedMimeType) {
          throw new AppError(`File ${file.originalname} content does not match declared type`, 400);
        }
      }

      next();
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          error: error.message,
        });
      }
      next(error);
    }
  };
};

/**
 * Sanitize file name to prevent path traversal attacks
 */
export const sanitizeFileName = (fileName: string): string => {
  // Remove path separators
  let sanitized = fileName.replace(/[/\\]/g, '_');
  
  // Remove special characters
  sanitized = sanitized.replace(/[^a-zA-Z0-9._-]/g, '_');
  
  // Limit length
  if (sanitized.length > 255) {
    const ext = path.extname(sanitized);
    sanitized = sanitized.substring(0, 255 - ext.length) + ext;
  }
  
  return sanitized;
};

/**
 * Generate unique file name
 */
export const generateUniqueFileName = (originalName: string): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const ext = path.extname(originalName);
  const baseName = path.basename(originalName, ext);
  const sanitizedBase = sanitizeFileName(baseName);
  
  return `${sanitizedBase}-${timestamp}-${random}${ext}`;
};
