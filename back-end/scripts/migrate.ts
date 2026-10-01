/**
 * Migration runner for the hand-maintained DDL in `migrations/`.
 *
 * an5Orm ships `push.ts` / `migrate.ts`, but both emit T-SQL DDL
 * (`NEWID()`, `IDENTITY(1,1)`, `[dbo].`) and are not published in the npm
 * tarball, so they cannot generate PostgreSQL DDL. N2Flow therefore keeps its
 * schema in `an5Schema/*.an5` (source of truth for the generated types and for
 * the runtime table mapping) and its DDL in `migrations/*.sql`, applied by this
 * runner.
 *
 * Usage:
 *   npm run db:migrate            apply every pending migration
 *   npm run db:migrate:status    list applied / pending migrations
 *   npm run db:migrate:reset     drop all objects, then re-apply everything
 */
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { An5Adapter } from '@an5/adapters';
import { splitSqlStatements } from '../lib/sqlStatements.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('Migrate');

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const migrationsDir = path.join(rootDir, 'migrations');

/** Tables the application owns, dropped in dependency order by `db:migrate:reset`. */
const OWNED_TABLES = ['flow_executions', 'flows', 'llm_providers', 'user_secrets', 'users'];

function requireDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL is required for migration commands.');
  }
  return url;
}

function listMigrationFiles(): string[] {
  if (!fs.existsSync(migrationsDir)) return [];
  return fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();
}

async function ensureMigrationTable(adapter: An5Adapter): Promise<void> {
  await adapter.exec(`
    CREATE TABLE IF NOT EXISTS "_an5_migrations" (
      "id"        TEXT NOT NULL PRIMARY KEY,
      "checksum"  TEXT NOT NULL,
      "appliedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
}

async function fetchApplied(adapter: An5Adapter): Promise<Map<string, string>> {
  const rows = await adapter.exec<{ id: string; checksum: string }>(
    'SELECT "id", "checksum" FROM "_an5_migrations"',
  );
  return new Map(rows.map((r) => [r.id, r.checksum]));
}

function checksum(sql: string): string {
  // Deterministic, dependency-free FNV-1a 64-bit rendered as hex.
  let hash = 0xcbf29ce484222325n;
  const prime = 0x100000001b3n;
  const mask = 0xffffffffffffffffn;
  for (let i = 0; i < sql.length; i += 1) {
    hash ^= BigInt(sql.charCodeAt(i));
    hash = (hash * prime) & mask;
  }
  return hash.toString(16).padStart(16, '0');
}

async function applyPending(adapter: An5Adapter): Promise<number> {
  const files = listMigrationFiles();
  if (files.length === 0) {
    logger.warn(`No .sql files found in ${migrationsDir}`);
    return 0;
  }

  await ensureMigrationTable(adapter);
  const applied = await fetchApplied(adapter);
  let count = 0;

  for (const file of files) {
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    const sum = checksum(sql);
    const already = applied.get(file);

    if (already) {
      if (already !== sum) {
        throw new Error(
          `Migration "${file}" was already applied but its contents have changed. ` +
            'Add a new migration instead of editing an applied one.',
        );
      }
      logger.info(`skip ${file} (already applied)`);
      continue;
    }

    const statements = splitSqlStatements(sql);
    logger.info(`applying ${file} (${statements.length} statement(s))`);

    const tx = await adapter.$begin();
    try {
      for (const statement of statements) {
        await tx.exec(statement);
      }
      await tx.exec('INSERT INTO "_an5_migrations" ("id", "checksum") VALUES (@id, @checksum)', {
        id: file,
        checksum: sum,
      });
      await tx.$commit();
      count += 1;
    } catch (err) {
      await tx.$rollback();
      throw new Error(`Migration "${file}" failed and was rolled back: ${(err as Error).message}`);
    }
  }

  return count;
}

async function printStatus(adapter: An5Adapter): Promise<void> {
  const files = listMigrationFiles();
  await ensureMigrationTable(adapter);
  const applied = await fetchApplied(adapter);

  console.log('\nMigration status');
  console.log('----------------');
  if (files.length === 0) {
    console.log('(no migration files)');
    return;
  }
  for (const file of files) {
    console.log(`${applied.has(file) ? '[applied]' : '[pending]'} ${file}`);
  }
  const pending = files.filter((f) => !applied.has(f)).length;
  console.log(`\n${files.length - pending} applied, ${pending} pending`);
}

async function reset(adapter: An5Adapter): Promise<void> {
  logger.warn('Dropping all N2Flow tables and re-applying migrations from scratch.');
  for (const table of OWNED_TABLES) {
    await adapter.exec(`DROP TABLE IF EXISTS "${table}" CASCADE`);
  }
  await adapter.exec('DROP TABLE IF EXISTS "_an5_migrations" CASCADE');
  await applyPending(adapter);
  logger.info('Reset complete.');
}

async function main(): Promise<void> {
  const command = process.argv[2] || 'apply';
  const adapter = new An5Adapter({ connectionString: requireDatabaseUrl() });

  try {
    await adapter.$connect();
    switch (command) {
      case 'apply':
        {
          const count = await applyPending(adapter);
          logger.info(count === 0 ? 'Database is already up to date.' : `Applied ${count} migration(s).`);
          break;
        }
      case 'status':
        await printStatus(adapter);
        break;
      case 'reset':
        await reset(adapter);
        break;
      default:
        throw new Error(`Unknown command "${command}". Use apply, status or reset.`);
    }
  } finally {
    await adapter.$disconnect();
  }
}

main().catch((err) => {
  console.error('Migration failed:', err instanceof Error ? err.message : err);
  process.exit(1);
});
