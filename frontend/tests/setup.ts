import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import { beforeAll, afterAll } from 'vitest';

const prisma = new PrismaClient();

beforeAll(async () => {
  process.env.DATABASE_URL = process.env.DATABASE_URL || 'file:./test.db';
  process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-32chars!';
  process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-key-for-testing-32chars!';

  try {
    execSync('npx prisma db push --skip-generate', { stdio: 'ignore' });
  } catch {
    // Ignore db push error if test DB setup fails
  }
});

afterAll(async () => {
  try {
    await prisma.$disconnect();
  } catch {
    // Ignore cleanup error
  }
});

export { prisma };
