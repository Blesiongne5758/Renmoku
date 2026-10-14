// ============================================================================
// PRISMA CLIENT INITIALIZATION
// ============================================================================
// File: backend/src/lib/prisma.ts
// ============================================================================
// Singleton Prisma client untuk koneksi database PostgreSQL.
// Mencegah multiple instances di development mode.
// ============================================================================

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Execute database operation with error handling
 */
export async function dbOperation<T>(
  operation: () => Promise<T>,
  context: string
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    console.error(`❌ Database error in ${context}:`, error);
    throw error;
  }
}

/**
 * Disconnect Prisma client (for cleanup)
 */
export async function disconnectPrisma() {
  await prisma.$disconnect();
  console.log('✅ Prisma client disconnected');
}
