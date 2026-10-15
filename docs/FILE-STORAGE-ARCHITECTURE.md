# 📁 File Storage & Media Architecture

## Overview

Dokumentasi lengkap untuk arsitektur penyimpanan file dan media Renmoku menggunakan AWS S3 dengan pre-signed URLs untuk upload/download yang aman dan efisien.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT (Frontend)                       │
│                                                              │
│  1. Request pre-signed URL dari backend                     │
│  2. Upload file langsung ke S3 menggunakan pre-signed URL   │
│  3. Simpan file key/URL ke database                         │
│                                                              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ HTTPS
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Express.js)                      │
│                                                              │
│  • Generate pre-signed URLs (upload & download)             │
│  • Validate file types & sizes                              │
│  • Check magic bytes (prevent malicious files)              │
│  • Verify user permissions                                  │
│  • Store file metadata in database                          │
│                                                              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ AWS SDK
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                      AWS S3 Buckets                          │
│                                                              │
│  ┌──────────────────┐      ┌──────────────────┐            │
│  │  PUBLIC BUCKET   │      │  PRIVATE BUCKET  │            │
│  │                  │      │                  │            │
│  │ • Vehicle images │      │ • KYC documents  │            │
│  │ • Profile pics   │      │ • Contracts      │            │
│  │ • Public media   │      │ • Chat files     │            │
│  │                  │      │ • Sensitive docs │            │
│  │ CDN: CloudFront  │      │                  │            │
│  └──────────────────┘      │ Access: Pre-     │            │
│                             │ signed URLs only │            │
│                             └──────────────────┘            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                         │
                         │ (Optional)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   CLOUDINARY / IMAGEKIT                      │
│                                                              │
│  • Automatic image optimization                              │
│  • WebP conversion                                           │
│  • Thumbnail generation                                      │
│  • Responsive images                                         │
│  • CDN delivery                                              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🪣 Bucket Strategy

### 1. Public Bucket
**Purpose:** Files yang bisa diakses publik

**Contents:**
- ✅ Vehicle listing photos
- ✅ Profile pictures
- ✅ Public gallery images
- ✅ Marketing materials

**Access:**
- Direct URL via CDN (CloudFront)
- No authentication required
- Cached at edge locations

**URL Format:**
```
https://{public-bucket}.s3.{region}.amazonaws.com/{key}
```

**Example:**
```
https://renmoku-public.s3.ap-southeast-1.amazonaws.com/vehicles/123/image-1.jpg
```

### 2. Private Bucket
**Purpose:** Files sensitif yang memerlukan autentikasi

**Contents:**
- 🔒 KYC documents (KTP, SIM, KK)
- 🔒 Corporate documents (NIB, NPWP, Akta)
- 🔒 Signed contracts
- 🔒 Chat attachments
- 🔒 Payment receipts
- 🔒 Internal documents

**Access:**
- Pre-signed GET URLs only
- Short-lived (15 minutes)
- Requires user verification
- Ownership/transaction check

**URL Format:**
```
https://{private-bucket}.s3.{region}.amazonaws.com/{key}?X-Amz-Algorithm=...&X-Amz-Credential=...&X-Amz-Date=...&X-Amz-Expires=900&X-Amz-SignedHeaders=...&X-Amz-Signature=...
```

---

## 🔐 Security Features

### 1. Pre-Signed URLs

**Upload URLs:**
- Expire in 1 hour
- Single-use only
- Limited to specific file size & type
- Direct upload to S3 (no server bandwidth)

**Download URLs:**
- Expire in 15 minutes
- Require user verification
- Check ownership/transaction status
- Short-lived for security

### 2. File Validation

**Client-Side (Zod):**
```typescript
const uploadSchema = z.object({
  bucket: z.enum(['public', 'private']),
  folder: z.string().min(1),
  fileName: z.string().min(1),
  contentType: z.string().min(1),
  fileSize: z.number().positive().max(10 * 1024 * 1024), // 10MB
});
```

**Server-Side (Magic Bytes):**
```typescript
// Check actual file content, not just MIME type
const magicBytes = {
  'image/jpeg': [0xFF, 0xD8, 0xFF],
  'image/png': [0x89, 0x50, 0x4E, 0x47],
  'application/pdf': [0x25, 0x50, 0x44, 0x46], // %PDF
};
```

**Benefits:**
- ✅ Prevents malicious script uploads
- ✅ Validates actual file content
- ✅ Detects file type spoofing
- ✅ Blocks oversized files

### 3. Access Control

**Verification Checks:**
- ✅ User authentication (JWT)
- ✅ File ownership verification
- ✅ Transaction status check (e.g., DP paid)
- ✅ Role-based access (Admin/Owner/Renter)
- ✅ Time-based access (URL expiration)

---

## 📤 Upload Flow

### Direct Upload (Pre-Signed URL)

```typescript
// 1. Frontend: Request upload URL
const response = await apiClient.post('/upload/upload-url', {
  bucket: 'public',
  folder: 'vehicles/123',
  fileName: 'image.jpg',
  contentType: 'image/jpeg',
  fileSize: 1024000,
});

const { uploadUrl, fileUrl, key } = response.data;

// 2. Frontend: Upload directly to S3
const xhr = new XMLHttpRequest();
xhr.open('PUT', uploadUrl);
xhr.setRequestHeader('Content-Type', 'image/jpeg');
xhr.send(file);

// 3. Frontend: Save file reference to database
await apiClient.post('/vehicles/123/images', {
  key,
  fileUrl,
});
```

**Benefits:**
- ✅ No server bandwidth usage
- ✅ No memory overload
- ✅ Faster uploads (direct to S3)
- ✅ Scalable architecture

---

## 📥 Download Flow

### Private File Access

```typescript
// 1. Frontend: Request download URL
const response = await apiClient.post('/upload/download-url', {
  key: 'kyc/user-123/ktp-scan.pdf',
});

// Backend verifies:
// - User authentication
// - File ownership
// - Transaction status (if applicable)

const { downloadUrl, expiresIn } = response.data;

// 2. Frontend: Download file
window.open(downloadUrl, '_blank');

// URL expires in 15 minutes
```

**Security:**
- ✅ Short-lived URLs (15 min)
- ✅ User verification required
- ✅ Ownership check
- ✅ Transaction status check (e.g., DP paid)

---

## 🖼️ Media Optimization

### Cloudinary Integration

**Features:**
- Automatic image compression
- WebP conversion
- Responsive images
- Thumbnail generation
- CDN delivery

**Usage:**
```typescript
// Generate optimized URL
const optimizedUrl = storageService.generateCloudinaryUrl(
  'vehicles/123/image',
  {
    width: 800,
    height: 600,
    quality: 'auto',
    format: 'auto',
  }
);

// Result:
// https://res.cloudinary.com/renmoku/image/upload/w_800,h_600,q_auto,f_auto/vehicles/123/image
```

**Benefits:**
- ✅ 40-60% smaller file sizes
- ✅ Faster page loads
- ✅ Better user experience
- ✅ Reduced bandwidth costs

---

## 📊 File Structure

### Folder Organization

```
s3://renmoku-public/
├── vehicles/
│   ├── {vehicleId}/
│   │   ├── image-1.jpg
│   │   ├── image-2.jpg
│   │   └── image-3.jpg
│   └── ...
├── profiles/
│   ├── {userId}/
│   │   └── avatar.jpg
│   └── ...
└── marketing/
    ├── banners/
    └── logos/

s3://renmoku-private/
├── kyc/
│   ├── {userId}/
│   │   ├── ktp-scan.pdf
│   │   ├── sim-scan.jpg
│   │   └── kk-scan.jpg
│   └── ...
├── contracts/
│   ├── {bookingId}/
│   │   └── contract-signed.pdf
│   └── ...
├── chats/
│   ├── {conversationId}/
│   │   └── message-attachment.jpg
│   └── ...
└── payments/
    ├── {paymentId}/
    │   └── receipt.pdf
    └── ...
```

---

## 🔧 Backend Implementation

### Storage Service

**File:** `backend/src/services/storageService.ts`

**Methods:**
```typescript
class StorageService {
  // Generate pre-signed URL for upload
  async generatePresignedUploadUrl(options: UploadOptions): Promise<PresignedUrlResponse>
  
  // Generate pre-signed URL for download
  async generatePresignedDownloadUrl(key: string, userId: string, verificationRequired: boolean): Promise<string>
  
  // Verify file access
  private async verifyFileAccess(key: string, userId: string): Promise<boolean>
  
  // Delete file
  async deleteFile(key: string, bucket: BucketType): Promise<void>
  
  // Generate Cloudinary URL
  generateCloudinaryUrl(publicId: string, options?: CloudinaryOptions): string
  
  // Upload to Cloudinary
  async uploadToCloudinary(file: Buffer, folder: string): Promise<CloudinaryResult>
}
```

### File Validation Middleware

**File:** `backend/src/middleware/fileValidation.ts`

**Features:**
```typescript
// Validate magic bytes
export const validateMagicBytes = (fileType: 'image' | 'document') => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Check actual file content
    // Prevent malicious uploads
  };
};

// Validate multiple files
export const validateMultipleFiles = (fileType: 'image' | 'document', maxCount: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Validate each file
    // Check size limits
  };
};
```

### Upload Controller

**File:** `backend/src/controllers/uploadController.ts`

**Endpoints:**
```typescript
// Generate pre-signed upload URL
POST /api/v1/upload/upload-url
{
  "bucket": "public" | "private",
  "folder": "vehicles/123",
  "fileName": "image.jpg",
  "contentType": "image/jpeg",
  "fileSize": 1024000
}

// Generate pre-signed download URL
POST /api/v1/upload/download-url
{
  "key": "kyc/user-123/ktp-scan.pdf"
}

// Upload KYC document
POST /api/v1/upload/kyc
Content-Type: multipart/form-data
{
  "document": File,
  "documentType": "ktp" | "sim" | "kk"
}

// Upload vehicle images
POST /api/v1/upload/vehicle/:vehicleId/images
Content-Type: multipart/form-data
{
  "images": File[]
}

// Upload profile picture
POST /api/v1/upload/profile-picture
Content-Type: multipart/form-data
{
  "avatar": File
}

// Delete file
DELETE /api/v1/upload/file
{
  "key": "vehicles/123/image.jpg",
  "bucket": "public"
}
```

---

## 🎨 Frontend Implementation

### FileUpload Component

**File:** `src/components/FileUpload.tsx`

**Features:**
- ✅ Drag & drop support
- ✅ Multiple file upload
- ✅ Progress tracking
- ✅ File validation
- ✅ Error handling
- ✅ Direct upload to S3

**Usage:**
```typescript
import FileUpload from './components/FileUpload';

function VehicleForm() {
  const handleUploadComplete = (urls: string[]) => {
    console.log('Uploaded:', urls);
    // Save URLs to database
  };

  return (
    <FileUpload
      bucket="public"
      folder="vehicles/123"
      accept="image/*"
      maxFiles={10}
      maxSize={5}
      onUploadComplete={handleUploadComplete}
    />
  );
}
```

---

## 📈 Performance Optimization

### 1. Direct Upload
- ✅ No server bandwidth
- ✅ No memory overload
- ✅ Faster uploads
- ✅ Scalable

### 2. CDN (CloudFront)
- ✅ Edge caching
- ✅ Global distribution
- ✅ Reduced latency
- ✅ Lower costs

### 3. Image Optimization (Cloudinary)
- ✅ Automatic compression
- ✅ WebP conversion
- ✅ Responsive images
- ✅ 40-60% size reduction

### 4. Caching Strategy
```typescript
// Public files: Long cache
Cache-Control: public, max-age=31536000, immutable

// Private files: Short cache
Cache-Control: private, max-age=0, no-cache
```

---

## 🔒 Security Checklist

### Upload Security
- [x] File type validation (MIME + magic bytes)
- [x] File size limits
- [x] Pre-signed URLs (time-limited)
- [x] User authentication
- [x] Folder structure validation
- [x] Malicious file detection

### Download Security
- [x] Pre-signed URLs (15 min expiry)
- [x] User verification
- [x] Ownership check
- [x] Transaction status check
- [x] Access logging

### Infrastructure Security
- [x] HTTPS only
- [x] S3 bucket policies
- [x] IAM roles & permissions
- [x] Encryption at rest
- [x] Encryption in transit
- [x] CORS configuration

---

## 🧪 Testing

### Unit Tests
```typescript
describe('StorageService', () => {
  it('should generate presigned upload URL', async () => {
    const result = await storageService.generatePresignedUploadUrl({
      bucket: 'public',
      folder: 'test',
      fileName: 'image.jpg',
      contentType: 'image/jpeg',
      fileSize: 1024,
    });

    expect(result.uploadUrl).toBeDefined();
    expect(result.key).toContain('test/');
  });

  it('should reject oversized files', async () => {
    await expect(
      storageService.generatePresignedUploadUrl({
        bucket: 'public',
        folder: 'test',
        fileName: 'large.jpg',
        contentType: 'image/jpeg',
        fileSize: 20 * 1024 * 1024, // 20MB
      })
    ).rejects.toThrow('File size exceeds maximum limit');
  });
});
```

### Integration Tests
```typescript
describe('Upload API', () => {
  it('should upload KYC document', async () => {
    const file = createMockFile('ktp.pdf', 'application/pdf');
    
    const response = await request(app)
      .post('/api/v1/upload/kyc')
      .attach('document', file)
      .field('documentType', 'ktp')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.key).toContain('kyc/');
  });
});
```

---

## 📊 Monitoring & Logging

### Metrics to Track
- Upload success rate
- Upload speed (average)
- Storage usage per bucket
- Download URL generation rate
- Failed upload attempts
- File type distribution

### Logs
```typescript
// Upload URL generated
logger.info('Upload URL generated', {
  userId: req.user.id,
  bucket: 'public',
  folder: 'vehicles/123',
  fileName: 'image.jpg',
  contentType: 'image/jpeg',
  fileSize: 1024000,
});

// File uploaded
logger.info('File uploaded successfully', {
  userId: req.user.id,
  key: 'vehicles/123/image.jpg',
  bucket: 'public',
});

// Access denied
logger.warn('File access denied', {
  userId: req.user.id,
  key: 'kyc/user-456/ktp.pdf',
  reason: 'Ownership verification failed',
});
```

---

## 🚀 Deployment

### AWS Setup

1. **Create S3 Buckets**
```bash
# Public bucket
aws s3 mb s3://renmoku-public --region ap-southeast-1

# Private bucket
aws s3 mb s3://renmoku-private --region ap-southeast-1
```

2. **Configure Bucket Policies**
```json
// Public bucket policy
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::renmoku-public/*"
    }
  ]
}
```

3. **Setup CloudFront (CDN)**
```bash
aws cloudfront create-distribution \
  --origin-domain-name renmoku-public.s3.amazonaws.com \
  --default-cache-behavior ...
```

4. **Configure IAM User**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": [
        "arn:aws:s3:::renmoku-public/*",
        "arn:aws:s3:::renmoku-private/*"
      ]
    }
  ]
}
```

### Environment Variables
```env
# AWS S3
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=ap-southeast-1
AWS_S3_BUCKET=renmoku

# Cloudinary (Optional)
CLOUDINARY_CLOUD_NAME=renmoku
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

---

## 📚 Related Documentation

- [Backend Summary](./BACKEND-SUMMARY.md)
- [API Documentation](./API-DOCUMENTATION.md)
- [Security Guide](./SECURITY.md)

---

**Status**: ✅ Implementation Complete  
**Last Updated**: 2026-10-15  
**Version**: 1.0.0
