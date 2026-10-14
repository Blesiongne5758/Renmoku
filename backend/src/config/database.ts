import { PrismaClient } from '@prisma/client';
import config from '../config';
import logger from '../utils/logger';

// Prisma Client singleton
const prisma = new PrismaClient({
  log:
    config.env === 'development'
      ? ['query', 'error', 'warn']
      : ['error'],
});

// Connect to database
export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    logger.info('✅ Database connected successfully');
  } catch (error) {
    logger.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

// Disconnect from database
export async function disconnectDatabase(): Promise<void> {
  try {
    await prisma.$disconnect();
    logger.info('✅ Database disconnected successfully');
  } catch (error) {
    logger.error('❌ Database disconnection failed:', error);
  }
}

// Handle database errors
prisma.$use(async (params, next) => {
  const before = Date.now();
  const result = await next(params);
  const after = Date.now();

  const duration = after - before;

  // Log slow queries
  if (duration > 1000) {
    logger.warn(`Slow query detected: ${params.model}.${params.action} took ${duration}ms`);
  }

  return result;
});

export default prisma;
