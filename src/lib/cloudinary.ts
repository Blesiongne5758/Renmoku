import { v2 as cloudinary } from 'cloudinary';

// Cloudinary configuration
cloudinary.config({
  cloud_name: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'your-cloud-name',
  api_key: import.meta.env.VITE_CLOUDINARY_API_KEY || 'your-api-key',
  api_secret: import.meta.env.VITE_CLOUDINARY_API_SECRET || 'your-api-secret',
  secure: true,
});

// Helper functions
export const cloudinaryHelpers = {
  // Upload image
  uploadImage: async (file: File | Blob, folder: string = 'renmoku') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'renmoku_preset');
    formData.append('folder', folder);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const data = await response.json();
      return {
        publicId: data.public_id,
        url: data.secure_url,
        format: data.format,
        width: data.width,
        height: data.height,
        bytes: data.bytes,
      };
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw error;
    }
  },

  // Upload video
  uploadVideo: async (file: File | Blob, folder: string = 'renmoku/videos') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'renmoku_preset');
    formData.append('folder', folder);
    formData.append('resource_type', 'video');

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/video/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const data = await response.json();
      return {
        publicId: data.public_id,
        url: data.secure_url,
        format: data.format,
        duration: data.duration,
        bytes: data.bytes,
      };
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw error;
    }
  },

  // Get optimized URL
  getOptimizedUrl: (publicId: string, options: {
    width?: number;
    height?: number;
    quality?: string | number;
    format?: string;
    crop?: string;
  } = {}) => {
    const { width, height, quality = 'auto', format = 'auto', crop = 'fill' } = options;
    
    let transformation = `q_${quality},f_${format}`;
    if (width) transformation += `,w_${width}`;
    if (height) transformation += `,h_${height}`;
    if (width && height) transformation += `,c_${crop}`;

    return `https://res.cloudinary.com/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload/${transformation}/${publicId}`;
  },

  // Get thumbnail
  getThumbnail: (publicId: string, width: number = 300, height: number = 200) => {
    return cloudinaryHelpers.getOptimizedUrl(publicId, {
      width,
      height,
      quality: 'auto',
      format: 'auto',
      crop: 'fill',
    });
  },

  // Delete asset
  deleteAsset: async (publicId: string, resourceType: 'image' | 'video' = 'image') => {
    try {
      // Note: This requires backend implementation with API secret
      // For frontend-only, you'll need to implement this via Supabase Edge Functions
      console.log('Delete asset:', publicId, resourceType);
      return { success: true };
    } catch (error) {
      console.error('Cloudinary delete error:', error);
      throw error;
    }
  },

  // Generate signature for secure uploads (requires backend)
  generateSignature: async (timestamp: number, folder: string) => {
    // This should be implemented in Supabase Edge Functions
    // For now, using unsigned uploads with upload preset
    return null;
  },
};

export default cloudinaryHelpers;
