import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

export const config = {
  // Server
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),
  apiPrefix: process.env.API_PREFIX || '/api/v1',

  // Database
  database: {
    url: process.env.DATABASE_URL || '',
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },

  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'],
    credentials: process.env.CORS_CREDENTIALS === 'true',
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },

  // File Upload
  upload: {
    dir: process.env.UPLOAD_DIR || './uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10),
    allowedTypes: process.env.ALLOWED_FILE_TYPES?.split(',') || [
      'image/jpeg',
      'image/png',
      'application/pdf',
    ],
  },

  // Email
  email: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.EMAIL_FROM || 'noreply@renmoku.id',
    fromName: process.env.EMAIL_FROM_NAME || 'Renmoku',
  },

  // Payment - Midtrans
  midtrans: {
    serverKey: process.env.MIDTRANS_SERVER_KEY || '',
    clientKey: process.env.MIDTRANS_CLIENT_KEY || '',
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
    webhookUrl: process.env.MIDTRANS_WEBHOOK_URL || '',
  },

  // AWS S3
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    region: process.env.AWS_REGION || 'ap-southeast-1',
    s3Bucket: process.env.AWS_S3_BUCKET || '',
    s3Endpoint: process.env.AWS_S3_ENDPOINT || '',
  },

  // Socket.io
  socket: {
    corsOrigin: process.env.SOCKET_IO_CORS_ORIGIN || 'http://localhost:5173',
    path: process.env.SOCKET_IO_PATH || '/socket.io',
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    dir: process.env.LOG_DIR || './logs',
  },

  // Admin
  admin: {
    email: process.env.ADMIN_EMAIL || 'admin@renmoku.id',
    defaultPassword: process.env.ADMIN_DEFAULT_PASSWORD || 'Admin123!',
  },

  // URLs
  urls: {
    frontend: process.env.FRONTEND_URL || 'http://localhost:5173',
    backend: process.env.BACKEND_URL || 'http://localhost:3001',
  },

  // Redis
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || '',
  },

  // Monitoring
  monitoring: {
    sentryDsn: process.env.SENTRY_DSN || '',
    googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID || '',
  },
};

export default config;
