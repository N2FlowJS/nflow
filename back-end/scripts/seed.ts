/**
 * Seed script.
 *
 * Creates the initial administrator account. Idempotent: running it twice does
 * not create duplicates and never overwrites an existing password.
 *
 * Configure with:
 *   SEED_ADMIN_EMAIL     (required to seed anything)
 *   SEED_ADMIN_USERNAME  (defaults to the part of the email before '@')
 *   SEED_ADMIN_PASSWORD  (required when SEED_ADMIN_EMAIL is set)
 *   SEED_ADMIN_NAME      (optional display name)
 */
import 'dotenv/config';
import { db } from '../lib/db';
import { createLogger } from '../utils/logger';

const logger = createLogger('Seed');

const HASH_ROUNDS = 10;

async function main(): Promise<void> {
  const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!email) {
    logger.info('SEED_ADMIN_EMAIL is not set - nothing to seed.');
    return;
  }
  if (!password || password.length < 8) {
    throw new Error('SEED_ADMIN_PASSWORD is required and must be at least 8 characters');
  }

  const username = process.env.SEED_ADMIN_USERNAME?.trim() || email.split('@')[0] || email;
  const name = process.env.SEED_ADMIN_NAME?.trim() || username;

  await db.$connect();

  try {
    const existing = await db.user.findFirst({ where: { OR: [{ email }, { username }] } });
    if (existing) {
      logger.info(`User already exists (${existing.email}) - skipping.`);
      return;
    }

    const { default: bcrypt } = await import('bcryptjs');
    const hashed = await bcrypt.hash(password, HASH_ROUNDS);

    const user = await db.user.create({ data: { email, username, password: hashed, name } });
    logger.info(`Created admin user ${user.email} (${user.id}).`);
  } finally {
    await db.$disconnect();
  }
}

main().catch((err) => {
  console.error('Seed failed:', err instanceof Error ? err.message : err);
  process.exit(1);
});
