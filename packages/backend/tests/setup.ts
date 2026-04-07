import { beforeAll, afterAll, beforeEach } from 'vitest';
import { execSync } from 'node:child_process';
import { rmSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const testDbFile = path.resolve(process.cwd(), 'data/test.db');

beforeAll(() => {
  // Ensure data dir exists
  mkdirSync(path.dirname(testDbFile), { recursive: true });

  // Wipe any leftover from previous runs
  for (const suffix of ['', '-journal', '-shm', '-wal']) {
    try {
      rmSync(testDbFile + suffix);
    } catch {
      // ignore
    }
  }

  // Apply migrations to the test DB
  execSync('npx prisma migrate deploy', {
    stdio: 'pipe',
    env: { ...process.env, DATABASE_URL: `file:${testDbFile}` },
  });
});

beforeEach(async () => {
  const { prisma } = await import('../src/lib/prisma.js');
  await prisma.trip.deleteMany();
});

afterAll(async () => {
  const { prisma } = await import('../src/lib/prisma.js');
  await prisma.$disconnect();
});
