import 'dotenv/config';
// Use the generated local Prisma client (bundled under `lib/prisma-client`) so
// runtime configuration (inline schema, runtime data model) matches the
// generated artifacts. Importing from `@prisma/client` can lead to
// constructor/initialization mismatches in this workspace.
import { PrismaClient } from './prisma-client';

import type { PrismaClient as PrismaClientType } from './prisma-client';

let prisma: PrismaClientType;

if (process.env.NODE_ENV === 'production') {
  const opts = process.env.DATABASE_URL
    ? { datasources: { db: { url: process.env.DATABASE_URL } } }
    : {};
  // Debug: ensure env is loaded at runtime
  // (mask credentials when printing)
  const _dbUrl = process.env.DATABASE_URL;
  console.log('PRISMA DEBUG: DATABASE_URL set:', !!_dbUrl);
  if (_dbUrl) {
    console.log('PRISMA DEBUG: DATABASE_URL (masked):', _dbUrl.replace(/:\/\/([^@]+)@/, '://***@'));
  }
  // Do not pass `datasources` to the PrismaClient constructor —
  // Prisma reads `DATABASE_URL` from the environment. Passing
  // `datasources` here can cause a constructor validation error
  prisma = new PrismaClient();
} else {
  // Avoid instantiating multiple PrismaClient instances in development
  if (!globalThis.prisma) {
    const opts = process.env.DATABASE_URL
      ? { datasources: { db: { url: process.env.DATABASE_URL } } }
      : {};
    // Debug: confirm env in development
    const _dbUrl = process.env.DATABASE_URL;
    console.log('PRISMA DEBUG (dev): DATABASE_URL set:', !!_dbUrl);
    if (_dbUrl) {
      console.log('PRISMA DEBUG (dev): DATABASE_URL (masked):', _dbUrl.replace(/:\/\/([^@]+)@/, '://***@'));
    }
    // @ts-ignore
    // Do not pass `datasources` here for the same reason as above.
    globalThis.prisma = new PrismaClient();
  }
  // @ts-ignore
  prisma = globalThis.prisma;
}

export default prisma;

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClientType | undefined;
}
