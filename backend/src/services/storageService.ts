import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import config from '../config';
import logger from '../utils/logger';
import { AppError } from '../middleware/errorHandler';

// Initialize S3 Client
const s3Client = new S3Client({
  region: config.aws.region,
  credentials: {
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey,
  },
});

// Bucket names
const PUBLIC_BUCKET = config.aws.s3Bucket + '-public';
const PRIVATE_BUCKET = config.aws.s3Bucket + '-private';

// File type validation
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export type BucketType = 'public' | 'private';

export interface UploadOptions {
  bucket: BucketType;
  folder: string;
  fileName: string;
  contentType: string;
  fileSize: number;
}

export interface PresignedUrlResponse {
  uploadUrl: string;
  fileUrl: string;
  key: string;
  expiresIn: number;
}

class StorageService {
  /**
   * Generate pre-signed URL for direct upload to S3
   */
  async generatePresignedUploadUrl(options: UploadOptions): Promise<PresignedUrlResponse> {
    try {
      const { bucket, folder, fileName, contentType, fileSize } = options;

      // Validate file size
      if (fileSize > MAX_FILE_SIZE) {
        throw new AppError(`File size exceeds maximum limit of ${MAX_FILE_SIZE / 1024 / 1024}MB`, 400);
      }

      // Validate content type
      if (bucket === 'public' && !ALLOWED_IMAGE_TYPES.includes(contentType)) {
        throw new AppError('Invalid file type. Only images are allowed for public bucket.', 400);
      }

      if (bucket === 'private' && !ALLOWED_DOCUMENT_TYPES.includes(contentType)) {
        throw new AppError('Invalid file type. Only PDF and images are allowed.', 400);
      }

      // Generate unique key
      const timestamp = Date.now();
      const key = `${folder}/${timestamp}-${fileName}`;
      const bucketName = bucket === 'public' ? PUBLIC_BUCKET : PRIVATE_BUCKET;

      // Create PUT command
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        ContentType: contentType,
        ContentLength: fileSize,
      });

      // Generate pre-signed URL (expires in 1 hour)
      const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

      // Public file URL (for CDN)
      const fileUrl = bucket === 'public' 
        ? `https://${PUBLIC_BUCKET}.s3.${config.aws.region}.amazonaws.com/${key}`
        : ''; // Private files don't have public URLs

      logger.info('Generated presigned upload URL', { bucket, key, contentType });

      return {
        uploadUrl,
        fileUrl,
        key,
        expiresIn: 3600,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Failed to generate presigned upload URL', error);
      throw new AppError('Failed to generate upload URL', 500);
    }
  }

  /**
   * Generate pre-signed URL for accessing private files
   * Only accessible after verification (e.g., DP paid, ownership verified)
   */
  async generatePresignedDownloadUrl(
    key: string,
    userId: string,
    verificationRequired: boolean = true
  ): Promise<string> {
    try {
      // TODO: Implement verification logic
      // - Check if user owns the file
      // - Check if transaction is completed (DP paid)
      // - Check if user has permission

      if (verificationRequired) {
        // Example verification (implement based on your business logic)
        const hasAccess = await this.verifyFileAccess(key, userId);
        if (!hasAccess) {
          throw new AppError('Access denied. You do not have permission to access this file.', 403);
        }
      }

      const command = new GetObjectCommand({
        Bucket: PRIVATE_BUCKET,
        Key: key,
      });

      // Generate pre-signed URL (expires in 15 minutes for security)
      const downloadUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });

      logger.info('Generated presigned download URL', { key, userId });

      return downloadUrl;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Failed to generate presigned download URL', error);
      throw new AppError('Failed to generate download URL', 500);
    }
  }

  /**
   * Verify if user has access to a private file
   */
  private async verifyFileAccess(key: string, userId: string): Promise<boolean> {
    try {
      // TODO: Implement actual verification logic
      // Examples:
      // - Check if file belongs to user's KYC documents
      // - Check if user has paid DP for related booking
      // - Check if user is owner of the vehicle

      // For now, return true (implement based on your requirements)
      const prisma = (await import('../config/database')).default;

      // Example: Check if file is user's KYC document
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          renterIndividual: true,
          renterCorporate: true,
        },
      });

      if (!user) return false;

      // Check if key matches user's documents
      const isUserDocument = 
        key.includes(`kyc/${userId}/`) ||
        key.includes(`vehicles/${userId}/`);

      return isUserDocument;
    } catch (error) {
      logger.error('Failed to verify file access', error);
      return false;
    }
  }

  /**
   * Delete file from S3
   */
  async deleteFile(key: string, bucket: BucketType): Promise<void> {
    try {
      const bucketName = bucket === 'public' ? PUBLIC_BUCKET : PRIVATE_BUCKET;

      const command = new DeleteObjectCommand({
        Bucket: bucketName,
        Key: key,
      });

      await s3Client.send(command);

      logger.info('File deleted successfully', { bucket, key });
    } catch (error) {
      logger.error('Failed to delete file', error);
      throw new AppError('Failed to delete file', 500);
    }
  }

  /**
   * Generate Cloudinary URL for image optimization
   */
  generateCloudinaryUrl(publicId: string, options?: {
    width?: number;
    height?: number;
    quality?: string;
    format?: string;
  }): string {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const { width, height, quality = 'auto', format = 'auto' } = options || {};

    let transformations = `q_${quality},f_${format}`;
    if (width) transformations += `,w_${width}`;
    if (height) transformations += `,h_${height}`;

    return `https://res.cloudinary.com/${cloudName}/image/upload/${transformations}/${publicId}`;
  }

  /**
   * Upload to Cloudinary for optimization (alternative to S3)
   */
  async uploadToCloudinary(file: Buffer, folder: string): Promise<{
    publicId: string;
    url: string;
    optimizedUrl: string;
  }> {
    try {
      // TODO: Implement Cloudinary upload
      // This requires cloudinary npm package

      // Example implementation:
      /*
      const cloudinary = require('cloudinary').v2;
      
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });

      const result = await cloudinary.uploader.upload_stream(
        { folder, resource_type: 'auto' },
        (error, result) => {
          if (error) throw error;
          return {
            publicId: result.public_id,
            url: result.secure_url,
            optimizedUrl: this.generateCloudinaryUrl(result.public_id),
          };
        }
      );

      file.pipe(result);
      */

      throw new AppError('Cloudinary upload not implemented yet', 501);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Failed to upload to Cloudinary', error);
      throw new AppError('Failed to upload image', 500);
    }
  }
}

export default new StorageService();
