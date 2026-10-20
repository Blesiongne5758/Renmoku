import { cloudinaryHelpers } from '../lib/cloudinary';
import { supabase } from '../lib/supabase';

// Simple logger for file uploads
const logger = {
  info: (message: string, data?: any) => console.log(`[INFO] ${message}`, data),
  error: (message: string, error?: any) => console.error(`[ERROR] ${message}`, error),
  warn: (message: string, data?: any) => console.warn(`[WARN] ${message}`, data),
};

// ============================================================================
// FILE UPLOAD SERVICE - Cloudinary + Supabase Storage
// ============================================================================

export type UploadType = 'vehicle-image' | 'profile-picture' | 'kyc-document' | 'chat-attachment';

export interface UploadResult {
  url: string;
  publicId: string;
  format: string;
  width?: number;
  height?: number;
  bytes: number;
}

export const fileUploadService = {
  /**
   * Upload image to Cloudinary
   */
  uploadImage: async (
    file: File,
    type: UploadType,
    folder?: string
  ): Promise<UploadResult> => {
    try {
      // Determine folder based on type
      const uploadFolder = folder || getFolderByType(type);

      // Upload to Cloudinary
      const result = await cloudinaryHelpers.uploadImage(file, uploadFolder);

      logger.info('Image uploaded to Cloudinary', {
        type,
        folder: uploadFolder,
        publicId: result.publicId,
        url: result.url,
      });

      return result;
    } catch (error) {
      logger.error('Failed to upload image to Cloudinary', error);
      throw error;
    }
  },

  /**
   * Upload vehicle images (multiple)
   */
  uploadVehicleImages: async (
    files: File[],
    vehicleId: string
  ): Promise<UploadResult[]> => {
    try {
      const results = await Promise.all(
        files.map(file => 
          fileUploadService.uploadImage(file, 'vehicle-image', `vehicles/${vehicleId}`)
        )
      );

      // Save URLs to database
      const { error } = await supabase
        .from('vehicles')
        .update({ images: results.map(r => r.url) })
        .eq('id', vehicleId);

      if (error) throw error;

      logger.info('Vehicle images uploaded', {
        vehicleId,
        imageCount: results.length,
      });

      return results;
    } catch (error) {
      logger.error('Failed to upload vehicle images', error);
      throw error;
    }
  },

  /**
   * Upload profile picture
   */
  uploadProfilePicture: async (
    file: File,
    userId: string
  ): Promise<UploadResult> => {
    try {
      const result = await fileUploadService.uploadImage(
        file,
        'profile-picture',
        `profiles/${userId}`
      );

      // Update user profile
      const { error } = await supabase
        .from('users')
        .update({ avatar_url: result.url })
        .eq('id', userId);

      if (error) throw error;

      logger.info('Profile picture uploaded', {
        userId,
        url: result.url,
      });

      return result;
    } catch (error) {
      logger.error('Failed to upload profile picture', error);
      throw error;
    }
  },

  /**
   * Upload KYC document to Supabase Storage (private)
   */
  uploadKycDocument: async (
    file: File,
    userId: string,
    documentType: 'ktp' | 'sim' | 'kk' | 'nib' | 'npwp' | 'akta'
  ): Promise<{ url: string; path: string }> => {
    try {
      const path = `kyc/${userId}/${documentType}-${Date.now()}.${file.type.split('/')[1]}`;

      // Upload to Supabase Storage (private bucket)
      const { data, error } = await supabase.storage
        .from('renmoku-private')
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      // Get public URL (will be accessed via pre-signed URL in production)
      const { data: urlData } = supabase.storage
        .from('renmoku-private')
        .getPublicUrl(path);

      logger.info('KYC document uploaded', {
        userId,
        documentType,
        path,
      });

      return {
        url: urlData.publicUrl,
        path,
      };
    } catch (error) {
      logger.error('Failed to upload KYC document', error);
      throw error;
    }
  },

  /**
   * Upload chat attachment
   */
  uploadChatAttachment: async (
    file: File,
    conversationId: string,
    userId: string
  ): Promise<UploadResult> => {
    try {
      const isImage = file.type.startsWith('image/');
      
      let result: UploadResult;
      
      if (isImage) {
        result = await fileUploadService.uploadImage(
          file,
          'chat-attachment',
          `chats/${conversationId}`
        );
      } else {
        // For non-image files, use Supabase Storage
        const path = `chats/${conversationId}/${userId}-${Date.now()}-${file.name}`;
        
        const { data, error } = await supabase.storage
          .from('renmoku-private')
          .upload(path, file);

        if (error) throw error;

        const { data: urlData } = supabase.storage
          .from('renmoku-private')
          .getPublicUrl(path);

        result = {
          url: urlData.publicUrl,
          publicId: path,
          format: file.type.split('/')[1],
          bytes: file.size,
        };
      }

      logger.info('Chat attachment uploaded', {
        conversationId,
        userId,
        url: result.url,
      });

      return result;
    } catch (error) {
      logger.error('Failed to upload chat attachment', error);
      throw error;
    }
  },

  /**
   * Delete file from Cloudinary
   */
  deleteFile: async (publicId: string, resourceType: 'image' | 'video' = 'image'): Promise<void> => {
    try {
      await cloudinaryHelpers.deleteAsset(publicId, resourceType);

      logger.info('File deleted from Cloudinary', {
        publicId,
        resourceType,
      });
    } catch (error) {
      logger.error('Failed to delete file from Cloudinary', error);
      throw error;
    }
  },

  /**
   * Delete file from Supabase Storage
   */
  deleteStorageFile: async (bucket: string, path: string): Promise<void> => {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);

      if (error) throw error;

      logger.info('File deleted from Supabase Storage', {
        bucket,
        path,
      });
    } catch (error) {
      logger.error('Failed to delete file from Supabase Storage', error);
      throw error;
    }
  },

  /**
   * Get optimized image URL
   */
  getOptimizedUrl: (
    publicId: string,
    options?: {
      width?: number;
      height?: number;
      quality?: string | number;
      format?: string;
    }
  ): string => {
    return cloudinaryHelpers.getOptimizedUrl(publicId, options);
  },

  /**
   * Get thumbnail URL
   */
  getThumbnail: (publicId: string, width: number = 300, height: number = 200): string => {
    return cloudinaryHelpers.getThumbnail(publicId, width, height);
  },

  /**
   * Validate file before upload
   */
  validateFile: (file: File, type: UploadType): { valid: boolean; error?: string } => {
    const maxSize = getMaxSizeByType(type);
    const allowedTypes = getAllowedTypesByType(type);

    // Check file size
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File size exceeds ${maxSize / 1024 / 1024}MB limit`,
      };
    }

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `Invalid file type. Allowed: ${allowedTypes.join(', ')}`,
      };
    }

    return { valid: true };
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getFolderByType(type: UploadType): string {
  const folders: Record<UploadType, string> = {
    'vehicle-image': 'vehicles',
    'profile-picture': 'profiles',
    'kyc-document': 'kyc',
    'chat-attachment': 'chats',
  };
  return folders[type];
}

function getMaxSizeByType(type: UploadType): number {
  const sizes: Record<UploadType, number> = {
    'vehicle-image': 5 * 1024 * 1024, // 5MB
    'profile-picture': 2 * 1024 * 1024, // 2MB
    'kyc-document': 10 * 1024 * 1024, // 10MB
    'chat-attachment': 10 * 1024 * 1024, // 10MB
  };
  return sizes[type];
}

function getAllowedTypesByType(type: UploadType): string[] {
  const types: Record<UploadType, string[]> = {
    'vehicle-image': ['image/jpeg', 'image/png', 'image/webp'],
    'profile-picture': ['image/jpeg', 'image/png', 'image/webp'],
    'kyc-document': ['application/pdf', 'image/jpeg', 'image/png'],
    'chat-attachment': ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
  };
  return types[type];
}

export default fileUploadService;
