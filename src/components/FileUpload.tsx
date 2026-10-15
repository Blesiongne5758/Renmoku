import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, CheckCircle, AlertCircle, File, Image as ImageIcon } from 'lucide-react';
import { apiClient } from '../api/client';

interface FileUploadProps {
  bucket: 'public' | 'private';
  folder: string;
  accept?: string;
  maxFiles?: number;
  maxSize?: number; // in MB
  onUploadComplete?: (urls: string[]) => void;
  onError?: (error: string) => void;
}

interface UploadFile {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  url?: string;
  error?: string;
}

export default function FileUpload({
  bucket,
  folder,
  accept = 'image/*',
  maxFiles = 1,
  maxSize = 10,
  onUploadComplete,
  onError,
}: FileUploadProps) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      return `File size exceeds ${maxSize}MB limit`;
    }

    // Check file type
    const allowedTypes = accept.split(',').map(type => type.trim());
    const fileType = file.type;
    
    const isValid = allowedTypes.some(type => {
      if (type === 'image/*') {
        return fileType.startsWith('image/');
      }
      if (type === 'application/pdf') {
        return fileType === 'application/pdf';
      }
      return fileType === type;
    });

    if (!isValid) {
      return `Invalid file type. Allowed: ${accept}`;
    }

    return null;
  };

  const handleFileSelect = async (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const fileArray = Array.from(selectedFiles).slice(0, maxFiles);
    const newFiles: UploadFile[] = [];

    for (const file of fileArray) {
      const error = validateFile(file);
      
      if (error) {
        newFiles.push({
          file,
          progress: 0,
          status: 'error',
          error,
        });
        continue;
      }

      newFiles.push({
        file,
        progress: 0,
        status: 'pending',
      });
    }

    setFiles(prev => [...prev, ...newFiles]);

    // Start uploading pending files
    for (const uploadFile of newFiles) {
      if (uploadFile.status === 'pending') {
        await uploadFileToS3(uploadFile);
      }
    }
  };

  const uploadFileToS3 = async (uploadFile: UploadFile) => {
    try {
      // Update status to uploading
      setFiles(prev => prev.map(f => 
        f.file === uploadFile.file 
          ? { ...f, status: 'uploading', progress: 10 }
          : f
      ));

      // Request pre-signed URL from backend
      const response = await apiClient.post<{
        data: {
          uploadUrl: string;
          fileUrl: string;
          key: string;
        };
      }>('/upload/upload-url', {
        bucket,
        folder,
        fileName: uploadFile.file.name,
        contentType: uploadFile.file.type,
        fileSize: uploadFile.file.size,
      });

      const { uploadUrl, fileUrl, key } = response.data;

      // Update progress
      setFiles(prev => prev.map(f => 
        f.file === uploadFile.file 
          ? { ...f, progress: 50 }
          : f
      ));

      // Upload directly to S3 using pre-signed URL
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = 50 + (e.loaded / e.total) * 50; // 50-100%
          setFiles(prev => prev.map(f => 
            f.file === uploadFile.file 
              ? { ...f, progress }
              : f
          ));
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          setFiles(prev => prev.map(f => 
            f.file === uploadFile.file 
              ? { ...f, status: 'success', progress: 100, url: fileUrl || key }
              : f
          ));

          // Check if all files are uploaded
          const allFiles = files.map(f => 
            f.file === uploadFile.file 
              ? { ...f, status: 'success', url: fileUrl || key }
              : f
          );

          if (allFiles.every(f => f.status === 'success')) {
            const urls = allFiles.map(f => f.url!).filter(Boolean);
            onUploadComplete?.(urls);
          }
        } else {
          throw new Error('Upload failed');
        }
      });

      xhr.addEventListener('error', () => {
        throw new Error('Upload failed');
      });

      xhr.open('PUT', uploadUrl);
      xhr.setRequestHeader('Content-Type', uploadFile.file.type);
      xhr.send(uploadFile.file);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      
      setFiles(prev => prev.map(f => 
        f.file === uploadFile.file 
          ? { ...f, status: 'error', error: errorMessage }
          : f
      ));

      onError?.(errorMessage);
    }
  };

  const removeFile = (file: File) => {
    setFiles(prev => prev.filter(f => f.file !== file));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
          transition-all duration-300
          ${isDragging 
            ? 'border-gold-400 bg-gold-500/10' 
            : 'border-white/10 hover:border-gold-400/50 hover:bg-white/5'
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={maxFiles > 1}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />

        <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragging ? 'text-gold-400' : 'text-gray-400'}`} />
        
        <p className="text-white font-medium mb-2">
          {isDragging ? 'Drop files here' : 'Click to upload or drag and drop'}
        </p>
        
        <p className="text-sm text-gray-400">
          {accept === 'image/*' ? 'Images' : 'Documents'} up to {maxSize}MB
          {maxFiles > 1 && ` (max ${maxFiles} files)`}
        </p>
      </div>

      {/* File List */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            {files.map((uploadFile, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10"
              >
                {/* File Icon */}
                <div className="flex-shrink-0">
                  {uploadFile.file.type.startsWith('image/') ? (
                    <ImageIcon className="w-8 h-8 text-gold-400" />
                  ) : (
                    <File className="w-8 h-8 text-blue-400" />
                  )}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">
                    {uploadFile.file.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {(uploadFile.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>

                  {/* Progress Bar */}
                  {uploadFile.status === 'uploading' && (
                    <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadFile.progress}%` }}
                        className="h-full bg-gradient-to-r from-gold-400 to-gold-600"
                      />
                    </div>
                  )}

                  {/* Status Message */}
                  {uploadFile.status === 'error' && (
                    <p className="mt-1 text-xs text-red-400">
                      {uploadFile.error}
                    </p>
                  )}
                </div>

                {/* Status Icon */}
                <div className="flex-shrink-0">
                  {uploadFile.status === 'success' && (
                    <CheckCircle className="w-6 h-6 text-emerald-400" />
                  )}
                  {uploadFile.status === 'error' && (
                    <AlertCircle className="w-6 h-6 text-red-400" />
                  )}
                  {uploadFile.status === 'uploading' && (
                    <div className="w-6 h-6 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
                  )}
                </div>

                {/* Remove Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(uploadFile.file);
                  }}
                  className="flex-shrink-0 p-1 rounded-lg hover:bg-white/10 transition"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
