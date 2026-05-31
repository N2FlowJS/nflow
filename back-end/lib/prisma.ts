import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
// Use the generated local Prisma client (bundled under `lib/prisma-client`) so
// runtime configuration (inline schema, runtime data model) matches the
// generated artifacts. Importing from `@prisma/client` can lead to
// constructor/initialization mismatches in this workspace.
import { PrismaClient } from './prisma-client';

import type { PrismaClient as PrismaClientType } from './prisma-client';

let prisma: PrismaClientType;

function createPrismaClient() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required to initialize Prisma');
  }

  return new PrismaClient({
    adapter: new PrismaPg({ connectionString: databaseUrl }),
  });
}

if (process.env.NODE_ENV === 'production') {
  // Debug: ensure env is loaded at runtime
  // (mask credentials when printing)
  const _dbUrl = process.env.DATABASE_URL;
  console.log('PRISMA DEBUG: DATABASE_URL set:', !!_dbUrl);
  if (_dbUrl) {
    console.log('PRISMA DEBUG: DATABASE_URL (masked):', _dbUrl.replace(/:\/\/([^@]+)@/, '://***@'));
  }
  prisma = createPrismaClient();
} else {
  // Avoid instantiating multiple PrismaClient instances in development
  if (!globalThis.prisma) {
    // Debug: confirm env in development
    const _dbUrl = process.env.DATABASE_URL;
    console.log('PRISMA DEBUG (dev): DATABASE_URL set:', !!_dbUrl);
    if (_dbUrl) {
      console.log('PRISMA DEBUG (dev): DATABASE_URL (masked):', _dbUrl.replace(/:\/\/([^@]+)@/, '://***@'));
    }
    // @ts-ignore
    globalThis.prisma = createPrismaClient();
  }
  // @ts-ignore
  prisma = globalThis.prisma;
}

export { prisma };

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClientType | undefined;
}
