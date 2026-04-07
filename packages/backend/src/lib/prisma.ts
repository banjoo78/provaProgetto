import { PrismaClient } from '@prisma/client';

// Reuse a single PrismaClient across HMR reloads in dev to avoid exhausting
// SQLite connections. In production each process owns one client.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'test' ? [] : ['warn', 'error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
